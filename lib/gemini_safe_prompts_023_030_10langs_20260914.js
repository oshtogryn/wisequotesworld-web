const PROJECT='wisequotesworld';
const LOCALES=['uk','ru','pl','en','sv','de','es','fr','it','pt'];
const LANGUAGE={uk:'Ukrainian',ru:'Russian',pl:'Polish',en:'English',sv:'Swedish',de:'German',es:'Spanish',fr:'French',it:'Italian',pt:'Brazilian Portuguese'};

const SCENE={
  WQ023:`A symbolic spring scene in a quiet literary garden. A small classical stone bust of an anonymous woman poet stands among traces of late frost. Tiny spring flowers push through the cold ground while warm early sunlight reaches the horizon. Nearby lie an open poetry book, handwritten manuscript pages, and a fountain pen. The visual story is active hope emerging through difficulty: dignified, resilient, calm, and hopeful without sentimentality.`,
  WQ024:`A symbolic civic scene at early dawn in a restrained memorial courtyard. A small classical stone bust of an anonymous statesman stands beside broad stone steps and clean architectural lines. Beyond the steps, the horizon opens into warm morning light, suggesting responsibility, public service, courage, and forward action. The mood is dignified, focused, inspiring, and active without theatrical patriotism.`,
  WQ025:`A symbolic poetic scene in a serene riverside garden at sunrise. A small classical stone bust of an anonymous poet stands beneath delicate branches beside still water and soft mist. Nearby are an open notebook and loose manuscript pages moved gently by the breeze. Warm morning light spreads across the landscape, creating a feeling of spiritual openness, tenderness, beauty, and quiet wonder without sentimentality.`,
  WQ026:`A symbolic reflective scene in a quiet Renaissance-style study. A small classical stone bust of an anonymous philosopher stands on a wooden table beside an open essay book, handwritten pages, a quill, and a simple hourglass. Soft window light meets restrained candlelight. The room feels orderly, inward-looking, intellectually curious, and humane, expressing self-examination rather than grandiosity.`,
  WQ027:`A symbolic mid-20th-century scene of inner freedom in a modest study. A small classical stone bust of an anonymous thinker stands near a simple desk, an open notebook, and a quiet lamp. Outside the window, a road ends at a stone wall; inside, a hand-drawn route on the desk turns away from the blocked path toward a new direction. Subtle light gradually softens the shadows. The mood is serious, humane, dignified, and quietly hopeful.`,
  WQ028:`A symbolic Stoic scene in a quiet Roman-inspired courtyard at late afternoon. A small classical stone bust of an anonymous philosopher stands beside a water clock, an hourglass, a few untouched wax tablets, and restrained olive branches. Long sunlight moves across stone while grains continue to fall, making the passage and loss of time visually clear. The mood is disciplined, lucid, calm, and unsentimental.`,
  WQ029:`A symbolic scene of courage and liberation in an open courtyard after rain. A small classical stone bust of an anonymous statesman stands beside a long pathway leading from shadow toward clear daylight. A simple gate stands open in the distance, and fresh light breaks through the clouds. The visual story is perseverance, dignity, reconciliation, and movement through fear rather than the absence of fear.`,
  WQ030:`A symbolic literary scene in a quiet writer's room near water. A small classical stone bust of an anonymous woman writer stands beside a writing desk with an open notebook, loose manuscript pages, and a fountain pen. Through the window, moving reflections of water and sky fill the room with shifting natural light. The space suggests intellectual independence, inner freedom, and the private territory of the mind. The mood is elegant, introspective, sensitive, and calm.`
};

function buildPrompt(id,lang,quote){
  const scene=SCENE[id];
  if(!scene) throw new Error(`${id}: missing scene`);
  const language=LANGUAGE[lang];
  if(!language) throw new Error(`${id}/${lang}: unsupported language`);
  return `Create a premium photorealistic vertical 9:16 cinematic video in ${language}.\n\n${scene}\n\nDo not depict any recognizable public figure or exact likeness. The bust must be generic, anonymous, and not identifiable as any specific real person. Do not reproduce a known portrait, photograph, memorial statue, or distinctive facial features of the quoted author.\n\nRender EXACT text in one stable, elegant, mobile-readable upper-middle text card:\n${quote}\n\nTypography: clean, large, elegant, mobile-readable; keep the complete quote stable on screen; no word-by-word or letter-by-letter animation.\n\nAudio: a calm native ${language} narrator reads the exact quote and attribution naturally and completely, with correct native pronunciation of the author's name. Restrained cinematic music remains below the voice.\n\nNo subtitles. No captions. No emoji. No decorative symbols. No logo. No branding. No watermark. No other readable text.\n\nEnd on a clean contemplative hold.`;
}

async function latestVersion(env,id,lang){
  return env.DB.prepare(`SELECT id,content_id,language_code,adapted_text,version FROM content_versions WHERE content_id=? AND language_code=? ORDER BY version DESC LIMIT 1`).bind(id,lang).first();
}

export async function applyGeminiSafePrompts023030(env){
  if(!env?.DB) return {ok:false,error:'DB unavailable'};
  const changed=[];
  for(let n=23;n<=30;n++){
    const id=`WQ${String(n).padStart(3,'0')}`;
    for(const lang of LOCALES){
      const row=await latestVersion(env,id,lang);
      if(!row?.id || !String(row.adapted_text||'').trim()) throw new Error(`${id}/${lang}: localized quote missing`);
      const prompt=buildPrompt(id,lang,String(row.adapted_text).trim());
      await env.DB.prepare(`UPDATE content_versions SET ai_prompt=? WHERE id=?`).bind(prompt,row.id).run();
      changed.push({id,language:lang,version:row.version,chars:prompt.length});
    }
  }
  return readGeminiSafePrompts023030(env,{changed});
}

export async function readGeminiSafePrompts023030(env,extra={}){
  if(!env?.DB) return {ok:false,error:'DB unavailable'};
  const rows=(await env.DB.prepare(`SELECT cv.content_id,cv.language_code,cv.version,cv.ai_prompt FROM content_versions cv JOIN (SELECT content_id,language_code,MAX(version) version FROM content_versions WHERE content_id BETWEEN 'WQ023' AND 'WQ030' AND language_code IN ('uk','ru','pl','en','sv','de','es','fr','it','pt') GROUP BY content_id,language_code) x ON x.content_id=cv.content_id AND x.language_code=cv.language_code AND x.version=cv.version ORDER BY cv.content_id,cv.language_code`).all()).results||[];
  const checks=rows.map(r=>({
    id:r.content_id,
    language:r.language_code,
    version:r.version,
    has_prompt:!!String(r.ai_prompt||'').trim(),
    anonymous_bust:String(r.ai_prompt||'').includes('small classical stone bust of an anonymous'),
    no_likeness:String(r.ai_prompt||'').includes('Do not depict any recognizable public figure or exact likeness.'),
    exact_text:String(r.ai_prompt||'').includes('Render EXACT text'),
    topic_scene:!!SCENE[r.content_id]
  }));
  const expected=8*10;
  const ok=checks.length===expected && checks.every(x=>x.has_prompt&&x.anonymous_bust&&x.no_likeness&&x.exact_text&&x.topic_scene);
  return {ok,expected,count:checks.length,topics:8,languages:LOCALES,checks,...extra};
}


export async function ensureGeminiSafePrompts023030Step(env){
  if(!env?.DB)return {ok:false,error:'DB unavailable'};
  await env.DB.exec(`CREATE TABLE IF NOT EXISTS system_migrations(id TEXT PRIMARY KEY,applied_at TEXT NOT NULL,notes TEXT);`);
  for(let n=23;n<=30;n++){
    const id=`WQ${String(n).padStart(3,'0')}`;
    const migrationId=`gemini-safe-prompts-${id}-10langs-20260914`;
    const done=await env.DB.prepare(`SELECT id FROM system_migrations WHERE id=?`).bind(migrationId).first();
    if(done)continue;
    const changed=[];
    const ts=new Date().toISOString();
    for(const lang of LOCALES){
      const row=await latestVersion(env,id,lang);
      if(!row?.id||!String(row.adapted_text||'').trim())throw new Error(`${id}/${lang}: localized quote missing`);
      const prompt=buildPrompt(id,lang,String(row.adapted_text).trim());
      await env.DB.prepare(`UPDATE content_versions SET ai_prompt=? WHERE id=?`).bind(prompt,row.id).run();
      changed.push({language:lang,version:row.version,chars:prompt.length});
    }
    await env.DB.prepare(`INSERT INTO system_migrations(id,applied_at,notes) VALUES(?,?,?)`).bind(migrationId,ts,`Applied Gemini-safe anonymous-bust prompts to ${id} for 10 locales`).run();
    return {ok:true,applied:id,changed:changed.length};
  }
  return {ok:true,done:true};
}
