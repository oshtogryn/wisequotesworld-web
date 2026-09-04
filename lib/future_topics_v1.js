const PROJECT='wisequotesworld';

export const FUTURE_TOPICS=[
['WQ016',16,'ukrainian_classics','Іван Франко','боротьба, життя, дія'],
['WQ017',17,'history','Abraham Lincoln','характер, відповідальність'],
['WQ018',18,'philosophy','Friedrich Nietzsche','внутрішня сила, становлення'],
['WQ019',19,'ukrainian_classics','Леся Українка','надія всупереч обставинам'],
['WQ020',20,'philosophy','Marcus Aurelius','думки й внутрішній світ'],
['WQ021',21,'literature','Maya Angelou','ставлення до людей'],
['WQ022',22,'ukrainian_classics','Тарас Шевченко','свобода, гідність'],
['WQ023',23,'science','Albert Einstein','уява, пізнання'],
['WQ024',24,'philosophy','Seneca','цінність часу'],
['WQ025',25,'history','John F. Kennedy','відповідальність і дія'],
['WQ026',26,'ukrainian_classics','Григорій Сковорода','пізнання себе'],
['WQ027',27,'literature','Oscar Wilde','бути собою'],
['WQ028',28,'history','Theodore Roosevelt','дія попри страх'],
['WQ029',29,'psychology','Viktor Frankl','свобода вибору ставлення'],
['WQ030',30,'ukrainian_classics','Ліна Костенко','неповторність людини'],
['WQ031',31,'philosophy','Confucius','рух маленькими кроками'],
['WQ032',32,'history','Benjamin Franklin','час і життя'],
['WQ033',33,'literature','Ernest Hemingway','мужність'],
['WQ034',34,'ukrainian_classics','Іван Франко','праця і поступ'],
['WQ035',35,'philosophy','Socrates','знання і незнання'],
['WQ036',36,'history','Martin Luther King Jr.','рух уперед у важкі часи'],
['WQ037',37,'psychology','Carl Jung','несвідоме й самопізнання'],
['WQ038',38,'ukrainian_classics','Леся Українка','сила духу'],
['WQ039',39,'art_science','Leonardo da Vinci','простота і майстерність'],
['WQ040',40,'history','Winston Churchill','наполегливість'],
['WQ041',41,'philosophy','Epictetus','внутрішня свобода'],
['WQ042',42,'ukrainian_classics','Тарас Шевченко','правда і воля'],
['WQ043',43,'history','Eleanor Roosevelt','подолання страху'],
['WQ044',44,'literature','Mark Twain','страх перед тим, чого не сталося'],
['WQ045',45,'history','Nelson Mandela','мужність і страх'],
['WQ046',46,'philosophy','Aristotle','звички й характер'],
['WQ047',47,'ukrainian_classics','Григорій Сковорода','щастя всередині людини'],
['WQ048',48,'business_technology','Steve Jobs','власний шлях і час'],
['WQ049',49,'philosophy','Seneca','майбутнє й теперішнє'],
['WQ050',50,'history','George Washington','репутація й характер'],
['WQ051',51,'ukrainian_classics','Ліна Костенко','гідність і вибір'],
['WQ052',52,'literature','Ralph Waldo Emerson','власна дорога'],
['WQ053',53,'philosophy','Friedrich Nietzsche','подолання себе'],
['WQ054',54,'history','Mahatma Gandhi','особиста відповідальність за зміни'],
['WQ055',55,'ukrainian_classics','Іван Франко','сила праці'],
['WQ056',56,'history','Thomas Jefferson','свобода й розум'],
['WQ057',57,'philosophy','Marcus Aurelius','контроль реакції'],
['WQ058',58,'literature','Virginia Woolf','свобода думки'],
['WQ059',59,'ukrainian_classics','Тарас Шевченко','боротьба за власну правду'],
['WQ060',60,'philosophy_literature','Albert Camus','сенс і абсурд'],
['WQ061',61,'history','Franklin D. Roosevelt','страх'],
['WQ062',62,'ukrainian_classics','Леся Українка','не здаватися'],
['WQ063',63,'literature','Fyodor Dostoevsky','відповідальність і людська природа'],
['WQ064',64,'history','Abraham Lincoln','майбутнє й характер'],
['WQ065',65,'philosophy','Marcus Aurelius','якість життя й думок']
];

export async function seedFutureTopics(env){
  if(!env?.DB)return{ok:false,error:'DB unavailable'};
  const ts=new Date().toISOString();
  const inserted=[],updated=[],skipped=[];
  for(const [id,seq,category,author,theme] of FUTURE_TOPICS){
    const existing=await env.DB.prepare(`SELECT id,status FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT,id).first();
    const title=`${author} — ${theme}`;
    const notes=`Редакційний backlog WQ016–WQ065. Майбутня тема: ${theme}. Конкретна цитата, першоджерело, attribution і 8 мовних адаптацій мають бути перевірені перед production.`;
    if(!existing){
      await env.DB.prepare(`INSERT INTO content_items(id,project_id,content_type,sequence_no,category,canonical_title,source_text,source_name,source_url,status,facts_verified,uniqueness_verified,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,PROJECT,'quote',seq,category,title,'',author,'','idea',0,0,notes,ts,ts).run();
      inserted.push(id);
    }else if(existing.status==='idea'){
      await env.DB.prepare(`UPDATE content_items SET sequence_no=?,category=?,canonical_title=?,source_name=?,facts_verified=0,uniqueness_verified=0,notes=?,updated_at=? WHERE project_id=? AND id=?`).bind(seq,category,title,author,notes,ts,PROJECT,id).run();
      updated.push(id);
    }else skipped.push({id,status:existing.status});
  }
  return{ok:skipped.length===0,total:FUTURE_TOPICS.length,inserted,updated,skipped,readback:await readbackFutureTopics(env)};
}

export async function readbackFutureTopics(env){
  if(!env?.DB)return{ok:false,error:'DB unavailable'};
  const rows=(await env.DB.prepare(`SELECT id,sequence_no,category,canonical_title,source_name,status,facts_verified,uniqueness_verified,notes FROM content_items WHERE project_id=? AND sequence_no BETWEEN 16 AND 65 ORDER BY sequence_no`).bind(PROJECT).all()).results||[];
  return{ok:rows.length===50,count:rows.length,idea_count:rows.filter(r=>r.status==='idea').length,rows};
}
