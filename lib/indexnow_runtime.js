const PROJECT_ID='wisequotesworld';
export const INDEXNOW_KEY='7f3c91a4d2e85b6076fa34c1b9e2d508';
const HOST='wisequotesworld.com';
const API='https://api.indexnow.org/indexnow';

function absolute(path){return `https://${HOST}${path}`}
function slug(v){return String(v||'').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-+|-+$/g,'')||'other'}

async function publishedRows(env,recentMinutes=null){
  if(!env?.DB)return [];
  let sql=`SELECT qp.canonical_path,qp.language_code,qp.updated_at,qp.published_at,ci.category_slug,ci.author_name,ci.attribution_status FROM quote_pages qp JOIN content_items ci ON ci.id=qp.content_item_id WHERE qp.project_id=? AND qp.status='published'`;
  const bind=[PROJECT_ID];
  if(Number.isFinite(recentMinutes)&&recentMinutes>0){sql+=` AND datetime(COALESCE(qp.updated_at,qp.published_at))>=datetime('now',?)`;bind.push(`-${Math.ceil(recentMinutes)} minutes`)}
  sql+=` ORDER BY COALESCE(qp.updated_at,qp.published_at) DESC`;
  return (await env.DB.prepare(sql).bind(...bind).all()).results||[];
}

function affectedUrls(rows){
  const out=[];
  for(const r of rows){
    if(r.canonical_path)out.push(absolute(r.canonical_path));
    if(r.language_code){out.push(absolute(`/${r.language_code}/`),absolute(`/${r.language_code}/quotes/`));}
    if(r.language_code&&r.category_slug)out.push(absolute(`/${r.language_code}/category/${encodeURIComponent(r.category_slug)}/`));
    if(r.language_code&&r.attribution_status==='verified'&&String(r.author_name||'').trim())out.push(absolute(`/${r.language_code}/author/${encodeURIComponent(slug(r.author_name))}/`));
  }
  return [...new Set(out)];
}

export async function submitIndexNowUrls(urls){
  const clean=[...new Set((urls||[]).filter(x=>typeof x==='string'&&x.startsWith(`https://${HOST}/`)))].slice(0,10000);
  if(!clean.length)return {ok:true,status:null,submitted:0,skipped:true};
  const payload={host:HOST,key:INDEXNOW_KEY,keyLocation:absolute(`/${INDEXNOW_KEY}.txt`),urlList:clean};
  try{
    const res=await fetch(API,{method:'POST',headers:{'content-type':'application/json; charset=utf-8'},body:JSON.stringify(payload)});
    return {ok:res.ok,status:res.status,submitted:clean.length};
  }catch(e){return {ok:false,status:null,submitted:clean.length,error:String(e?.message||e)}}
}

export async function submitRecentPublished(env,minutes=10){
  return submitIndexNowUrls(affectedUrls(await publishedRows(env,minutes)));
}

export async function submitAllPublished(env){
  return submitIndexNowUrls(affectedUrls(await publishedRows(env,null)));
}
