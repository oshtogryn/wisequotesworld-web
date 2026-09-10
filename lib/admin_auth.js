// Centralized backend admin authentication for Wise Quotes World.
// Cloudflare Access is the primary authentication layer for browser admin access.
// Legacy ADMIN_TOKEN remains accepted only as a backend fallback for non-browser automation.

import {verifyCloudflareAccessJwt} from './cloudflare_access_jwt.js';
import {json} from './http.js';

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

function verifierConfigured(env){
  return Boolean(String(env?.CF_ACCESS_TEAM_DOMAIN||'').trim()&&String(env?.CF_ACCESS_AUD||'').trim());
}

function isPagesPreview(request){
  try{return new URL(request.url).hostname.endsWith('.pages.dev')}catch{return true}
}

async function isCloudflareAccessAdmin(request,env){
  const assertion=accessAssertion(request);
  if(!assertion)return false;

  // Preferred and required path once Access verifier settings exist: verify
  // RS256 signature, issuer, AUD, exp and nbf before trusting identity claims.
  if(verifierConfigured(env)){
    const verified=await verifyCloudflareAccessJwt(assertion,env);
    if(!verified.ok)return false;
    const email=String(verified.payload?.email||verified.payload?.sub||'').trim().toLowerCase();
    const headerEmail=accessEmail(request);
    // When Access also supplied an identity header, require it to agree with
    // the signed token rather than silently accepting conflicting identity.
    if(headerEmail&&headerEmail!==email)return false;
    return !!email&&allowedEmails(env).includes(email);
  }

  // Compatibility path for the existing protected production hostname while
  // CF_ACCESS_TEAM_DOMAIN/AUD are being configured. Never decode or trust an
  // unsigned JWT payload. Never allow this fallback on pages.dev previews,
  // because a public preview can otherwise bypass the intended Access edge.
  if(isPagesPreview(request))return false;
  const email=accessEmail(request);
  return !!email&&allowedEmails(env).includes(email);
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
  if(await isCloudflareAccessAdmin(request,env))return true;
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
