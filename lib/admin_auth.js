// Centralized backend admin authentication for Wise Quotes World.
// Cloudflare Access is the primary perimeter control. ADMIN_TOKEN remains a
// mandatory second backend layer for sensitive admin/ops APIs.

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

function suppliedToken(request){
  const bearer=request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]||'';
  return bearer||request.headers.get('x-admin-token')||'';
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

export async function isAdminRequest(request,env){
  const expected=String(env?.ADMIN_TOKEN||'');
  const supplied=String(suppliedToken(request)||'');
  if(!expected||!supplied)return false;
  const [a,b]=await Promise.all([sha256(expected),sha256(supplied)]);
  return equalBytes(a,b);
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
