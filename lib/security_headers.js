const CSP=[
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://tracker.metricool.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "media-src 'self' blob: https:",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://tracker.metricool.com",
  "frame-src 'self' https:"
].join('; ');

export function withSecurityHeaders(response){
  if(!response)return response;
  const headers=new Headers(response.headers);
  headers.set('strict-transport-security','max-age=31536000; includeSubDomains');
  headers.set('x-content-type-options','nosniff');
  headers.set('referrer-policy','strict-origin-when-cross-origin');
  headers.set('permissions-policy','camera=(), microphone=(), geolocation=()');
  headers.set('x-frame-options','DENY');
  headers.set('cross-origin-opener-policy','same-origin');
  const type=String(headers.get('content-type')||'').toLowerCase();
  if(type.includes('text/html'))headers.set('content-security-policy',CSP);
  return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
