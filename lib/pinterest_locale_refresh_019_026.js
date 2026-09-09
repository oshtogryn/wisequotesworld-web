const PROJECT='wisequotesworld';
const TOPICS=['WQ019','WQ020','WQ021','WQ022','WQ023','WQ024','WQ025','WQ026'];
const LANGS=['uk','ru','pl','en','sv','de','es','fr','it','pt','id','tr','ar'];
const TS=()=>new Date().toISOString();

const CONCEPT={
 WQ019:'Marcus Aurelius in a restrained Roman study at dawn. Dark ink slowly diffuses through clear water, becoming the metaphor for repeated thoughts coloring the inner life.',
 WQ020:'A refined theatrical portrait of Oscar Wilde beside a rain-darkened Victorian street. Reflections in the gutter lead the eye upward to a clear field of stars, preserving the original play’s irony while allowing a hopeful visual tension.',
 WQ021:'A dignified classical Chinese scholar setting with Confucius represented through a historically respectful portrait tradition. A student repeatedly practices calligraphy; successive strokes become steadier, turning repetition into visible mastery.',
 WQ022:'Einstein in a quiet 1929 study, recognizably rendered in a dignified editorial portrait. Chalk equations stop at the edge of a board while a window opens onto a vast star field, making imagination the bridge beyond known facts.',
 WQ023:'A dignified art-historical portrait of Lesya Ukrainka in a spring landscape emerging from late frost. Small flowers push through cold ground while warm light reaches the horizon: active hope without sentimentality.',
 WQ024:'A dignified presidential portrait of John F. Kennedy in a restrained 1961 civic setting. Citizens pass a light forward from one person to another, turning responsibility from an abstract slogan into visible service.',
 WQ025:'A dignified portrait of Rabindranath Tagore beside an open threshold at dawn. A bowed silhouette slowly raises its head as walls recede into open sky, expressing intellectual and moral freedom without triumphalism.',
 WQ026:'Montaigne in a quiet Renaissance tower library, dignified and contemplative. An unfinished manuscript lies beside ordinary objects of daily life; sunlight moves across them, suggesting that living itself is the work and the art.'
};

const PALETTE={
 uk:'deep blue, warm wheat-gold and soft dusk neutrals',
 ru:'deep burgundy, charcoal and muted ivory',
 pl:'warm ivory, muted crimson and graphite',
 en:'Oxford navy, parchment and restrained brass',
 sv:'Nordic cool blue, pale stone and soft amber',
 de:'charcoal, forest green and warm ochre',
 es:'terracotta, olive and warm cream',
 fr:'slate blue, warm ivory and muted burgundy',
 it:'olive green, terracotta and warm stone',
 pt:'deep emerald, warm sand and muted azure',
 id:'teak-brown earth tones, warm cream and subdued indigo',
 tr:'deep teal, copper and warm stone',
 ar:'desert sand, deep indigo and antique gold'
};

const COPY={
 uk:[
  a=>`Цитата ${a}, до якої варто повернутися не заради красивої фрази, а заради змісту. У статті — контекст, тлумачення й практична рефлексія про те, як ця думка працює в житті.`,
  a=>`Що насправді стоїть за цими словами ${a}? Розбираємо контекст цитати, її сенс і те, як вона може змінити погляд на звичайні життєві рішення.`,
  a=>`Одна коротка думка ${a} може відкрити значно ширшу розмову. Повний матеріал пояснює походження цитати, її зміст і практичний вимір без спрощених мотиваційних лозунгів.`],
 ru:[
  a=>`Цитата ${a}, к которой стоит возвращаться не ради красивой формулировки, а ради смысла. В статье — контекст, толкование и практическое размышление о том, как эта мысль проявляется в жизни.`,
  a=>`Что на самом деле стоит за этими словами ${a}? Разбираем контекст цитаты, её смысл и то, как она может изменить взгляд на обычные жизненные решения.`,
  a=>`Одна короткая мысль ${a} может открыть гораздо более широкий разговор. Полный материал объясняет происхождение цитаты, её смысл и практическое измерение без упрощённых мотивационных лозунгов.`],
 pl:[
  a=>`Cytat ${a}, do którego warto wracać nie dla samego brzmienia, lecz dla jego sensu. W artykule znajdziesz kontekst, interpretację i praktyczną refleksję nad tym, jak ta myśl działa w codziennym życiu.`,
  a=>`Co naprawdę kryje się za tymi słowami ${a}? Przyglądamy się kontekstowi cytatu, jego znaczeniu i temu, jak może zmienić sposób patrzenia na zwykłe decyzje.`,
  a=>`Jedna krótka myśl ${a} może otworzyć znacznie szerszą rozmowę. Pełny tekst pokazuje źródło, sens i praktyczny wymiar cytatu bez upraszczania go do motywacyjnego hasła.`],
 en:[
  a=>`A ${a} quote worth returning to for more than its wording. The full article explores its context, meaning, and the practical question of how this idea can shape everyday choices.`,
  a=>`What is really behind these words by ${a}? We look at the quote in context, unpack its meaning, and consider how it can change the way we see ordinary decisions.`,
  a=>`A short line from ${a} can open a much larger conversation. The full reflection traces the quote’s context and practical meaning without reducing it to a motivational slogan.`],
 sv:[
  a=>`Ett citat av ${a} som är värt att återvända till för mer än själva formuleringen. I artikeln finns sammanhang, tolkning och en praktisk reflektion över hur tanken kan påverka vardagens val.`,
  a=>`Vad finns egentligen bakom de här orden av ${a}? Vi ser på citatet i sitt sammanhang, tolkar innebörden och undersöker hur det kan förändra synen på vanliga beslut.`,
  a=>`En kort tanke av ${a} kan öppna ett betydligt större samtal. Den fullständiga texten ger sammanhang och praktisk mening utan att göra citatet till en förenklad motivationsfras.`],
 de:[
  a=>`Ein Zitat von ${a}, zu dem man nicht nur wegen seiner Formulierung zurückkehren kann. Der Artikel beleuchtet Kontext, Bedeutung und die praktische Frage, was dieser Gedanke im Alltag verändert.`,
  a=>`Was steckt wirklich hinter diesen Worten von ${a}? Wir ordnen das Zitat ein, entschlüsseln seine Bedeutung und fragen, wie es den Blick auf alltägliche Entscheidungen verändern kann.`,
  a=>`Ein kurzer Satz von ${a} kann ein viel größeres Gespräch eröffnen. Der vollständige Beitrag zeigt Kontext und praktische Bedeutung, ohne das Zitat auf einen Motivationsspruch zu reduzieren.`],
 es:[
  a=>`Una cita de ${a} a la que vale la pena volver por algo más que su belleza. El artículo explora su contexto, su significado y la forma en que esta idea puede influir en decisiones cotidianas.`,
  a=>`¿Qué hay realmente detrás de estas palabras de ${a}? Revisamos el contexto de la cita, su sentido y cómo puede cambiar nuestra manera de mirar decisiones aparentemente simples.`,
  a=>`Una frase breve de ${a} puede abrir una conversación mucho más amplia. La reflexión completa recupera su contexto y su dimensión práctica sin convertirla en un eslogan motivacional.`],
 fr:[
  a=>`Une citation de ${a} à laquelle il vaut la peine de revenir pour autre chose que sa beauté. L’article en explore le contexte, le sens et la portée concrète dans les choix du quotidien.`,
  a=>`Que se cache-t-il vraiment derrière ces mots de ${a} ? Nous replaçons la citation dans son contexte, en éclairons le sens et examinons ce qu’elle peut changer dans notre manière de décider.`,
  a=>`Une phrase brève de ${a} peut ouvrir une réflexion beaucoup plus vaste. Le texte complet en restitue le contexte et la portée pratique sans la réduire à un slogan de motivation.`],
 it:[
  a=>`Una citazione di ${a} a cui vale la pena tornare non soltanto per la sua forma. Nell’articolo trovi contesto, significato e una riflessione concreta su come questa idea può entrare nelle scelte di ogni giorno.`,
  a=>`Che cosa c’è davvero dietro queste parole di ${a}? Ricostruiamo il contesto della citazione, ne esploriamo il significato e il modo in cui può cambiare lo sguardo sulle decisioni quotidiane.`,
  a=>`Una frase breve di ${a} può aprire una riflessione molto più ampia. Il testo completo ne approfondisce contesto e valore pratico senza ridurla a uno slogan motivazionale.`],
 pt:[
  a=>`Uma citação de ${a} à qual vale a pena voltar por algo além da beleza da frase. O artigo explora o contexto, o significado e como essa ideia pode aparecer nas escolhas do dia a dia.`,
  a=>`O que realmente existe por trás destas palavras de ${a}? Revisitamos o contexto da citação, seu sentido e a maneira como ela pode mudar nosso olhar sobre decisões comuns.`,
  a=>`Uma frase curta de ${a} pode abrir uma conversa muito maior. A reflexão completa apresenta contexto e significado prático sem transformar a citação em um simples slogan motivacional.`],
 id:[
  a=>`Kutipan dari ${a} ini layak dibaca kembali bukan hanya karena bunyinya. Artikel lengkap membahas konteks, makna, dan bagaimana gagasan ini dapat hadir dalam pilihan sehari-hari.`,
  a=>`Apa yang sebenarnya ada di balik kata-kata ${a} ini? Kami melihat konteks kutipan, menafsirkan maknanya, dan mempertimbangkan bagaimana gagasan tersebut dapat mengubah cara kita memandang keputusan sehari-hari.`,
  a=>`Satu kalimat singkat dari ${a} dapat membuka pembahasan yang jauh lebih luas. Refleksi lengkapnya memberi konteks dan makna praktis tanpa menjadikannya sekadar slogan motivasi.`],
 tr:[
  a=>`${a}’dan bu alıntıya yalnızca güzel bir söz olduğu için değil, taşıdığı anlam için de dönmeye değer. Yazıda bağlamı, anlamı ve bu düşüncenin günlük seçimlerde nasıl karşılık bulabileceğini ele alıyoruz.`,
  a=>`${a}’ın bu sözlerinin arkasında gerçekte ne var? Alıntıyı bağlamına yerleştiriyor, anlamını açıyor ve sıradan kararlarımızı nasıl etkileyebileceğini inceliyoruz.`,
  a=>`${a}’dan kısa bir cümle çok daha geniş bir düşünce alanı açabilir. Tam metin, alıntıyı basit bir motivasyon sloganına indirgemeden bağlamını ve pratik anlamını ele alıyor.`],
 ar:[
  a=>`اقتباس لـ${a} يستحق العودة إليه من أجل معناه لا من أجل جمال عبارته فقط. يتناول المقال سياقه ودلالته وكيف يمكن لهذه الفكرة أن تظهر في قرارات الحياة اليومية.`,
  a=>`ما الذي يقف حقًا وراء هذه الكلمات لـ${a}؟ نضع الاقتباس في سياقه، ونوضح معناه، ونتأمل كيف يمكن أن يغيّر نظرتنا إلى القرارات العادية.`,
  a=>`قد تفتح عبارة قصيرة لـ${a} بابًا لتأمل أوسع بكثير. يعرض النص الكامل السياق والمعنى العملي من دون اختزال الاقتباس في شعار تحفيزي.`]
};

function baseQuote(q){return String(q).split(' — ')[0].replace(/^[«“„”]+|[»“”]+$/g,'').trim()}
function authorFromQuote(q,fallback=''){const a=String(q).split(' — ');return a.length>1?a[a.length-1].trim():fallback}
function pinTitle(q,author){const b=baseQuote(q).replace(/[.!?…]+$/,'');return `${author} — ${b}`.slice(0,96)}
function pinPrompt(lang,q,concept){return `Create a premium photorealistic vertical 2:3 Pinterest image, target 1000×1500.\n\n${concept}\n\nLocale visual direction: use a refined palette of ${PALETTE[lang]}. Treat this only as a subtle editorial color mood for this locale. Do not use flags, national emblems, stereotypical costumes, tourist landmarks, folk motifs, or literal country symbolism unless the quote itself requires them.\n\nKeep the scene premium, cinematic and save-worthy, with a composition that feels distinct from the other language versions of the same topic while preserving the same meaning. Leave generous clean space for large mobile-readable typography.\n\nRender EXACT text:\n${q}\n\nThe exact quote and its attribution already contained above are the ONLY readable text. Do not add CTA text, “read more”, explanations, labels, extra words, logo, branding or watermark.`}

async function ensure(env){await env.DB.exec(`CREATE TABLE IF NOT EXISTS content_outputs (id TEXT PRIMARY KEY,project_id TEXT NOT NULL,content_item_id TEXT NOT NULL,language_code TEXT NOT NULL,output_key TEXT NOT NULL,output_text TEXT,status TEXT NOT NULL DEFAULT 'draft',updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE(content_item_id,language_code,output_key));`)}

export async function refreshPinterestLocaleCreative019026(env){
 if(!env?.DB)return{ok:false,error:'DB unavailable'};await ensure(env);const ts=TS(),samples=[];
 for(const id of TOPICS){
  for(const lang of LANGS){
   const v=await env.DB.prepare(`SELECT adapted_text FROM content_versions WHERE content_id=? AND language_code=? ORDER BY version DESC LIMIT 1`).bind(id,lang).first();
   const item=await env.DB.prepare(`SELECT author_name FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT,id).first();
   if(!v?.adapted_text)return{ok:false,error:'missing localized quote',id,lang};
   const q=v.adapted_text,author=authorFromQuote(q,item?.author_name||''),variant=Number(id.slice(2))%3;
   const outputs={
    pinterest_prompt:pinPrompt(lang,q,CONCEPT[id]),
    pinterest_title:pinTitle(q,author),
    pinterest_description:COPY[lang][variant](author)
   };
   for(const [key,text] of Object.entries(outputs)){
    await env.DB.prepare(`INSERT INTO content_outputs(id,project_id,content_item_id,language_code,output_key,output_text,status,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(content_item_id,language_code,output_key) DO UPDATE SET output_text=excluded.output_text,status='ready',updated_at=excluded.updated_at`).bind(`${id}_${lang}_${key}`,PROJECT,id,lang,key,text,'ready',ts).run();
   }
   if(samples.length<6)samples.push({id,lang,prompt:outputs.pinterest_prompt,title:outputs.pinterest_title,description:outputs.pinterest_description});
  }
 }
 return{ok:true,at:ts,updated_topics:TOPICS.length,locales:LANGS.length,fields_per_locale:3,expected_rows:TOPICS.length*LANGS.length*3,samples,readback:await readPinterestLocaleCreative019026(env)};
}

export async function readPinterestLocaleCreative019026(env){
 if(!env?.DB)return{ok:false,error:'DB unavailable'};await ensure(env);const rows=[];
 for(const id of TOPICS){
  const r=await env.DB.prepare(`SELECT COUNT(*) c,COUNT(DISTINCT language_code) langs FROM content_outputs WHERE project_id=? AND content_item_id=? AND language_code IN ('uk','ru','pl','en','sv','de','es','fr','it','pt','id','tr','ar') AND output_key IN ('pinterest_prompt','pinterest_title','pinterest_description') AND status='ready' AND TRIM(COALESCE(output_text,''))<>''`).bind(PROJECT,id).first();
  const noCta=await env.DB.prepare(`SELECT COUNT(*) c FROM content_outputs WHERE project_id=? AND content_item_id=? AND output_key='pinterest_prompt' AND language_code IN ('uk','ru','pl','en','sv','de','es','fr','it','pt','id','tr','ar') AND output_text LIKE '%Do not add CTA text%'`).bind(PROJECT,id).first();
  const palette=await env.DB.prepare(`SELECT COUNT(*) c FROM content_outputs WHERE project_id=? AND content_item_id=? AND output_key='pinterest_prompt' AND language_code IN ('uk','ru','pl','en','sv','de','es','fr','it','pt','id','tr','ar') AND output_text LIKE '%Locale visual direction:%'`).bind(PROJECT,id).first();
  rows.push({id,ready_fields:Number(r?.c||0),locales:Number(r?.langs||0),no_cta_prompts:Number(noCta?.c||0),locale_palette_prompts:Number(palette?.c||0),complete:Number(r?.c||0)===39&&Number(r?.langs||0)===13&&Number(noCta?.c||0)===13&&Number(palette?.c||0)===13});
 }
 return{ok:rows.length===8&&rows.every(x=>x.complete),rows};
}
