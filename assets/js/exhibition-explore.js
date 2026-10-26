import {writeNote} from './exhibition-notes.js?v=20261026b';
// Route note sounds through the same shared player as the navigation room.
const playWriting=seconds=>document.dispatchEvent(new CustomEvent('exhibition-writing',{detail:seconds}));
const stopWriting=()=>document.dispatchEvent(new CustomEvent('exhibition-writing-stop'));
const wall=document.querySelector('[data-explore]');
if(wall){

 const tabs=[...wall.querySelectorAll('[data-mode]')];
 function select(tab){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active;});wall.querySelector('.explore-content')?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();select(tabs[n]);tabs[n].focus();}});});
 wall.querySelectorAll('[data-return-topics]').forEach(button=>button.addEventListener('click',()=>{select(tabs[0]);tabs[0].focus();}));
}


const objects=[...document.querySelectorAll('.room-object:not(.maritime-object)')];
objects.forEach((object,i)=>{
 const note=document.createElement('aside');note.className='exhibition-note room-object-note';note.id='room-object-note-'+i;note.hidden=true;note.setAttribute('role','note');wall.append(note);
 function position(){const width=Math.min(265,innerWidth*(innerWidth<900?.30:.28));note.style.width=width+'px';const b=object.getBoundingClientRect();const x=innerWidth*(innerWidth<900?.40:.43);note.style.left=Math.max(16,Math.min(innerWidth-width-16,x))+'px';note.style.top=Math.max(100,Math.min(innerHeight-note.offsetHeight-30,b.top+b.height*.46))+'px';}
 function show(){if(!note.hidden)return;note.replaceChildren();const count=writeNote(note,[object.dataset.title,object.dataset.date,object.dataset.origin]);note.hidden=false;object.dataset.noteVisible='true';object.setAttribute('aria-describedby',note.id);position();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)playWriting(count*.014+.13);}
 function hide(){if(note.hidden)return;note.hidden=true;delete object.dataset.noteVisible;object.removeAttribute('aria-describedby');stopWriting();}
 // Inset the trigger by 12% on every side in the artwork's own coordinates.
 // Using the SVG transform keeps the tilted mask and scaled saber calibrated.
 const surface=object.querySelector('.mask-watch, .saber-art');
 if(!surface){object.addEventListener('pointerenter',show);object.addEventListener('pointerleave',hide);}
 function updateHover(event){
  if(event.pointerType==='touch')return;
  const matrix=surface?.getScreenCTM();if(!matrix)return;
  const point=surface.createSVGPoint();point.x=event.clientX;point.y=event.clientY;
  const local=point.matrixTransform(matrix.inverse()),box=surface.viewBox.baseVal;
  const x=(local.x-box.x)/box.width,y=(local.y-box.y)/box.height;
  const inside=x>.12&&x<.88&&y>.12&&y<.88;
  if(inside)show();else if(!object.matches(':focus-visible'))hide();
 }
 wall.addEventListener('pointermove',updateHover,{passive:true});
 wall.addEventListener('pointerleave',()=>{if(!object.matches(':focus-visible'))hide();});
 object.addEventListener('focus',()=>{if(object.matches(':focus-visible'))show();});
 object.addEventListener('blur',hide);
 window.addEventListener('resize',position);window.addEventListener('scroll',()=>{hide();},{passive:true});document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
});
const saber=wall?.querySelector('.saber-art');
wall?.addEventListener('exhibition-light',e=>{
 if(!saber)return;const b=saber.getBoundingClientRect();
 // The saber is rotated 180 degrees; convert the beam back into image coordinates.
 const point=saber.createSVGPoint();point.x=e.detail.x;point.y=e.detail.y;const local=point.matrixTransform(saber.getScreenCTM().inverse());const x=local.x,y=local.y;
 const gradient=saber.querySelector('#saber-glint');gradient.setAttribute('cx',x);gradient.setAttribute('cy',y);
 saber.querySelector('.saber-shine').style.opacity=e.detail.active?'1':'0';
});
