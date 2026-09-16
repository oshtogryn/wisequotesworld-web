// Machine-checkable subset of MASTER_RULES prompt requirements.
// This linter does not replace visual/native QA; it prevents structural prompt regressions.
function t(v){return String(v||'').trim()}
function norm(v){return t(v).normalize('NFKC').replace(/[“”„‟«»"']/g,'').replace(/\s+/g,' ').trim().toLowerCase()}
export function validateVideoPrompt({prompt,localized_quote,quote_type,author_name}){
 const p=t(prompt),q=t(localized_quote),type=String(quote_type||'adapted'),errors=[],warnings=[];
 if(!p)errors.push('missing_prompt');
 if(!/vertical\s+9:16/i.test(p))errors.push('missing_vertical_9_16');
 if(!/Audio\s*:/i.test(p))errors.push('missing_audio_block');
 if(!/No subtitles\./i.test(p))errors.push('missing_no_subtitles');
 if(!/No captions\./i.test(p))errors.push('missing_no_captions');
 if(!/No (?:logo|branding|watermark)/i.test(p))warnings.push('negative_branding_line_may_be_incomplete');
 if(q&&norm(p).indexOf(norm(q))<0)errors.push('localized_quote_not_exactly_present');
 if(type==='adapted'&&t(author_name)&&norm(p).includes(norm(author_name)))errors.push('adapted_prompt_contains_author');
 if(type==='verbatim'&&!t(author_name))errors.push('verbatim_missing_author');
 if(/phonetic|pronunciation diagnostic|unicode diagnostic|qa label|wrong spelling/i.test(p))errors.push('internal_qa_leaked_into_prompt');
 if((p.match(/\b(?:subtitle|caption)s?\b/gi)||[]).length>4)warnings.push('prompt_overexplains_text_controls');
 return{ready:errors.length===0,errors,warnings};
}

export function validatePinterestPrompt({prompt,localized_quote,quote_type,author_name}){
 const p=t(prompt),q=t(localized_quote),type=String(quote_type||'adapted'),errors=[],warnings=[];
 if(!p)errors.push('missing_prompt');
 if(!/(2:3|1000\s*[×x]\s*1500)/i.test(p))warnings.push('missing_explicit_2_3_target');
 if(q&&norm(p).indexOf(norm(q))<0)errors.push('localized_quote_not_exactly_present');
 if(type==='adapted'&&t(author_name)&&norm(p).includes(norm(author_name)))errors.push('adapted_prompt_contains_author');
 if(type==='verbatim'&&t(author_name)&&norm(p).indexOf(norm(author_name))<0)warnings.push('verbatim_author_not_explicit');
 if(/call to action|cta|website url|watermark|generated logo/i.test(p))warnings.push('possible_forbidden_helper_text');
 return{ready:errors.length===0,errors,warnings};
}
