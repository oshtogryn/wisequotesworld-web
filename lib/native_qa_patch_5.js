const PROJECT_ID='wisequotesworld';
const QA_LANGS=['it','pt','id','tr','ar'];
const TS=()=>new Date().toISOString();

const FIELD_PATCHES=[
  {id:'WQ012',lang:'it',title:'Non devi essere la persona che gli altri vogliono che tu sia',quote:'Non devi diventare la persona che gli altri vogliono che tu sia. Diventa la persona che vuoi essere.'},
  {id:'WQ005',lang:'pt',meta:'Uma reflexão sobre autodisciplina, constância e os compromissos que assumimos conosco quando ninguém está cobrando.'},
  {id:'WQ012',lang:'id',quote:'Kamu tidak harus menjadi seperti yang orang lain inginkan. Jadilah pribadi yang benar-benar ingin kamu jadi.'},
  {id:'WQ005',lang:'tr',quote:'En zor zafer, kimse seni zorlamazken yapılması gerekeni yapmaktır.'},
  {id:'WQ006',lang:'ar',quote:'نكبر حين نغادر بيت والدينا، ونكبر مرة أخرى حين ندرك مدى حاجتنا إليهما.'}
];

const REFLECTION_REPLACES=[
  {id:'WQ005',lang:'id',old:'Setiap tindakan semacam itu memperkuat kepercayaan kepada diri sendiri.',next:'Setiap tindakan semacam itu memperkuat kepercayaan pada diri sendiri.'},
  {id:'WQ011',lang:'id',old:'Rasa sakit, kehilangan, kegagalan, dan krisis bisa menguras tenaga, meninggalkan ketakutan, dan membutuhkan waktu panjang untuk dipulihkan.',next:'Rasa sakit, kehilangan, kegagalan, dan krisis bisa menguras tenaga, meninggalkan ketakutan, dan membutuhkan waktu lama untuk pulih.'},
  {id:'WQ011',lang:'tr',old:'Korkuyla geçen bir dönem, istikrarı ve yanımızda kalan insanları daha derinden değerli kılabilir.',next:'Korkuyla geçen bir dönem, istikrara ve yanımızda kalan insanlara daha çok değer vermemizi sağlayabilir.'},
  {id:'WQ014',lang:'tr',old:'Amaç kusursuz bir hayat kurmak değil, daha çok farkında olduğumuz bir hayat yaşamaktır.',next:'Amaç kusursuz bir hayat kurmak değil, daha bilinçli bir hayat yaşamaktır.'},
  {id:'WQ005',lang:'ar',old:'لذلك فإن التقدم الطويل غالبًا ما يُبنى من أفعال صغيرة لا يراها أحد:',next:'لذلك فإن التقدم على المدى الطويل غالبًا ما يُبنى من أفعال صغيرة لا يراها أحد:'},
  {id:'WQ012',lang:'ar',old:'عندما تنظر يومًا إلى الحياة التي بنيتها، ينبغي أن يكون الشخص الذي تراها له هو أنت فعلًا.',next:'عندما تنظر يومًا إلى الحياة التي بنيتها، ينبغي أن يكون الشخص الذي تراه فيها هو أنت فعلًا.'},
  {id:'WQ015',lang:'ar',old:'ويبدأ الاحتمال في الشعور كأنه يقين.',next:'ونبدأ في الشعور بأن الاحتمال صار يقينًا.'}
];

async function syncReflectionOutput(env,id,lang,ts){
  const row=await env.DB.prepare(`SELECT reflection_body FROM quote_pages WHERE project_id=? AND content_item_id=? AND language_code=? AND status='published' LIMIT 1`).bind(PROJECT_ID,id,lang).first();
  if(!row)return;
  await env.DB.prepare(`UPDATE content_outputs SET output_text=?,updated_at=? WHERE project_id=? AND content_item_id=? AND language_code=? AND output_key='website_reflection'`).bind(row.reflection_body,ts,PROJECT_ID,id,lang).run();
}

export async function applyNativeQaFive(env){
  if(!env?.DB)return {ok:false,error:'DB binding unavailable'};
  const ts=TS();
  const changed=[];
  for(const p of FIELD_PATCHES){
    const cv=await env.DB.prepare(`SELECT id,adapted_text FROM content_versions WHERE content_id=? AND language_code=? ORDER BY version DESC LIMIT 1`).bind(p.id,p.lang).first();
    if(!cv)throw new Error(`Missing content version ${p.id}/${p.lang}`);
    if(p.quote){
      await env.DB.prepare(`UPDATE content_versions SET adapted_text=?,language_check_status='native_qa_pass',verification_date=?,approved=1 WHERE id=?`).bind(p.quote,ts.slice(0,10),cv.id).run();
    }
    const sets=[],bind=[];
    if(p.title){sets.push('seo_title=?','reflection_title=?');bind.push(p.title,p.title)}
    if(p.meta){sets.push('meta_description=?');bind.push(p.meta)}
    if(sets.length){sets.push('updated_at=?');bind.push(ts,PROJECT_ID,p.id,p.lang);await env.DB.prepare(`UPDATE quote_pages SET ${sets.join(',')} WHERE project_id=? AND content_item_id=? AND language_code=?`).bind(...bind).run()}
    changed.push({id:p.id,lang:p.lang,kind:'field'});
  }
  for(const p of REFLECTION_REPLACES){
    const row=await env.DB.prepare(`SELECT reflection_body FROM quote_pages WHERE project_id=? AND content_item_id=? AND language_code=? AND status='published' LIMIT 1`).bind(PROJECT_ID,p.id,p.lang).first();
    if(!row)throw new Error(`Missing quote page ${p.id}/${p.lang}`);
    if(!String(row.reflection_body||'').includes(p.old))throw new Error(`Expected QA source phrase not found ${p.id}/${p.lang}`);
    await env.DB.prepare(`UPDATE quote_pages SET reflection_body=REPLACE(reflection_body,?,?),updated_at=? WHERE project_id=? AND content_item_id=? AND language_code=?`).bind(p.old,p.next,ts,PROJECT_ID,p.id,p.lang).run();
    await syncReflectionOutput(env,p.id,p.lang,ts);
    changed.push({id:p.id,lang:p.lang,kind:'reflection'});
  }
  await env.DB.prepare(`UPDATE content_versions SET language_check_status='native_qa_pass',verification_date=?,editor_notes=CASE WHEN COALESCE(editor_notes,'') LIKE '%Native QA recheck 2026-09-04%' THEN editor_notes ELSE TRIM(COALESCE(editor_notes,'') || '\nNative QA recheck 2026-09-04: reviewed for native naturalness, grammar, semantic fidelity and editorial tone.') END WHERE content_id IN (SELECT id FROM content_items WHERE project_id=?) AND language_code IN ('it','pt','id','tr','ar')`).bind(ts.slice(0,10),PROJECT_ID).run();
  return {ok:true,reviewed_languages:QA_LANGS,reviewed_pages:35,corrections:changed.length,changed};
}

export async function readbackNativeQaFive(env){
  if(!env?.DB)return {ok:false,error:'DB binding unavailable'};
  const counts=(await env.DB.prepare(`SELECT language_code,COUNT(*) count FROM quote_pages WHERE project_id=? AND language_code IN ('it','pt','id','tr','ar') AND status='published' GROUP BY language_code ORDER BY language_code`).bind(PROJECT_ID).all()).results||[];
  const probes=(await env.DB.prepare(`SELECT qp.content_item_id content_id,qp.language_code,qp.seo_title,qp.meta_description,cv.adapted_text,qp.reflection_body FROM quote_pages qp JOIN content_versions cv ON cv.id=qp.content_version_id WHERE qp.project_id=? AND ((qp.content_item_id='WQ012' AND qp.language_code='it') OR (qp.content_item_id='WQ005' AND qp.language_code='pt') OR (qp.content_item_id='WQ012' AND qp.language_code='id') OR (qp.content_item_id='WQ005' AND qp.language_code='tr') OR (qp.content_item_id='WQ006' AND qp.language_code='ar') OR (qp.content_item_id='WQ011' AND qp.language_code IN ('id','tr')) OR (qp.content_item_id='WQ014' AND qp.language_code='tr') OR (qp.content_item_id IN ('WQ005','WQ012','WQ015') AND qp.language_code='ar')) ORDER BY qp.language_code,qp.content_item_id`).bind(PROJECT_ID).all()).results||[];
  return {ok:true,counts,probes};
}
