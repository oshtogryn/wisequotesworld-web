const PROJECT='wisequotesworld';
const TOPICS=['WQ019','WQ020','WQ021','WQ022','WQ023','WQ024','WQ025','WQ026'];
const LANGS=['uk','ru','pl','en','sv','de','es','fr','it','pt','id','tr','ar'];
const DESC={
uk:[
'Ця цитата варта уваги не лише через красиве формулювання. У повній статті розбираємо її контекст, сенс і те, як ця думка може проявлятися у звичайних життєвих рішеннях.',
'Що насправді стоїть за цими словами? Розбираємо контекст цитати, її сенс і те, як вона може змінити погляд на повсякденні рішення.',
'Одна коротка цитата може відкрити значно ширшу розмову. Повний матеріал пояснює її походження, зміст і практичний вимір без спрощених мотиваційних лозунгів.'
],
ru:[
'Эта цитата заслуживает внимания не только из-за красивой формулировки. В полной статье разбираем её контекст, смысл и то, как эта мысль может проявляться в обычных жизненных решениях.',
'Что на самом деле стоит за этими словами? Разбираем контекст цитаты, её смысл и то, как она может изменить взгляд на повседневные решения.',
'Одна короткая цитата может открыть гораздо более широкий разговор. Полный материал объясняет её происхождение, смысл и практическое измерение без упрощённых мотивационных лозунгов.'
],
pl:[
'Ten cytat zasługuje na uwagę nie tylko ze względu na brzmienie. W pełnym artykule przyglądamy się jego kontekstowi, znaczeniu i temu, jak ta myśl może działać w codziennych decyzjach.',
'Co naprawdę kryje się za tymi słowami? Przyglądamy się kontekstowi cytatu, jego znaczeniu i temu, jak może zmienić sposób patrzenia na codzienne decyzje.',
'Jedno krótkie zdanie może otworzyć znacznie szerszą rozmowę. Pełny tekst pokazuje źródło, sens i praktyczny wymiar cytatu bez sprowadzania go do motywacyjnego hasła.'
],
en:[
'This quote is worth more than a quick save. The full article explores its context, meaning, and the practical question of how the idea can shape everyday choices.',
'What is really behind these words? We look at the quote in context, unpack its meaning, and consider how it can change the way we see ordinary decisions.',
'A short quotation can open a much larger conversation. The full reflection traces its context and practical meaning without reducing it to a motivational slogan.'
],
sv:[
'Det här citatet är värt mer än ett snabbt sparande. I artikeln finns sammanhang, tolkning och en praktisk reflektion över hur tanken kan påverka vardagens val.',
'Vad finns egentligen bakom de här orden? Vi ser på citatet i sitt sammanhang, tolkar innebörden och undersöker hur det kan förändra synen på vanliga beslut.',
'Ett kort citat kan öppna ett betydligt större samtal. Den fullständiga texten ger sammanhang och praktisk mening utan att göra orden till en förenklad motivationsfras.'
],
de:[
'Dieses Zitat ist mehr wert als ein schnelles Speichern. Der Artikel beleuchtet Kontext, Bedeutung und die praktische Frage, was dieser Gedanke im Alltag verändern kann.',
'Was steckt wirklich hinter diesen Worten? Wir ordnen das Zitat ein, entschlüsseln seine Bedeutung und fragen, wie es den Blick auf alltägliche Entscheidungen verändern kann.',
'Ein kurzer Satz kann ein viel größeres Gespräch eröffnen. Der vollständige Beitrag zeigt Kontext und praktische Bedeutung, ohne das Zitat auf einen Motivationsspruch zu reduzieren.'
],
es:[
'Esta cita merece algo más que un guardado rápido. El artículo explora su contexto, su significado y la forma en que esta idea puede influir en decisiones cotidianas.',
'¿Qué hay realmente detrás de estas palabras? Revisamos el contexto de la cita, su sentido y cómo puede cambiar nuestra manera de mirar decisiones aparentemente simples.',
'Una frase breve puede abrir una conversación mucho más amplia. La reflexión completa recupera su contexto y su dimensión práctica sin convertirla en un eslogan motivacional.'
],
fr:[
'Cette citation mérite plus qu’un simple enregistrement. L’article en explore le contexte, le sens et la portée concrète dans les choix du quotidien.',
'Que se cache-t-il vraiment derrière ces mots ? Nous replaçons la citation dans son contexte, en éclairons le sens et examinons ce qu’elle peut changer dans notre manière de décider.',
'Une phrase brève peut ouvrir une réflexion beaucoup plus vaste. Le texte complet en restitue le contexte et la portée pratique sans la réduire à un slogan de motivation.'
],
it:[
'Questa citazione merita più di un semplice salvataggio. Nell’articolo trovi contesto, significato e una riflessione concreta su come questa idea può entrare nelle scelte di ogni giorno.',
'Che cosa c’è davvero dietro queste parole? Ricostruiamo il contesto della citazione, ne esploriamo il significato e il modo in cui può cambiare lo sguardo sulle decisioni quotidiane.',
'Una frase breve può aprire una riflessione molto più ampia. Il testo completo ne approfondisce contesto e valore pratico senza ridurla a uno slogan motivazionale.'
],
pt:[
'Esta citação merece mais do que ser apenas salva. O artigo explora o contexto, o significado e como essa ideia pode aparecer nas escolhas do dia a dia.',
'O que realmente existe por trás destas palavras? Revisitamos o contexto da citação, seu sentido e a maneira como ela pode mudar nosso olhar sobre decisões comuns.',
'Uma frase curta pode abrir uma conversa muito maior. A reflexão completa apresenta contexto e significado prático sem transformar a citação em um simples slogan motivacional.'
],
id:[
'Kutipan ini layak lebih dari sekadar disimpan. Artikel lengkap membahas konteks, makna, dan bagaimana gagasan tersebut dapat hadir dalam pilihan sehari-hari.',
'Apa yang sebenarnya ada di balik kata-kata ini? Kami melihat konteks kutipan, menafsirkan maknanya, dan mempertimbangkan bagaimana gagasan tersebut dapat mengubah cara kita memandang keputusan sehari-hari.',
'Satu kalimat singkat dapat membuka pembahasan yang jauh lebih luas. Refleksi lengkapnya memberi konteks dan makna praktis tanpa menjadikannya sekadar slogan motivasi.'
],
tr:[
'Bu alıntı yalnızca kaydedilip geçilecek bir sözden fazlasını hak ediyor. Yazıda bağlamını, anlamını ve bu düşüncenin günlük seçimlerde nasıl karşılık bulabileceğini ele alıyoruz.',
'Bu sözlerin arkasında gerçekte ne var? Alıntıyı bağlamına yerleştiriyor, anlamını açıyor ve sıradan kararlarımızı nasıl etkileyebileceğini inceliyoruz.',
'Kısa bir cümle çok daha geniş bir düşünce alanı açabilir. Tam metin, alıntıyı basit bir motivasyon sloganına indirgemeden bağlamını ve pratik anlamını ele alıyor.'
],
ar:[
'هذا الاقتباس يستحق أكثر من مجرد حفظه سريعًا. يتناول المقال سياقه ودلالته وكيف يمكن لهذه الفكرة أن تظهر في قرارات الحياة اليومية.',
'ما الذي يقف حقًا وراء هذه الكلمات؟ نضع الاقتباس في سياقه، ونوضح معناه، ونتأمل كيف يمكن أن يغيّر نظرتنا إلى القرارات العادية.',
'قد تفتح عبارة قصيرة بابًا لتأمل أوسع بكثير. يعرض النص الكامل السياق والمعنى العملي من دون اختزال الاقتباس في شعار تحفيزي.'
]};

export async function fixPinterestDescriptions019026(env){
 if(!env?.DB)return{ok:false,error:'DB unavailable'};const ts=new Date().toISOString(),items=[];
 for(const id of TOPICS){const variant=Number(id.slice(2))%3;for(const lang of LANGS){const text=DESC[lang][variant];await env.DB.prepare(`UPDATE content_outputs SET output_text=?,status='ready',updated_at=? WHERE project_id=? AND content_item_id=? AND language_code=? AND output_key='pinterest_description'`).bind(text,ts,PROJECT,id,lang).run();items.push({id,lang,text})}}
 const rows=[];for(const id of TOPICS){const r=await env.DB.prepare(`SELECT COUNT(*) c,COUNT(DISTINCT language_code) langs FROM content_outputs WHERE project_id=? AND content_item_id=? AND output_key='pinterest_description' AND status='ready' AND language_code IN ('uk','ru','pl','en','sv','de','es','fr','it','pt','id','tr','ar') AND TRIM(COALESCE(output_text,''))<>''`).bind(PROJECT,id).first();rows.push({id,descriptions:Number(r?.c||0),locales:Number(r?.langs||0),complete:Number(r?.c||0)===13&&Number(r?.langs||0)===13})}
 return{ok:rows.every(x=>x.complete),at:ts,updated:items.length,rows,samples:items.slice(0,5)};
}
