// UI guard matching the canonical backend rule: `scheduled` and `published`
// are evidence-backed states and cannot be set manually from the topic card.
(function(){
  if(typeof statusSelect==='function'){
    statusSelect=function(x){
      const editable=['media_pending','media_ready','approved','skipped'];
      const current=String(x?.status||'');
      const locked=current==='scheduled'||current==='published';
      const options=(locked?[current]:editable).map(s=>`<option value="${s}" ${current===s?'selected':''}>${STATUS_LABEL[s]||s}</option>`).join('');
      return `<div class="statusbar"><select id="status_${x.id}" ${locked?'disabled':''}>${options}</select>${locked?`<span class="muted">${current==='scheduled'?'Planner readback':'Publication readback'} ✓</span>`:`<button class="secondary" onclick="changeStatus('${x.id}')">Змінити статус</button>`}</div>`;
    };
  }

  if(typeof setTopicStatus==='function'){
    const originalSetTopicStatus=setTopicStatus;
    setTopicStatus=async function(id,status){
      if(status==='scheduled'||status==='published'){
        flash(status==='scheduled'?'Scheduled ставиться тільки після Metricool Planner readback.':'Published ставиться тільки після фактичної публікації/readback.');
        return;
      }
      return originalSetTopicStatus(id,status);
    };
  }

  if(typeof renderTopics==='function'){
    const originalRenderTopics=renderTopics;
    renderTopics=function(){
      originalRenderTopics();
      document.querySelectorAll('.topiccard button.success').forEach(btn=>{
        if((btn.getAttribute('onclick')||'').includes("'published'"))btn.remove();
      });
    };
  }
})();
