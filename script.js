const m=document.querySelector('.menu'),n=document.querySelector('.navlinks');if(m&&n)m.addEventListener('click',()=>n.classList.toggle('open'));const lb=document.querySelector('.lang button'),lm=document.querySelector('.langmenu');if(lb&&lm){lb.addEventListener('click',e=>{e.stopPropagation();lm.classList.toggle('show')});document.addEventListener('click',()=>lm.classList.remove('show'));}

// Metricool: one tracker per language brand. UA and RU are currently embedded directly in their language pages.
const metricoolHashes={
  pl:'c381513400756762969fc09f5b4fc98c',
  en:'8f23b8c0f14e3cfa6ff1eddf5ec69c02',
  sv:'f597d9425c80f6c53ffafa65f05dff2d',
  de:'8c66131b02cd287e4a0fc92b3ad5381c',
  es:'452cf36ec8ec1a188325f08c5eab21ff'
};
const lang=(location.pathname.split('/')[1]||'').toLowerCase();
const hash=metricoolHashes[lang];
if(hash){
  const s=document.createElement('script');
  s.type='text/javascript';
  s.src='https://tracker.metricool.com/resources/be.js';
  s.onload=()=>{if(window.beTracker)beTracker.t({hash});};
  document.head.appendChild(s);
}
