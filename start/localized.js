(()=>{
  const l=document.documentElement.lang||'en';
  const T={
    uk:{sub:'Мудрість, до якої хочеться повертатися.',latest:'Останні цитати та роздуми',latestSmall:'Нові публікації Wise Quotes World',channels:'Офіційні канали',site:'Сайт',change:'Змінити мову',foot:'Wise Quotes World — позачасові слова, вдумливо зібрані.',pending:'Незабаром'},
    ru:{sub:'Мудрость, к которой хочется возвращаться.',latest:'Последние цитаты и размышления',latestSmall:'Новые публикации Wise Quotes World',channels:'Официальные каналы',site:'Сайт',change:'Сменить язык',foot:'Wise Quotes World — вечные слова, собранные с вниманием.',pending:'Скоро'},
    pl:{sub:'Mądrość, do której chce się wracać.',latest:'Najnowsze cytaty i refleksje',latestSmall:'Nowe publikacje Wise Quotes World',channels:'Oficjalne kanały',site:'Strona',change:'Zmień język',foot:'Wise Quotes World — ponadczasowe słowa, starannie wybrane.',pending:'Wkrótce'},
    en:{sub:'Wisdom worth returning to.',latest:'Latest quotes and reflections',latestSmall:'New Wise Quotes World posts',channels:'Official channels',site:'Website',change:'Change language',foot:'Wise Quotes World — timeless words, thoughtfully curated.',pending:'Coming soon'},
    sv:{sub:'Visdom att återvända till.',latest:'Senaste citaten och reflektionerna',latestSmall:'Nya inlägg från Wise Quotes World',channels:'Officiella kanaler',site:'Webbplats',change:'Byt språk',foot:'Wise Quotes World — tidlösa ord, omsorgsfullt utvalda.',pending:'Kommer snart'},
    de:{sub:'Weisheit, zu der man gern zurückkehrt.',latest:'Neueste Zitate und Gedanken',latestSmall:'Neue Beiträge von Wise Quotes World',channels:'Offizielle Kanäle',site:'Website',change:'Sprache ändern',foot:'Wise Quotes World — zeitlose Worte, sorgfältig ausgewählt.',pending:'Demnächst'},
    es:{sub:'Sabiduría a la que merece la pena volver.',latest:'Últimas citas y reflexiones',latestSmall:'Nuevas publicaciones de Wise Quotes World',channels:'Canales oficiales',site:'Sitio web',change:'Cambiar idioma',foot:'Wise Quotes World — palabras atemporales, cuidadosamente seleccionadas.',pending:'Próximamente'},
    fr:{sub:'Une sagesse à laquelle revenir.',latest:'Dernières citations et réflexions',latestSmall:'Nouvelles publications de Wise Quotes World',channels:'Canaux officiels',site:'Site web',change:'Changer de langue',foot:'Wise Quotes World — des mots intemporels, choisis avec soin.',pending:'Bientôt disponible'}
  };
  const R={
    uk:{facebook:'https://www.facebook.com/878404672024804',instagram:'https://www.instagram.com/wisequotes.ua/',threads:'https://www.threads.com/@wisequotes.ua',tiktok:'https://www.tiktok.com/@wisequotes.ua',youtube:'https://www.youtube.com/channel/UCh1HcI0nmrm_ddAPfVvyCSg',pinterest:'https://www.pinterest.com/wisequotesworld/'},
    ru:{facebook:'https://www.facebook.com/840438055830136',instagram:'https://www.instagram.com/wisequotes.ru/',threads:'https://www.threads.com/@wisequotes.ru',tiktok:'https://www.tiktok.com/@wisequotes.ru',youtube:'https://www.youtube.com/channel/UCV7RTZl4bfpRal8yq4fWrww',pinterest:'https://www.pinterest.com/wisequotesworld/'},
    pl:{facebook:'https://www.facebook.com/1114233325116588',instagram:'https://www.instagram.com/wisequotes.pl/',threads:'https://www.threads.com/@wisequotes.pl',tiktok:'https://www.tiktok.com/@wisequotes.pl',youtube:'https://www.youtube.com/channel/UCQYOdpJO52DNZg3r8Rpnb2Q',pinterest:'https://www.pinterest.com/wisequotesworld/'},
    en:{facebook:'https://www.facebook.com/908076919052977',instagram:'https://www.instagram.com/wisequotes.en/',threads:'https://www.threads.com/@wisequotes.en',tiktok:'https://www.tiktok.com/@wisequotes.en',youtube:'https://www.youtube.com/channel/UCMwuq1k0jrz8dh2ocozUz1Q',pinterest:'https://www.pinterest.com/wisequotesworld/'},
    sv:{facebook:'https://www.facebook.com/929364273586587',instagram:'https://www.instagram.com/wisequotes.se/',threads:'https://www.threads.com/@wisequotes.se',tiktok:'https://www.tiktok.com/@wisequotes.se',youtube:'https://www.youtube.com/channel/UCHnu9TFYxibDvSEOEfQykhg',pinterest:'https://www.pinterest.com/wisequotesworld/'},
    de:{facebook:'https://www.facebook.com/1151007124763146',instagram:'https://www.instagram.com/wisequotes.de/',threads:'https://www.threads.com/@wisequotes.de',tiktok:'https://www.tiktok.com/@wisequotes.de',youtube:'https://www.youtube.com/channel/UCNy384R9H91PAIPWAHppvzw',pinterest:'https://www.pinterest.com/wisequotesworld/'},
    es:{facebook:'https://www.facebook.com/1064990903375476',instagram:'https://www.instagram.com/wisequotes.es/',threads:'https://www.threads.com/@wisequotes.es',tiktok:'https://www.tiktok.com/@wisequotes.es',youtube:'https://www.youtube.com/channel/UCnFTJvWS7lpYYC2zJYG925Q',pinterest:'https://www.pinterest.com/wisequotesworld/'},
    fr:{facebook:null,instagram:null,threads:null,tiktok:null,youtube:null,pinterest:'https://www.pinterest.com/wisequotesworld/'}
  };
  const A=T[l]||T.en;
  const links=R[l]||R.en;
  const social=[['facebook','Facebook','📘'],['instagram','Instagram','📸'],['threads','Threads','🧵'],['tiktok','TikTok','🎵'],['youtube','YouTube','▶️'],['pinterest','Pinterest','📌']];
  const socialHtml=social.map(([key,name,icon])=>links[key]
    ? `<a class="btn" href="${links[key]}" target="_blank" rel="noopener noreferrer">${icon} ${name}</a>`
    : `<div class="btn disabled">${icon} ${name}<small>${A.pending}</small></div>`
  ).join('');
  document.getElementById('app').innerHTML=`<main class="wrap"><section class="card"><div class="top"><div class="logo">W</div><div><h1>Wise Quotes World</h1><p class="sub">${A.sub}</p></div></div><a class="btn primary" href="/${l}/">📖 ${A.latest}<small>${A.latestSmall}</small></a><div class="section"><h2>${A.channels}</h2><div class="grid"><a class="btn" href="/${l}/">🌐 ${A.site}</a>${socialHtml}</div></div><a class="btn" href="/start/">🌍 ${A.change}</a><p class="foot">${A.foot}</p></section></main>`;
})();