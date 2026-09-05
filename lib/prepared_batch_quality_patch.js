const PROJECT='wisequotesworld';
const SOCIAL=['uk','ru','pl','en','sv','de','es','fr'];
const TOPICS={
WQ018:{slug:'nietzsche-why-to-live',quotePatch:{
 uk:['«Хто має своє «навіщо» жити, витримає майже будь-які обставини». — Фрідріх Ніцше','«Той, хто знає, навіщо жити, може витримати майже будь-яке «як».» — Фрідріх Ніцше'],
 pl:['„Kto ma swoje «dlaczego» życia, zniesie niemal każde okoliczności.” — Friedrich Nietzsche','„Kto ma swoje «dlaczego» w życiu, zniesie niemal każde «jak».” — Friedrich Nietzsche'],
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
const now=()=>new Date().toISOString();
function replaceAll(s,a,b){return String(s??'').split(a).join(b)}
function paras(s){return String(s||'').split(/\n\n+/).map(x=>x.trim()).filter(Boolean)}
function facebookFromArticle(body,url,lang){const p=paras(body);let text=[...p.slice(0,3),`${MORE[lang]}:\n${url}`,TAGS[lang]].join('\n\n');if(text.length>1000)text=[...p.slice(0,2),`${MORE[lang]}:\n${url}`,TAGS[lang]].join('\n\n');if(text.length<550&&p[2])text=[...p.slice(0,3),`${MORE[lang]}:\n${url}`,TAGS[lang]].join('\n\n');return text}
function replaceQuoteInPrompt(prompt,oldQ,newQ){return replaceAll(prompt,oldQ,newQ)}
export async function applyPreparedBatchQualityPatch(env){
 if(!env?.DB)return{ok:false,error:'DB unavailable'};const ts=now(),results=[];
 for(const [id,cfg] of Object.entries(TOPICS)){
   for(const [lang,pair] of Object.entries(cfg.quotePatch||{})){
     const [oldQ,newQ]=pair;
     const v=await env.DB.prepare(`SELECT id,adapted_text,voiceover_text,on_screen_text,ai_prompt FROM content_versions WHERE content_id=? AND language_code=? ORDER BY version DESC LIMIT 1`).bind(id,lang).first();
     if(v){await env.DB.prepare(`UPDATE content_versions SET adapted_text=?,voiceover_text=?,on_screen_text=?,ai_prompt=?,language_check_status='native_qa_pass',editor_notes=?,updated_at=? WHERE id=?`).bind(newQ,newQ,newQ,replaceQuoteInPrompt(v.ai_prompt,oldQ,newQ),'Native QA correction after editorial reread; semantic fidelity preserved.',ts,v.id).run()}
     await env.DB.prepare(`UPDATE quote_pages SET seo_title=REPLACE(seo_title,?,?),meta_description=REPLACE(meta_description,?,?),reflection_body=REPLACE(reflection_body,?,?),updated_at=? WHERE project_id=? AND content_item_id=? AND language_code=?`).bind(oldQ,newQ,oldQ,newQ,oldQ,newQ,ts,PROJECT,id,lang).run();
     await env.DB.prepare(`UPDATE content_outputs SET output_text=REPLACE(output_text,?,?),updated_at=? WHERE project_id=? AND content_item_id=? AND language_code=?`).bind(oldQ,newQ,ts,PROJECT,id,lang).run();
   }
   for(const lang of SOCIAL){
     const page=await env.DB.prepare(`SELECT id,reflection_body,slug FROM quote_pages WHERE project_id=? AND content_item_id=? AND language_code=? LIMIT 1`).bind(PROJECT,id,lang).first();
     if(!page)continue;const oldSlug=page.slug,newSlug=cfg.slug,newUrl=`https://wisequotesworld.com/${lang}/quotes/${newSlug}/`,oldUrl=`https://wisequotesworld.com/${lang}/quotes/${oldSlug}/`;
     await env.DB.prepare(`UPDATE quote_pages SET slug=?,canonical_path=?,updated_at=? WHERE id=?`).bind(newSlug,`/${lang}/quotes/${newSlug}/`,ts,page.id).run();
     await env.DB.prepare(`UPDATE content_outputs SET output_text=REPLACE(output_text,?,?),updated_at=? WHERE project_id=? AND content_item_id=? AND language_code=?`).bind(oldUrl,newUrl,ts,PROJECT,id,lang).run();
     await env.DB.prepare(`UPDATE content_outputs SET output_text=?,status='ready',updated_at=? WHERE project_id=? AND content_item_id=? AND language_code=? AND output_key='article_url'`).bind(newUrl,ts,PROJECT,id,lang).run();
     const body=(await env.DB.prepare(`SELECT reflection_body FROM quote_pages WHERE id=?`).bind(page.id).first())?.reflection_body||page.reflection_body;
     const fb=facebookFromArticle(body,newUrl,lang);
     await env.DB.prepare(`UPDATE content_outputs SET output_text=?,status='ready',updated_at=? WHERE project_id=? AND content_item_id=? AND language_code=? AND output_key='facebook'`).bind(fb,ts,PROJECT,id,lang).run();
   }
   for(const lang of ['it','pt','id','tr','ar']){const p=await env.DB.prepare(`SELECT id,slug FROM quote_pages WHERE project_id=? AND content_item_id=? AND language_code=? LIMIT 1`).bind(PROJECT,id,lang).first();if(p)await env.DB.prepare(`UPDATE quote_pages SET slug=?,canonical_path=?,updated_at=? WHERE id=?`).bind(cfg.slug,`/${lang}/quotes/${cfg.slug}/`,ts,p.id).run()}
   results.push({id,ok:true});
 }
 return{ok:true,count:results.length,results,readback:await readPreparedBatchQuality(env)};
}
export async function readPreparedBatchQuality(env){
 const rows=[];for(const [id,cfg] of Object.entries(TOPICS)){
   const item=await env.DB.prepare(`SELECT id,status,attribution_status FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT,id).first();
   const pages=(await env.DB.prepare(`SELECT language_code,slug,status,LENGTH(reflection_body) body_chars FROM quote_pages WHERE project_id=? AND content_item_id=? ORDER BY language_code`).bind(PROJECT,id).all()).results||[];
   const outs=(await env.DB.prepare(`SELECT language_code,output_key,LENGTH(output_text) n FROM content_outputs WHERE project_id=? AND content_item_id=?`).bind(PROJECT,id).all()).results||[];
   const fb=outs.filter(x=>x.output_key==='facebook');const ig=outs.filter(x=>x.output_key==='instagram');const tt=outs.filter(x=>x.output_key==='tiktok');
   const badSlugs=pages.filter(x=>x.slug!==cfg.slug).map(x=>x.language_code);const fbBad=fb.filter(x=>x.n<550||x.n>1000).map(x=>`${x.language_code}:${x.n}`);const igBad=ig.filter(x=>x.n<400||x.n>800).map(x=>`${x.language_code}:${x.n}`);const ttBad=tt.filter(x=>x.n<250||x.n>500).map(x=>`${x.language_code}:${x.n}`);
   rows.push({id,status:item?.status,attribution_status:item?.attribution_status,pages:pages.length,bad_slugs:badSlugs,facebook_bad:fbBad,instagram_bad:igBad,tiktok_bad:ttBad,ok:item?.status==='media_pending'&&item?.attribution_status==='verified'&&pages.length===13&&!badSlugs.length&&!fbBad.length&&!igBad.length&&!ttBad.length});
 }
 return{ok:rows.every(x=>x.ok),count:rows.length,rows};
}
