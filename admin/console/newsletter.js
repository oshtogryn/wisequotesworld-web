async function loadNewsletter(){
  const box=$('newsletterStatus');if(!box)return;
  try{
    box.className='status';box.textContent='Завантажую…';
    const j=await api('/api/admin/newsletter');const s=j.settings||{},n=j.subscribers||{};
    $('nlEnabled').checked=Number(s.enabled)===1;$('nlCadence').value=s.cadence_days||14;$('nlDailyCap').value=s.daily_cap||300;$('nlHour').value=s.run_hour_utc??8;$('nlExecCap').value=s.execution_cap||40;
    $('nlActive').textContent=n.active??0;$('nlTotal').textContent=n.total_real??0;$('nlInactive').textContent=n.inactive??0;$('nlLastRun').textContent=s.last_run_at?new Date(s.last_run_at).toLocaleString():'ще не було';
    const langs=Object.entries(n.by_language||{}).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k.toUpperCase()}: ${v}`).join(' · ');$('nlLangs').textContent=langs||'—';
    $('nlRecent').innerHTML=(n.recent||[]).map(x=>`<div class="nlrow"><b>${esc(x.email_masked)}</b><span>${esc((x.language||'').toUpperCase())}</span><small>${esc(x.updated_at||'')}</small></div>`).join('')||'<p class="muted">Реальних активних підписників поки немає.</p>';
    $('nlDeliveries').innerHTML=(j.deliveries||[]).map(x=>`<div class="nlrow"><b>${esc(x.cycle_key||'—')}</b><span>${esc(x.status||'—')} · ${esc(x.count||0)}</span><small>${esc(x.last_sent_at||'')}</small></div>`).join('')||'<p class="muted">Історії відправок ще немає.</p>';
    box.className='status ok';box.textContent=Number(s.enabled)===1?'Автоматична розсилка увімкнена.':'Автоматична розсилка вимкнена.';
  }catch(e){box.className='status bad';box.textContent=e.message}
}
async function saveNewsletter(){
  const btn=$('nlSave');setBusy(btn,true,'Зберігаю…');
  try{await api('/api/admin/newsletter/settings',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({enabled:$('nlEnabled').checked,cadence_days:Number($('nlCadence').value),daily_cap:Number($('nlDailyCap').value),run_hour_utc:Number($('nlHour').value),execution_cap:Number($('nlExecCap').value)})});flash('Налаштування розсилки збережено');await loadNewsletter();markDone(btn)}catch(e){alert(e.message)}finally{setBusy(btn,false)}
}
async function sendNewsletterNow(){
  const ok=await modalConfirm('Запустити розсилку зараз?','Буде відправлено чергову порцію листів реальним активним підписникам, які ще не отримували поточний 14-денний дайджест.');if(!ok)return;
  const btn=$('nlSendNow');setBusy(btn,true,'Відправляю…');
  try{const r=await api('/api/admin/newsletter/send-now',{method:'POST'});$('newsletterStatus').className='status '+(r.failed?'bad':'ok');$('newsletterStatus').textContent=`Вибрано: ${r.selected||0} · Відправлено: ${r.sent||0} · Помилок: ${r.failed||0}`;await loadNewsletter()}catch(e){$('newsletterStatus').className='status bad';$('newsletterStatus').textContent=e.message}finally{setBusy(btn,false)}
}
document.addEventListener('DOMContentLoaded',()=>{
  const b=document.querySelector('[data-tab="newsletter"]');if(b)b.addEventListener('click',()=>loadNewsletter());
  $('nlRefresh')?.addEventListener('click',loadNewsletter);$('nlSave')?.addEventListener('click',saveNewsletter);$('nlSendNow')?.addEventListener('click',sendNewsletterNow);
});
