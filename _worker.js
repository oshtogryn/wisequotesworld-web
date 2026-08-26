const LANGS=['en','uk','ru','pl','sv','de','es'];
const MIGRATION_PATH='/_migration/4Vn8qR1xD6mK3tZ9pL2cH7wF5yS0bJ';
function preferred(request){const h=(request.headers.get('Accept-Language')||'').toLowerCase();for(const l of ['uk','ru','pl','sv','de','es','en'])if(h.startsWith(l)||h.includes(','+l)||h.includes(' '+l))return l;return'en'}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}

async function loadMigration(request,env){
  const manifestResponse=await env.ASSETS.fetch(new Request(new URL('/db/plain_migration/manifest.json',request.url)));
  if(!manifestResponse.ok)throw new Error(`manifest unavailable (${manifestResponse.status})`);
  const manifest=await manifestResponse.json();
  if(!Number.isInteger(manifest.parts)||manifest.parts<1)throw new Error('invalid migration manifest');
  const statements=[];
  for(let i=0;i<manifest.parts;i++){
    const name=`/db/plain_migration/part_${String(i).padStart(2,'0')}.json`;
    const r=await env.ASSETS.fetch(new Request(new URL(name,request.url)));
    if(!r.ok)throw new Error(`${name} unavailable (${r.status})`);
    const part=await r.json();
    if(!Array.isArray(part))throw new Error(`${name} is not an array`);
    statements.push(...part);
  }
  if(statements.length!==manifest.statements)throw new Error(`statement count mismatch ${statements.length}/${manifest.statements}`);
  return statements;
}

async function migrationStatus(db){
  const tables=(await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all()).results||[];
  const names=tables.map(x=>x.name);
  const counts={};
  for(const t of ['projects','languages','platforms','content_items','content_versions','platform_content','rules','validation_rules','social_accounts','publications','import_rows']){
    if(names.includes(t))counts[t]=(await db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).first()).n;
  }
  let progress=null,done=false;
  if(names.includes('_migration_meta')){
    progress=await db.prepare("SELECT v FROM _migration_meta WHERE k='progress'").first();
    done=!!(await db.prepare("SELECT v FROM _migration_meta WHERE k='done'").first());
  }
  return {tables:names,counts,progress:progress?Number(progress.v):0,done};
}

async function runMigration(request,env){
  if(!env.DB)return json({ok:false,error:'DB binding unavailable'},500);
  const url=new URL(request.url);
  if(url.searchParams.get('run')!=='1')return json({ok:true,project:'wisequotesworld',...(await migrationStatus(env.DB))});
  await env.DB.exec("CREATE TABLE IF NOT EXISTS _migration_meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);");
  const done=await env.DB.prepare("SELECT v FROM _migration_meta WHERE k='done'").first();
  if(done)return json({ok:true,already_done:true,project:'wisequotesworld',...(await migrationStatus(env.DB))});
  const statements=await loadMigration(request,env);
  const row=await env.DB.prepare("SELECT v FROM _migration_meta WHERE k='progress'").first();
  let start=row?Number(row.v):0;
  const chunk=12;
  for(let i=start;i<statements.length;i+=chunk){
    const end=Math.min(statements.length,i+chunk);
    const batch=statements.slice(i,end).map(sql=>env.DB.prepare(sql));
    batch.push(env.DB.prepare("INSERT INTO _migration_meta(k,v) VALUES('progress',?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").bind(String(end)));
    await env.DB.batch(batch);
  }
  await env.DB.prepare("INSERT INTO _migration_meta(k,v) VALUES('done','1') ON CONFLICT(k) DO UPDATE SET v='1'").run();
  return json({ok:true,migrated:true,statements:statements.length,project:'wisequotesworld',...(await migrationStatus(env.DB))});
}

export default{async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname===MIGRATION_PATH){try{return await runMigration(request,env)}catch(e){return json({ok:false,error:String(e?.message||e)},500)}}
  if(url.pathname==='/'||url.pathname==='/index.html'){return Response.redirect(`${url.origin}/${preferred(request)}/`,302)}
  return env.ASSETS.fetch(request)
}};