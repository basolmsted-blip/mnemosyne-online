import {desktopEligible, preference, exhibitionAudio as settings} from './exhibition-config.js?v=2';
const nested=window.parent!==window;
const kindFor=url=>new URL(url,location.href).pathname.includes('/egyptology/')?'egypt':new URL(url,location.href).pathname.match(/nubiology|who-made-kermas-blue/)?'nubia':new URL(url,location.href).pathname.includes('/maritime-archaeology/')?'maritime':'gallery';
const tracks={egypt:new URL('../exhibition/egypt/ambience.mp3',import.meta.url).href,nubia:new URL('../exhibition/nubia/ambience.mp3',import.meta.url).href,gallery:new URL('../exhibition/awestruck.m4a',import.meta.url).href,maritime:new URL('../exhibition/maritime/ambience.m4a',import.meta.url).href};
const cache=new Map();
let context,master,voice,wanted=false,playing=false,request=0,button,status,scratch,waveTimer,waveSource,waveGain;
let kind=kindFor(location.href),roomFrame,internalNavigation=false;
const voices=new Set();
function decode(kind){
 if(!cache.has(kind)){
  const Decoder=window.OfflineAudioContext||window.webkitOfflineAudioContext;
  const decoder=new Decoder(2,1,48000);
  const read=url=>fetch(url).then(r=>{if(!r.ok)throw new Error('Sound unavailable');return r.arrayBuffer();}).then(bytes=>decoder.decodeAudioData(bytes));
  let result=read(tracks[kind]);
  if(kind==='gallery')result=result.catch(()=>read(new URL('../exhibition/awestruck.wav',import.meta.url).href));
  cache.set(kind,result.catch(error=>{cache.delete(kind);throw error;}));
 }
 return cache.get(kind);
}
function display(){
 if(!button)return;
 button.querySelector('span').textContent=playing?'Sound On':'Sound Off';
 button.setAttribute('aria-pressed',String(playing));
}
function remember(current){
 if(!current)return;
 if(current.element){try{sessionStorage.setItem('mnemosyne-audio-offset:'+current.kind,String(current.element.currentTime));}catch{}return;}
 try{sessionStorage.setItem('mnemosyne-audio-offset:'+current.kind,String((current.offset+context.currentTime-current.started)%current.buffer.duration));}catch{}
}
function stopVoice(current){
 if(!current)return;
 if(current.element){current.element.pause();current.source.disconnect();}
 else{try{current.source.stop();}catch{}}
 current.gain.disconnect();voices.delete(current);
}
async function selectTrack(next){
 const attempt=++request;kind=next;stopWaves();
 if(!wanted)return;
 if(voice?.kind===next){playing=true;display();status.textContent='';if((next==='maritime'||next==='nubia'))scheduleWave(true);return;}
 let offset=0;
 try{offset=Number(sessionStorage.getItem('mnemosyne-audio-offset:'+next))||0;}catch{}
 let nextVoice;
 if(['maritime','nubia','egypt'].includes(next)){
  // Stream the nine-minute track instead of downloading and decoding it all.
  const element=new Audio(tracks[next]);element.loop=true;element.preload='auto';
  const source=context.createMediaElementSource(element),gain=context.createGain();
  gain.gain.value=0;source.connect(gain).connect(master);
  nextVoice={element,source,gain,kind:next};voices.add(nextVoice);
  element.addEventListener('loadedmetadata',()=>{if(offset&&Number.isFinite(element.duration))element.currentTime=offset%element.duration;},{once:true});
  try{await element.play();}catch(error){stopVoice(nextVoice);throw error;}
 }else{
  const buffer=await decode(next);
  if(attempt!==request||!wanted)return;
  const source=context.createBufferSource(),gain=context.createGain(),now=context.currentTime;
  source.buffer=buffer;source.loop=true;gain.gain.value=0;source.connect(gain).connect(master);
  nextVoice={source,gain,buffer,kind:next,offset:offset%buffer.duration,started:now};
  source.start(now,nextVoice.offset);voices.add(nextVoice);
 }
 if(attempt!==request||!wanted){stopVoice(nextVoice);return;}
 const old=voice,now=context.currentTime;remember(old);voice=nextVoice;
 nextVoice.gain.gain.linearRampToValueAtTime(next==='egypt'?.08:(next==='maritime'||next==='nubia')?.12:settings.volume,now+(old?2.2:1.5));
 if(old){
  old.gain.gain.cancelScheduledValues(now);old.gain.gain.setValueAtTime(old.gain.gain.value,now);old.gain.gain.linearRampToValueAtTime(0,now+2.2);
  if(old.element)setTimeout(()=>stopVoice(old),2250);
  else{old.source.stop(now+2.25);old.source.onended=()=>{old.gain.disconnect();voices.delete(old);};}
 }
 playing=true;display();button.dataset.track=next;status.textContent='';if((next==='maritime'||next==='nubia'))scheduleWave(true);
}
async function enable(){
 wanted=true;preference.set('sound','on');display();
 try{
  if(!context){context=new (window.AudioContext||window.webkitAudioContext)();master=context.createGain();master.gain.value=0;master.connect(context.destination);}
  await context.resume();if(!wanted)return;if(context.state!=='running')throw new Error('Gesture required');
  master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(1,context.currentTime,.2);
  status.textContent=voice?'':'Preparing soundtrack…';await selectTrack(kind);
 }catch{wanted=false;playing=false;display();status.textContent='Select sound to resume playback.';}
}
function disable(){
 wanted=false;playing=false;++request;preference.set('sound','off');display();stopWriting();stopWaves();status.textContent='';
 if(master){master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(0,context.currentTime,.12);}
}
export function stopWriting(){
 if(nested){parent.document.dispatchEvent(new CustomEvent('exhibition-writing-stop'));return;}
 if(scratch){try{scratch.stop();}catch{}scratch=null;}
 if(button)delete button.dataset.writingActive;
}
export function playWriting(seconds){
 if(nested){parent.document.dispatchEvent(new CustomEvent('exhibition-writing',{detail:seconds}));return;}
 stopWriting();if(!wanted||context?.state!=='running')return;
 const length=Math.ceil(context.sampleRate*seconds),noise=context.createBuffer(1,length,context.sampleRate),samples=noise.getChannelData(0);
 for(let i=0;i<length;i++){const t=i/context.sampleRate,stroke=Math.max(0,Math.sin(t*48)+.3*Math.sin(t*91));samples[i]=(Math.random()*2-1)*stroke*.025*Math.min(1,t*30,(seconds-t)*20);}
 scratch=context.createBufferSource();scratch.buffer=noise;
 const filter=context.createBiquadFilter(),gain=context.createGain();filter.type='bandpass';filter.frequency.value=2200;filter.Q.value=.7;gain.gain.value=.45;
 scratch.connect(filter).connect(gain).connect(context.destination);const current=scratch;button.dataset.writingActive='true';
 current.onended=()=>{gain.disconnect();if(scratch===current){scratch=null;delete button.dataset.writingActive;}};current.start();
}
function stopWaves(){
 clearTimeout(waveTimer);waveTimer=null;
 if(waveSource){try{waveSource.stop();}catch{}waveSource=null;}
 waveGain?.disconnect();waveGain=null;if(button)delete button.dataset.waveState;
}
function scheduleWave(first=false){
 if(!['maritime','nubia'].includes(kind)||!wanted||waveTimer)return;
 button.dataset.waveState='scheduled';waveTimer=setTimeout(()=>{waveTimer=null;playWave();},first?6500:26000+Math.random()*18000);
}
function playWave(){
 if(!['maritime','nubia'].includes(kind)||!wanted||context?.state!=='running')return;
 const duration=8.5+Math.random()*2,length=Math.ceil(context.sampleRate*duration),surf=context.createBuffer(2,length,context.sampleRate);
 for(let channel=0;channel<2;channel++){const samples=surf.getChannelData(channel);let low=0;for(let i=0;i<length;i++){const white=Math.random()*2-1;low=(low+.025*white)/1.025;samples[i]=white*.25+low*2.8;}}
 const t=context.currentTime;waveSource=context.createBufferSource();waveSource.buffer=surf;
 const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.setValueAtTime(420,t);filter.frequency.exponentialRampToValueAtTime(3200,t+2.1);filter.frequency.exponentialRampToValueAtTime(480,t+duration);
 waveGain=context.createGain();waveGain.gain.setValueAtTime(.0001,t);waveGain.gain.exponentialRampToValueAtTime(.075,t+2.1);waveGain.gain.exponentialRampToValueAtTime(.022,t+4.5);waveGain.gain.exponentialRampToValueAtTime(.0001,t+duration);
 if(kind==='nubia'){filter.type='bandpass';filter.Q.value=.45;filter.frequency.setValueAtTime(220,t);filter.frequency.exponentialRampToValueAtTime(850,t+4);filter.frequency.exponentialRampToValueAtTime(280,t+duration);waveGain.gain.cancelScheduledValues(t);waveGain.gain.setValueAtTime(.0001,t);waveGain.gain.exponentialRampToValueAtTime(.025,t+4);waveGain.gain.exponentialRampToValueAtTime(.0001,t+duration);}
 waveSource.connect(filter).connect(waveGain).connect(master);button.dataset.waveState='playing';const current=waveSource;
 current.onended=()=>{if(waveSource===current){waveSource=null;waveGain?.disconnect();waveGain=null;if(wanted)scheduleWave();}};current.start();
}
function exit(url){
 preference.set('mode','standard');try{sessionStorage.setItem('mnemosyne-standard-visit','yes');sessionStorage.removeItem('mnemosyne-exhibition-session');}catch{}
 disable();location.assign(url.href);
}
function navigate(url,{push=true}={}){
 if(url.origin!==location.origin||!url.pathname.startsWith('/exhibition/')){exit(url);return;}
 if(url.pathname.includes('who-made-kermas-blue')&&!location.pathname.includes('who-made-kermas-blue')){try{sessionStorage.setItem('kerma-return',location.pathname+location.search+location.hash);}catch{}}
 stopWriting();internalNavigation=true;
 // The top-level player survives room changes, so decoded loops can crossfade.
 if(!roomFrame){
  roomFrame=document.createElement('iframe');roomFrame.className='exhibition-page-frame';roomFrame.title='Mnemosyne exhibition room';
  roomFrame.addEventListener('load',()=>{
   try{document.title=roomFrame.contentDocument.title;roomFrame.contentDocument.querySelector('.exhibition')?.setAttribute('tabindex','-1');roomFrame.contentDocument.querySelector('.exhibition')?.focus({preventScroll:true});}catch{}
   internalNavigation=false;
  });document.body.append(roomFrame);
 }
 roomFrame.src=url.href;document.body.classList.add('exhibition-browsing');document.body.classList.toggle('explore-page',(url.pathname.includes('/explore/')||url.pathname.includes('/exhibition/articles/')));
 if(push)history.pushState({exhibitionRoom:true},'',url.href);
 selectTrack(kindFor(url.href)).catch(()=>{status.textContent='Soundtrack unavailable. Select sound to retry.';});
}
function roomClick(event){
 const link=event.target.closest('a[href]');
 if(!link||event.defaultPrevented||link.target==='_blank'||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.hasAttribute('download'))return;
 const url=new URL(link.href);if(url.origin!==location.origin)return;
 if(url.pathname===location.pathname&&url.hash){return;}
 if(url.pathname.startsWith('/exhibition/')){
  event.preventDefault();
  if(nested)parent.document.dispatchEvent(new CustomEvent('exhibition-navigate',{detail:url.href}));else navigate(url);
 }else{
  event.preventDefault();
  if(nested)parent.document.dispatchEvent(new CustomEvent('exhibition-exit',{detail:url.href}));else exit(url);
 }
}
if((desktopEligible()||document.querySelector('.kerma-exhibition'))&&document.querySelector('.exhibition')){
 document.querySelector('.exhibition').addEventListener('click',roomClick);
 if(nested){
  document.addEventListener('exhibition-writing',event=>parent.document.dispatchEvent(new CustomEvent('exhibition-writing',{detail:event.detail})));
  document.addEventListener('exhibition-writing-stop',()=>parent.document.dispatchEvent(new CustomEvent('exhibition-writing-stop')));
 }else{
  button=document.createElement('button');button.type='button';button.className='exhibition-sound';button.dataset.sound='';
  button.innerHTML='<img class="control-icon" src="/assets/exhibition/controls/sound.png" alt="" aria-hidden="true"><span></span>';
  status=document.createElement('span');status.className='exhibition-audio-status';status.setAttribute('role','status');document.body.append(button,status);document.body.classList.add('exhibition-landing');display();
  if(kind==='gallery')decode(kind).then(()=>{button.dataset.audioReady='true';}).catch(()=>{});
  // Fetch other room soundtracks only when that room is selected.
  button.addEventListener('click',()=>wanted?disable():enable());
  document.addEventListener('exhibition-writing',event=>playWriting(event.detail));document.addEventListener('exhibition-writing-stop',stopWriting);
  document.addEventListener('exhibition-navigate',event=>navigate(new URL(event.detail)));
  document.addEventListener('exhibition-exit',event=>exit(new URL(event.detail)));
  window.addEventListener('popstate',()=>{if(roomFrame)navigate(new URL(location.href),{push:false});});
  window.addEventListener('pagehide',()=>{remember(voice);stopWriting();stopWaves();for(const current of [...voices])stopVoice(current);voice=null;context?.suspend();});
  window.addEventListener('pageshow',event=>{if(event.persisted&&preference.get('sound')==='on')enable();});
  // A new document starts silent until a user gesture permits playback.
  // Room navigation keeps this player alive and preserves playing audio.
 }
}
