const PROJECT_ID='wisequotesworld';

export async function registerNewLocales(env){
  if(!env?.DB)return {ok:false,error:'DB binding unavailable'};
  const locales=[
    {code:'it',name:'Italian',native_name:'Italiano'},
    {code:'pt',name:'Portuguese (Brazil)',native_name:'Português (Brasil)'}
  ];
  for(const l of locales){
    await env.DB.prepare(`INSERT INTO languages(code,name,native_name,active) VALUES(?,?,?,1) ON CONFLICT(code) DO UPDATE SET name=excluded.name,native_name=excluded.native_name,active=1`).bind(l.code,l.name,l.native_name).run();
    await env.DB.prepare(`INSERT INTO project_languages(project_id,language_code,active) VALUES(?,?,1) ON CONFLICT(project_id,language_code) DO UPDATE SET active=1`).bind(PROJECT_ID,l.code).run();
  }
  const rows=(await env.DB.prepare(`SELECT l.code,l.name,l.native_name,l.active,pl.project_id,pl.active project_active FROM languages l LEFT JOIN project_languages pl ON pl.language_code=l.code AND pl.project_id=? WHERE l.code IN ('it','pt') ORDER BY l.code`).bind(PROJECT_ID).all()).results||[];
  return {ok:true,rows};
}
