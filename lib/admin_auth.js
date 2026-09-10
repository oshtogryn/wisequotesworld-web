// Centralized backend admin authentication for Wise Quotes World.
// Cloudflare Access is the primary authentication layer for browser admin access.
// Legacy ADMIN_TOKEN remains accepted as a fallback for non-browser automation.

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
    const normalized=value.replace(/-/g,'+').replace(/_/g,'/');
    const padded=normalized+'='.repeat((4-normalized.length%4)%4);
    return atob(padded);
  }catch{return ''}
}

function emailFromAccessJwt(request){
  const token=accessAssertion(request);
  if(!token)return '';
  const parts=token.split('.');
  if(parts.length<2)return '';
  try{
    const payload=JSON.parse(decodeBase64Url(parts[1])||'{}');
    return String(payload.email||payload.sub||'').trim().toLowerCase();
  }catch{return ''}
}

function isCloudflareAccessAdmin(request,env){
  const assertion=accessAssertion(request);
  if(!assertion)return false;

  // Depending on the Cloudflare Access integration path, the explicit
  // authenticated-user-email header may be absent while the signed Access
  // JWT is still present. Prefer the header when available, otherwise read
  // the identity claim from the Access JWT payload. Cloudflare Access itself
  // remains the enforcement layer for the protected route.
  const email=accessEmail(request)||emailFromAccessJwt(request);
  return !!email && allowedEmails(env).includes(email);
}

async function sha256(value){
  const data=new TextEncoder().encode(String(value||''));
  return new Uint8Array(await crypto.subtle.digest('SHA-256',data));
}

function equalBytes(a,b){
  if(a.length!==b.length)return false;
  let diff=0;
  for(let i=0;i<a.length;i++)diff|=a[i]^b[i];
  return diff===0;
}

async function hasLegacyAdminToken(request,env){
  const expected=String(env?.ADMIN_TOKEN||'');
  const supplied=String(suppliedToken(request)||'');
  if(!expected||!supplied)return false;
  const [a,b]=await Promise.all([sha256(expected),sha256(supplied)]);
  return equalBytes(a,b);
}

export async function isAdminRequest(request,env){
  if(isCloudflareAccessAdmin(request,env))return true;
  return hasLegacyAdminToken(request,env);
}

export async function requireAdmin(request,env){
  return await isAdminRequest(request,env)
    ? null
    : json({ok:false,error:'unauthorized'},401);
}

export function isAdminPath(pathname){
  return pathname==='/admin'||
    pathname.startsWith('/admin/')||
    pathname.startsWith('/api/admin/')||
    pathname==='/ops'||
    pathname.startsWith('/ops/');
}
