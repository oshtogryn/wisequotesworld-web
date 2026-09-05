const PROJECT_ID='wisequotesworld';
export const INDEXNOW_KEY='7f3c91a4d2e85b6076fa34c1b9e2d508';
const HOST='wisequotesworld.com';
const API='https://api.indexnow.org/indexnow';

function absolute(path){return `https://${HOST}${path}`}

async function publishedRows(env,recentMinutes=null){
  if(!env?.DB)return [];
  let sql=`SELECT canonical_path,updated_at FROM quote_pages WHERE project_id=? AND status='published'`;
  const bind=[PROJECT_ID];
  if(Number.isFinite(recentMinutes)&&recentMinutes>0){sql+=` AND datetime(COALESCE(updated_at,published_at))>=datetime('now',?)`;bind.push(`-${Math.ceil(recentMinutes)} minutes`)}
  sql+=` ORDER BY COALESCE(updated_at,published_at) DESC`;
  return (await env.DB.prepare(sql).bind(...bind).all()).results||[];
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
  const rows=await publishedRows(env,minutes);
  return submitIndexNowUrls(rows.map(r=>absolute(r.canonical_path)));
}

export async function submitAllPublished(env){
  const rows=await publishedRows(env,null);
  return submitIndexNowUrls(rows.map(r=>absolute(r.canonical_path)));
}
