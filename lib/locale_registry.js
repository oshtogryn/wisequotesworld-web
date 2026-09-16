// Canonical locale registry for Wise Quotes World.
// DB/URL codes remain backward-compatible. Canonical BCP-47 tags are used for HTML/hreflang/analytics semantics.
export const LOCALES = Object.freeze({
  uk:{db:'uk',url:'uk',canonical:'uk',html:'uk',name:'Українська',dir:'ltr',social:true,publishingMode:'metricool'},
  ru:{db:'ru',url:'ru',canonical:'ru',html:'ru',name:'Русский',dir:'ltr',social:true,publishingMode:'metricool'},
  pl:{db:'pl',url:'pl',canonical:'pl',html:'pl',name:'Polski',dir:'ltr',social:true,publishingMode:'metricool'},
  en:{db:'en',url:'en',canonical:'en',html:'en',name:'English',dir:'ltr',social:true,publishingMode:'metricool'},
  sv:{db:'sv',url:'sv',canonical:'sv',html:'sv',name:'Svenska',dir:'ltr',social:true,publishingMode:'metricool'},
  de:{db:'de',url:'de',canonical:'de',html:'de',name:'Deutsch',dir:'ltr',social:true,publishingMode:'metricool'},
  es:{db:'es',url:'es',canonical:'es',html:'es',name:'Español',dir:'ltr',social:true,publishingMode:'metricool'},
  fr:{db:'fr',url:'fr',canonical:'fr',html:'fr',name:'Français',dir:'ltr',social:true,publishingMode:'metricool'},
  it:{db:'it',url:'it',canonical:'it',html:'it',name:'Italiano',dir:'ltr',social:false,publishingMode:'manual'},
  pt:{db:'pt',url:'pt',canonical:'pt-BR',html:'pt-BR',name:'Português (Brasil)',dir:'ltr',social:false,publishingMode:'manual'},
  id:{db:'id',url:'id',canonical:'id',html:'id',name:'Bahasa Indonesia',dir:'ltr',social:false,publishingMode:'manual'},
  tr:{db:'tr',url:'tr',canonical:'tr',html:'tr',name:'Türkçe',dir:'ltr',social:false,publishingMode:'manual'},
  ar:{db:'ar',url:'ar',canonical:'ar',html:'ar',name:'العربية',dir:'rtl',social:false,publishingMode:'manual'}
});

export const WEBSITE_LOCALES=Object.freeze(Object.keys(LOCALES));
export const SOCIAL_LOCALES=Object.freeze(WEBSITE_LOCALES.filter(code=>LOCALES[code].social));

const ALIASES=Object.freeze({
  'pt-br':'pt','pt_br':'pt','ptbr':'pt','pt-BR':'pt','PT-BR':'pt',
  'ua':'uk','uk-ua':'uk','uk_ua':'uk',
  'sv-se':'sv','de-de':'de','es-es':'es','fr-fr':'fr','it-it':'it','tr-tr':'tr','ar-sa':'ar'
});

export function normalizeLocale(value){
  const raw=String(value||'').trim();
  if(!raw)return null;
  if(LOCALES[raw])return raw;
  const lower=raw.toLowerCase();
  if(LOCALES[lower])return lower;
  return ALIASES[raw]||ALIASES[lower]||null;
}

export function localeConfig(value){
  const code=normalizeLocale(value);
  return code?LOCALES[code]:null;
}

export function hreflang(value){
  return localeConfig(value)?.canonical||null;
}

export function localeUrl(value,path=''){
  const code=normalizeLocale(value);
  if(!code)return null;
  const suffix=String(path||'').replace(/^\/+/, '');
  return `/${LOCALES[code].url}/${suffix}`;
}

export function isConnectedSocialLocale(value){
  const cfg=localeConfig(value);
  return !!cfg?.social;
}
