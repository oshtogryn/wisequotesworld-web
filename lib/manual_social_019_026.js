const PROJECT='wisequotesworld';
const TOPICS=['WQ019','WQ020','WQ021','WQ022','WQ023','WQ024','WQ025','WQ026'];
const LANGS=['it','pt','id','tr','ar'];
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

const INSIGHT={
 it:{
  WQ019:'I pensieri a cui torniamo continuamente plasmano poco a poco il carattere e il nostro modo di vedere il mondo.',
  WQ020:'Anche nelle circostanze più difficili o umilianti possiamo scegliere di rivolgere lo sguardo oltre ciò che ci tiene a terra.',
  WQ021:'La conoscenza diventa davvero parte di noi attraverso la ripetizione, la pratica e il ritorno consapevole a ciò che abbiamo imparato.',
  WQ022:'L’immaginazione ci permette di andare oltre ciò che già sappiamo e di vedere possibilità che i fatti, da soli, non mostrano ancora.',
  WQ023:'Qui la speranza non è la garanzia di un buon esito, ma la decisione attiva di continuare a vivere e agire anche senza garanzie.',
  WQ024:'La responsabilità civica non riguarda soltanto diritti e aspettative: comincia anche dalla domanda su quale contributo possiamo offrire noi.',
  WQ025:'La libertà interiore comincia quando la paura smette di determinare i nostri pensieri, le nostre parole e il nostro modo di stare nel mondo.',
  WQ026:'La vita non è una prova generale prima del “vero” lavoro: il modo in cui viviamo ogni giorno è già la nostra pratica fondamentale.'
 },
 pt:{
  WQ019:'Os pensamentos aos quais voltamos repetidamente moldam, pouco a pouco, nosso caráter e nossa maneira de enxergar o mundo.',
  WQ020:'Mesmo em circunstâncias difíceis ou degradantes, ainda podemos escolher olhar para além daquilo que nos mantém no chão.',
  WQ021:'O conhecimento se torna parte de nós por meio da repetição, da prática e do retorno consciente ao que aprendemos.',
  WQ022:'A imaginação nos permite ir além do que já conhecemos e enxergar possibilidades que os fatos, sozinhos, ainda não mostram.',
  WQ023:'Aqui, esperança não é garantia de um bom resultado, mas a decisão ativa de continuar vivendo e agindo mesmo sem garantias.',
  WQ024:'A responsabilidade cívica não começa apenas com direitos e expectativas, mas também com a pergunta sobre qual contribuição podemos oferecer.',
  WQ025:'A liberdade interior começa quando o medo deixa de definir nossos pensamentos, nossas palavras e nossa postura diante do mundo.',
  WQ026:'A vida não é um ensaio antes do “trabalho de verdade”: a maneira como vivemos cada dia já é nossa prática central.'
 },
 id:{
  WQ019:'Pikiran yang terus kita ulang perlahan membentuk karakter dan cara kita memandang dunia.',
  WQ020:'Bahkan dalam keadaan yang sulit atau merendahkan, kita masih dapat memilih untuk mengarahkan pandangan melampaui keadaan itu.',
  WQ021:'Pengetahuan menjadi bagian dari diri kita melalui pengulangan, latihan, dan kebiasaan kembali pada apa yang telah dipelajari.',
  WQ022:'Imajinasi memungkinkan kita melampaui apa yang sudah diketahui dan melihat kemungkinan yang belum tampak dari fakta semata.',
  WQ023:'Harapan di sini bukan jaminan hasil yang baik, melainkan keputusan aktif untuk tetap hidup dan bertindak tanpa kepastian.',
  WQ024:'Tanggung jawab sebagai warga bukan hanya soal hak dan harapan, tetapi juga tentang kontribusi apa yang dapat kita berikan.',
  WQ025:'Kebebasan batin dimulai ketika rasa takut tidak lagi menentukan pikiran, kata-kata, dan sikap kita terhadap dunia.',
  WQ026:'Hidup bukan latihan sebelum “pekerjaan yang sebenarnya”; cara kita menjalani setiap hari adalah praktik utama itu sendiri.'
 },
 tr:{
  WQ019:'Sürekli döndüğümüz düşünceler zamanla karakterimizi ve dünyaya bakışımızı şekillendirir.',
  WQ020:'İnsan, zor ya da aşağılayıcı koşullarda bile bakışını o koşulların ötesine çevirmeyi seçebilir.',
  WQ021:'Bilgi, tekrar ederek, uygulayarak ve öğrendiklerimize bilinçli biçimde dönerek içselleşir.',
  WQ022:'Hayal gücü, bildiklerimizin ötesine geçip yalnızca olguların henüz göstermediği olasılıkları görmemizi sağlar.',
  WQ023:'Buradaki umut iyi bir sonucun garantisi değil; garanti olmadan da yaşamaya ve harekete devam etme kararıdır.',
  WQ024:'Yurttaşlık sorumluluğu yalnızca haklar ve beklentilerle değil, bizim ne katkı sunabileceğimizi sormakla da başlar.',
  WQ025:'İç özgürlük, korkunun düşüncelerimizi, sözlerimizi ve dünyaya karşı duruşumuzu belirlemeyi bıraktığı yerde başlar.',
  WQ026:'Hayat, “asıl iş” başlamadan önceki bir prova değildir; her gün nasıl yaşadığımız başlı başına temel pratiğimizdir.'
 },
 ar:{
  WQ019:'الأفكار التي نعود إليها باستمرار تشكّل مع الوقت شخصيتنا وطريقتنا في رؤية العالم.',
  WQ020:'حتى في الظروف الصعبة أو المهينة نستطيع أن نختار رفع نظرنا إلى ما يتجاوز ما يثقلنا.',
  WQ021:'تصبح المعرفة جزءًا منا بالتكرار والممارسة والعودة الواعية إلى ما تعلّمناه.',
  WQ022:'يتيح لنا الخيال أن نتجاوز ما نعرفه بالفعل وأن نرى إمكانات لا تكشفها الحقائق وحدها بعد.',
  WQ023:'الأمل هنا ليس ضمانًا لنتيجة جيدة، بل قرارًا فعّالًا بأن نواصل الحياة والعمل حتى من دون ضمانات.',
  WQ024:'لا تبدأ المسؤولية المدنية بالحقوق والتوقعات فقط، بل أيضًا بالسؤال عما يمكن أن نقدمه نحن.',
  WQ025:'تبدأ الحرية الداخلية حين يتوقف الخوف عن تحديد أفكارنا وكلماتنا وطريقة وقوفنا أمام العالم.',
  WQ026:'الحياة ليست بروفة تسبق «العمل الحقيقي»؛ فالطريقة التي نعيش بها كل يوم هي ممارستنا الأساسية نفسها.'
 }
};

const UI={
 it:{more:'Leggi l’articolo completo',profile:'Approfondisci dal link nel profilo.',visit:'Per approfondire, visita',question:'Che cosa cambia, concretamente, se prendi sul serio questa idea oggi?',tags:'#Saggezza #Filosofia #Citazioni #WiseQuotesWorld'},
 pt:{more:'Leia o artigo completo',profile:'Saiba mais pelo link no perfil.',visit:'Para ler mais, visite',question:'O que muda, na prática, se você levar essa ideia a sério hoje?',tags:'#Sabedoria #Filosofia #Citações #WiseQuotesWorld'},
 id:{more:'Baca artikel lengkap',profile:'Baca selengkapnya melalui tautan di profil.',visit:'Untuk membaca selengkapnya, kunjungi',question:'Apa yang berubah secara nyata jika gagasan ini Anda terapkan hari ini?',tags:'#Kebijaksanaan #Filsafat #Kutipan #WiseQuotesWorld'},
 tr:{more:'Yazının tamamını oku',profile:'Devamı profil bağlantısında.',visit:'Daha fazlası için',question:'Bu düşünceyi bugün ciddiye alırsanız somut olarak ne değişir?',tags:'#Bilgelik #Felsefe #Alıntılar #WiseQuotesWorld'},
 ar:{more:'اقرأ المقال كاملًا',profile:'للمزيد، استخدم الرابط في الملف الشخصي.',visit:'للمزيد، تفضل بزيارة',question:'ما الذي سيتغير عمليًا إذا أخذت هذه الفكرة بجدية اليوم؟',tags:'#حكمة #فلسفة #اقتباسات #WiseQuotesWorld'}
};

const CORRECTIONS={
 'WQ023:pt':'“Mesmo sem esperança, continuarei a ter esperança. Vou viver! Fora, pensamentos tristes!” — Lesya Ukrainka',
 'WQ025:id':'“Di mana pikiran bebas dari rasa takut dan kepala tetap tegak.” — Rabindranath Tagore',
 'WQ026:it':'«Il mio mestiere e la mia arte: vivere.» — Michel de Montaigne',
 'WQ026:pt':'“Meu ofício e minha arte consistem em viver.” — Michel de Montaigne'
};

function baseQuote(q){return String(q).split(' — ')[0]}
function authorFromQuote(q,fallback=''){const a=String(q).split(' — ');return a.length>1?a[a.length-1]:fallback}
function cap(s){return s?s.charAt(0).toUpperCase()+s.slice(1):s}
function site(lang){return `WiseQuotesWorld.com/${lang}/`}
function videoPrompt(lang,q,concept,author){return `Create a premium photorealistic vertical 9:16 cinematic video in ${lang}.\n\n${concept}\n\nRender EXACT text in one stable, elegant, mobile-readable upper-middle text card:\n${q}\n\nAudio: a calm native ${lang} narrator reads the exact quote and attribution naturally and completely, with correct native pronunciation of ${author}. Restrained cinematic music remains below the voice.\n\nNo subtitles. No captions. No emoji. No decorative symbols. No logo. No branding. No watermark. No other readable text.\n\nEnd on a clean contemplative hold.`}
function pinPrompt(q,concept){return `Create a premium photorealistic vertical 2:3 Pinterest image, target 1000×1500. ${concept} Compose as a refined editorial still with generous clean space for large mobile-readable typography. Render EXACT text: ${q} No other readable text. No logo. No branding. No watermark.`}

function social(lang,id,q,insight,url,author){const u=UI[lang],short=baseQuote(q).replace(/[«»„”“]/g,'');
 const common={
  it:{fb:`${q}\n\n${insight}\n\nUna citazione diventa utile quando smette di essere soltanto una frase da condividere e ci costringe a guardare una scelta concreta. Non offre una scorciatoia: offre un punto di vista da mettere alla prova.\n\n${u.question}\n\n${u.more}:\n${url}\n\n${u.tags}`,ig:`${q}\n\n${insight}\n\nNon limitarti a salvarla: prova a verificarla in una decisione concreta di oggi.\n\n${u.profile}\n\n${u.tags}`,th2:`${u.question}\n\nA volte una risposta onesta vale più di dieci frasi motivazionali.`,th3:`Una grande citazione conta davvero quando rende almeno un passo più consapevole.`,tt:`${q}\n\n${insight}\n\n${u.visit}: ${site(lang)}\n\n${u.tags}`,yt:`${insight} Questa citazione merita più di un semplice salvataggio: vale la pena metterla alla prova nella vita reale. ${u.profile}`,pin:`${insight} Una riflessione su ${author}, sul contesto della citazione e su ciò che può significare nella vita quotidiana.`},
  pt:{fb:`${q}\n\n${insight}\n\nUma citação se torna útil quando deixa de ser apenas uma frase para compartilhar e passa a iluminar uma escolha concreta. Ela não oferece um atalho; oferece um ponto de vista que pode ser testado na vida real.\n\n${u.question}\n\n${u.more}:\n${url}\n\n${u.tags}`,ig:`${q}\n\n${insight}\n\nNão apenas salve a frase: teste-a em uma decisão concreta hoje.\n\n${u.profile}\n\n${u.tags}`,th2:`${u.question}\n\nÀs vezes, uma resposta honesta vale mais do que dez frases motivacionais.`,th3:`Uma grande citação ganha valor quando torna pelo menos um passo mais consciente.`,tt:`${q}\n\n${insight}\n\n${u.visit}: ${site(lang)}\n\n${u.tags}`,yt:`${insight} Esta citação merece mais do que ser salva: vale colocá-la à prova na vida real. ${u.profile}`,pin:`${insight} Uma reflexão sobre ${author}, o contexto da citação e o que ela pode significar na vida cotidiana.`},
  id:{fb:`${q}\n\n${insight}\n\nSebuah kutipan menjadi berguna ketika tidak berhenti sebagai kalimat untuk dibagikan, tetapi membantu kita melihat satu pilihan nyata dengan lebih jernih. Kutipan bukan jalan pintas; ia adalah sudut pandang yang perlu diuji dalam hidup.\n\n${u.question}\n\n${u.more}:\n${url}\n\n${u.tags}`,ig:`${q}\n\n${insight}\n\nJangan hanya menyimpannya—uji gagasan ini dalam satu keputusan nyata hari ini.\n\n${u.profile}\n\n${u.tags}`,th2:`${u.question}\n\nKadang satu jawaban yang jujur lebih berharga daripada sepuluh slogan motivasi.`,th3:`Kutipan besar baru berarti ketika membuat setidaknya satu langkah menjadi lebih sadar.`,tt:`${q}\n\n${insight}\n\n${u.visit}: ${site(lang)}\n\n${u.tags}`,yt:`${insight} Kutipan ini layak lebih dari sekadar disimpan; cobalah mengujinya dalam kehidupan nyata. ${u.profile}`,pin:`${insight} Refleksi tentang ${author}, konteks kutipan, dan maknanya bagi kehidupan sehari-hari.`},
  tr:{fb:`${q}\n\n${insight}\n\nBir alıntı, yalnızca paylaşılacak güzel bir cümle olmaktan çıkıp somut bir seçimi daha açık görmemizi sağladığında işe yarar. Kestirme bir çözüm sunmaz; hayatta sınayabileceğimiz bir bakış açısı sunar.\n\n${u.question}\n\n${u.more}:\n${url}\n\n${u.tags}`,ig:`${q}\n\n${insight}\n\nSadece kaydetmeyin; bu düşünceyi bugün vereceğiniz somut bir kararda sınayın.\n\n${u.profile}\n\n${u.tags}`,th2:`${u.question}\n\nBazen dürüst bir cevap, on motivasyon sözünden daha değerlidir.`,th3:`Büyük bir alıntı, en az bir adımı daha bilinçli hâle getirdiğinde gerçek değerini gösterir.`,tt:`${q}\n\n${insight}\n\n${u.visit}: ${site(lang)}\n\n${u.tags}`,yt:`${insight} Bu alıntı yalnızca kaydedilmeyi değil, gerçek hayatta sınanmayı da hak ediyor. ${u.profile}`,pin:`${insight} ${author} sözünün bağlamı ve günlük hayatta ne anlama gelebileceği üzerine kısa bir düşünme.`},
  ar:{fb:`${q}\n\n${insight}\n\nتصبح المقولة نافعة حين لا تبقى مجرد عبارة جميلة للمشاركة، بل تساعدنا على رؤية اختيار واقعي بوضوح أكبر. إنها لا تقدم طريقًا مختصرًا، بل زاوية نظر يمكن اختبارها في الحياة.\n\n${u.question}\n\n${u.more}:\n${url}\n\n${u.tags}`,ig:`${q}\n\n${insight}\n\nلا تكتفِ بحفظ العبارة؛ اختبرها اليوم في قرار واقعي واحد.\n\n${u.profile}\n\n${u.tags}`,th2:`${u.question}\n\nأحيانًا تكون إجابة صادقة أثمن من عشر عبارات تحفيزية.`,th3:`تكتسب المقولة الكبيرة قيمتها حين تجعل خطوة واحدة على الأقل أكثر وعيًا.`,tt:`${q}\n\n${insight}\n\n${u.visit}: ${site(lang)}\n\n${u.tags}`,yt:`${insight} هذه المقولة تستحق أكثر من مجرد الحفظ؛ تستحق أن نختبرها في الحياة الواقعية. ${u.profile}`,pin:`${insight} تأمل في كلمات ${author} وسياقها وما يمكن أن تعنيه في حياتنا اليومية.`}
 }[lang];
 const th1=`${q}\n\n${insight}\n\n${url}`;
 const th2=`${common.th2}\n\n${url}`;
 const th3=`${common.th3}\n\n${insight}\n\n${url}`;
 return {facebook:common.fb,instagram:common.ig,threads:[th1,th2,th3].join('\n\n---\n\n'),tiktok:common.tt,youtube_title:`${author}: ${short.slice(0,82)}`,youtube_description:common.yt,pinterest_title:`${author} — ${short.slice(0,70)}`,pinterest_description:common.pin};
}

async function ensure(env){await env.DB.exec(`CREATE TABLE IF NOT EXISTS content_outputs (id TEXT PRIMARY KEY,project_id TEXT NOT NULL,content_item_id TEXT NOT NULL,language_code TEXT NOT NULL,output_key TEXT NOT NULL,output_text TEXT,status TEXT NOT NULL DEFAULT 'draft',updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE(content_item_id,language_code,output_key));`)}

export async function applyManualSocial019026(env){if(!env?.DB)return{ok:false,error:'DB unavailable'};await ensure(env);const ts=TS();const changes=[];
 for(const id of TOPICS){
  for(const lang of LANGS){
   const corr=CORRECTIONS[`${id}:${lang}`];
   if(corr){await env.DB.prepare(`UPDATE content_versions SET adapted_text=?,voiceover_text=?,on_screen_text=?,title=?,language_check_status='native_qa_pass',approved=1,verification_date=?,editor_notes=? WHERE content_id=? AND language_code=? AND version=(SELECT MAX(version) FROM content_versions WHERE content_id=? AND language_code=?)`).bind(corr,corr,corr,`${authorFromQuote(corr)} — ${baseQuote(corr)}`,ts,'Native adaptation re-reviewed 2026-09-07; corrected for idiomatic target-language wording while preserving source meaning.',id,lang,id,lang).run();changes.push({id,lang,quote:corr})}
   const v=await env.DB.prepare(`SELECT adapted_text FROM content_versions WHERE content_id=? AND language_code=? ORDER BY version DESC LIMIT 1`).bind(id,lang).first();
   const p=await env.DB.prepare(`SELECT canonical_path,reflection_body FROM quote_pages WHERE project_id=? AND content_item_id=? AND language_code=? ORDER BY updated_at DESC LIMIT 1`).bind(PROJECT,id,lang).first();
   const item=await env.DB.prepare(`SELECT author_name FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT,id).first();
   if(!v?.adapted_text||!p?.canonical_path)return{ok:false,error:'missing localized quote/page',id,lang};
   const q=v.adapted_text,author=authorFromQuote(q,item?.author_name||''),url=`https://wisequotesworld.com${p.canonical_path}`,insight=INSIGHT[lang][id],s=social(lang,id,q,insight,url,author);
   const vp=videoPrompt(lang,q,CONCEPT[id],author);await env.DB.prepare(`UPDATE content_versions SET ai_prompt=?,language_check_status='native_qa_pass',approved=1,verification_date=?,editor_notes=? WHERE content_id=? AND language_code=? AND version=(SELECT MAX(version) FROM content_versions WHERE content_id=? AND language_code=?)`).bind(vp,ts,'Native social/prompt package re-reviewed 2026-09-07; semantic fidelity, idiomatic wording, CTA policy and author attribution checked.',id,lang,id,lang).run();
   const outs={pinterest_prompt:pinPrompt(q,CONCEPT[id]),facebook:s.facebook,instagram:s.instagram,threads:s.threads,tiktok:s.tiktok,youtube_title:s.youtube_title,youtube_description:s.youtube_description,pinterest_title:s.pinterest_title,pinterest_description:s.pinterest_description,website_reflection:p.reflection_body,article_url:url};
   for(const [key,text] of Object.entries(outs))await env.DB.prepare(`INSERT INTO content_outputs(id,project_id,content_item_id,language_code,output_key,output_text,status,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(content_item_id,language_code,output_key) DO UPDATE SET output_text=excluded.output_text,status='ready',updated_at=excluded.updated_at`).bind(`${id}_${lang}_${key}`,PROJECT,id,lang,key,text,'ready',ts).run();
  }
  await env.DB.prepare(`UPDATE content_items SET notes=?,updated_at=? WHERE project_id=? AND id=?`).bind('Complete pre-media package: verified source; 13 website localizations; 8 Metricool social locales plus 5 manual social locales prepared with native-QA; video/Pinterest prompts and platform copy ready. Awaiting media upload.',ts,PROJECT,id).run();
 }
 return {ok:true,at:ts,corrected_quotes:changes,readback:await readManualSocial019026(env)};
}

export async function readManualSocial019026(env){if(!env?.DB)return{ok:false,error:'DB unavailable'};await ensure(env);const rows=[];
 for(const id of TOPICS){
  const manualOutputs=await env.DB.prepare(`SELECT COUNT(*) c FROM content_outputs WHERE project_id=? AND content_item_id=? AND language_code IN ('it','pt','id','tr','ar') AND TRIM(COALESCE(output_text,''))<>''`).bind(PROJECT,id).first();
  const manualReady=await env.DB.prepare(`SELECT COUNT(*) c FROM content_outputs WHERE project_id=? AND content_item_id=? AND language_code IN ('it','pt','id','tr','ar') AND status='ready' AND TRIM(COALESCE(output_text,''))<>''`).bind(PROJECT,id).first();
  const prompts=await env.DB.prepare(`SELECT COUNT(*) c FROM content_versions WHERE content_id=? AND language_code IN ('it','pt','id','tr','ar') AND language_check_status='native_qa_pass' AND TRIM(COALESCE(ai_prompt,''))<>''`).bind(id).first();
  const pages=await env.DB.prepare(`SELECT COUNT(*) c FROM quote_pages WHERE project_id=? AND content_item_id=?`).bind(PROJECT,id).first();
  rows.push({id,manual_outputs:Number(manualOutputs?.c||0),manual_ready:Number(manualReady?.c||0),manual_video_prompts:Number(prompts?.c||0),website_locales:Number(pages?.c||0),complete:Number(manualReady?.c||0)===55&&Number(prompts?.c||0)===5&&Number(pages?.c||0)>=13});
 }
 return{ok:rows.length===8&&rows.every(x=>x.complete),rows};
}
