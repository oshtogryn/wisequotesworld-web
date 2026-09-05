import {authorSlug,htmlLang} from './taxonomy_seo.js';

const PROJECT_ID='wisequotesworld';
const BASE='https://wisequotesworld.com';
const LOCALES=['uk','ru','pl','en','sv','de','es','fr','it','pt','id','tr','ar'];

function xml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))}
function abs(path){return `${BASE}${path}`}
function lastmod(row){const v=row?.updated_at||row?.published_at;if(!v)return'';const d=new Date(v);return Number.isNaN(d.getTime())?'':d.toISOString()}
function visibleSql(alias='ci'){return `(COALESCE(${alias}.sequence_no,CAST(SUBSTR(${alias}.id,3) AS INTEGER),0)<=15 OR EXISTS (SELECT 1 FROM content_approvals sva WHERE sva.content_item_id=${alias}.id AND sva.approval_scope='website_visibility' AND sva.language_code IS NULL AND sva.status='approved'))`}
function urlNode(loc,lm='',alts=[]){let out=`  <url>\n    <loc>${xml(loc)}</loc>\n`;if(lm)out+=`    <lastmod>${xml(lm)}</lastmod>\n`;for(const a of alts)out+=`    <xhtml:link rel="alternate" hreflang="${xml(a.lang)}" href="${xml(a.href)}" />\n`;out+='  </url>\n';return out}

async function quoteRows(env){
  return (await env.DB.prepare(`SELECT qp.content_item_id,qp.language_code,qp.canonical_path,qp.updated_at,qp.published_at FROM quote_pages qp WHERE qp.project_id=? AND qp.status='published' AND qp.language_code IN ('uk','ru','pl','en','sv','de','es','fr','it','pt','id','tr','ar') AND TRIM(COALESCE(qp.canonical_path,''))<>'' ORDER BY qp.content_item_id,qp.language_code`).bind(PROJECT_ID).all()).results||[];
}
async function categoryRows(env){
  return (await env.DB.prepare(`SELECT DISTINCT qp.language_code,ci.category_slug FROM quote_pages qp JOIN content_items ci ON ci.id=qp.content_item_id WHERE qp.project_id=? AND qp.status='published' AND ${visibleSql('ci')} AND qp.language_code IN ('uk','ru','pl','en','sv','de','es','fr','it','pt','id','tr','ar') AND TRIM(COALESCE(ci.category_slug,''))<>'' ORDER BY qp.language_code,ci.category_slug`).bind(PROJECT_ID).all()).results||[];
}
async function authorRows(env){
  return (await env.DB.prepare(`SELECT DISTINCT qp.language_code,ci.author_name FROM quote_pages qp JOIN content_items ci ON ci.id=qp.content_item_id WHERE qp.project_id=? AND qp.status='published' AND ${visibleSql('ci')} AND qp.language_code IN ('uk','ru','pl','en','sv','de','es','fr','it','pt','id','tr','ar') AND ci.attribution_status='verified' AND TRIM(COALESCE(ci.author_name,''))<>'' ORDER BY qp.language_code,ci.author_name`).bind(PROJECT_ID).all()).results||[];
}

export async function dynamicSitemap(env){
  if(!env?.DB)return new Response('Database unavailable',{status:503,headers:{'content-type':'text/plain; charset=utf-8','cache-control':'no-store'}});
  const [quotes,categories,authors]=await Promise.all([quoteRows(env),categoryRows(env),authorRows(env)]);
  const groups=new Map();
  for(const q of quotes){if(!groups.has(q.content_item_id))groups.set(q.content_item_id,[]);groups.get(q.content_item_id).push(q)}
  let body='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  body+=urlNode(`${BASE}/`);
  for(const l of LOCALES){body+=urlNode(abs(`/${l}/`));body+=urlNode(abs(`/${l}/quotes/`));body+=urlNode(abs(`/${l}/start/`))}
  for(const rows of groups.values()){
    const alternates=rows.map(r=>({lang:htmlLang(r.language_code),href:abs(r.canonical_path)}));
    const def=rows.find(r=>r.language_code==='en')||rows[0];if(def)alternates.push({lang:'x-default',href:abs(def.canonical_path)});
    for(const r of rows)body+=urlNode(abs(r.canonical_path),lastmod(r),alternates);
  }
  for(const r of categories)body+=urlNode(abs(`/${r.language_code}/category/${encodeURIComponent(r.category_slug)}/`));
  for(const r of authors)body+=urlNode(abs(`/${r.language_code}/author/${encodeURIComponent(authorSlug(r.author_name))}/`));
  body+='</urlset>\n';
  return new Response(body,{status:200,headers:{'content-type':'application/xml; charset=utf-8','cache-control':'public, max-age=300'}});
}
