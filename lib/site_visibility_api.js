const PROJECT='wisequotesworld';
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
function auth(req,env){return !!env.ADMIN_TOKEN&&(req.headers.get('authorization')||'')===`Bearer ${env.ADMIN_TOKEN}`}
async function state(env,id){
 const item=await env.DB.prepare(`SELECT id,sequence_no,status,canonical_title FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT,id).first();
 if(!item)return null;
 const gate=await env.DB.prepare(`SELECT status,updated_at,notes FROM content_approvals WHERE content_item_id=? AND approval_scope='website_visibility' AND language_code IS NULL ORDER BY id DESC LIMIT 1`).bind(id).first();
 const legacy=Number(item.sequence_no||String(id).replace(/\D/g,''))<=15;
 const pages=await env.DB.prepare(`SELECT COUNT(*) n FROM quote_pages WHERE project_id=? AND content_item_id=? AND status='published'`).bind(PROJECT,id).first();
 return{...item,visible:legacy||gate?.status==='approved',legacy_visible:legacy,website_visibility:gate||{status:'hidden',updated_at:null},published_pages:Number(pages?.n||0)};
}
async function publish(env,id){
 const s=await state(env,id);if(!s)return json({ok:false,error:'topic not found'},404);
 if(s.published_pages<13)return json({ok:false,error:`website package incomplete: ${s.published_pages}/13 published pages`},409);
 if(s.visible&&!s.legacy_visible)return json({ok:true,id,visible:true,already_visible:true,website_visibility:s.website_visibility});
 const ts=new Date().toISOString(),note='Editorial website visibility approved from Admin. Direct article URLs may exist/index before this gate; navigation/latest becomes visible only after this action.';
 const row=await env.DB.prepare(`SELECT id FROM content_approvals WHERE content_item_id=? AND approval_scope='website_visibility' AND language_code IS NULL ORDER BY id DESC LIMIT 1`).bind(id).first();
 if(row)await env.DB.prepare(`UPDATE content_approvals SET status='approved',notes=?,updated_at=? WHERE id=?`).bind(note,ts,row.id).run();
 else await env.DB.prepare(`INSERT INTO content_approvals(project_id,content_item_id,approval_scope,language_code,status,approved_by,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)`).bind(PROJECT,id,'website_visibility',null,'approved','admin',note,ts,ts).run();
 return json({ok:true,id,visible:true,published_at:ts,state:await state(env,id)});
}
async function hide(env,id){
 const s=await state(env,id);if(!s)return json({ok:false,error:'topic not found'},404);if(s.legacy_visible)return json({ok:false,error:'legacy WQ001-WQ015 visibility is locked'},409);
 const ts=new Date().toISOString(),note='Editorial website visibility hidden from Admin.';
 const row=await env.DB.prepare(`SELECT id FROM content_approvals WHERE content_item_id=? AND approval_scope='website_visibility' AND language_code IS NULL ORDER BY id DESC LIMIT 1`).bind(id).first();
 if(row)await env.DB.prepare(`UPDATE content_approvals SET status='rejected',notes=?,updated_at=? WHERE id=?`).bind(note,ts,row.id).run();
 else await env.DB.prepare(`INSERT INTO content_approvals(project_id,content_item_id,approval_scope,language_code,status,approved_by,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)`).bind(PROJECT,id,'website_visibility',null,'rejected','admin',note,ts,ts).run();
 return json({ok:true,id,visible:false,state:await state(env,id)});
}
export async function siteVisibilityApi(request,env){
 const url=new URL(request.url),m=url.pathname.match(/^\/api\/admin\/site-visibility\/([A-Za-z0-9_-]+)(?:\/(publish|hide))?$/);if(!m)return null;
 if(!auth(request,env))return json({ok:false,error:'unauthorized'},401);if(!env?.DB)return json({ok:false,error:'DB unavailable'},503);
 const id=m[1],action=m[2];if(request.method==='GET'&&!action){const s=await state(env,id);return s?json({ok:true,state:s}):json({ok:false,error:'topic not found'},404)}
 if(request.method==='POST'&&action==='publish')return publish(env,id);
 if(request.method==='POST'&&action==='hide')return hide(env,id);
 return json({ok:false,error:'method not allowed'},405);
}
