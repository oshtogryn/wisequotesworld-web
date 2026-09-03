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
  if(data&&typeof data==='object'&&!Array.isArray(data)){
    summary.locales={};
    for(const [lang,v] of Object.entries(data)){
      summary.locales[lang]={
        keys:v&&typeof v==='object'?Object.keys(v):[],
        lengths:v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,typeof x==='string'?x.length:Array.isArray(x)?x.length:null])):{}
      };
    }
  }
  return summary;
}
