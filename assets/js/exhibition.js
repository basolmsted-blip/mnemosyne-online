import { playWriting, stopWriting } from './exhibition-player.js?v=20261026b';
import { installNotes } from './exhibition-notes.js?v=20261026b';
import { exhibitionLighting as lighting, desktopEligible, preference } from './exhibition-config.js?v=2';
const wall = document.querySelector('.exhibition');
const home = document.body.dataset.home;
if (!desktopEligible()) {
  // Never replace the standard mobile/tablet website with the flashlight interface.
  location.replace(home);
} else if (wall) {
  preference.set('mode', 'exhibition');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const artifacts = [...wall.querySelectorAll('.artifact, .room-object')];
  const sources = wall.querySelector('dialog');
  const credits = wall.querySelector('[data-credits]');
  if (!wall.hasAttribute('data-explore')) installNotes(wall, playWriting, stopWriting);
  let bounds, geometry = [], frame = 0, last = 0, strength = 0;
  let current = { x:-1000, y:-1000 }, target = { ...current }, active = false;
  let focused = null, firstPointer = null;
  let isReduced = reduced.matches || !lighting.enabled;
  wall.style.setProperty('--beam', `${lighting.beamRadius}px`);
  wall.style.setProperty('--hotspot', `${100*lighting.hotspotRadius/lighting.beamRadius}%`);
  // Approximate incandescent black-body color, mixed only faintly over true image colors.
  const kelvin=lighting.colorTemperature/100;
  const green=Math.max(0,Math.min(255,99.4708*Math.log(kelvin)-161.1196));
  const blue=Math.max(0,Math.min(255,138.5177*Math.log(Math.max(1,kelvin-10))-305.0448));
  wall.style.setProperty('--warmth-rgb', `255,${green.toFixed(0)},${blue.toFixed(0)}`);
  wall.style.setProperty('--ambient', String(1-(wall.hasAttribute('data-explore')?.40:lighting.ambientVisibility)));
  // A single scene overlay reveals the wall, lettering, images and shadows together.
  // CSS radial gradients avoid mask/filter compositing differences across browsers.
  wall.classList.add('is-ready');
  const measure = () => {
    bounds = wall.getBoundingClientRect();
    const title = wall.querySelector('h1').getBoundingClientRect();
    wall.style.setProperty('--title-left', `${title.left-bounds.left}px`);
    wall.style.setProperty('--title-top', `${title.top-bounds.top}px`);
    geometry = artifacts.map(link => {
      const box = link.getBoundingClientRect();
      return { link, x:box.left-bounds.left+box.width/2, y:box.top-bounds.top+box.height/2,
        angle:parseFloat(getComputedStyle(link).getPropertyValue('--object-tilt'))||0, depth:Number(link.dataset.depth), max:Number(link.dataset.displacement) };
    });
    if (focused) aimAt(focused);
  };
  const requestFrame = () => { if (!frame && !isReduced && !document.hidden) frame=requestAnimationFrame(render); };
  function aimAt(link) {
    const g = geometry.find(item => item.link === link);
    if (!g) { const b=link.getBoundingClientRect(); target={x:b.left-bounds.left+b.width/2,y:b.top-bounds.top+b.height/2};current={...target};active=true;requestFrame();return; }
    target={x:g.x,y:g.y}; current={...target}; active=true;
    wall.classList.add('has-explored'); requestFrame();
  }
  function render(now) {
    frame=0;
    const elapsed=last ? Math.min(now-last,50) : 16.7; last=now;
    const blend=1-Math.exp(-elapsed/lighting.pointerSmoothing);
    current.x+=(target.x-current.x)*blend; current.y+=(target.y-current.y)*blend;
    strength+=((active ? 1:0)-strength)*(1-Math.exp(-elapsed/110));
    wall.style.setProperty('--light-x', `${current.x.toFixed(2)}px`);
    wall.style.setProperty('--light-y', `${current.y.toFixed(2)}px`);
    wall.style.setProperty('--light-strength',strength.toFixed(4));
    wall.dispatchEvent(new CustomEvent('exhibition-light',{detail:{x:current.x+bounds.left,y:current.y+bounds.top,active}}));
    for (const g of geometry) {
      const factor=g.depth/(lighting.lightDepth-g.depth);
      let dx=(g.x-current.x)*factor, dy=(g.y-current.y)*factor;
      const distance=Math.hypot(dx,dy), clamp=distance>g.max ? g.max/distance:1;
      if (!lighting.shadowsEnabled) { dx=0; dy=0; }
      const angle=g.angle*Math.PI/180;
      const localX=dx*Math.cos(angle)+dy*Math.sin(angle);
      const localY=-dx*Math.sin(angle)+dy*Math.cos(angle);
      g.link.style.setProperty('--shadow-x',`${(localX*clamp).toFixed(2)}px`);
      g.link.style.setProperty('--shadow-y',`${(localY*clamp).toFixed(2)}px`);
    }
    if (Math.abs(target.x-current.x)+Math.abs(target.y-current.y)>.1 || Math.abs((active?1:0)-strength)>.001) requestFrame();
    else last=0;
  }
  artifacts.forEach(link => {
    link.style.setProperty('--shadow-softness',`${Number(link.dataset.softness)*lighting.shadowSoftness}px`);
    const shadow=link.querySelector('.artifact__shadow, .saber-shadow');if(shadow)shadow.style.opacity=lighting.shadowIntensity;
  });
  wall.addEventListener('pointermove',event => {
    if (event.pointerType==='touch' || sources?.open || isReduced) return;
    if (!firstPointer) firstPointer={x:event.clientX,y:event.clientY};
    if (Math.hypot(event.clientX-firstPointer.x,event.clientY-firstPointer.y)>8) wall.classList.add('has-explored');
    focused=null; target={x:event.clientX-bounds.left,y:event.clientY-bounds.top};
    if (!active && strength<.01) current={...target};
    active=true; requestFrame();
  },{passive:true});
  wall.addEventListener('pointerleave',() => { if (!focused) { active=false; requestFrame(); } });
  wall.addEventListener('focusin',event => {
    const link=event.target.closest('.artifact, .room-object, .topic-link, .explore-panel a, .explore-mask, .explore-tabs button, .explore-panel button');
    if (link) { focused=link; aimAt(link); }
    else { focused=null; active=false; requestFrame(); }
  });
  const updateMotion = () => {
    isReduced=reduced.matches || !lighting.enabled;
    wall.classList.toggle('is-reduced',isReduced);
    if (isReduced) { cancelAnimationFrame(frame); frame=0; }
    else { strength=0; active=false; wall.style.setProperty('--light-strength','0'); requestFrame(); }
  };
  updateMotion(); reduced.addEventListener('change',updateMotion);
  measure();
  const observer=new ResizeObserver(measure); observer.observe(wall);
  window.addEventListener('resize',measure,{passive:true});
  window.addEventListener('scroll',measure,{passive:true});
  window.visualViewport?.addEventListener('resize',measure,{passive:true});
  document.fonts.ready.then(measure);
  credits?.addEventListener('click',() => { active=false; requestFrame(); sources.showModal(); });
  wall.querySelector('[data-close]')?.addEventListener('click',() => sources.close());
  sources?.addEventListener('close',() => credits.focus());
  sources?.addEventListener('click',event => { if (event.target===sources) {
    const b=sources.getBoundingClientRect();
    if(event.clientX<b.left || event.clientX>b.right || event.clientY<b.top || event.clientY>b.bottom) sources.close();
  }});

  wall.addEventListener('click',event => {
    if(event.target.closest('[data-exit]')) preference.set('mode','standard');
  });
  const eligibility=matchMedia('(hover: hover) and (pointer: fine)');
  eligibility.addEventListener('change',()=>{ if(!desktopEligible()) { location.replace(home); } });
  document.addEventListener('visibilitychange',()=> {
    if(document.hidden) {cancelAnimationFrame(frame);frame=0;last=0;} else requestFrame();
  });
  window.addEventListener('pageshow',event=>{ if(event.persisted) { measure(); } });
}
