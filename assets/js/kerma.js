import {installImageExamination} from './image-examination.js';
import {writeNote} from './exhibition-notes.js?v=20261026b';
const nested=window.parent!==window;
const storage={get:k=>{try{return sessionStorage.getItem(k);}catch{return null;}},set:(k,v)=>{try{sessionStorage.setItem(k,v);}catch{}}};
const label=document.querySelector('.kerma-label');
const handwritten=document.querySelector('.kerma-handwritten');
const artifact=document.querySelector('.kerma-artifact-button');
let labelHideTimer;
const openLabel=()=>{clearTimeout(labelHideTimer);if(!handwritten||!handwritten.hidden)return;handwritten.replaceChildren();const count=writeNote(handwritten,['Eye of Horus (wedjat) pectoral','Nubian, Sudan · 743–712 BCE · Faience','Museum of Fine Arts, Boston · 24.679']);const detail=document.createElement('button');detail.type='button';detail.className='kerma-label-details';detail.textContent='Object details';detail.addEventListener('click',()=>label.showModal());handwritten.append(detail);handwritten.hidden=false;artifact.setAttribute('aria-expanded','true');artifact.setAttribute('aria-describedby','kerma-handwritten-label');if(document.querySelector('.kerma-exhibition')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.dispatchEvent(new CustomEvent('exhibition-writing',{detail:count*.014+.13}));};
const closeHandwritten=()=>{clearTimeout(labelHideTimer);if(handwritten)handwritten.hidden=true;artifact?.setAttribute('aria-expanded','false');artifact?.removeAttribute('aria-describedby');document.dispatchEvent(new CustomEvent('exhibition-writing-stop'));};
const scheduleLabelHide=()=>{clearTimeout(labelHideTimer);labelHideTimer=setTimeout(()=>{if(!artifact.matches(':hover,:focus-within')&&!handwritten.matches(':hover,:focus-within'))closeHandwritten();},140);};
artifact?.addEventListener('pointerenter',openLabel);artifact?.addEventListener('pointerleave',scheduleLabelHide);artifact?.addEventListener('focus',openLabel);artifact?.addEventListener('blur',scheduleLabelHide);
artifact?.addEventListener('click',openLabel);handwritten?.addEventListener('pointerenter',()=>clearTimeout(labelHideTimer));handwritten?.addEventListener('pointerleave',scheduleLabelHide);handwritten?.addEventListener('focusout',scheduleLabelHide);
document.addEventListener('click',e=>{if(!e.target.closest('.kerma-artifact-button,.kerma-handwritten,.kerma-label'))closeHandwritten();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeHandwritten();});
document.querySelector('[data-label-close]')?.addEventListener('click',()=>label.close());
label?.addEventListener('click',e=>{if(e.target===label){const r=label.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)label.close();}});
// Remember the actual entry route, without replacing it on presentation changes.
const route=location.pathname,ref=document.referrer;
try{const u=new URL(ref);if(u.origin===location.origin&&!u.pathname.includes('who-made-kermas-blue'))storage.set('kerma-return',u.pathname+u.search+u.hash);}catch{}
document.querySelector('[data-article-back]')?.addEventListener('click',e=>{
 e.preventDefault();e.stopPropagation();const fallback=e.currentTarget.href;const saved=storage.get('kerma-return');const u=new URL(saved||fallback,location.href);if(u.origin!==location.origin)return;
 if(nested)parent.document.dispatchEvent(new CustomEvent(u.pathname.startsWith('/exhibition/')?'exhibition-navigate':'exhibition-exit',{detail:u.href}));else location.assign(u.href);
});
const entry=document.querySelector('[data-exhibition-entry]');if(entry){entry.href='/exhibition/articles/who-made-kermas-blue/';entry.setAttribute('data-mode-switch','');}
document.querySelectorAll('[data-mode-switch]').forEach(link=>link.addEventListener('click',()=>{
 const target=document.querySelector('.museum-figure')?.getBoundingClientRect();
 storage.set('kerma-position',JSON.stringify({ratio:scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight),investigation:target&&target.top<innerHeight&&target.bottom>0}));
}));
const position=storage.get('kerma-position');if(position){storage.set('kerma-position','');requestAnimationFrame(()=>requestAnimationFrame(()=>{try{const p=JSON.parse(position);p.investigation?document.querySelector('.museum-figure')?.scrollIntoView():scrollTo(0,p.ratio*(document.documentElement.scrollHeight-innerHeight));}catch{}}));}
for(const stage of document.querySelectorAll('.museum-figure--sides')){
 const front=stage.querySelector('.museum-turn__front'),back=stage.querySelector('.museum-turn__back'),sideLabel=stage.querySelector('.museum-turn__side');
 const show=side=>{const isBack=side==='b';front.hidden=isBack;back.hidden=!isBack;front.setAttribute('aria-hidden',String(isBack));back.setAttribute('aria-hidden',String(!isBack));stage.dataset.side=side;sideLabel.textContent=isBack?'Side B':'Side A';stage.querySelectorAll('[data-side-select]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sideSelect===side)));};
 stage.querySelectorAll('[data-side-select]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.sideSelect)));show('a');
}

// Figure credits and high-resolution examination use the same metadata in both modes.
for(const figure of document.querySelectorAll('[data-museum-figure]')){
 const credit=figure.querySelector('.museum-credit');
 figure.querySelector('[data-image-credit]')?.addEventListener('click',()=>credit.showModal());
 figure.querySelector('[data-credit-close]')?.addEventListener('click',()=>credit.close());
 credit?.addEventListener('click',e=>{if(e.target===credit){const r=credit.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)credit.close();}});
}
installImageExamination();
// Native scroll timelines are preferred. The fallback only updates visible stages.
const exhibition=document.querySelector('.museum-article');
if(exhibition){
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),small=matchMedia('(max-width:760px)');
 const stages=[...document.querySelectorAll('.museum-figure[data-effect="magnify"],.museum-figure[data-effect="landscape"]')];
 const native=CSS.supports('animation-timeline: view()');if(native)exhibition.classList.add('native-museum-scroll');
 {const active=new Set();let frame=0;const update=()=>{frame=0;if(motion.matches||small.matches)return;for(const stage of active){const track=stage.querySelector('.museum-figure__track'),rect=track.getBoundingClientRect();const distance=Math.max(1,rect.height-(innerHeight-80));let p=Math.max(0,Math.min(1,(65-rect.top)/distance));p=Math.max(0,Math.min(1,(p-.1)/.7));if(native)continue;if(stage.dataset.effect==='magnify')stage.style.setProperty('--figure-scale',String(1+.3*p));else stage.style.setProperty('--landscape-width',(80+20*p)+'vw');}};const request=()=>{if(!frame&&active.size)frame=requestAnimationFrame(update);};const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting)active.add(e.target);else active.delete(e.target);}request();},{rootMargin:'200px'});stages.forEach(s=>observer.observe(s));addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});motion.addEventListener('change',request);small.addEventListener('change',request);}
}
// Warm both small display images before the two-sided figure enters view.
const twoSidedFigure=document.querySelector('#figure-three');
if(twoSidedFigure){const preloadSides=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){twoSidedFigure.querySelectorAll('img').forEach(image=>{image.loading='eager';});preloadSides.disconnect();}},{rootMargin:'1000px'});preloadSides.observe(twoSidedFigure);}
