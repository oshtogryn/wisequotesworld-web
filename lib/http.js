// Shared HTTP response helpers for Wise Quotes World.
// New and refactored modules should use these instead of re-declaring json().

export function noStoreHeaders(extra={}){
  return {
    'cache-control':'no-store',
    'x-content-type-options':'nosniff',
    ...extra
  };
}

export function json(data,status=200,extraHeaders={}){
  return new Response(JSON.stringify(data),{
    status,
    headers:noStoreHeaders({
      'content-type':'application/json; charset=utf-8',
      ...extraHeaders
    })
  });
}

export function text(body,status=200,extraHeaders={}){
  return new Response(String(body??''),{
    status,
    headers:noStoreHeaders({
      'content-type':'text/plain; charset=utf-8',
      ...extraHeaders
    })
  });
}

export function methodNotAllowed(allowed=[]){
  return json({ok:false,error:'method_not_allowed'},405,allowed.length?{allow:allowed.join(', ')}:{});
}

export function notFound(){
  return json({ok:false,error:'not_found'},404);
}

export function serviceUnavailable(error='service_unavailable'){
  return json({ok:false,error},503);
}

export function clampInteger(value,min,max,fallback=min){
  const n=Number.parseInt(String(value??''),10);
  if(!Number.isFinite(n))return fallback;
  return Math.max(min,Math.min(max,n));
}

export function cleanIdentifier(value,maxLength=80){
  return String(value??'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,maxLength);
}

export function cleanFilename(value,maxLength=180){
  return String(value||'upload.bin').replace(/[^A-Za-z0-9._-]/g,'_').slice(0,maxLength)||'upload.bin';
}
