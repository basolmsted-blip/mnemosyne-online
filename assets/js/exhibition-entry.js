import { desktopEligible, preference } from './exhibition-config.js?v=2';
const entry = document.querySelector('[data-exhibition-entry]');
if (entry) {
  const corresponding = () => {
    const p=location.pathname;
    if(p.startsWith('/topics/'))return '/exhibition/explore/'+p.slice(8);
    if(p.startsWith('/articles/') && document.querySelector('[data-mode-switch]'))return '/exhibition'+p;
    if(p.startsWith('/objects-in-focus/when-death-comes-calling/'))return '/exhibition'+p;
    return '/exhibition/';
  };
  const update = () => {
    entry.href=corresponding()+location.hash;
    entry.hidden = !desktopEligible();
    entry.textContent = preference.get('mode') === 'exhibition' ? 'Return to Exhibition' : 'Exhibition Mode';
  };
  update();
  matchMedia('(hover: hover) and (pointer: fine)').addEventListener('change', update);
  entry.addEventListener('click', () => {preference.set('mode', 'exhibition');try{sessionStorage.removeItem('mnemosyne-standard-visit');}catch{}});
  window.addEventListener('pageshow', update);
}

// The head redirects before homepage content can paint. The intro now lives on
// the exhibition document itself, so its fade reveals only the exhibition wall.
if(document.body.classList.contains('home-page') && desktopEligible() && !location.hash){
  let standard=false;try{standard=sessionStorage.getItem('mnemosyne-standard-visit')==='yes';}catch{}
  if(!standard){const destination=new URL(entry.href);destination.searchParams.set('intro','20261020');location.replace(destination.href);}
}
