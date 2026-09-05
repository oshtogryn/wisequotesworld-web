(()=>{
  function seqFromText(el){
    const m=(el.textContent||'').match(/WQ\s*0*(\d+)/i);
    return m?Number(m[1]):Number.MAX_SAFE_INTEGER;
  }
  function sortChildren(id,selector){
    const box=document.getElementById(id);
    if(!box)return;
    const rows=[...box.querySelectorAll(selector)];
    rows.sort((a,b)=>seqFromText(a)-seqFromText(b));
    rows.forEach(r=>box.appendChild(r));
  }
  function apply(){
    sortChildren('contentList',':scope > .rowbtn');
    sortChildren('approvalList',':scope > .approvalrow');
  }
  function watch(id){
    const box=document.getElementById(id);
    if(!box)return;
    let queued=false;
    new MutationObserver(()=>{
      if(queued)return;
      queued=true;
      requestAnimationFrame(()=>{queued=false;apply()});
    }).observe(box,{childList:true});
  }
  document.addEventListener('DOMContentLoaded',()=>{
    apply();
    watch('contentList');
    watch('approvalList');
    document.querySelectorAll('[data-tab="content"],[data-tab="approval"]').forEach(b=>b.addEventListener('click',()=>setTimeout(apply,0)));
  });
})();
