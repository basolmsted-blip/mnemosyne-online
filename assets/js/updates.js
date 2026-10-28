import {writeNote} from '/assets/js/exhibition-notes.js?v=20261026b';
const icon=(name)=>{const i=document.createElement('img');i.className='control-icon';i.src='/assets/exhibition/controls/'+name+'.png';i.alt='';i.setAttribute('aria-hidden','true');return i;};
function decorate(){
 document.querySelectorAll('.exhibition-sound').forEach(b=>{if(!b.querySelector('img'))b.prepend(icon('sound'));});
}
decorate();new MutationObserver(decorate).observe(document.body,{subtree:true,childList:true});
document.querySelectorAll('.room-button,[data-exit],.exhibition__exit').forEach(b=>{
 if(b.matches('[data-exit],.exhibition__exit')||b.textContent.includes('Exit Exhibition'))b.prepend(icon('exit'));
 else if(b.textContent.includes('←')){b.innerHTML=b.innerHTML.replace('←','');b.prepend(icon('arrow-left'));}
});
const canoe=document.querySelector('.maritime-object'), note=document.querySelector('.maritime-note');
if(canoe&&note){
 let pinned=false;
 const show=()=>{if(!note.hidden)return;note.replaceChildren();let count=writeNote(note,['The Great Canoe','Carved from one western red cedar','Haíɫzaqv & Haida artists · Northwest Coast','American Museum of Natural History']);note.hidden=false;canoe.setAttribute('aria-describedby','canoe-note');note.id='canoe-note';document.dispatchEvent(new CustomEvent('exhibition-writing',{detail:count*.014+.13}));};
 const hide=()=>{note.hidden=true;canoe.removeAttribute('aria-describedby');document.dispatchEvent(new CustomEvent('exhibition-writing-stop'));};
 canoe.addEventListener('pointerenter',show);canoe.addEventListener('pointerleave',()=>{if(!pinned)hide();});canoe.addEventListener('focus',show);canoe.addEventListener('blur',()=>{if(!pinned)hide();});canoe.addEventListener('click',()=>{pinned=true;show();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){pinned=false;hide();}});
}
const figures=[...document.querySelectorAll('.article-shell figure:not([data-museum-figure])')];
if(figures.length){
 const modal=document.createElement('dialog');modal.className='figure-viewer';modal.setAttribute('aria-label','Enlarged article figure');modal.innerHTML='<div class="figure-viewer__tools"><span>Figure viewer</span><a download>Download image ↓</a><button type="button">Close ×</button></div><img class="figure-viewer__image" alt=""><figcaption></figcaption><div class="figure-viewer__credit"></div>';document.body.append(modal);
 modal.querySelector('button').onclick=()=>modal.close();modal.addEventListener('click',e=>{if(e.target===modal)modal.close();});
 figures.forEach(f=>{const imgs=[...f.querySelectorAll('img')];const caption=f.querySelector('figcaption')?.textContent||'';const sourceCredit=f.querySelector('.figure-credit')?.textContent||'';const original=f.classList.contains('banana-figure--original');
 if(original){const credit=document.createElement('small');credit.className='figure-credit';credit.textContent='Figure created by Sebastian Olmsted · Free to download and reuse without restrictions.';f.prepend(credit);}
 imgs.forEach((im,i)=>{if(im.closest('a,button'))return;const b=document.createElement('button');b.type='button';b.className='figure-enlarge';b.setAttribute('aria-label','Enlarge '+(im.alt||'figure')+(imgs.length>1?' · panel '+(i+1):''));im.before(b);b.append(im);b.onclick=()=>{const enlarged=modal.querySelector('img');enlarged.src=im.currentSrc||im.src;enlarged.alt=im.alt;modal.querySelector('a').href=im.currentSrc||im.src;modal.querySelector('figcaption').textContent=caption;modal.querySelector('.figure-viewer__credit').textContent=original?('Figure created by Sebastian Olmsted · No restrictions on reuse. '+sourceCredit):(sourceCredit||'Image credit and reuse terms: see the figure caption.');modal.showModal();};});
 });
}
