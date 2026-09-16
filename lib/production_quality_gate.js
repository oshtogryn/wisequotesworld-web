import {validateOutputSet} from './social_copy_quality.js';
import {validateVideoPrompt,validatePinterestPrompt} from './prompt_quality.js';

const SOCIAL=['uk','ru','pl','en','sv','de','es','fr'];
const V2_KEYS=['facebook','instagram','threads_1','threads_2','threads_3','tiktok','youtube_title','youtube_description','pinterest_image_title','pinterest_image_description','pinterest_video_title','pinterest_video_description','pinterest_prompt','article_url'];

function val(v){return String(v||'').trim()}
function mapOutputs(rows){const by={};for(const l of SOCIAL)by[l]={};for(const r of rows||[]){if(by[r.language_code])by[r.language_code][r.output_key]=r.output_text||''}return by}
function mapVersions(rows){return new Map((rows||[]).map(v=>[v.language_code,v]))}

export function evaluateProductionQuality({id,item,versions,outputs}){
 const n=Number(String(id||'').replace(/^WQ/i,''));
 if(!Number.isFinite(n)||n<=26)return{enforced:false,ready:true,standard:'legacy-compatible',languages:[]};
 const by=mapOutputs(outputs),vm=mapVersions(versions),languages=[];
 for(const language of SOCIAL){
   const o=by[language]||{},v=vm.get(language)||{};
   const missing=V2_KEYS.filter(k=>!val(o[k]));
   const social=validateOutputSet({locale:language,article_url:o.article_url,outputs:o});
   const video=validateVideoPrompt({prompt:v.ai_prompt,localized_quote:v.adapted_text,quote_type:item?.quote_type,author_name:item?.author_name});
   const pinterest=validatePinterestPrompt({prompt:o.pinterest_prompt,localized_quote:v.adapted_text,quote_type:item?.quote_type,author_name:item?.author_name});
   const errors=[...missing.map(k=>`missing_${k}`),...social.checks.flatMap(x=>x.errors||[]),...(social.threads?.errors||[]),...(video.errors||[]),...(pinterest.errors||[])];
   const warnings=[...(social.warnings||[]),...(video.warnings||[]),...(pinterest.warnings||[])];
   languages.push({language,ready:missing.length===0&&social.ready&&video.ready&&pinterest.ready,missing,social,video_prompt:video,pinterest_prompt:pinterest,errors:[...new Set(errors)],warnings:[...new Set(warnings)]});
 }
 return{enforced:true,standard:'v2',ready:languages.every(x=>x.ready),languages};
}
