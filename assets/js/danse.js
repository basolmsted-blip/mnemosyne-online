import {writeNote} from './exhibition-notes.js?v=20261026b';
import {installImageExamination} from './image-examination.js';
installImageExamination();
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const cover=document.querySelector('.danse-cover'),note=cover?.querySelector('.danse-label');
if(cover){const show=()=>{if(!note.childElementCount){writeNote(note,['Dance of Death · Michael Wolgemut','Nuremberg, 1493 · Woodcut and letterpress','The Metropolitan Museum of Art · 2018.839.160']);const details=document.createElement('button');details.type='button';details.className='kerma-label-details';details.textContent='Object details';details.onclick=()=>document.querySelector('.danse-object-details').showModal();note.append(details);if(document.querySelector('.danse-exhibition')&&!reduced.matches)document.dispatchEvent(new CustomEvent('exhibition-writing',{detail:2.2}));}};cover.addEventListener('pointerenter',show);cover.addEventListener('focusin',show);cover.addEventListener('pointerleave',()=>{if(!cover.contains(document.activeElement))note.replaceChildren();});document.querySelector('[data-danse-details-close]').onclick=()=>document.querySelector('.danse-object-details').close();}
const film=document.querySelector('video'),toggle=document.querySelector('[data-film-toggle]');
if(film){let loaded=false;const loadFilm=()=>{if(loaded)return;loaded=true;const source=film.querySelector('source');source.src=source.dataset.src;film.load();};new IntersectionObserver(entries=>{if(entries[0].isIntersecting)loadFilm();},{rootMargin:'300px'}).observe(film);let manualPause=false;film.muted=true;film.addEventListener('volumechange',()=>{if(!film.muted)film.muted=true;});const sync=()=>toggle.textContent=film.paused?'Play silent film':'Pause silent film';film.addEventListener('play',sync);film.addEventListener('pause',sync);toggle.onclick=()=>{if(film.paused){loadFilm();manualPause=false;film.play().catch(()=>{});}else{manualPause=true;film.pause();}};new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&!reduced.matches&&!manualPause){loadFilm();film.play().catch(()=>{});}else film.pause();},{threshold:.35}).observe(film);}
for(const figure of document.querySelectorAll('.danse-panorama')){
 const view=figure.querySelector('.panorama-viewport');
 figure.querySelector('[data-panorama-open]').onclick=()=>{figure.classList.add('is-exploring');view.focus({preventScroll:true});};
 figure.querySelector('[data-pan-left]').onclick=()=>view.scrollBy({left:-view.clientWidth*.7,behavior:reduced.matches?'instant':'smooth'});
 figure.querySelector('[data-pan-right]').onclick=()=>view.scrollBy({left:view.clientWidth*.7,behavior:reduced.matches?'instant':'smooth'});
 figure.querySelector('[data-pan-reset]').onclick=()=>{figure.classList.remove('is-exploring');view.scrollLeft=0;};
 let drag;view.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||!figure.classList.contains('is-exploring'))return;drag={x:e.clientX,left:view.scrollLeft};view.setPointerCapture(e.pointerId);});view.addEventListener('pointermove',e=>{if(drag)view.scrollLeft=drag.left+drag.x-e.clientX;});view.addEventListener('pointerup',()=>drag=null);view.addEventListener('pointercancel',()=>drag=null);
}
const fresco=document.querySelector('[data-fresco]');
if(fresco){const data=JSON.parse(document.getElementById('fresco-data').textContent);for(const b of fresco.querySelectorAll('[data-fresco-select]'))b.onclick=()=>{const f=data[b.dataset.frescoSelect];for(const other of fresco.querySelectorAll('[data-fresco-select]'))other.setAttribute('aria-pressed',String(other===b));const img=fresco.querySelector('img');img.removeAttribute('srcset');img.src='/assets/articles/danse-macabre/'+f.display;img.dataset.original='/assets/articles/danse-macabre/'+f.image;img.alt=f.title+' Dance of Death fresco';fresco.querySelector('[data-caption]').textContent=f.caption;fresco.querySelector('[data-credit]').textContent=f.credit;const a=fresco.querySelector('[data-source]');if(a){a.href=f.source;a.hidden=!f.source;}fresco.querySelector('.panorama-viewport').scrollLeft=0;};}
// Document-relative, reversible figure zoom; the stage releases at its end.
if(document.querySelector('.danse-exhibition')&&!reduced.matches&&innerWidth>800){
 for(const id of ['1','6']){
  const figure=document.getElementById('figure-'+id),view=figure.querySelector('.panorama-viewport');figure.classList.add('scroll-figure');view.classList.add('scroll-stage');
  const image=figure.querySelector('img');image.style.transformOrigin=id==='1'?'left bottom':'center center';
  let queued=false;const render=()=>{queued=false;const top=figure.getBoundingClientRect().top+scrollY,progress=Math.max(0,Math.min(1,(scrollY-top)/(view.parentElement.querySelector('.scroll-spacer')?.offsetHeight||innerHeight*1.8)));const steps=[1,1.025,1.055,1.09,1.12],part=Math.min(3,Math.floor(progress*4)),fraction=progress*4-part;image.style.transform=`scale(${steps[part]+(steps[part+1]-steps[part])*fraction})`;};
  const spacer=document.createElement('div');spacer.className='scroll-spacer';const track=document.createElement('div');track.className='scroll-track';view.before(track);track.append(view,spacer);
  const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(render);}};addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);image.addEventListener('load',schedule);document.fonts.ready.then(schedule);render();
 }
}
const frescoControls=document.querySelector('[data-fresco] .panorama-controls');
if(frescoControls){const update=()=>{const beram=document.querySelector('[data-fresco-select="beram"]').getAttribute('aria-pressed')==='true';frescoControls.hidden=beram;if(beram)frescoControls.closest('figure').classList.remove('is-exploring');};document.querySelectorAll('[data-fresco-select]').forEach(b=>b.addEventListener('click',update));update();}
