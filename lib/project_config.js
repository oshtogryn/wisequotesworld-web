// Wise Quotes World runtime configuration.
// Keep website languages, current social delivery mode, and future provider rollout separate.

export const PROJECT_ID='wisequotesworld';

export const WEBSITE_LOCALES=['uk','ru','pl','en','sv','de','es','fr','it','pt','id','tr','ar'];

// Current temporary social operating mode as of 2026-09-10.
// These are provider-routing states, not content-language capabilities.
export const SOCIAL_DELIVERY={
  uk:{mode:'metricool',enabled:true},
  ru:{mode:'metricool',enabled:true},
  pl:{mode:'metricool',enabled:true},
  en:{mode:'metricool',enabled:true},
  sv:{mode:'metricool',enabled:true},
  de:{mode:'metricool',enabled:true},
  es:{mode:'metricool',enabled:true},
  fr:{mode:'metricool',enabled:true},
  it:{mode:'manual',enabled:true},
  pt:{mode:'manual',enabled:true},
  id:{mode:'prepared',enabled:false},
  tr:{mode:'prepared',enabled:false},
  ar:{mode:'prepared',enabled:false}
};

// Planned near-term state: all 13 Wise Quotes World locales connected to Metricool.
// Do not make production logic depend on the temporary eight-locale state.
export const TARGET_SOCIAL_PROVIDER='metricool';
export const TARGET_WQW_METRICOOL_BRANDS=13;
export const TARGET_SWEDEN_NO_SUGAR_METRICOOL_BRANDS=2;
export const TARGET_TOTAL_METRICOOL_BRANDS=15;

export function websiteLocales(){return [...WEBSITE_LOCALES];}
export function socialLocalesByMode(mode){
  return Object.entries(SOCIAL_DELIVERY).filter(([,v])=>v.mode===mode&&v.enabled).map(([k])=>k);
}
export function currentMetricoolLocales(){return socialLocalesByMode('metricool');}
export function currentManualSocialLocales(){return socialLocalesByMode('manual');}
export function socialPreparationLocales(){
  return Object.keys(SOCIAL_DELIVERY);
}
