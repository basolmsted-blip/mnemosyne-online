export function installNotes(wall,playWriting,stopWriting){
  const note=document.createElement('aside');note.className='exhibition-note';note.hidden=true;note.id='exhibition-object-note';note.setAttribute('role','note');
  wall.append(note);
  const links=[...wall.querySelectorAll('.artifact')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const heading=wall.querySelector('h1');
  const defaultHeading=heading.textContent;
  let selected=null;
  const navigation=document.createElement('div');navigation.className='exhibition-navigate';navigation.hidden=true;wall.append(navigation);
  const silhouettes=new Map();
  function pixels(link){
    if(silhouettes.has(link))return silhouettes.get(link);
    const image=link.querySelector('.artifact__image');
    if(!image.complete||!image.naturalWidth)return [];
    const canvas=document.createElement('canvas');canvas.width=96;canvas.height=96;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,96,96);
    const data=ctx.getImageData(0,0,96,96).data,points=[];
    for(let y=0;y<96;y+=2)for(let x=0;x<96;x+=2)if(data[(y*96+x)*4+3]>60)points.push({x:(x+.5)/96,y:(y+.5)/96});
    silhouettes.set(link,points);return points;
  }
  function visiblePoints(link){
    const box=link.getBoundingClientRect(),image=link.querySelector('.artifact__image');
    const scale=Math.min(link.clientWidth/image.naturalWidth,link.clientHeight/image.naturalHeight);
    const angle=(parseFloat(getComputedStyle(link).getPropertyValue('--object-tilt'))||0)*Math.PI/180;
    const iw=image.naturalWidth*scale,ih=image.naturalHeight*scale;
    const cx=box.left+box.width/2,cy=box.top+box.height/2;
    return pixels(link).map(p=>{const x=(p.x-.5)*iw,y=(p.y-.5)*ih;return {x:cx+x*Math.cos(angle)-y*Math.sin(angle),y:cy+x*Math.sin(angle)+y*Math.cos(angle)};}).filter(p=>p.x>=0&&p.x<=innerWidth&&p.y>=0&&p.y<=innerHeight);
  }
  function position(){
    if(!selected)return;
    const compact=innerWidth<1024,points=visiblePoints(selected);
    if(!points.length)return;
    const r={left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))};
    const cx=(r.left+r.right)/2,cy=(r.top+r.bottom)/2;
    const pad=22,w=Math.min(compact?235:250,innerWidth*.43);
    note.style.width=`${w}px`;
    const h=note.offsetHeight,title=heading.getBoundingClientRect();
    const allPoints=links.flatMap(visiblePoints);
    const preferredRight=compact?cx<innerWidth/2:cx>innerWidth*.65;
    const targetY=compact?cy-h/2:title.top+(title.height-h)/2;
    const ranges=compact?[[pad,Math.max(pad,innerWidth-w-pad)]]:[[pad,Math.max(pad,title.left-w-16)],[Math.min(innerWidth-w-pad,title.right+16),innerWidth-w-pad]];
    let best;
    for(const [lo,hi] of ranges)for(let x=lo;x<=hi+1;x+=12)for(let y=78;y<=innerHeight-h-35;y+=10){
      const hits=allPoints.filter(p=>p.x>x-14&&p.x<x+w+14&&p.y>y-14&&p.y<y+h+14).length;
      const headingOverlap=x<title.right+12&&x+w>title.left-12&&y<title.bottom+12&&y+h>title.top-12;
      const sidePenalty=(x>innerWidth/2)!==preferredRight?40:0;
      const score=hits*100000+(headingOverlap?1000000:0)+Math.abs(y-targetY)+sidePenalty+Math.abs(x-(preferredRight?innerWidth-w-innerWidth*.065:innerWidth*.065))*.3;
      if(!best||score<best.score)best={x,y,score,hits};
    }
    if(best){note.style.left=`${best.x}px`;note.style.top=`${best.y}px`;note.dataset.objectOverlap=String(best.hits);}
    // Match the visible silhouette, rather than the transparent rectangular image padding.
    const nw=navigation.offsetWidth,nh=navigation.offsetHeight,gap=9;
    let nx,ny;
    if(cx<innerWidth*.28){ny=cy-nh/2;const band=points.filter(p=>Math.abs(p.y-cy)<25);nx=Math.max(...(band.length?band:points).map(p=>p.x))+gap;}
    else if(cx>innerWidth*.72){ny=cy-nh/2;const band=points.filter(p=>Math.abs(p.y-cy)<25);nx=Math.min(...(band.length?band:points).map(p=>p.x))-nw-gap;}
    else if(cy<innerHeight*.5){nx=cx-nw/2;ny=r.bottom+gap;}
    else{nx=cx-nw/2;ny=r.top-nh-gap;}
    if(compact){nx=cx-nw/2;ny=r.top-nh-gap;}
    if(!compact&&selected.classList.contains('artifact--articles'))nx-=110;
    navigation.style.left=`${Math.max(16,Math.min(innerWidth-nw-16,nx))}px`;
    navigation.style.top=`${Math.max(65,Math.min(innerHeight-nh-35,ny))}px`;
  }
  function hide(){selected?.removeAttribute('aria-describedby');selected=null;note.hidden=true;navigation.hidden=true;heading.textContent=defaultHeading;stopWriting();}
  function reveal(link){
    if(selected===link)return;
    hide();selected=link;heading.textContent=link.getAttribute('aria-label').toUpperCase();note.replaceChildren();
    navigation.textContent=`Navigate to ${link.dataset.destination}`;navigation.hidden=false;
    let count=0;
    for(const text of [link.dataset.title,link.dataset.date,link.dataset.origin]){
      const p=document.createElement('p');const accessible=document.createElement('span');accessible.className='note-accessible';accessible.textContent=text;p.append(accessible);
      for(const word of text.split(' ')){
        const span=document.createElement('span');span.className='word';span.setAttribute('aria-hidden','true');
        for(const letter of word){const ink=document.createElement('span');ink.className='ink';ink.textContent=letter;ink.style.setProperty('--ink-delay',`${count++*14}ms`);span.append(ink);}
        p.append(span,document.createTextNode(' '));
      }
      note.append(p);
    }
    note.style.setProperty('--note-tilt',links.indexOf(link)%2?'3deg':'-4deg');
    note.hidden=false;link.setAttribute('aria-describedby',note.id);position();
    if(!reduced.matches)playWriting(count*.014+.13);
  }
  links.forEach(link=>{
    link.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')reveal(link);});
    link.addEventListener('pointerleave',()=>{if(document.activeElement!==link)hide();});
    link.addEventListener('focus',()=>reveal(link));link.addEventListener('blur',hide);
    link.addEventListener('click',hide);
  });
  window.addEventListener('resize',position);window.addEventListener('scroll',position,{passive:true});
  wall.querySelector('[data-credits]').addEventListener('click',hide);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
  document.fonts.ready.then(position);
  links.forEach(link=>link.querySelector('.artifact__image').addEventListener('load',position));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();});
}
