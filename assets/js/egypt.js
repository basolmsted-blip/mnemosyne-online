import {writeNote} from './exhibition-notes.js?v=20261026b';
const note=document.querySelector('.nubia-note');
const labelSpace=note.parentElement,wall=document.querySelector('.egypt-room');wall.append(note);
function positionNote(){const box=labelSpace.getBoundingClientRect(),base=wall.getBoundingClientRect();note.style.left=(box.left-base.left)+'px';note.style.top=(box.top-base.top)+'px';note.style.width=box.width+'px';note.style.height=box.height+'px';}
positionNote();addEventListener('resize',positionNote);document.fonts.ready.then(positionNote);
const labels={amun:['Head of the god Amun','ca. 1328–1318 BCE · Granodiorite','The Metropolitan Museum of Art · 07.228.34'],amenhotep:['Head of Amenhotep III Wearing the Blue Crown','c. 1391–1353 BCE · Granodiorite','Cleveland Museum of Art · 1952.513']};
let selected=null,pinned=false;
function show(object){positionNote();if(selected===object&&!note.hidden)return;selected=object;note.replaceChildren();const count=writeNote(note,labels[object.dataset.label]);note.hidden=false;note.id='egypt-object-label';document.querySelectorAll('.egypt-object').forEach(o=>o.setAttribute('aria-expanded',String(o===object)));object.setAttribute('aria-describedby',note.id);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.dispatchEvent(new CustomEvent('exhibition-writing',{detail:count*.014+.13}));}
function hide(){note.hidden=true;selected=null;pinned=false;document.querySelectorAll('.egypt-object').forEach(o=>{o.setAttribute('aria-expanded','false');o.removeAttribute('aria-describedby');});document.dispatchEvent(new CustomEvent('exhibition-writing-stop'));}
for(const object of document.querySelectorAll('.egypt-object')){object.addEventListener('pointerenter',()=>{pinned=false;show(object);});object.addEventListener('pointerleave',()=>{if(!pinned)hide();});object.addEventListener('focus',()=>show(object));object.addEventListener('blur',()=>{if(!pinned)hide();});object.addEventListener('click',()=>{show(object);pinned=true;});}
document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
document.addEventListener('click',e=>{if(!e.target.closest('.egypt-object'))hide();});
