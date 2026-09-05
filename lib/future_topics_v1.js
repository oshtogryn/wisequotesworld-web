const PROJECT='wisequotesworld';

export const FUTURE_TOPICS=[
['WQ016',16,'skipped','Іван Франко','пропущено редакційно'],
['WQ017',17,'history','Abraham Lincoln','характер, відповідальність'],
['WQ018',18,'philosophy','Friedrich Nietzsche','становлення, внутрішня сила'],
['WQ019',19,'literature_philosophy','Rumi','внутрішня свобода, любов, шлях'],
['WQ020',20,'philosophy','Marcus Aurelius','думки й внутрішній світ'],
['WQ021',21,'literature','Oscar Wilde','бути собою'],
['WQ022',22,'philosophy','Confucius','рух уперед і дисципліна'],
['WQ023',23,'science','Albert Einstein','уява, пізнання'],
['WQ024',24,'ukrainian_classics','Леся Українка','надія всупереч обставинам'],
['WQ025',25,'history','John F. Kennedy','відповідальність і дія'],
['WQ026',26,'literature','Rabindranath Tagore','свобода духу'],
['WQ027',27,'psychology','Viktor Frankl','вибір ставлення'],
['WQ028',28,'philosophy','Seneca','цінність часу'],
['WQ029',29,'history','Nelson Mandela','мужність і страх'],
['WQ030',30,'literature','Virginia Woolf','свобода думки'],
['WQ031',31,'art_science','Leonardo da Vinci','простота і майстерність'],
['WQ032',32,'history','Benjamin Franklin','час і життя'],
['WQ033',33,'ukrainian_classics','Григорій Сковорода','пізнання себе'],
['WQ034',34,'literature','Ernest Hemingway','мужність під тиском'],
['WQ035',35,'philosophy','Laozi','простота і шлях'],
['WQ036',36,'history','Martin Luther King Jr.','рух уперед у важкі часи'],
['WQ037',37,'psychology','Carl Jung','несвідоме й самопізнання'],
['WQ038',38,'philosophy_literature','Michel de Montaigne','самопізнання і судження'],
['WQ039',39,'history','Theodore Roosevelt','дія попри страх'],
['WQ040',40,'literature_philosophy','Khalil Gibran','любов і свобода'],
['WQ041',41,'philosophy','Epictetus','внутрішня свобода'],
['WQ042',42,'history','George Washington','характер і репутація'],
['WQ043',43,'philosophy_literature','Albert Camus','сенс і абсурд'],
['WQ044',44,'literature','Mark Twain','страх і уява'],
['WQ045',45,'ukrainian_classics','Тарас Шевченко','свобода і гідність'],
['WQ046',46,'philosophy','Aristotle','звички й характер'],
['WQ047',47,'history','Eleanor Roosevelt','подолання страху'],
['WQ048',48,'business_technology','Steve Jobs','власний шлях і час'],
['WQ049',49,'literature','Fyodor Dostoevsky','відповідальність і людська природа'],
['WQ050',50,'history','Mahatma Gandhi','особиста відповідальність за зміни'],
['WQ051',51,'philosophy','Simone Weil','увага і внутрішня чесність'],
['WQ052',52,'history','Franklin D. Roosevelt','страх'],
['WQ053',53,'philosophy','Friedrich Nietzsche','подолання себе'],
['WQ054',54,'literature','Jorge Luis Borges','час, пам’ять, вибір'],
['WQ055',55,'philosophy','Socrates','знання і незнання'],
['WQ056',56,'history','Thomas Jefferson','свобода й розум'],
['WQ057',57,'philosophy','Marcus Aurelius','контроль реакції'],
['WQ058',58,'literature','Jane Austen','характер і судження'],
['WQ059',59,'philosophy','Confucius','характер і послідовність'],
['WQ060',60,'history','Winston Churchill','наполегливість'],
['WQ061',61,'philosophy','Seneca','майбутнє й теперішнє'],
['WQ062',62,'ukrainian_modern','Ліна Костенко','гідність і неповторність'],
['WQ063',63,'history','Nelson Mandela','свобода і витривалість'],
['WQ064',64,'history','Abraham Lincoln','майбутнє й характер'],
['WQ065',65,'philosophy','Epictetus','влада над власною реакцією']
];

export async function seedFutureTopics(env){
  if(!env?.DB)return{ok:false,error:'DB unavailable'};
  const ts=new Date().toISOString();
  const inserted=[],updated=[],skipped=[];
  for(const [id,seq,category,author,theme] of FUTURE_TOPICS){
    const existing=await env.DB.prepare(`SELECT id,status FROM content_items WHERE project_id=? AND id=?`).bind(PROJECT,id).first();
    const title=`${author} — ${theme}`;
    const notes=id==='WQ016'?'Редакційно пропущено. Не запускати в production без нового explicit рішення користувача.':`Редакційний backlog WQ016–WQ065. Майбутня тема: ${theme}. Конкретна цитата, першоджерело, attribution, 13 website-localizations та social package мають пройти Master Rules перед production.`;
    if(!existing){
      await env.DB.prepare(`INSERT INTO content_items(id,project_id,content_type,sequence_no,category,canonical_title,source_text,source_name,source_url,status,facts_verified,uniqueness_verified,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,PROJECT,'quote',seq,category,title,'',author,'','idea',0,0,notes,ts,ts).run();
      inserted.push(id);
    }else if(['idea','source_check'].includes(existing.status)){
      await env.DB.prepare(`UPDATE content_items SET sequence_no=?,category=?,canonical_title=?,source_name=?,source_url='',source_work=NULL,source_text='',quote_type=NULL,original_quote=NULL,original_language=NULL,author_name=NULL,author_source=NULL,source_date=NULL,attribution_status=NULL,facts_verified=0,uniqueness_verified=0,status='idea',notes=?,updated_at=? WHERE project_id=? AND id=?`).bind(seq,category,title,author,notes,ts,PROJECT,id).run();
      updated.push(id);
    }else skipped.push({id,status:existing.status});
  }
  return{ok:true,total:FUTURE_TOPICS.length,inserted,updated,skipped,readback:await readbackFutureTopics(env)};
}

export async function readbackFutureTopics(env){
  if(!env?.DB)return{ok:false,error:'DB unavailable'};
  const rows=(await env.DB.prepare(`SELECT id,sequence_no,category,canonical_title,source_name,status,facts_verified,uniqueness_verified,notes FROM content_items WHERE project_id=? AND sequence_no BETWEEN 16 AND 65 ORDER BY sequence_no`).bind(PROJECT).all()).results||[];
  return{ok:rows.length===50,count:rows.length,idea_count:rows.filter(r=>r.status==='idea').length,rows};
}
