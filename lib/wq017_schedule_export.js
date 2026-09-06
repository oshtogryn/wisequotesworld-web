const LANGS=['uk','ru','pl','en','sv','de','es','fr','it'];
const KEYS=['pinterest_prompt','facebook','instagram','threads','tiktok','youtube_title','youtube_description','pinterest_title','pinterest_description','article_url','website_reflection'];
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}})}
async function exportPack(env,id){
  const item=await env.DB.prepare(`SELECT id,status,author_name,attribution_status,quote_type FROM content_items WHERE project_id='wisequotesworld' AND id=?`).bind(id).first();
  const outs=(await env.DB.prepare(`SELECT language_code,output_key,output_text,status FROM content_outputs WHERE project_id='wisequotesworld' AND content_item_id=? AND language_code IN ('uk','ru','pl','en','sv','de','es','fr','it') ORDER BY language_code,output_key`).bind(id).all()).results||[];
  const vers=(await env.DB.prepare(`SELECT cv.language_code,cv.version,cv.adapted_text,cv.ai_prompt,cv.status FROM content_versions cv JOIN (SELECT language_code,MAX(version) v FROM content_versions WHERE content_id=? GROUP BY language_code) x ON x.language_code=cv.language_code AND x.v=cv.version WHERE cv.content_id=? ORDER BY cv.language_code`).bind(id,id).all()).results||[];
  const media=(await env.DB.prepare(`SELECT m.id,m.language_code,m.asset_type,m.mime_type,m.original_filename,m.created_at,COALESCE(r.qa_status,'pending') qa_status FROM media_inbox m LEFT JOIN media_reviews r ON r.media_inbox_id=m.id WHERE m.project_id='wisequotesworld' AND m.content_item_id=? ORDER BY m.language_code,m.created_at DESC`).bind(id).all()).results||[];
  const approval=await env.DB.prepare(`SELECT approval_scope,status,updated_at FROM content_approvals WHERE content_item_id=? AND approval_scope='content' AND language_code IS NULL ORDER BY id DESC LIMIT 1`).bind(id).first();
  const visibility=await env.DB.prepare(`SELECT approval_scope,status,updated_at FROM content_approvals WHERE content_item_id=? AND approval_scope='website_visibility' AND language_code IS NULL ORDER BY id DESC LIMIT 1`).bind(id).first();
  const pack={};
  for(const lang of LANGS){
    const v=vers.find(x=>x.language_code===lang)||null;
    pack[lang]={localized_quote:v?.adapted_text||null,video_prompt:v?.ai_prompt||null,version_status:v?.status||null,outputs:{}};
    for(const o of outs)if(o.language_code===lang&&KEYS.includes(o.output_key))pack[lang].outputs[o.output_key]=o.output_text;
  }
  return {ok:true,item,approval,visibility,pack,media:media.map(m=>({id:m.id,language:m.language_code,asset_type:m.asset_type,mime_type:m.mime_type,filename:m.original_filename,qa_status:m.qa_status,created_at:m.created_at}))};
}
const WQ019={
uk:{q:'«Душа забарвлюється думками». — Марк Аврелій',lang:'Ukrainian',name:'Марк Аврелій',scene:'A dignified pale-marble Roman bust inspired by Marcus Aurelius stands in a quiet study at dawn. The sculpture remains unmistakably a work of art, never a living person. Beside it, one drop of dark blue ink slowly spreads through a clear glass bowl of water, turning the water from transparent to blue. Warm sunrise enters through a stone arch. Use slate blue, ivory stone and restrained amber-gold light. Slow cinematic camera movement, subtle atmospheric dust, premium editorial realism.'},
ru:{q:'«Душа окрашивается мыслями». — Марк Аврелий',lang:'Russian',name:'Марк Аврелий',scene:'A dark-bronze Roman bust inspired by Marcus Aurelius stands beside a still reflecting pool in an ancient library courtyard. The sculpture is clearly an artwork and never appears alive. A ribbon of burgundy pigment enters the water and gradually changes its tone, symbolizing repeated thoughts shaping the inner life. Use deep navy, aged bronze, burgundy and soft candle amber. Slow controlled camera drift, premium cinematic realism.'},
pl:{q:'„Dusza nabiera barwy naszych myśli.” — Marek Aureliusz',lang:'Polish',name:'Marek Aureliusz',scene:'A refined limestone relief inspired by Marcus Aurelius rests in a Roman scriptorium. It is visibly carved stone, not a living person. On a nearby table, natural pigments dissolve into a shallow ceramic bowl while blank parchment catches the changing reflected color. Use warm cream, forest green, muted burgundy and aged parchment tones. Gentle side light, restrained movement, sophisticated editorial realism.'},
en:{q:'“The soul is dyed by the thoughts.” — Marcus Aurelius',lang:'English',name:'Marcus Aurelius',scene:'A classical white-marble bust inspired by Marcus Aurelius stands in a high Roman library with tall arches. The sculpture remains clearly a museum-like artwork, never a living person. Sunlight passes through a vessel of colored water and casts gradually deepening teal and amber reflections across pale stone, visualizing thought coloring the inner life. Premium teal, ivory and amber palette, slow cinematic push-in, realistic atmospheric depth.'},
sv:{q:'”Själen färgas av tankarna.” — Marcus Aurelius',lang:'Swedish',name:'Marcus Aurelius',scene:'A light-stone Roman bust inspired by Marcus Aurelius stands on a quiet open terrace above a misty landscape. It remains unmistakably a sculpture. A clear bowl of water on a stone table receives a single cool-blue pigment drop that slowly spreads in soft layers. Use a Nordic palette of blue-grey, pale stone, muted pine and delicate morning gold. Clean composition, subtle mist, slow elegant camera movement.'},
de:{q:'„Die Seele wird von den Gedanken gefärbt.“ — Marc Aurel',lang:'German',name:'Marc Aurel',scene:'A severe dark-bronze Roman bust inspired by Marcus Aurelius stands in an austere stone chamber with geometric window shadows. It remains visibly a crafted artwork, not a living person. Black ink enters clear water in a precise glass vessel and forms disciplined branching patterns before the water darkens. Use graphite, dark bronze, muted ochre and restrained warm light. Deliberate camera motion, architectural composition, premium realism.'},
es:{q:'«El alma se tiñe con los pensamientos». — Marco Aurelio',lang:'Spanish',name:'Marco Aurelio',scene:'A warm sandstone Roman bust inspired by Marcus Aurelius stands in a sunlit Mediterranean courtyard. It remains clearly a sculpture. In a small fountain basin, terracotta-red pigment slowly swirls through clear water while sunlight moves across textured stone. Use terracotta, warm sandstone, muted olive and golden late-afternoon light. Gentle breeze in distant foliage, slow cinematic movement, premium photorealistic detail.'},
fr:{q:'«L’âme se colore de nos pensées.» — Marc Aurèle',lang:'French',name:'Marc Aurèle',scene:'A refined white-marble Roman bust inspired by Marcus Aurelius stands in an elegant classical gallery. The sculpture remains unmistakably an artwork and never appears alive. Soft rose and muted blue pigment diffuse through a crystal bowl, casting delicate colored reflections on ivory marble. Use ivory, dusty blue, restrained rose and antique gold. Graceful camera movement, soft morning haze, sophisticated editorial realism.'},
it:{q:'«L’anima si tinge dei pensieri.» — Marco Aurelio',lang:'Italian',name:'Marco Aurelio',scene:'A Carrara-marble Roman bust inspired by Marcus Aurelius stands in a serene Roman loggia overlooking sunlit hills. The sculpture remains clearly a work of art, never a living person. A drop of deep red pigment falls into a clear travertine basin and slowly spreads through the water, while warm light moves across the marble. Use ivory marble, travertine, muted olive, deep red and soft Italian-gold sunlight. Slow elegant camera movement, premium cinematic realism.'}
};
function videoPrompt(x){return `Create a premium photorealistic vertical 9:16 cinematic video in ${x.lang}.\n\n${x.scene}\n\nRender EXACT text in one stable, elegant, mobile-readable upper-middle text card:\n${x.q}\n\nAudio: a calm native ${x.lang} narrator reads the exact quote and attribution naturally and completely, with correct native pronunciation of ${x.name}. Restrained cinematic music remains below the voice.\n\nNo subtitles. No captions. No emoji. No decorative symbols. No logo. No branding. No watermark. No other readable text.\n\nEnd on a clean contemplative hold.`}
function pinPrompt(x){return `Create a premium photorealistic vertical 2:3 Pinterest image, target 1000×1500. ${x.scene} Compose as a refined editorial still with generous clean space for large mobile-readable typography. Render EXACT text: ${x.q} No other readable text. No logo. No branding. No watermark.`}
const IT_OUT={
article_url:'https://wisequotesworld.com/it/quotes/marcus-aurelius-soul-thoughts/',
facebook:`«L’anima si tinge dei pensieri.» — Marco Aurelio\n\nQuesta immagine, tratta dalle Meditazioni, Libro V, 16, esprime un’idea essenziale: i pensieri a cui torniamo più spesso finiscono per lasciare un’impronta sul nostro modo di vedere il mondo e su ciò che diventiamo.\n\nNon significa che basti “pensare positivo”. Marco Aurelio invita piuttosto a osservare con attenzione ciò a cui concediamo spazio nella mente, perché ciò che alimentiamo ogni giorno influenza giudizi, reazioni e abitudini.\n\nLeggi di più:\nhttps://wisequotesworld.com/it/quotes/marcus-aurelius-soul-thoughts/\n\n#Saggezza #Filosofia #Citazioni #WiseQuotesWorld`,
instagram:`«L’anima si tinge dei pensieri.» — Marco Aurelio\n\nI pensieri a cui torniamo ogni giorno non restano senza conseguenze: poco alla volta influenzano il nostro sguardo, le nostre reazioni e il nostro carattere.\n\nLa domanda utile non è soltanto “che cosa sto pensando?”, ma anche: “a quali pensieri sto dando spazio continuamente?”\n\nScopri di più dal link nel profilo.\n\n#Saggezza #Filosofia #Citazioni #WiseQuotesWorld`,
threads:`«L’anima si tinge dei pensieri.» — Marco Aurelio\n\nCiò a cui torniamo con la mente, giorno dopo giorno, finisce per influenzare il modo in cui guardiamo il mondo.\n\nhttps://wisequotesworld.com/it/quotes/marcus-aurelius-soul-thoughts/\n\n---\n\nQuali pensieri stai alimentando più spesso in questo periodo?\n\nNon tutto ciò che attraversa la mente ci definisce. Ma ciò a cui torniamo continuamente può lasciare un’impronta.\n\nhttps://wisequotesworld.com/it/quotes/marcus-aurelius-soul-thoughts/\n\n---\n\nMarco Aurelio non parla di ottimismo forzato. Parla di attenzione: ciò che occupa abitualmente la mente può cambiare il nostro modo di giudicare, reagire e agire.\n\nhttps://wisequotesworld.com/it/quotes/marcus-aurelius-soul-thoughts/`,
tiktok:`«L’anima si tinge dei pensieri.» — Marco Aurelio\n\nI pensieri a cui torniamo più spesso possono influenzare il nostro modo di vedere, reagire e vivere.\n\nWiseQuotesWorld.com/it/\n\n#Saggezza #Filosofia #Citazioni #WiseQuotesWorld`,
youtube_title:'Marco Aurelio: L’anima si tinge dei pensieri',
youtube_description:`I pensieri a cui torniamo più spesso lasciano un’impronta sul nostro modo di vedere il mondo. Marco Aurelio ci invita a prestare attenzione a ciò che alimentiamo nella mente ogni giorno. Scopri di più dal link nel profilo.\n\n#Saggezza #Filosofia #Citazioni #WiseQuotesWorld`,
pinterest_title:'Marco Aurelio — L’anima si tinge dei pensieri',
pinterest_description:'«L’anima si tinge dei pensieri.» I pensieri a cui torniamo più spesso influenzano gradualmente il nostro modo di vedere il mondo e di reagire.',
website_reflection:`«L’anima si tinge dei pensieri.» — Marco Aurelio\n\nNelle Meditazioni, Libro V, 16, Marco Aurelio riflette sul modo in cui i pensieri abituali plasmano la mente. L’immagine della tintura è semplice ma potente: ciò a cui torniamo interiormente lascia gradualmente un colore, una traccia.\n\nIl punto non è fingere che i problemi non esistano né imporre un ottimismo artificiale. È osservare con maggiore attenzione quali giudizi, paure, risentimenti o principi stiamo ripetendo dentro di noi. Con il tempo, questi schemi influenzano le nostre reazioni e il nostro carattere.\n\nNella vita quotidiana la domanda può diventare molto concreta: quali pensieri sto alimentando più spesso, e mi aiutano a vedere la situazione con maggiore lucidità? Non possiamo controllare tutto ciò che ci accade, ma possiamo esercitare una certa disciplina sull’attenzione che concediamo alle cose.\n\nFonte: Meditazioni, Libro V, 16. Testo greco: Οἷα ἂν πολλάκις φαντασθῇς, τοιαύτη σοι ἔσται ἡ διάνοια· βάπτεται γὰρ ὑπὸ τῶν φαντασιῶν ἡ ψυχή.`
};
async function prepareWQ019(env){
  const ts=new Date().toISOString();
  for(const lang of LANGS){
    const x=WQ019[lang];
    await env.DB.prepare(`UPDATE content_versions SET ai_prompt=?,status='media_pending',updated_at=? WHERE id=(SELECT id FROM content_versions WHERE content_id='WQ019' AND language_code=? ORDER BY version DESC LIMIT 1)`).bind(videoPrompt(x),ts,lang).run();
    await env.DB.prepare(`UPDATE content_outputs SET output_text=?,status='ready',updated_at=? WHERE project_id='wisequotesworld' AND content_item_id='WQ019' AND language_code=? AND output_key='pinterest_prompt'`).bind(pinPrompt(x),ts,lang).run();
  }
  const allIt={...IT_OUT,pinterest_prompt:pinPrompt(WQ019.it)};
  for(const [k,v] of Object.entries(allIt)){
    await env.DB.prepare(`INSERT OR REPLACE INTO content_outputs(id,project_id,content_item_id,language_code,output_key,output_text,status,updated_at) VALUES(?,?,?,?,?,?,?,?)`).bind(`WQ019-it-${k}`,'wisequotesworld','WQ019','it',k,v,'ready',ts).run();
  }
  await env.DB.prepare(`UPDATE content_items SET status='media_pending',updated_at=? WHERE project_id='wisequotesworld' AND id='WQ019'`).bind(ts).run();
  return exportPack(env,'WQ019');
}
async function schemaProbe(env){
  const content_outputs=(await env.DB.prepare(`PRAGMA table_info(content_outputs)`).all()).results||[];
  const content_versions=(await env.DB.prepare(`PRAGMA table_info(content_versions)`).all()).results||[];
  const indexes=(await env.DB.prepare(`PRAGMA index_list(content_outputs)`).all()).results||[];
  return {ok:true,content_outputs,content_versions,indexes};
}
export async function wq017ScheduleExport(request,env){
  const url=new URL(request.url);
  if(!env?.DB)return null;
  try{
    if(request.method==='GET'&&url.pathname==='/ops/export/wq017-9c7f4e2a')return json(await exportPack(env,'WQ017'));
    if(request.method==='GET'&&url.pathname==='/ops/export/wq018-4e8c7a19')return json(await exportPack(env,'WQ018'));
    if(request.method==='GET'&&url.pathname==='/ops/export/wq019-31f6c8aa')return json(await exportPack(env,'WQ019'));
    if(request.method==='GET'&&url.pathname==='/ops/schema/wq019-5bb7e2c1')return json(await schemaProbe(env));
    if(request.method==='POST'&&url.pathname==='/ops/prepare/wq019-8a31df74')return json(await prepareWQ019(env));
    return null;
  }catch(e){return json({ok:false,error:String(e?.message||e)},500)}
}
