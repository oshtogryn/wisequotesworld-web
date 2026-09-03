import packed from './wq014_data.js';

function base64Bytes(s){
  const bin=atob(s),out=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);
  return out;
}

export async function readWQ014Package(){
  const bytes=base64Bytes(packed);
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const text=await new Response(stream).text();
  return JSON.parse(text);
}

export async function readWQ014PackageSummary(){
  const data=await readWQ014Package();
  const summary={type:Array.isArray(data)?'array':typeof data,keys:data&&typeof data==='object'?Object.keys(data):[]};
  if(data?.locales)summary.locales=Object.keys(data.locales);
  if(data?.languages)summary.languages=Object.keys(data.languages);
  if(data?.data)summary.dataKeys=Object.keys(data.data);
  return summary;
}
