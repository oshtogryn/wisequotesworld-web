const PROJECT='wisequotesworld';
const TS=()=>new Date().toISOString();

const WQ016={
  id:'WQ016',author:'Ivan Franko',author_uk:'Іван Франко',work:'Vivere memento!',original:'Лиш боротись значить жить…',source_url:'https://www.i-franko.name/uk/Verses/ZVershynINyzyn/Vesnjanky/VivereMemento.html',source_locator:'Vivere memento!, final stanza; 14 October 1883',
  localizations:{
    uk:'«Лиш боротись значить жить…» — Іван Франко',
    ru:'«Лишь бороться — значит жить…» — Иван Франко',
    pl:'„Tylko walczyć — znaczy żyć…” — Iwan Franko',
    en:'“Only to struggle is to live…” — Ivan Franko',
    sv:'”Att kämpa är att leva…” — Ivan Franko',
    de:'„Nur kämpfen heißt leben…“ — Iwan Franko',
    es:'«Solo luchar significa vivir…» — Iván Frankó',
    fr:'«Lutter, c’est vivre…» — Ivan Franko',
    it:'«Solo lottare significa vivere…» — Ivan Franko',
    pt:'«Só lutar significa viver…» — Ivan Franko',
    id:'“Hanya dengan berjuang kita benar-benar hidup…” — Ivan Franko',
    tr:'“Yalnızca mücadele etmek, yaşamak demektir…” — Ivan Franko',
    ar:'«أن تكافح هو أن تعيش حقًا…» — إيفان فرانكو'
  }
};

const CANDIDATES={
  WQ017:{author:'Abraham Lincoln',theme:'character / responsibility',candidate:'Primary-source candidate still under selection; avoid circulating unsourced Lincoln aphorisms.',status:'idea',risk:'source wording needs final selection'},
  WQ018:{author:'Friedrich Nietzsche',theme:'inner strength / becoming',candidate:'“Werde, der du bist” candidate; exact Nietzsche locus/translation must be fixed before production.',status:'idea',risk:'popular wording is translation-sensitive'},
  WQ019:{author:'Lesya Ukrainka',theme:'hope despite adversity',candidate:'«Без надії таки сподіватись, Буду жити! Геть думи сумні!»',work:'Contra spem spero!',source:'https://www.l-ukrainka.name/uk/Verses/NaKrylachPisen/ContraSpemSpero.html',status:'source_check',risk:'low; public-domain primary text'},
  WQ020:{author:'Marcus Aurelius',theme:'thoughts / inner world',candidate:'“Such as are thy habitual thoughts, such also will be the character of thy mind; for the soul is dyed by the thoughts.”',work:'Meditations 5.16, George Long translation',source:'https://en.wikisource.org/wiki/The_Thoughts_of_the_Emperor_Marcus_Aurelius_Antoninus/Book_V',status:'source_check',risk:'low if public-domain translation credited'},
  WQ021:{author:'Maya Angelou',theme:'attitude / new beginnings',candidate:'“Each new hour holds new chances / For a new beginning.”',work:'On the Pulse of Morning',source:'https://www.poetryfoundation.org/poems/48990/on-the-pulse-of-morning',status:'source_check',risk:'copyrighted modern work; rights/editorial review required before production'},
  WQ022:{author:'Taras Shevchenko',theme:'freedom / dignity',candidate:'«Борітеся — поборете! Вам Бог помагає; За вас сила, за вас воля І правда святая!»',work:'Кавказ',source:'https://uk.wikisource.org/wiki/Кобзарь_(1876)/Том_2/Кавказ',status:'source_check',risk:'low; public-domain primary text'},
  WQ023:{author:'Albert Einstein',theme:'imagination / knowledge',candidate:'“Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.”',work:'What Life Means to Einstein, The Saturday Evening Post, 26 Oct 1929',source:'https://thequotegenerator.com/source-center/imagination-more-important-than-knowledge-1929/',status:'source_check',risk:'low provenance; use exact 1929 wording'},
  WQ024:{author:'Seneca',theme:'time / life',candidate:'Candidate from De Brevitate Vitae; exact Latin + section to be fixed before production.',status:'idea',risk:'source locator still pending'},
  WQ025:{author:'John F. Kennedy',theme:'responsibility / action',candidate:'“Ask not what your country can do for you—ask what you can do for your country.”',work:'Inaugural Address, 20 January 1961',source:'https://www.archives.gov/milestone-documents/president-john-f-kennedys-inaugural-address',status:'source_check',risk:'low; US federal public-domain speech'}
};

export async function prepareFuturePreprod(env){
  if(!env?.DB)return{ok:false,error:'DB unavailable'};
  const ts=TS();
  const item=await env.DB.prepare(`SELECT id FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT,WQ016.id).first();
  if(!item)return{ok:false,error:'WQ016 backlog item missing'};
  await env.DB.prepare(`UPDATE content_items SET status='localized',quote_type='verbatim',original_quote=?,original_language='uk',author_name=?,source_name=?,source_url=?,source_work=?,attribution_status='verified',facts_verified=1,source_verified_at=?,source_verification_notes=?,notes=?,updated_at=? WHERE project_id=? AND id=?`).bind(WQ016.original,WQ016.author,WQ016.author_uk,WQ016.source_url,WQ016.work,ts,'Verified against Ivan Franko text “Vivere memento!”, final stanza, dated 14 October 1883. Quote-length gate PASS; all localized versions are short.','Pre-production only. 13 website localizations drafted; native-language QA and all prompts/copy/articles remain pending.',ts,PROJECT,WQ016.id).run();
  await env.DB.prepare(`INSERT INTO quote_source_evidence(content_item_id,source_type,source_title,source_url,source_locator,original_text,original_language,verified,verification_notes,created_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT DO NOTHING`).bind(WQ016.id,'primary_text','Ivan Franko, Vivere memento!',WQ016.source_url,WQ016.source_locator,WQ016.original,'uk',1,'Primary text verified; line appears in final stanza.',ts).run();
  for(const [lang,text] of Object.entries(WQ016.localizations)){
    const id=`WQ016_${lang}_v1`;
    await env.DB.prepare(`INSERT INTO content_versions(id,content_id,language_code,title,adapted_text,voiceover_text,on_screen_text,status,language_check_status,approved,verification_date,source_urls,version) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,1) ON CONFLICT(content_id,language_code,version) DO UPDATE SET title=excluded.title,adapted_text=excluded.adapted_text,voiceover_text=excluded.voiceover_text,on_screen_text=excluded.on_screen_text,status=excluded.status,language_check_status=excluded.language_check_status,verification_date=excluded.verification_date,source_urls=excluded.source_urls`).bind(id,WQ016.id,lang,`${WQ016.author}: ${WQ016.work}`,text,text,text,'localized','pending',0,ts,WQ016.source_url).run();
  }
  for(const [id,c] of Object.entries(CANDIDATES)){
    const notes=`PREPROD candidate | theme: ${c.theme} | quote: ${c.candidate}${c.work?` | work: ${c.work}`:''}${c.source?` | source: ${c.source}`:''} | risk: ${c.risk}`;
    await env.DB.prepare(`UPDATE content_items SET status=?,source_name=?,source_url=COALESCE(?,source_url),source_work=COALESCE(?,source_work),notes=?,updated_at=? WHERE project_id=? AND id=? AND status IN ('idea','source_check')`).bind(c.status,c.author,c.source||null,c.work||null,notes,ts,PROJECT,id).run();
  }
  const wq016=await env.DB.prepare(`SELECT id,status,quote_type,author_name,source_work,attribution_status,facts_verified FROM content_items WHERE project_id=? AND id='WQ016'`).bind(PROJECT).first();
  const versions=(await env.DB.prepare(`SELECT language_code,status,language_check_status,adapted_text FROM content_versions WHERE content_id='WQ016' AND version=1 ORDER BY language_code`).all()).results||[];
  const next=(await env.DB.prepare(`SELECT id,status,source_name,source_work,notes FROM content_items WHERE project_id=? AND sequence_no BETWEEN 17 AND 25 ORDER BY sequence_no`).bind(PROJECT).all()).results||[];
  return{ok:true,wq016,localizations:versions.length,versions,next};
}
