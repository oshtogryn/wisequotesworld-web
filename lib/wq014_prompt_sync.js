const PROJECT_ID='wisequotesworld';
const CONTENT_ID='WQ014';
const LANGS=['uk','ru','pl','en','sv','de','es','fr'];

const Q={
uk:{lang:'Ukrainian',quote:'«Неосмислене життя не варте того, щоб його проживати».',author:'— Сократ'},
ru:{lang:'Russian',quote:'«Неосмысленная жизнь не стоит того, чтобы её проживать».',author:'— Сократ'},
pl:{lang:'Polish',quote:'„Życie bez refleksji nie jest warte przeżycia.”',author:'— Sokrates'},
en:{lang:'English',quote:'“The unexamined life is not worth living.”',author:'— Socrates'},
sv:{lang:'Swedish',quote:'”Ett liv utan självrannsakan är inte värt att leva.”',author:'— Sokrates'},
de:{lang:'German',quote:'„Ein ungeprüftes Leben ist nicht lebenswert.“',author:'— Sokrates'},
es:{lang:'Spanish',quote:'«Una vida sin examen no merece la pena ser vivida».',author:'— Sócrates'},
fr:{lang:'French',quote:'«Une vie sans examen ne vaut pas la peine d’être vécue.»',author:'— Socrate'}
};

const PIN_SCENES={
uk:'A dignified classical stone portrait of Socrates stands in a quiet ancient Athenian courtyard at dawn. In front of him is a shallow bronze bowl filled with still water, reflecting his face with clarity. Soft golden morning light, pale stone columns, subtle olive branches in the background, calm philosophical atmosphere, refined editorial realism.',
ru:'A powerful marble portrait of Socrates sits in a dim philosophical chamber lit by a single oil lamp. Beside him lies a wax tablet and stylus, suggesting reflection and inner examination. Deep shadows, warm amber light, textured stone, intimate contemplative mood, premium cinematic realism.',
pl:'A classical stone bust of Socrates stands beneath an open colonnade overlooking a quiet Athenian landscape at sunset. A long shadow stretches across the floor, symbolizing reflection and the passage of time. Warm evening light, soft atmosphere, restrained intellectual elegance, premium editorial realism.',
en:'A dignified portrait sculpture of Socrates appears in a refined ancient Greek interior beside a polished bronze mirror resting on a stone table. The mirror catches soft light but reflects only part of the face, suggesting self-examination. Quiet luxury, warm muted tones, dark stone, sophisticated philosophical editorial composition, cinematic realism.',
sv:'A solemn marble portrait of Socrates stands near the entrance of an ancient Greek study. Beyond the doorway, early morning light enters softly, illuminating dust in the air and a rolled scroll on a stone bench. The scene feels quiet, disciplined and introspective. Premium editorial realism, soft warm light, subtle atmosphere.',
de:'A dignified classical portrait of Socrates is placed in a severe stone interior with steps descending into shadow. A narrow beam of sunlight falls across his face and across an open scroll, creating a strong contrast between darkness and clarity. Restrained, intellectual, premium philosophical atmosphere, refined cinematic realism.',
es:'A classical bust of Socrates stands in a peaceful Athenian garden with olive trees and stone paths after light rain. Small puddles on the ground reflect the sculpture and the sky, creating a subtle metaphor of inner examination. Fresh atmosphere, soft diffused light, elegant intellectual mood, premium editorial realism.',
fr:'A noble stone portrait of Socrates stands in a refined ancient portico at twilight. In the foreground, a calm pool of water reflects the columns and the philosopher’s face, while the sky glows softly in muted gold and blue tones. Quiet, elevated, contemplative mood, sophisticated editorial composition, premium cinematic realism.'
};

function videoPrompt(lang){const q=Q[lang];return `Create a premium photorealistic vertical 9:16 cinematic video in ${q.lang}.

A dignified classical stone portrait of Socrates stands in a restrained ancient Athenian philosophical interior. In front of him is a shallow bronze bowl filled with dark water. At first the reflection is disturbed by gentle ripples; as the water slowly becomes still, the face of Socrates appears clearly. Subtle warm light, dark stone, quiet intellectual atmosphere, slow cinematic push-in. The visual metaphor is self-examination and learning to see oneself clearly.

Render EXACT text as one stable elegant text card:

${q.quote}
${q.author}

Use large, elegant, highly readable typography in the upper-middle safe area. Keep the text stable and complete.

Audio: calm native ${q.lang} narrator reads the exact quote and attribution naturally and completely; restrained contemplative music below the voice.

No subtitles. No captions. No emoji. No decorative symbols. No logo. No branding. No watermark. No other readable text.

End on the perfectly still reflection.`}
function pinterestPrompt(lang){const q=Q[lang];return `Create a premium photorealistic vertical 2:3 Pinterest image, target 1000×1500.

${PIN_SCENES[lang]}

Leave generous clean space for large mobile-readable typography.

Render EXACT ${q.lang} text:

${q.quote}
${q.author}

Use elegant, highly readable typography with clear hierarchy and balanced spacing.

No other readable text. No logo. No branding. No watermark.`}

async function ensureOutputsTable(db){await db.exec(`CREATE TABLE IF NOT EXISTS content_outputs (id TEXT PRIMARY KEY,project_id TEXT NOT NULL,content_item_id TEXT NOT NULL,language_code TEXT NOT NULL,output_key TEXT NOT NULL,output_text TEXT,status TEXT NOT NULL DEFAULT 'draft',updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE(content_item_id,language_code,output_key));CREATE INDEX IF NOT EXISTS idx_content_outputs_item ON content_outputs(content_item_id,language_code,output_key);`)}

export async function syncWQ014Prompts(env){
 if(!env?.DB)return {ok:false,error:'DB binding unavailable'};
 await ensureOutputsTable(env.DB);
 const ts=new Date().toISOString();
 for(const lang of LANGS){
   const vp=videoPrompt(lang),pp=pinterestPrompt(lang);
   await env.DB.prepare(`UPDATE content_versions SET ai_prompt=?,updated_at=? WHERE content_id=? AND language_code=? AND version=1`).bind(vp,ts,CONTENT_ID,lang).run();
   await env.DB.prepare(`INSERT INTO content_outputs(id,project_id,content_item_id,language_code,output_key,output_text,status,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(content_item_id,language_code,output_key) DO UPDATE SET output_text=excluded.output_text,status=excluded.status,updated_at=excluded.updated_at`).bind(`${CONTENT_ID}_${lang}_pinterest_prompt`,PROJECT_ID,CONTENT_ID,lang,'pinterest_prompt',pp,'ready',ts).run();
 }
 return readbackWQ014Prompts(env);
}

export async function readbackWQ014Prompts(env){
 if(!env?.DB)return {ok:false,error:'DB binding unavailable'};
 const rows=(await env.DB.prepare(`SELECT language_code,ai_prompt FROM content_versions WHERE content_id=? AND version=1 ORDER BY language_code`).bind(CONTENT_ID).all()).results||[];
 const pins=(await env.DB.prepare(`SELECT language_code,output_text FROM content_outputs WHERE project_id=? AND content_item_id=? AND output_key='pinterest_prompt' ORDER BY language_code`).bind(PROJECT_ID,CONTENT_ID).all()).results||[];
 const languages=LANGS.map(lang=>({language:lang,video_prompt:!!rows.find(r=>r.language_code===lang)?.ai_prompt?.trim(),pinterest_prompt:!!pins.find(r=>r.language_code===lang)?.output_text?.trim()}));
 return {ok:languages.every(x=>x.video_prompt&&x.pinterest_prompt),languages,video_prompt_count:languages.filter(x=>x.video_prompt).length,pinterest_prompt_count:languages.filter(x=>x.pinterest_prompt).length};
}
