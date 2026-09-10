// Cloudflare Access JWT verification using the account JWKS endpoint.
// Required env vars for cryptographic verification:
//   CF_ACCESS_TEAM_DOMAIN=https://<team>.cloudflareaccess.com
//   CF_ACCESS_AUD=<application audience tag>[,<second tag>]

const CACHE_TTL_MS=5*60*1000;
let jwksCache={issuer:null,expiresAt:0,keys:[]};

function b64urlBytes(value){
  const s=String(value||'').replace(/-/g,'+').replace(/_/g,'/');
  const padded=s+'='.repeat((4-s.length%4)%4);
  const raw=atob(padded),out=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);
  return out;
}
function b64urlJson(value){return JSON.parse(new TextDecoder().decode(b64urlBytes(value)));}
function normalizeIssuer(raw){
  const value=String(raw||'').trim().replace(/\/$/,'');
  if(!value)return null;
  let u;try{u=new URL(value)}catch{return null}
  if(u.protocol!=='https:'||!u.hostname.endsWith('.cloudflareaccess.com'))return null;
  return u.origin;
}
function audiences(env){return String(env?.CF_ACCESS_AUD||'').split(',').map(x=>x.trim()).filter(Boolean)}
function audienceMatches(payloadAud,allowed){
  const actual=Array.isArray(payloadAud)?payloadAud:[payloadAud].filter(Boolean);
  return actual.some(x=>allowed.includes(String(x)));
}
async function getJwks(issuer){
  const now=Date.now();if(jwksCache.issuer===issuer&&jwksCache.expiresAt>now&&jwksCache.keys.length)return jwksCache.keys;
  const r=await fetch(`${issuer}/cdn-cgi/access/certs`,{headers:{accept:'application/json'}});
  if(!r.ok)throw new Error(`access_jwks_${r.status}`);
  const data=await r.json(),keys=Array.isArray(data?.keys)?data.keys:[];
  if(!keys.length)throw new Error('access_jwks_empty');
  jwksCache={issuer,expiresAt:now+CACHE_TTL_MS,keys};return keys;
}
async function verifySignature(token,header,issuer){
  if(header?.alg!=='RS256'||!header?.kid)return false;
  const keys=await getJwks(issuer),jwk=keys.find(k=>k.kid===header.kid&&k.kty==='RSA');if(!jwk)return false;
  const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
  const parts=token.split('.'),data=new TextEncoder().encode(`${parts[0]}.${parts[1]}`),sig=b64urlBytes(parts[2]);
  return crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,sig,data);
}

export async function verifyCloudflareAccessJwt(token,env){
  const issuer=normalizeIssuer(env?.CF_ACCESS_TEAM_DOMAIN),allowedAud=audiences(env);
  if(!issuer||!allowedAud.length)return{ok:false,error:'access_verifier_not_configured'};
  const parts=String(token||'').split('.');if(parts.length!==3)return{ok:false,error:'malformed_access_jwt'};
  let header,payload;try{header=b64urlJson(parts[0]);payload=b64urlJson(parts[1])}catch{return{ok:false,error:'invalid_access_jwt_encoding'}}
  if(String(payload?.iss||'').replace(/\/$/,'')!==issuer)return{ok:false,error:'access_issuer_mismatch'};
  if(!audienceMatches(payload?.aud,allowedAud))return{ok:false,error:'access_audience_mismatch'};
  const now=Math.floor(Date.now()/1000),skew=60;
  if(payload?.exp&&Number(payload.exp)<now-skew)return{ok:false,error:'access_token_expired'};
  if(payload?.nbf&&Number(payload.nbf)>now+skew)return{ok:false,error:'access_token_not_yet_valid'};
  try{if(!await verifySignature(token,header,issuer))return{ok:false,error:'access_signature_invalid'}}catch(e){return{ok:false,error:String(e?.message||e)}}
  return{ok:true,payload};
}
