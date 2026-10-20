import {desktopEligible, preference, exhibitionAudio as settings} from './exhibition-config.js?v=2';
const nested=window.parent!==window;
const track=new URL('../exhibition/awestruck.m4a',import.meta.url).href;
let context, gain, buffer, source, loading, wanted=false, token=0, scratch, scratchGain;
let button, status;
export function stopWriting(){
  if(nested){parent.document.dispatchEvent(new CustomEvent('exhibition-writing-stop'));return;}
  if(scratch){try{scratch.stop();}catch{} scratch=null;}
}
export function playWriting(seconds){
  if(nested){parent.document.dispatchEvent(new CustomEvent('exhibition-writing',{detail:seconds}));return;}
  stopWriting();
  if(!wanted || context?.state!=='running') return;
  // Original synthesized pencil friction: band-limited noise with irregular short strokes.
  const length=Math.ceil(context.sampleRate*seconds), noise=context.createBuffer(1,length,context.sampleRate);
  const samples=noise.getChannelData(0);
  for(let i=0;i<length;i++){
    const t=i/context.sampleRate, stroke=Math.max(0,Math.sin(t*48)+.3*Math.sin(t*91));
    samples[i]=(Math.random()*2-1)*stroke*.025*Math.min(1,t*30,(seconds-t)*20);
  }
  scratch=context.createBufferSource();scratch.buffer=noise;
  const filter=context.createBiquadFilter();filter.type='bandpass';filter.frequency.value=2200;filter.Q.value=.7;
  scratchGain=context.createGain();scratchGain.gain.value=.45;
  scratch.connect(filter).connect(scratchGain).connect(context.destination);scratch.start();
}
function prepareSoundtrack(){
  // Decode quietly before the visitor clicks; playback still needs their gesture.
  const OfflineEngine=window.OfflineAudioContext||window.webkitOfflineAudioContext;
  const decoder=new OfflineEngine(2,1,48000);
  const decode=url=>fetch(url).then(r=>{if(!r.ok)throw new Error('Audio unavailable');return r.arrayBuffer();}).then(data=>decoder.decodeAudioData(data));
  return decode(track).catch(()=>decode(new URL('../exhibition/awestruck.wav',import.meta.url).href)).then(decoded=>{
    buffer=decoded;if(button)button.dataset.audioReady='true';return decoded;
  }).catch(()=>{loading=null;return null;});
}
function display(){
  button.textContent=wanted?'Sound On':'Sound Off';button.setAttribute('aria-pressed',String(wanted));
}
async function enable(){
  wanted=true;const attempt=++token;display();preference.set('sound','on');
  try{
    if(!context){context=new (window.AudioContext||window.webkitAudioContext)();gain=context.createGain();gain.gain.value=0;gain.connect(context.destination);}
    await context.resume();
    if(context.state!=='running') throw new Error('Gesture required');
    if(!buffer){status.textContent='Preparing soundtrack…';loading ||= prepareSoundtrack();buffer=await loading;if(!buffer)throw new Error('Audio unavailable');}
    if(!wanted||attempt!==token)return;
    if(!source){source=context.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(gain);source.start();}
    gain.gain.cancelScheduledValues(context.currentTime);gain.gain.setTargetAtTime(settings.volume,context.currentTime,.25);status.textContent='';
  }catch{if(attempt!==token)return;wanted=false;display();button.textContent='Sound On · resume';status.textContent='Select sound to resume playback.';}
}
function disable(){wanted=false;++token;stopWriting();preference.set('sound','off');display();status.textContent='';if(gain){gain.gain.cancelScheduledValues(context.currentTime);gain.gain.setTargetAtTime(0,context.currentTime,.12);}}
if(!nested && desktopEligible() && document.querySelector('.exhibition')){
  button=document.createElement('button');button.type='button';button.className='exhibition-sound';button.dataset.sound='';
  status=document.createElement('span');status.className='exhibition-audio-status';status.setAttribute('role','status');
  document.body.append(button,status);display();document.body.classList.add('exhibition-landing');
  loading=prepareSoundtrack();
  button.addEventListener('click',()=>wanted?disable():enable());
  document.addEventListener('exhibition-writing',e=>playWriting(e.detail));
  document.addEventListener('exhibition-writing-stop',stopWriting);
  if(preference.get('sound')==='on')button.textContent='Sound On · resume';
  // Standard destinations leave Exhibition Mode. No player or audio survives the visit.
  const stop=()=>{disable();if(source){try{source.stop();}catch{}source=null;}context?.suspend();};
  document.querySelector('.exhibition').addEventListener('click',event=>{
    const link=event.target.closest('a[href]');
    if(!link||event.defaultPrevented||link.target==='_blank'||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const url=new URL(link.href);
    if(url.origin===location.origin){
      try{sessionStorage.setItem('mnemosyne-standard-visit','yes');sessionStorage.removeItem('mnemosyne-exhibition-session');}catch{}
      preference.set('mode','standard');stop();
    }
  });
  window.addEventListener('pagehide',stop);
  window.addEventListener('pageshow',e=>{if(e.persisted){wanted=false;display();}});
}
