// Centralized backend admin authentication for Wise Quotes World.
// Cloudflare Access is the primary authentication layer for browser/admin automation.
// Legacy ADMIN_TOKEN remains accepted as an additional fallback layer.

function json(data,status=200){
  return new Response(JSON.stringify(data),{
    status,
    headers:{
      'content-type':'application/json; charset=utf-8',
      'cache-control':'no-store',
      'x-content-type-options':'nosniff'
    }
  });
}

const DEFAULT_ADMIN_EMAIL='alex.shtogryn@gmail.com';
const DEFAULT_ACCESS_ISSUER='https://empty-flower-5659.cloudflareaccess.com';
let jwksCache={issuer:'',expiresAt:0,keys:[]};

function suppliedToken(request){
  const bearer=request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]||'';
  return bearer||request.headers.get('x-admin-token')||'';
}

function accessEmail(request){
  return String(request.headers.get('cf-access-authenticated-user-email')||'').trim().toLowerCase();
}

function accessAssertion(request){
  return String(request.headers.get('cf-access-jwt-assertion')||'').trim();
}

function allowedEmails(env){
  const configured=String(env?.ADMIN_EMAILS||env?.ADMIN_EMAIL||DEFAULT_ADMIN_EMAIL);
  return configured.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
}

function decodeBase64Url(value){
  try{
    const normalized=String(value||'').replace(/-/g,'+').replace(/_/g,'/');
    const padded=normalized+'='.repeat((4-normalized.length%4)%4);
    return atob(padded);
  }catch{return ''}
}

function decodeJsonPart(value){
  try{return JSON.parse(decodeBase64Url(value)||'{}')}catch{return null}
}

function base64UrlBytes(value){
  const raw=decodeBase64Url(value);if(!raw)return new Uint8Array();
  const out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out;
}

function expectedIssuer(env){
  return String(env?.CF_ACCESS_TEAM_DOMAIN||env?.ACCESS_TEAM_DOMAIN||DEFAULT_ACCESS_ISSUER).replace(/\/$/,'');
}

async function accessKeys(issuer){
  const now=Date.now();
  if(jwksCache.issuer===issuer&&jwksCache.expiresAt>now&&jwksCache.keys.length)return jwksCache.keys;
  const res=await fetch(`${issuer}/cdn-cgi/access/certs`,{headers:{accept:'application/json'}});
  if(!res.ok)throw new Error(`access_jwks_${res.status}`);
  const body=await res.json();
  const keys=Array.isArray(body?.keys)?body.keys:[];
  if(!keys.length)throw new Error('access_jwks_empty');
  jwksCache={issuer,expiresAt:now+60*60*1000,keys};
  return keys;
}

async function verifyAccessJwt(request,env){
  const token=accessAssertion(request);if(!token)return null;
  const parts=token.split('.');if(parts.length!==3)return null;
  const header=decodeJsonPart(parts[0]),payload=decodeJsonPart(parts[1]);
  if(!header||!payload||header.alg!=='RS256'||!header.kid)return null;
  const issuer=expectedIssuer(env);
  if(String(payload.iss||'').replace(/\/$/,'')!==issuer)return null;
  const now=Math.floor(Date.now()/1000);
  if(Number(payload.exp||0)<=now-30)return null;
  if(payload.nbf!=null&&Number(payload.nbf)>now+30)return null;
  if(payload.iat!=null&&Number(payload.iat)>now+120)return null;
  const expectedAud=String(env?.CF_ACCESS_AUD||env?.ACCESS_AUD||'').trim();
  if(expectedAud){const aud=Array.isArray(payload.aud)?payload.aud:[payload.aud];if(!aud.includes(expectedAud))return null;}
  try{
    const keys=await accessKeys(issuer),jwk=keys.find(k=>k.kid===header.kid&&k.kty==='RSA');if(!jwk)return null;
    const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
    const data=new TextEncoder().encode(`${parts[0]}.${parts[1]}`),sig=base64UrlBytes(parts[2]);
    if(!sig.length||!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,sig,data))return null;
    return payload;
  }catch{return null}
}

async function isCloudflareAccessHuman(request,env){
  const payload=await verifyAccessJwt(request,env);if(!payload)return false;
  const email=accessEmail(request)||String(payload.email||'').trim().toLowerCase();
  return !!email&&allowedEmails(env).includes(email);
}

async function isCloudflareAccessService(request,env){
  const payload=await verifyAccessJwt(request,env);if(!payload)return false;
  const common=String(payload.common_name||'').trim();
  if(payload.type!=='app'||String(payload.sub||'')!==''||!common.endsWith('.access'))return false;
  const presented=String(request.headers.get('cf-access-client-id')||'').trim();
  if(presented&&presented!==common)return false;
  return true;
}

async function sha256(value){
  const data=new TextEncoder().encode(String(value||''));
  return new Uint8Array(await crypto.subtle.digest('SHA-256',data));
}

function equalBytes(a,b){
  if(a.length!==b.length)return false;
  let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;
}

async function hasLegacyAdminToken(request,env){
  const expected=String(env?.ADMIN_TOKEN||''),supplied=String(suppliedToken(request)||'');
  if(!expected||!supplied)return false;
  const [a,b]=await Promise.all([sha256(expected),sha256(supplied)]);return equalBytes(a,b);
}

export async function isAdminRequest(request,env){
  if(await isCloudflareAccessHuman(request,env))return true;
  if(await isCloudflareAccessService(request,env))return true;
  return hasLegacyAdminToken(request,env);
}

export async function requireAdmin(request,env){
  return await isAdminRequest(request,env)?null:json({ok:false,error:'unauthorized'},401);
}

export function isAdminPath(pathname){
  return pathname==='/admin'||pathname.startsWith('/admin/')||pathname.startsWith('/api/admin/')||pathname==='/ops'||pathname.startsWith('/ops/');
}
