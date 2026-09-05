const PROJECT='wisequotesworld';
const SOCIAL=['uk','ru','pl','en','sv','de','es','fr'];
const EXTRA=['it','pt','id','tr','ar'];
const TOPICS={
WQ018:{slug:'nietzsche-why-to-live',quotePatch:{
 uk:['«Хто має своє «навіщо» жити, витримає майже будь-які обставини». — Фрідріх Ніцше','«Той, хто має заради чого жити, витримає майже будь-яке «як».» — Фрідріх Ніцше'],
 pl:['„Kto ma swoje «dlaczego» życia, zniesie niemal każde okoliczności.” — Friedrich Nietzsche','„Kto ma po co żyć, zniesie niemal każde «jak».” — Friedrich Nietzsche'],
 en:['“If you have a why to live, you can bear almost any circumstances.” — Friedrich Nietzsche','“He who has a why to live can bear almost any how.” — Friedrich Nietzsche']
}},
WQ019:{slug:'marcus-aurelius-soul-thoughts'},
WQ020:{slug:'oscar-wilde-gutter-stars',quotePatch:{
 es:['«Todos estamos en la cuneta, pero algunos miramos las estrellas». — Oscar Wilde','«Todos estamos en el arroyo, pero algunos miramos las estrellas». — Oscar Wilde']
}},
WQ021:{slug:'confucius-learn-practice'},
WQ022:{slug:'einstein-imagination-knowledge'},
WQ023:{slug:'lesya-ukrainka-hope-live'},
WQ024:{slug:'kennedy-ask-what-you-can-do'},
WQ025:{slug:'tagore-mind-without-fear'},
WQ026:{slug:'montaigne-art-to-live'}
};
const TAGS={uk:'#Мудрість #Філософія #Цитати #WiseQuotesWorld',ru:'#Мудрость #Философия #Цитаты #WiseQuotesWorld',pl:'#Mądrość #Filozofia #Cytaty #WiseQuotesWorld',en:'#Wisdom #Philosophy #Quotes #WiseQuotesWorld',sv:'#Visdom #Filosofi #Citat #WiseQuotesWorld',de:'#Weisheit #Philosophie #Zitate #WiseQuotesWorld',es:'#Sabiduría #Filosofía #Citas #WiseQuotesWorld',fr:'#Sagesse #Philosophie #Citations #WiseQuotesWorld'};
const MORE={uk:'Докладніше',ru:'Подробнее',pl:'Więcej',en:'Read more',sv:'Läs mer',de:'Mehr',es:'Más',fr:'En savoir plus'};
const PROFILE={uk:'Більше — за посиланням у профілі.',ru:'Больше — по ссылке в профиле.',pl:'Więcej — pod linkiem w profilu.',en:'More via the link in the profile.',sv:'Mer via länken i profilen.',de:'Mehr über den Link im Profil.',es:'Más en el enlace del perfil.',fr:'Plus via le lien dans le profil.'};
const SITE={uk:'Більше: WiseQuotesWorld.com/uk/',ru:'Больше: WiseQuotesWorld.com/ru/',pl:'Więcej: WiseQuotesWorld.com/pl/',en:'More: WiseQuotesWorld.com/en/',sv:'Mer: WiseQuotesWorld.com/sv/',de:'Mehr: WiseQuotesWorld.com/de/',es:'Más: WiseQuotesWorld.com/es/',fr:'Plus : WiseQuotesWorld.com/fr/'};
const now=()=>new Date().toISOString();
function replaceAll(s,a,b){return String(s??'').split(a).join(b)}
function paras(s){return String(s||'').split(/\n\n+/).map(x=>x.trim()).filter(Boolean)}
function clampWords(text,maxChars){const words=String(text||'').split(/\s+/);let out='';for(const w of words){const n=out?out+' '+w:w;if(n.length>maxChars)break;out=n}return out.replace(/[,:;\-–—]+$/,'').trim()+(out&&out.length<String(text||'').length?'…':'')}
function compose(body,suffix,min,max){const ps=paras(body),chosen=[];let base=suffix;for(const p of ps){const candidate=[...chosen,p,base].join('\n\n');if(candidate.length<=max){chosen.push(p);if(candidate.length>=min)break}else break}let text=[...chosen,base].join('\n\n');if(text.length<min){const used=chosen.length,next=ps[used];if(next){const room=Math.max(0,max-text.length-2);const clipped=clampWords(next,room);if(clipped)text=[...chosen,clipped,base].join('\n\n')}}return text}
function facebookFromArticle(body,url,lang){return compose(body,`${MORE[lang]}:\n${url}\n\n${TAGS[lang]}`,550,1000)}
function instagramFromArticle(body,lang){return compose(body,`${PROFILE[lang]}\n\n${TAGS[lang]}`,400,800)}
function tiktokFromArticle(body,lang){return compose(body,`${SITE[lang]}\n\n${TAGS[lang]}`,250,500)}
function replaceQuoteInPrompt(prompt,oldQ,newQ){return replaceAll(prompt,oldQ,newQ)}
async function upsertOutput(env,id,lang,key,text,ts){await env.DB.prepare(`INSERT INTO content_outputs(id,project_id,content_item_id,language_code,output_key,output_text,status,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(content_item_id,language_code,output_key) DO UPDATE SET output_text=excluded.output_text,status=excluded.status,updated_at=excluded.updated_at`).bind(`${id}_${lang}_${key}`,PROJECT,id,lang,key,text,'ready',ts).run()}
export async function applyPreparedTopicQuality(env,id){
 if(!env?.DB)return{ok:false,error:'DB unavailable'};const cfg=TOPICS[id];if(!cfg)return{ok:false,error:'unsupported topic',id};const ts=now();
 for(const [lang,pair] of Object.entries(cfg.quotePatch||{})){
   const [oldQ,newQ]=pair;
   const v=await env.DB.prepare(`SELECT id,adapted_text,voiceover_text,on_screen_text,ai_prompt FROM content_versions WHERE content_id=? AND language_code=? ORDER BY version DESC LIMIT 1`).bind(id,lang).first();
   if(v)await env.DB.prepare(`UPDATE content_versions SET adapted_text=?,voiceover_text=?,on_screen_text=?,ai_prompt=?,language_check_status='native_qa_pass',editor_notes=? WHERE id=?`).bind(newQ,newQ,newQ,replaceQuoteInPrompt(v.ai_prompt,oldQ,newQ),'Native QA correction after editorial reread; semantic fidelity preserved.',v.id).run();
   await env.DB.prepare(`UPDATE quote_pages SET seo_title=REPLACE(seo_title,?,?),meta_description=REPLACE(meta_description,?,?),reflection_body=REPLACE(reflection_body,?,?),updated_at=? WHERE project_id=? AND content_item_id=? AND language_code=?`).bind(oldQ,newQ,oldQ,newQ,oldQ,newQ,ts,PROJECT,id,lang).run();
   await env.DB.prepare(`UPDATE content_outputs SET output_text=REPLACE(output_text,?,?),updated_at=? WHERE project_id=? AND content_item_id=? AND language_code=?`).bind(oldQ,newQ,ts,PROJECT,id,lang).run();
 }
 for(const lang of SOCIAL){
   const page=await env.DB.prepare(`SELECT id,reflection_body,slug FROM quote_pages WHERE project_id=? AND content_item_id=? AND language_code=? LIMIT 1`).bind(PROJECT,id,lang).first();
   if(!page)continue;const oldSlug=page.slug,newSlug=cfg.slug,newUrl=`https://wisequotesworld.com/${lang}/quotes/${newSlug}/`,oldUrl=`https://wisequotesworld.com/${lang}/quotes/${oldSlug}/`;
   await env.DB.prepare(`UPDATE quote_pages SET slug=?,canonical_path=?,updated_at=? WHERE id=?`).bind(newSlug,`/${lang}/quotes/${newSlug}/`,ts,page.id).run();
   if(oldUrl!==newUrl)await env.DB.prepare(`UPDATE content_outputs SET output_text=REPLACE(output_text,?,?),updated_at=? WHERE project_id=? AND content_item_id=? AND language_code=?`).bind(oldUrl,newUrl,ts,PROJECT,id,lang).run();
   await upsertOutput(env,id,lang,'article_url',newUrl,ts);
   const body=(await env.DB.prepare(`SELECT reflection_body FROM quote_pages WHERE id=?`).bind(page.id).first())?.reflection_body||page.reflection_body;
   await upsertOutput(env,id,lang,'facebook',facebookFromArticle(body,newUrl,lang),ts);
   await upsertOutput(env,id,lang,'instagram',instagramFromArticle(body,lang),ts);
   await upsertOutput(env,id,lang,'tiktok',tiktokFromArticle(body,lang),ts);
 }
 for(const lang of EXTRA){const p=await env.DB.prepare(`SELECT id FROM quote_pages WHERE project_id=? AND content_item_id=? AND language_code=? LIMIT 1`).bind(PROJECT,id,lang).first();if(p)await env.DB.prepare(`UPDATE quote_pages SET slug=?,canonical_path=?,updated_at=? WHERE id=?`).bind(cfg.slug,`/${lang}/quotes/${cfg.slug}/`,ts,p.id).run()}
 return{ok:true,id,readback:await readPreparedTopicQuality(env,id)};
}
export async function applyPreparedBatchQualityPatch(env){const results=[];for(const id of Object.keys(TOPICS))results.push(await applyPreparedTopicQuality(env,id));return{ok:results.every(x=>x.ok),count:results.length,results,readback:await readPreparedBatchQuality(env)}}
export async function readPreparedTopicQuality(env,id){
 const cfg=TOPICS[id];if(!cfg)return{ok:false,error:'unsupported topic',id};const item=await env.DB.prepare(`SELECT id,status,attribution_status FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT,id).first();
 const pages=(await env.DB.prepare(`SELECT language_code,slug,status,LENGTH(reflection_body) body_chars FROM quote_pages WHERE project_id=? AND content_item_id=? ORDER BY language_code`).bind(PROJECT,id).all()).results||[];
 const outs=(await env.DB.prepare(`SELECT language_code,output_key,LENGTH(output_text) n FROM content_outputs WHERE project_id=? AND content_item_id=?`).bind(PROJECT,id).all()).results||[];
 const by=k=>outs.filter(x=>x.output_key===k);const badSlugs=pages.filter(x=>x.slug!==cfg.slug).map(x=>x.language_code);const fbBad=by('facebook').filter(x=>x.n<550||x.n>1000).map(x=>`${x.language_code}:${x.n}`);const igBad=by('instagram').filter(x=>x.n<400||x.n>800).map(x=>`${x.language_code}:${x.n}`);const ttBad=by('tiktok').filter(x=>x.n<250||x.n>500).map(x=>`${x.language_code}:${x.n}`);const socialCounts=Object.fromEntries(SOCIAL.map(l=>[l,outs.filter(x=>x.language_code===l&&String(x.n||0)>0).length]));const outputBad=Object.entries(socialCounts).filter(([,n])=>n<11).map(([l,n])=>`${l}:${n}`);
 const ok=item?.status==='media_pending'&&item?.attribution_status==='verified'&&pages.length===13&&!badSlugs.length&&!fbBad.length&&!igBad.length&&!ttBad.length&&!outputBad.length;
 return{id,status:item?.status,attribution_status:item?.attribution_status,pages:pages.length,bad_slugs:badSlugs,facebook_bad:fbBad,instagram_bad:igBad,tiktok_bad:ttBad,output_bad:outputBad,ok};
}
export async function readPreparedBatchQuality(env){const rows=[];for(const id of Object.keys(TOPICS))rows.push(await readPreparedTopicQuality(env,id));return{ok:rows.every(x=>x.ok),count:rows.length,rows}}
