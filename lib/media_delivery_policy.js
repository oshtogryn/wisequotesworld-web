// Cross-platform delivery policy for social video assets.
// A file existing in R2 is not sufficient for social readiness.
// Normalized assets are produced by the media-normalize workflow using ffmpeg.
const VIDEO_MIME='video/mp4';
const NORMALIZED_ASSET_TYPES=new Set(['video_normalized','video_normalized_mp4','social_video_normalized']);
const MAX_SOCIAL_VIDEO_BYTES=95*1024*1024;

function s(v){return String(v||'').trim()}
function lower(v){return s(v).toLowerCase()}
function ext(name){const m=lower(name).match(/\.([a-z0-9]+)$/);return m?m[1]:''}

export function mediaKind(row){
  const type=lower(row?.asset_type),mime=lower(row?.mime_type);
  if(type.includes('video')||mime.startsWith('video/'))return 'video';
  if(type.includes('pinterest')||type.includes('image')||mime.startsWith('image/'))return 'pinterest';
  return 'other';
}

export function isNormalizedVideo(row){
  if(mediaKind(row)!=='video')return false;
  const type=lower(row?.asset_type),mime=lower(row?.mime_type),filename=lower(row?.original_filename);
  return NORMALIZED_ASSET_TYPES.has(type)&&mime===VIDEO_MIME&&ext(filename)==='mp4'&&Number(row?.size_bytes||0)>0&&Number(row?.size_bytes||0)<=MAX_SOCIAL_VIDEO_BYTES;
}

export function videoDeliveryCheck(row){
  const issues=[];
  if(!row)return{ready:false,issues:['missing_video']};
  if(mediaKind(row)!=='video')issues.push('not_video');
  if(lower(row.mime_type)!==VIDEO_MIME)issues.push('video_mime_not_mp4');
  if(ext(row.original_filename)!=='mp4')issues.push('video_extension_not_mp4');
  if(!NORMALIZED_ASSET_TYPES.has(lower(row.asset_type)))issues.push('video_not_normalized');
  const bytes=Number(row.size_bytes||0);
  if(!bytes)issues.push('video_size_unknown');
  else if(bytes>MAX_SOCIAL_VIDEO_BYTES)issues.push('video_too_large');
  return{ready:issues.length===0,issues,policy:{container:'mp4',video_codec:'h264',audio_codec:'aac',pixel_format:'yuv420p',faststart:true,max_bytes:MAX_SOCIAL_VIDEO_BYTES}};
}

export function imageDeliveryCheck(row){
  const issues=[];
  if(!row)return{ready:false,issues:['missing_image']};
  if(mediaKind(row)!=='pinterest')issues.push('not_image');
  const mime=lower(row.mime_type);
  if(!['image/png','image/jpeg','image/webp'].includes(mime))issues.push('unsupported_image_mime');
  const bytes=Number(row.size_bytes||0);
  if(!bytes)issues.push('image_size_unknown');
  else if(bytes>20*1024*1024)issues.push('image_too_large');
  return{ready:issues.length===0,issues};
}

export const SOCIAL_VIDEO_POLICY=Object.freeze({
  container:'mp4',
  videoCodec:'h264',
  audioCodec:'aac',
  pixelFormat:'yuv420p',
  faststart:true,
  maxBytes:MAX_SOCIAL_VIDEO_BYTES,
  normalizedAssetTypes:[...NORMALIZED_ASSET_TYPES]
});
