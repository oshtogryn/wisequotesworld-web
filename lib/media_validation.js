// Deterministic technical media validation for Wise Quotes World.
// Browser/runtime metadata may be incomplete; unknown values remain null and
// produce warnings rather than invented measurements.

const PROFILES={
  video:{
    acceptedMimePrefixes:['video/'],
    targetAspect:9/16,
    aspectTolerance:0.035,
    maxBytes:100*1024*1024,
    maxDurationSeconds:180,
    minWidth:540,
    minHeight:960
  },
  pinterest_image:{
    acceptedMimePrefixes:['image/'],
    targetAspect:2/3,
    aspectTolerance:0.025,
    maxBytes:20*1024*1024,
    minWidth:600,
    minHeight:900
  }
};

export function canonicalMediaProfile(kind){
  const k=String(kind||'').toLowerCase();
  return k==='video'?'video':'pinterest_image';
}

export function validateMediaMetadata(meta={}){
  const profileKey=canonicalMediaProfile(meta.kind||meta.asset_type);
  const p=PROFILES[profileKey],checks=[];
  const mime=String(meta.mime_type||'').toLowerCase();
  const size=Number.isFinite(Number(meta.size_bytes))?Number(meta.size_bytes):null;
  const width=Number.isFinite(Number(meta.width))&&Number(meta.width)>0?Number(meta.width):null;
  const height=Number.isFinite(Number(meta.height))&&Number(meta.height)>0?Number(meta.height):null;
  const duration=Number.isFinite(Number(meta.duration_seconds))&&Number(meta.duration_seconds)>=0?Number(meta.duration_seconds):null;
  const aspect=width&&height?width/height:null;

  checks.push({key:'mime_type',status:p.acceptedMimePrefixes.some(x=>mime.startsWith(x))?'pass':'fail',actual:mime||null});
  checks.push({key:'file_size',status:size===null?'warning':size<=p.maxBytes?'pass':'fail',actual:size,max:p.maxBytes});

  if(aspect===null){checks.push({key:'aspect_ratio',status:'warning',actual:null,target:p.targetAspect});}
  else checks.push({key:'aspect_ratio',status:Math.abs(aspect-p.targetAspect)<=p.aspectTolerance?'pass':'fail',actual:aspect,target:p.targetAspect});

  if(width===null||height===null)checks.push({key:'resolution',status:'warning',width,height});
  else checks.push({key:'resolution',status:width>=p.minWidth&&height>=p.minHeight?'pass':'fail',width,height,min_width:p.minWidth,min_height:p.minHeight});

  if(profileKey==='video'){
    checks.push({key:'duration',status:duration===null?'warning':duration<=p.maxDurationSeconds?'pass':'fail',actual:duration,max:p.maxDurationSeconds});
  }

  const failed=checks.filter(x=>x.status==='fail');
  const warnings=checks.filter(x=>x.status==='warning');
  return {
    profile:profileKey,
    status:failed.length?'failed':warnings.length?'warning':'passed',
    width,height,duration_seconds:duration,file_size_bytes:size,aspect_ratio:aspect,
    checks
  };
}

export function sha256Hex(bytes){
  return crypto.subtle.digest('SHA-256',bytes).then(buf=>Array.from(new Uint8Array(buf),b=>b.toString(16).padStart(2,'0')).join(''));
}
