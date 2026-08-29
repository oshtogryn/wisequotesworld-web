const $=id=>document.getElementById(id);
const LANGS=['uk','ru','pl','en','sv','de','es','fr'];
let TOKEN=localStorage.getItem('wq_admin_token')||'';
let ITEMS=[];

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function api(path,opt={}){opt.headers={...(opt.headers||{}),Authorization:'Bearer '+TOKEN};const r=await fetch(path,opt);let j;try{j=await r.json()}catch{j={ok:false,error:'non-json response'}}if(!r.ok)throw new Error(j.error||('HTTP '+r.status));return j}
function tab(name){document.querySelectorAll('[data-tab],.section').forEach(x=>x.classList.remove('on'));document.querySelector(`[data-tab="${name}"]`)?.classList.add('on');$(name)?.classList.add('on');if(name==='content'||name==='approval')loadContent();if(name==='media')loadMedia();}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>tab(b.dataset.tab)));

async function connect(){TOKEN=$('token').value.trim();localStorage.setItem('wq_admin_token',TOKEN);try{const [h,s]=await Promise.all([fetch('/api/health').then(r=>r.json()),api('/api/admin/schema')]);$('health').textContent='● online';$('health').className='online';$('sys').className='status ok';$('sys').textContent=`D1 ${h.db?'✓':'✗'} · R2 ${h.r2?'✓':'✗'} · Admin ${h.admin_secret?'✓':'✗'} · schema ${s.schema?.ready?'ready':'check'}`;$('kDb').textContent=s.schema?.ready?'READY':'CHECK';await Promise.all([loadContent(),loadMedia()]);}catch(e){$('health').textContent='● error';$('health').className='offline';$('sys').className='status bad';$('sys').textContent=e.message}}

async function loadContent(){try{const j=await api('/api/admin/content');ITEMS=j.items||[];$('kContent').textContent=ITEMS.length;$('contentList').innerHTML=ITEMS.map(x=>`<button class="rowbtn" onclick="openItem('${x.id}')"><b>${x.id}</b><span>${esc(x.canonical_title||'')}</span><span class="pill">${esc(x.quote_type||'')}</span><span>${x.approved_at?'✓ approved':esc(x.status||'')}</span></button>`).join('')||'<p>Немає контенту.</p>';$('approvalList').innerHTML=ITEMS.map(x=>`<div class="approvalrow"><div><b>${x.id}</b><div>${esc(x.canonical_title||'')}</div><small>${esc(x.quote_type||'')} · ${esc(x.attribution_status||'')}</small></div><div class="actions"><button class="secondary" onclick="openItem('${x.id}')">Review</button><button onclick="approve('${x.id}','approved')">Approve</button><button class="danger" onclick="approve('${x.id}','rejected')">Reject</button></div></div>`).join('');$('kApproved').textContent=ITEMS.filter(x=>x.approved_at||x.status==='approved').length;}catch(e){$('contentList').innerHTML='<p>'+esc(e.message)+'</p>'}}

async function openItem(id){try{const j=await api('/api/admin/content/'+id),x=j.item,latest={};(x.versions||[]).forEach(v=>{if(!latest[v.language_code]||Number(v.version)>Number(latest[v.language_code].version))latest[v.language_code]=v});$('detail').innerHTML=`<div class="detailhead"><div><h2>${id}</h2><p class="quotelead">${esc(x.original_quote||x.canonical_title||'')}</p><p class="muted">${esc(x.quote_type)} · ${x.author_name?esc(x.author_name):'NO AUTHOR'} · ${esc(x.attribution_status||'')} · category: ${esc(x.category_slug||x.category||'—')}</p></div><div class="actions"><button onclick="approve('${id}','approved')">Approve</button><button class="danger" onclick="approve('${id}','rejected')">Reject</button></div></div><div class="langgrid">${LANGS.map(l=>{const v=latest[l];return `<article class="lang"><header><b>${l.toUpperCase()}</b><span class="pill ${v?'good':'warn'}">${v?'ready':'missing'}</span></header><p class="localized">${esc(v?.adapted_text||'MISSING')}</p><details open><summary>Gemini production prompt</summary><pre>${esc(v?.ai_prompt||'MISSING')}</pre></details><details><summary>Voiceover / on-screen</summary><p>${esc(v?.voiceover_text||'')}</p><p>${esc(v?.on_screen_text||'')}</p></details><div class="links"><a target="_blank" href="/${l}/">Site</a>${(x.quote_pages||[]).find(p=>p.language_code===l)?.canonical_path?`<a target="_blank" href="${esc((x.quote_pages||[]).find(p=>p.language_code===l).canonical_path)}">Quote page</a>`:''}</div></article>`}).join('')}</div>`;tab('content');}catch(e){$('detail').innerHTML='<p>'+esc(e.message)+'</p>'}}

async function approve(id,status){try{const j=await api(`/api/admin/content/${id}/approval`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({status})});alert(`${id}: ${status}`);await loadContent();if(j.item)openItem(id)}catch(e){alert(e.message)}}

async function loadMedia(){try{const j=await api('/api/admin/media'),a=j.items||[];$('kMedia').textContent=a.length;$('mediaList').innerHTML=a.slice(0,100).map(m=>`<div class="mediarow"><b>${esc(m.content_item_id||'—')}</b><span>${esc(m.language_code||'—')}</span><span>${esc(m.asset_type||m.media_type||'media')}</span><span>${esc(m.original_filename||m.r2_key||'')}</span><span class="pill">${esc(m.qa_status||m.status||'')}</span></div>`).join('')||'<p>Немає медіа.</p>'}catch(e){$('mediaList').innerHTML='<p>'+esc(e.message)+'</p>'}}

async function uploadMedia(){const files=[...$('mFile').files];if(!files.length){setUpload('Вибери файл.','bad');return}for(const f of files){const fd=new FormData();fd.append('file',f);fd.append('content_item_id',$('mCid').value.trim());fd.append('language_code',$('mLang').value);fd.append('asset_type',$('mKind').value);setUpload(`Завантаження ${f.name}…`,'');try{await api('/api/admin/media',{method:'POST',body:fd})}catch(e){setUpload(`${f.name}: ${e.message}`,'bad');return}}setUpload(`Готово: ${files.length} файл(ів) у R2 + D1.`,'ok');$('mFile').value='';await loadMedia()}
function setUpload(t,c){$('uploadStatus').className='status '+c;$('uploadStatus').textContent=t}

async function schema(){try{$('raw').textContent=JSON.stringify(await api('/api/admin/schema'),null,2)}catch(e){$('raw').textContent=e.message}}

$('token').value=TOKEN;
$('connectBtn').onclick=connect;
$('uploadBtn').onclick=uploadMedia;
$('schemaBtn').onclick=schema;
$('refreshContent').onclick=loadContent;
$('refreshMedia').onclick=loadMedia;
if(TOKEN)connect();
window.openItem=openItem;window.approve=approve;
