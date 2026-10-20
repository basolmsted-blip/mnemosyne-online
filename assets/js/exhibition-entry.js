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

// The head redirects before homepage content can paint. The intro now lives on
// the exhibition document itself, so its fade reveals only the exhibition wall.
if(document.body.classList.contains('home-page') && desktopEligible() && !location.hash){
  let standard=false;try{standard=sessionStorage.getItem('mnemosyne-standard-visit')==='yes';}catch{}
  if(!standard)location.replace(entry.href);
}
