import { desktopEligible, preference } from './exhibition-config.js?v=2';
const entry = document.querySelector('[data-exhibition-entry]');
if (entry) {
  const update = () => {
    entry.hidden = !desktopEligible();
    entry.textContent = preference.get('mode') === 'exhibition' ? 'Return to Exhibition' : 'Exhibition Mode';
  };
  update();
  matchMedia('(hover: hover) and (pointer: fine)').addEventListener('change', update);
  entry.addEventListener('click', () => {preference.set('mode', 'exhibition');try{sessionStorage.removeItem('mnemosyne-standard-visit');}catch{}});
  window.addEventListener('pageshow', update);
}

// A fresh desktop homepage visit plays its intro, then opens the exhibition.
// Explicit standard-page navigation stays standard for the rest of this tab's visit.
if(document.body.classList.contains('home-page') && desktopEligible() && !location.hash){
  let standard=false;try{standard=sessionStorage.getItem('mnemosyne-standard-visit')==='yes';}catch{}
  if(!standard){
    const intro=document.querySelector('[data-mn-intro]');
    const enter=()=>location.replace(entry.href);
    if(!intro||intro.hidden)enter();
    else{
      const observer=new MutationObserver(()=>{if(intro.hidden){observer.disconnect();enter();}});
      observer.observe(intro,{attributes:true,attributeFilter:['hidden']});
    }
  }
}
