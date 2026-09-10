(()=>{
  const q=id=>document.getElementById(id);
  const ids={start:'bulkSiteStartTopic',count:'bulkSiteCount',interval:'bulkSiteInterval',date:'bulkSiteStartDate',time:'bulkSiteTime',preview:'bulkSitePreview',button:'bulkSiteScheduleBtn',status:'bulkSiteStatus'};
  let rows=[];
  function n(id){return Number(String(id||'').replace(/\D/g,''))||0}
  function ymd(d){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
  function localDate(date,time){return new Date(`${date}T${time||'09:00'}:00`)}
  function addDays(date,days){const d=new Date(date);d.setDate(d.getDate()+days);return d}
  function candidates(){return rows.filter(x=>n(x.id)>15&&!['published','skipped'].includes(x.status)).sort((a,b)=>n(a.id)-n(b.id))}
  function selectedPlan(){
    const all=candidates(),start=q(ids.start)?.value,count=Math.max(1,Math.min(20,Number(q(ids.count)?.value)||10)),step=Math.max(1,Math.min(30,Number(q(ids.interval)?.value)||1));
    const idx=all.findIndex(x=>x.id===start);if(idx<0)return[];
    const chosen=all.slice(idx,idx+count),base=localDate(q(ids.date)?.value,q(ids.time)?.value);
    if(!Number.isFinite(base.getTime()))return[];
    return chosen.map((x,i)=>({row:x,date:addDays(base,i*step)}));
  }
  function renderPreview(){
    const box=q(ids.preview),plan=selectedPlan();if(!box)return;
    if(!plan.length){box.className='status warn';box.textContent='Вибери першу тему, дату та час.';return}
    const missing=plan.filter(x=>Number(x.row.published_pages||0)<13);
    const first=plan[0],last=plan[plan.length-1];
    box.className='status '+(missing.length?'warn':'ok');
    box.innerHTML=`<b>${plan.length} тем:</b> ${first.row.id} — ${first.date.toLocaleString('uk-UA')} → ${last.row.id} — ${last.date.toLocaleString('uk-UA')}<br>${plan.map(x=>`${x.row.id}: ${x.date.toLocaleDateString('uk-UA')} ${String(x.date.getHours()).padStart(2,'0')}:${String(x.date.getMinutes()).padStart(2,'0')} · статті ${Number(x.row.published_pages||0)}/13`).join('<br>')}${missing.length?`<br><b>Не готові:</b> ${missing.map(x=>x.row.id).join(', ')}`:''}`;
  }
  async function fetchJson(url,opt={}){opt.credentials='same-origin';const r=await fetch(url,opt);let j={};try{j=await r.json()}catch{}if(!r.ok){const e=new Error(j.error||`HTTP ${r.status}`);e.data=j;throw e}return j}
  async function load(){
    const start=q(ids.start);if(!start)return;
    try{const j=await fetchJson('/api/admin/topics');rows=j.items||[];const all=candidates();start.innerHTML=all.map(x=>`<option value="${x.id}">${x.id} — ${(x.canonical_title||'').replace(/[<>&"]/g,'')}</option>`).join('');
      const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);if(!q(ids.date).value)q(ids.date).value=ymd(tomorrow);if(!q(ids.time).value)q(ids.time).value='09:00';
      for(const id of [ids.start,ids.count,ids.interval,ids.date,ids.time])q(id)?.addEventListener('change',renderPreview);q(ids.count)?.addEventListener('input',renderPreview);q(ids.interval)?.addEventListener('input',renderPreview);renderPreview();
    }catch(e){q(ids.status).className='status bad';q(ids.status).textContent=e.message}
  }
  async function schedule(){
    const plan=selectedPlan(),box=q(ids.status),btn=q(ids.button);if(!plan.length)return;
    const requested=Number(q(ids.count)?.value)||10;if(plan.length<requested){box.className='status bad';box.textContent=`Доступно лише ${plan.length} послідовних тем із запитаних ${requested}.`;return}
    const timezone=Intl.DateTimeFormat().resolvedOptions().timeZone||'Europe/Stockholm';
    const summary=`${plan.length} тем: ${plan[0].row.id} → ${plan[plan.length-1].row.id}, починаючи ${plan[0].date.toLocaleString('uk-UA')}. Соцмережі ця дія НЕ планує.`;
    if(!window.confirm(`Запланувати сайт?\n\n${summary}`))return;
    btn.disabled=true;const old=btn.textContent;btn.textContent='Перевіряю весь пакет…';box.className='status';box.textContent='Виконується server-side readiness preflight…';
    try{
      const payload={timezone,items:plan.map(x=>({id:x.row.id,scheduled_for:x.date.toISOString()}))};
      const j=await fetchJson('/api/admin/site-visibility/bulk-schedule',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
      box.className='status ok';box.innerHTML=`Заплановано ${j.count}/${plan.length}.<br>${(j.scheduled||[]).map(x=>`${x.id}: ${new Date(x.scheduled_for).toLocaleString('uk-UA')}`).join('<br>')}`;btn.textContent='Заплановано ✓';setTimeout(()=>btn.textContent=old,1800);
    }catch(e){
      const blockers=e.data?.blockers||[];box.className='status bad';box.innerHTML=`${e.message}${blockers.length?'<br>'+blockers.map(x=>`${x.id}: ${x.error}`).join('<br>'):''}`;btn.textContent=old;
    }finally{btn.disabled=false}
  }
  document.addEventListener('DOMContentLoaded',()=>{load();q(ids.button)?.addEventListener('click',schedule)});
})();
