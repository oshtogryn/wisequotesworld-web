(()=>{
const CLOSED=new Set(['published','scheduled']);
function active(items){return (items||[]).filter(x=>!CLOSED.has(String(x.status||'').toLowerCase()))}
function replaceWithSelect(id){const old=document.getElementById(id);if(!old)return null;if(old.tagName==='SELECT')return old;const s=document.createElement('select');s.id=id;s.className=old.className||'';old.replaceWith(s);return s}
function syncTopicSelectors(){
  const items=active(typeof ITEMS!=='undefined'?ITEMS:[]);
  const html=items.length?items.map(x=>`<option value="${x.id}">${x.id} — ${String(x.canonical_title||'').replace(/[&<>"']/g,'')}</option>`).join(''):'<option value="">Немає активних тем</option>';
  for(const id of ['matrixCid','mCid']){const s=replaceWithSelect(id);if(s){const prev=s.value;s.innerHTML=html;if(prev&&items.some(x=>x.id===prev))s.value=prev}}
  const schedule=document.getElementById('scheduleTopic');if(schedule){const prev=schedule.value;schedule.innerHTML=html;if(prev&&items.some(x=>x.id===prev))schedule.value=prev}
}
function renderActiveLists(){
  if(typeof ITEMS==='undefined')return;
  ITEMS=active(ITEMS);
  const cl=document.getElementById('contentList');
  if(cl&&typeof esc==='function')cl.innerHTML=ITEMS.map(x=>`<button class="rowbtn" onclick="openItem('${x.id}')"><b>${x.id}</b><span>${esc(x.canonical_title||'')}</span><span class="pill">${esc(x.quote_type||'')}</span><span>${x.approved_at?'✓ approved':esc(x.status||'')}</span></button>`).join('')||'<p>Немає активних тем.</p>';
  const al=document.getElementById('approvalList');
  if(al&&typeof esc==='function')al.innerHTML=ITEMS.map(x=>`<div class="approvalrow"><div><b>${x.id}</b><div>${esc(x.canonical_title||'')}</div><small>${esc(x.quote_type||'')} · ${esc(x.attribution_status||'')}</small></div><div class="actions"><button class="secondary" onclick="openItem('${x.id}')">Review</button><button onclick="approve('${x.id}','approved')">Approve</button><button class="danger" onclick="approve('${x.id}','rejected')">Reject</button></div></div>`).join('')||'<p>Немає активних тем.</p>';
  if(typeof renderTopics==='function')renderTopics();
  syncTopicSelectors();
}
function install(){
  try{
    const original=loadContent;
    loadContent=async function(){await original();renderActiveLists()};
  }catch{}
  const p=document.querySelector('#media .card p');if(p)p.textContent='8 мов: video + Pinterest. Вибери активну тему зі списку. Завантаження прямо з iPhone → private R2 + D1.';
  syncTopicSelectors();
  setTimeout(renderActiveLists,500);
}
window.addEventListener('load',()=>setTimeout(install,150));
})();