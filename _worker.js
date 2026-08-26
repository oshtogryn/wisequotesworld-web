const LANGS=['en','uk','ru','pl','sv','de','es'];
function preferred(request){const h=(request.headers.get('Accept-Language')||'').toLowerCase();for(const l of ['uk','ru','pl','sv','de','es','en'])if(h.startsWith(l)||h.includes(','+l)||h.includes(' '+l))return l;return'en'}
export default{async fetch(request,env){const url=new URL(request.url);if(url.pathname==='/'||url.pathname==='/index.html'){return Response.redirect(`${url.origin}/${preferred(request)}/`,302)}return env.ASSETS.fetch(request)}};
