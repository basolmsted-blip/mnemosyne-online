// Fixed eye artwork with independently tracked iris/pupil cutouts from the supplied PNG.
export const eyeSettings=Object.freeze({maxX:32,maxY:11,response:125});
export function installEyes(wall){
 const mask=wall.querySelector('.mask-watch');if(!mask)return;
 const pupils=[...mask.querySelectorAll('[data-pupil]')].map(element=>({element,cx:Number(element.dataset.cx),cy:Number(element.dataset.cy),x:0,y:0,tx:0,ty:0}));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0,last=0,blinkInterval=0,blinkEnd=0;
 function stopBlink(){clearInterval(blinkInterval);clearTimeout(blinkEnd);blinkInterval=blinkEnd=0;delete mask.dataset.blink;}
 function startBlink(){stopBlink();if(reduced.matches||document.hidden)return;blinkInterval=setInterval(()=>{mask.dataset.blink='true';blinkEnd=setTimeout(()=>{delete mask.dataset.blink;blinkEnd=0;},500);},10000);}
 startBlink();
 window.addEventListener('pagehide',stopBlink);
 window.addEventListener('pageshow',startBlink);
 function draw(now){
  frame=0;const dt=last?Math.min(now-last,50):16;last=now;
  const blend=1-Math.exp(-dt/eyeSettings.response);let moving=false;
  pupils.forEach(p=>{p.x+=(p.tx-p.x)*blend;p.y+=(p.ty-p.y)*blend;p.element.setAttribute('transform',`translate(${p.x.toFixed(3)} ${p.y.toFixed(3)})`);moving ||= Math.abs(p.x-p.tx)+Math.abs(p.y-p.ty)>.01;});
  if(moving)frame=requestAnimationFrame(draw);else last=0;
 }
 wall.addEventListener('exhibition-light',e=>{
  if(reduced.matches||!e.detail.active)return;
  const matrix=mask.getScreenCTM();if(!matrix)return;
  const point=mask.createSVGPoint();point.x=e.detail.x;point.y=e.detail.y;
  const local=point.matrixTransform(matrix.inverse());
  pupils.forEach(p=>{p.tx=Math.tanh((local.x-p.cx)/320)*eyeSettings.maxX;p.ty=Math.tanh((local.y-p.cy)/400)*eyeSettings.maxY;});
  if(!frame)frame=requestAnimationFrame(draw);
 });
 reduced.addEventListener('change',()=>{startBlink();if(reduced.matches){cancelAnimationFrame(frame);frame=0;pupils.forEach(p=>{p.x=p.y=p.tx=p.ty=0;p.element.removeAttribute('transform');});}});
 document.addEventListener('visibilitychange',()=>{startBlink();if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}});
}
