// Platform-aware copy QA for Wise Quotes World.
// Hard errors protect link routing and output completeness; target-length deviations are warnings.
function text(v){return String(v||'').trim()}
function chars(v){return [...text(v)].length}
function hashtags(v){return text(v).match(/(^|\s)#[\p{L}\p{N}_-]+/gu)||[]}
function urls(v){return text(v).match(/https?:\/\/[^\s)\]}]+/giu)||[]}
function tokens(v){return new Set(text(v).toLowerCase().replace(/https?:\/\/\S+/g,' ').replace(/#[\p{L}\p{N}_-]+/gu,' ').replace(/[^\p{L}\p{N}]+/gu,' ').split(/\s+/u).filter(x=>x.length>2))}
function jaccard(a,b){const A=tokens(a),B=tokens(b);if(!A.size&&!B.size)return 1;let n=0;for(const x of A)if(B.has(x))n++;return n/(A.size+B.size-n||1)}
function articleUrl(locale,slugOrUrl){const v=text(slugOrUrl);if(/^https:\/\/wisequotesworld\.com\//i.test(v))return v;return `https://wisequotesworld.com/${locale}/quotes/${v.replace(/^\/+|\/+$/g,'')}/`}
function basic(v,targetMin,targetMax){const errors=[],warnings=[],n=chars(v),hs=hashtags(v);if(!n)errors.push('missing_text');if(hs.length>5)errors.push('too_many_hashtags');if(n&&n<Math.max(80,Math.floor(targetMin*.45)))errors.push('copy_too_thin');else if(n&&n<targetMin)warnings.push('below_working_target');if(n>targetMax*1.7)errors.push('copy_excessively_long');else if(n>targetMax)warnings.push('above_working_target');return{errors,warnings,chars:n,hashtags:hs.length}}
export function validateSocialCopy({network,value,locale,article_url}){
 const expected=articleUrl(locale,article_url),v=text(value),base=network==='facebook'?basic(v,550,1000):network==='instagram'?basic(v,400,800):network==='tiktok'?basic(v,250,500):network==='threads'?basic(v,120,500):network==='youtube_description'?basic(v,120,650):network.startsWith('pinterest_')?basic(v,100,500):basic(v,1,500);
 const {errors,warnings}=base,found=urls(v);
 if(network==='facebook'||network==='threads'){
   if(!v.includes(expected))errors.push('missing_exact_article_url');
   if(found.some(u=>u!==expected))warnings.push('unexpected_extra_url');
 }
 if(network==='instagram'||network==='youtube_description'){
   if(found.length)errors.push('raw_url_not_allowed');
 }
 if(network==='tiktok'){
   if(/clickable|клікабель|кликабель|clicable|klickbar|cliquable/i.test(v))errors.push('claims_clickable_link');
 }
 if(network==='pinterest_image_description'||network==='pinterest_video_description'){
   if(found.length)warnings.push('destination_url_belongs_in_pin_field');
 }
 return{network,ready:errors.length===0,errors:[...new Set(errors)],warnings:[...new Set(warnings)],...base};
}
export function validateThreadSet(values){const errors=[],warnings=[],v=values.map(text);if(v.some(x=>!x))errors.push('threads_missing');for(let i=0;i<v.length;i++)for(let j=i+1;j<v.length;j++){const score=jaccard(v[i],v[j]);if(score>=0.82)errors.push(`threads_${i+1}_${j+1}_near_duplicate`);else if(score>=0.68)warnings.push(`threads_${i+1}_${j+1}_similar`)}return{ready:errors.length===0,errors,warnings}}
export function validateOutputSet({locale,article_url,outputs}){
 const checks=[];const get=k=>outputs?.[k]||'';
 for(const k of ['facebook','instagram','tiktok','youtube_description','pinterest_image_description','pinterest_video_description'])checks.push(validateSocialCopy({network:k,value:get(k),locale,article_url}));
 for(const k of ['threads_1','threads_2','threads_3'])checks.push(validateSocialCopy({network:'threads',value:get(k),locale,article_url}));
 const threadSet=validateThreadSet([get('threads_1'),get('threads_2'),get('threads_3')]);
 const titleMissing=['youtube_title','pinterest_image_title','pinterest_video_title'].filter(k=>!text(get(k)));
 return{ready:checks.every(x=>x.ready)&&threadSet.ready&&!titleMissing.length,checks,threads:threadSet,title_missing:titleMissing,warnings:[...checks.flatMap(x=>x.warnings),...threadSet.warnings]};
}
