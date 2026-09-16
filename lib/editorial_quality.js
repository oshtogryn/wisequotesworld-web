// Editorial QA for localized Wise Quotes World articles.
// The goal is information density and structural quality, not mechanical word inflation.

function text(v){return String(v||'').trim()}
function words(v){return text(v).split(/\s+/u).filter(Boolean)}
function paragraphs(v){return text(v).split(/\n\s*\n/u).map(x=>x.replace(/\s+/gu,' ').trim()).filter(Boolean)}
function sentences(v){return text(v).split(/(?<=[.!?。！？])\s+/u).map(x=>x.trim()).filter(Boolean)}
function normalized(v){return text(v).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/gu,' ').trim()}
function tokens(v){return new Set(normalized(v).split(' ').filter(x=>x.length>3))}
function jaccard(a,b){const A=tokens(a),B=tokens(b);if(!A.size&&!B.size)return 1;let common=0;for(const x of A)if(B.has(x))common++;return common/(A.size+B.size-common||1)}
function occurrences(haystack,needle){const h=normalized(haystack),n=normalized(needle);if(!h||!n||n.length<12)return 0;let count=0,pos=0;while((pos=h.indexOf(n,pos))!==-1){count++;pos+=Math.max(1,n.length)}return count}

// Phrases that are acceptable occasionally, but repeated across many articles often indicate template drift.
// These are warnings only; they never block publication by themselves.
const TEMPLATE_MARKERS=[
  'not a detached motivational slogan',
  'more useful when read in context',
  'one idea should change one action',
  'constant stream of information judgment comparison',
  'separate what is outside your control'
];

export function evaluateEditorialQuality({reflection,quote='',seo_title='',meta_description=''}){
  const body=text(reflection),ps=paragraphs(body),ss=sentences(body),wc=words(body).length;
  const errors=[],warnings=[];

  if(!body)errors.push('missing_reflection');
  if(wc<180)errors.push('reflection_too_short');
  else if(wc<250)warnings.push('reflection_below_editorial_target');
  if(wc>650)warnings.push('reflection_above_editorial_target');

  if(body&&ps.length<3)errors.push('reflection_not_multi_paragraph');
  else if(ps.length<4)warnings.push('reflection_low_paragraph_variety');

  // Catch exact or near-duplicate paragraphs/sentences without punishing deliberate short refrains.
  for(let i=0;i<ps.length;i++){
    if(normalized(ps[i]).length<80)continue;
    for(let j=i+1;j<ps.length;j++){
      if(normalized(ps[j]).length<80)continue;
      const score=jaccard(ps[i],ps[j]);
      if(score>=0.92)errors.push('near_duplicate_reflection_paragraph');
      else if(score>=0.78)warnings.push('similar_reflection_paragraphs');
    }
  }
  const longSentences=ss.filter(s=>words(s).length>42).length;
  if(longSentences>=2)warnings.push('multiple_very_long_sentences');

  const quoteUses=occurrences(body,quote);
  if(quoteUses>2)warnings.push('quote_repeated_too_often');

  const normBody=normalized(body);
  const markerHits=TEMPLATE_MARKERS.filter(x=>normBody.includes(normalized(x)));
  if(markerHits.length>=2)warnings.push('template_phrase_density');

  const titleLen=[...text(seo_title)].length;
  const metaLen=[...text(meta_description)].length;
  if(!titleLen)errors.push('missing_seo_title');
  else if(titleLen>70)warnings.push('seo_title_long');
  if(!metaLen)errors.push('missing_meta_description');
  else if(metaLen<80)warnings.push('meta_description_short');
  else if(metaLen>180)warnings.push('meta_description_long');

  return {
    ready:errors.length===0,
    errors:[...new Set(errors)],
    warnings:[...new Set(warnings)],
    metrics:{words:wc,paragraphs:ps.length,sentences:ss.length,quote_uses:quoteUses,template_marker_hits:markerHits.length,title_chars:titleLen,meta_chars:metaLen}
  };
}
