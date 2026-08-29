const PROJECT_ID='wisequotesworld';
const LOCALES=['uk','ru','pl','en','sv','de','es','fr'];
const NAMES={uk:'Українська',ru:'Русский',pl:'Polski',en:'English',sv:'Svenska',de:'Deutsch',es:'Español',fr:'Français'};
const UI={
 uk:{title:'Усі цитати',all:'Усі цитати',categories:'Категорії',empty:'Поки що немає опублікованих цитат.',by:'Автор'},
 ru:{title:'Все цитаты',all:'Все цитаты',categories:'Категории',empty:'Пока нет опубликованных цитат.',by:'Автор'},
 pl:{title:'Wszystkie cytaty',all:'Wszystkie cytaty',categories:'Kategorie',empty:'Brak opublikowanych cytatów.',by:'Autor'},
 en:{title:'All quotes',all:'All quotes',categories:'Categories',empty:'No published quotes yet.',by:'Author'},
 sv:{title:'Alla citat',all:'Alla citat',categories:'Kategorier',empty:'Inga publicerade citat ännu.',by:'Författare'},
 de:{title:'Alle Zitate',all:'Alle Zitate',categories:'Kategorien',empty:'Noch keine veröffentlichten Zitate.',by:'Autor'},
 es:{title:'Todas las citas',all:'Todas las citas',categories:'Categorías',empty:'Aún no hay citas publicadas.',by:'Autor'},
 fr:{title:'Toutes les citations',all:'Toutes les citations',categories:'Catégories',empty:'Aucune citation publiée pour le moment.',by:'Auteur'}
};
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function slug(v){return String(v||'').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\u0400-\u04ff]+/g,'-').replace(/^-+|-+$/g,'')||'other'}
async function rows(env,locale,category=null){
 let sql=`SELECT qp.slug,qp.seo_title,qp.meta_description,qp.reflection_title,qp.reflection_body,qp.published_at,cv.adapted_text,ci.author_name,ci.attribution_status,ci.category,ci.category_slug,ci.quote_type
 FROM quote_pages qp JOIN content_versions cv ON cv.id=qp.content_version_id JOIN content_items ci ON ci.id=qp.content_item_id
 WHERE qp.project_id=? AND qp.language_code=? AND qp.status='published'`;
 const bind=[PROJECT_ID,locale];
 if(category){sql+=` AND COALESCE(ci.category_slug,'')=?`;bind.push(category)}
 sql+=` ORDER BY COALESCE(qp.published_at,qp.updated_at) DESC, COALESCE(ci.sequence_no,0) DESC`;
 return (await env.DB.prepare(sql).bind(...bind).all()).results||[];
}
async function categories(env,locale){
 return (await env.DB.prepare(`SELECT COALESCE(NULLIF(ci.category_slug,''),'other') slug,COALESCE(NULLIF(ci.category,''),NULLIF(ci.category_slug,''),'Other') label,COUNT(*) count
 FROM quote_pages qp JOIN content_items ci ON ci.id=qp.content_item_id
 WHERE qp.project_id=? AND qp.language_code=? AND qp.status='published'
 GROUP BY COALESCE(NULLIF(ci.category_slug,''),'other'),COALESCE(NULLIF(ci.category,''),NULLIF(ci.category_slug,''),'Other') ORDER BY count DESC,label`).bind(PROJECT_ID,locale).all()).results||[];
}
function shell(locale,title,body,categoryRows=[]){const u=UI[locale]||UI.en;const langs=LOCALES.map(l=>`<a class="lang${l===locale?' on':''}" href="/${l}/">${NAMES[l]}</a>`).join('');const cats=categoryRows.map(c=>`<a class="chip" href="/${locale}/category/${encodeURIComponent(c.slug)}/">${esc(c.label)} <span>${c.count}</span></a>`).join('');return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} — Wise Quotes World</title><meta name="description" content="Wise Quotes World — ${esc(title)}"><style>:root{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#151515;background:#f4f2ed}*{box-sizing:border-box}body{margin:0}.top{padding:18px 20px;background:#111;color:white;display:flex;justify-content:space-between;gap:20px;align-items:center}.brand{font-weight:800;font-size:20px}.langs{display:flex;gap:6px;overflow:auto}.lang{color:#bbb;text-decoration:none;padding:6px 8px;border-radius:8px;white-space:nowrap}.lang.on{background:#fff;color:#111}.wrap{max-width:1120px;margin:auto;padding:28px 18px 60px}.hero{display:flex;justify-content:space-between;gap:20px;align-items:end;margin-bottom:20px}.hero h1{font-size:clamp(34px,7vw,72px);line-height:.95;margin:0;max-width:760px}.hero a{color:#111}.cats{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0}.chip{background:#fff;border:1px solid #ddd;color:#111;text-decoration:none;padding:10px 13px;border-radius:999px}.chip span{color:#777}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.quote{background:#fff;border-radius:22px;padding:22px;min-height:220px;display:flex;flex-direction:column;justify-content:space-between;text-decoration:none;color:#111;border:1px solid #e6e3dc}.q{font-family:Georgia,serif;font-size:26px;line-height:1.25;margin:0 0 24px}.meta{color:#666;font-size:14px;display:flex;justify-content:space-between;gap:10px}.empty{background:#fff;border-radius:22px;padding:30px}.foot{margin-top:40px;color:#777;font-size:14px}@media(max-width:820px){.grid{grid-template-columns:1fr 1fr}.top{align-items:flex-start;flex-direction:column}.hero{align-items:flex-start;flex-direction:column}}@media(max-width:560px){.grid{grid-template-columns:1fr}.q{font-size:25px}.wrap{padding-top:22px}}</style><link rel="canonical" href="https://wisequotesworld.com/${locale}/"></head><body><header class="top"><div class="brand">Wise Quotes World</div><nav class="langs">${langs}</nav></header><main class="wrap"><div class="hero"><h1>${esc(title)}</h1><a href="/${locale}/quotes/">${esc(u.all)} →</a></div>${categoryRows.length?`<h2>${esc(u.categories)}</h2><div class="cats">${cats}</div>`:''}${body}<div class="foot">Wise Quotes World · database-first multilingual archive</div></main></body></html>`}
function cards(locale,a){const u=UI[locale]||UI.en;if(!a.length)return `<div class="empty">${esc(u.empty)}</div>`;return `<div class="grid">${a.map(x=>`<a class="quote" href="/${locale}/quotes/${encodeURIComponent(x.slug)}/"><p class="q">“${esc(x.adapted_text)}”</p><div class="meta"><span>${x.author_name&&x.attribution_status==='verified'?esc(x.author_name):'Wise Quotes World'}</span><span>${esc(x.category||x.category_slug||'')}</span></div></a>`).join('')}</div>`}
export async function siteV2(request,env){
 const url=new URL(request.url);if(!env.DB)return null;
 const home=url.pathname.match(/^\/(uk|ru|pl|en|sv|de|es|fr)\/?$/);const archive=url.pathname.match(/^\/(uk|ru|pl|en|sv|de|es|fr)\/quotes\/?$/);const cat=url.pathname.match(/^\/(uk|ru|pl|en|sv|de|es|fr)\/category\/([^/]+)\/?$/);
 if(!home&&!archive&&!cat)return null;
 const locale=(home||archive||cat)[1],allCats=await categories(env,locale);
 if(cat){const key=decodeURIComponent(cat[2]);const list=await rows(env,locale,key);const found=allCats.find(c=>c.slug===key);const title=found?.label||key;return new Response(shell(locale,title,cards(locale,list),allCats),{headers:{'content-type':'text/html; charset=utf-8','cache-control':'public, max-age=60'}})}
 const list=await rows(env,locale);return new Response(shell(locale,UI[locale]?.title||UI.en.title,cards(locale,list),allCats),{headers:{'content-type':'text/html; charset=utf-8','cache-control':'public, max-age=60'}});
}
