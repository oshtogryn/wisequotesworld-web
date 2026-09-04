const PROJECT_ID='wisequotesworld';
export async function prepareNewLocales(env){
  if(!env?.DB)return {ok:false,error:'DB binding unavailable'};
  await env.DB.prepare(`INSERT INTO languages(code,name,native_name,active) VALUES('it','Italian','Italiano',1) ON CONFLICT(code) DO UPDATE SET name='Italian',native_name='Italiano',active=1`).run();
  await env.DB.prepare(`INSERT INTO languages(code,name,native_name,active) VALUES('pt','Portuguese (Brazil)','Português (Brasil)',1) ON CONFLICT(code) DO UPDATE SET name='Portuguese (Brazil)',native_name='Português (Brasil)',active=1`).run();
  await env.DB.prepare(`INSERT INTO project_languages(project_id,language_code,active) VALUES(?,'it',1) ON CONFLICT(project_id,language_code) DO UPDATE SET active=1`).bind(PROJECT_ID).run();
  await env.DB.prepare(`INSERT INTO project_languages(project_id,language_code,active) VALUES(?,'pt',1) ON CONFLICT(project_id,language_code) DO UPDATE SET active=1`).bind(PROJECT_ID).run();
  const profiles=[
    ['it',JSON.stringify({locale:'it-IT',tone:'naturale, conciso, riflessivo, contemporaneo',translation_policy:'adattare il significato canonico; evitare calchi letterali; preservare stato e attribuzione delle citazioni',social_status:'prepared_inactive'})],
    ['pt',JSON.stringify({locale:'pt-BR',tone:'natural, conciso, reflexivo, contemporâneo',translation_policy:'adaptar o significado canônico; evitar tradução literal; preservar status e atribuição das citações',social_status:'prepared_inactive'})]
  ];
  for(const [lang,json] of profiles){
    await env.DB.prepare(`INSERT INTO language_style_profiles(project_id,language_code,profile_json,version,active) VALUES(?,?,?,1,1) ON CONFLICT(project_id,language_code,version) DO UPDATE SET profile_json=excluded.profile_json,active=1`).bind(PROJECT_ID,lang,json).run();
  }
  const rows=(await env.DB.prepare(`SELECT l.code,l.name,l.native_name,l.active,pl.active project_active FROM languages l LEFT JOIN project_languages pl ON pl.language_code=l.code AND pl.project_id=? WHERE l.code IN ('it','pt') ORDER BY l.code`).bind(PROJECT_ID).all()).results||[];
  return {ok:true,languages:rows};
}
