const projects = [
 {name:'MySites Motion',image:'mysites-organic-concept',width:1448,height:1086,category:'creative',kind:'Brand & digital studio',description:'Sculptural moss, confident typography and an organic visual identity.',path:'mysites-organic',colour:'#15180f',status:'Design concept'},
 {name:'MySites Windows',image:'mysites-windows-concept',width:1448,height:1086,category:'creative',kind:'Type & motion playground',description:'A wall of type, seven drifting windows and nothing standing still.',path:'mysites-windows',colour:'#000000',status:'Design concept'},
 {name:'Terrain Surrey',image:'terrain',category:'business',kind:'Gardens & landscaping',description:'A fresh, image-led home for a family garden business.',path:'terrain-surrey',colour:'#b8c8f3',status:'Design concept'},
 {name:'Annexe',image:'annexe-hq',width:2295,height:1350,category:'creative',kind:'Spatial experience',description:'A walk through a courtyard. Six material studies. A different way to explore.',path:'showroom',colour:'#c4ccda',status:'Experimental build'},
 {name:'MySites Studio',image:'mysites-architecture-concept',width:1448,height:1086,category:'business',kind:'Architecture & interiors',description:'Considered architecture, a natural setting and a refined digital presence.',path:'mysites-architecture',colour:'#25311c',status:'Design concept'},
 {name:'MySites Industrial',image:'mysites-industrial-concept',width:1448,height:1086,category:'business',kind:'Engineering & product design',description:'A precise industrial direction. Machined details, monochrome and purposeful design.',path:'mysites-industrial',colour:'#c6c7ca',status:'Design concept'},
];
const root = document.querySelector('#projects');
for (const project of projects) {
 const article=document.createElement('article');article.className='project';article.dataset.category=project.category;article.dataset.site=project.path;
 const url='../05-example-sites/'+project.path+'/';
 article.innerHTML=`<a class="project-visual" href="${url}" target="_blank" rel="noopener" aria-label="Open ${project.name} preview" style="--project-bg:${project.colour}"><video class="preview" muted playsinline preload="metadata" poster="assets/${project.image}.webp" width="${project.width||1280}" height="${project.height||720}" aria-label="${project.name} website preview, scrolls with the page"><source src="assets/previews/${project.path}.mp4" type="video/mp4"></video></a><div class="project-meta"><h3><a href="${url}" target="_blank" rel="noopener">${project.name} ↗</a></h3><span class="project-type">${project.kind}</span></div><p class="project-desc">${project.description}</p><div class="project-links"><span>${project.status}</span><a href="${url}" target="_blank" rel="noopener">Open site ↗</a>${(project.versions||[]).map(([label,path])=>`<a href="../05-example-sites/${path}/" target="_blank" rel="noopener">${label} ↗</a>`).join('')}</div>`;
 root.append(article);
}
for(const button of document.querySelectorAll('[data-filter]'))button.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});
 let count=0;root.querySelectorAll('.project').forEach(p=>{p.hidden=button.dataset.filter!=='all'&&p.dataset.category!==button.dataset.filter;if(!p.hidden)count++});
 document.querySelector('#filter-status').textContent=`Showing ${count} projects.`;
});
const experiment=document.querySelector('.experiment');
let demoVisible=false;
function syncDemoPlayback(){
 const moving=demoVisible&&!demoPaused&&!document.hidden;
 experiment.classList.toggle('demo-paused',!moving);

}
for(const button of document.querySelectorAll('.capability'))button.addEventListener('click',()=>{
 document.querySelectorAll('.capability').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});experiment.dataset.demo=button.dataset.demo;syncDemoPlayback();
});
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
let demoPaused=motionPreference.matches;
const demoPause=document.querySelector('#demo-pause');
function setDemoPause(){demoPause.disabled=motionPreference.matches;demoPause.textContent=motionPreference.matches?'Reduced motion':demoPaused?'Play demo ▷':'Pause demo Ⅱ';demoPause.setAttribute('aria-pressed',String(demoPaused));syncDemoPlayback();}
motionPreference.addEventListener('change',()=>{demoPaused=motionPreference.matches;setDemoPause()});
setDemoPause();demoPause.addEventListener('click',()=>{demoPaused=!demoPaused;setDemoPause()});
new IntersectionObserver(entries=>{demoVisible=entries[0].isIntersecting;syncDemoPlayback()},{threshold:.15}).observe(experiment);
document.addEventListener('visibilitychange',syncDemoPlayback);
experiment.addEventListener('pointermove',event=>{if(demoPaused||event.pointerType==='touch')return;const b=experiment.getBoundingClientRect();experiment.style.setProperty('--mx',`${((event.clientX-b.left)/b.width-.5)*55}px`);experiment.style.setProperty('--my',`${((event.clientY-b.top)/b.height-.5)*40}px`)});
experiment.addEventListener('pointerleave',()=>{experiment.style.setProperty('--mx','0px');experiment.style.setProperty('--my','0px')});
const dialog=document.querySelector('#brief-dialog');
document.querySelector('#open-brief').addEventListener('click',()=>dialog.showModal());
document.querySelector('#close-brief').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
document.querySelector('#brief-form').addEventListener('submit',event=>{
 event.preventDefault();const values=new FormData(event.target);const business=values.get('business').trim();
 const body=`Business: ${business}\nProject: ${values.get('service')}\n\n${values.get('details').trim()}\n`;
 const mailto=`mailto:mysitesstudio@gmail.com?subject=${encodeURIComponent('Website brief: '+business)}&body=${encodeURIComponent(body)}`;
 event.target.dataset.mailto=mailto;
 window.location.href=mailto;
 document.querySelector('#brief-status').innerHTML='Your email app should open with the brief filled in. If it does not, copy it into an email to <a href="mailto:mysitesstudio@gmail.com">mysitesstudio@gmail.com</a>.';
});

// Both films stop offscreen and respect the visitor's motion preferences.
for(const study of document.querySelectorAll('.brand-ident')){
 const film=study.querySelector('video');
 const button=study.querySelector('button');
 const name=film.id==='montage-film'?'chrome':'monochrome';
 film.defaultPlaybackRate=film.playbackRate=name==='monochrome'?2:1;
 let visible=false,paused=motionPreference.matches;
 function sync(){
  if(visible&&!paused&&!motionPreference.matches&&!document.hidden)film.play().catch(()=>{});else film.pause();
  button.textContent=motionPreference.matches?'Reduced motion':paused?'Play film ▷':'Pause film Ⅱ';
  button.setAttribute('aria-label',`${paused?'Play':'Pause'} ${name} film`);
  button.setAttribute('aria-pressed',String(paused));
  button.disabled=motionPreference.matches;
 }
 button.addEventListener('click',()=>{paused=!paused;sync()});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:.15}).observe(film);
 motionPreference.addEventListener('change',()=>{paused=motionPreference.matches;sync()});
 document.addEventListener('visibilitychange',sync);
 sync();
}


// Home-page previews scrub with the page: each clip is the site scrolling top to bottom, and the card's
// position in the viewport picks the frame. Only clips near the viewport are touched.
(() => {
 if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
 const live = new Set();
 const io = new IntersectionObserver(entries => {
  for (const e of entries) {
   const v = e.target;
   if (e.isIntersecting) { live.add(v); if (!v.dataset.primed) { v.dataset.primed = '1'; v.play().then(() => v.pause()).catch(() => {}); } }
   else live.delete(v);
  }
 }, { rootMargin: '25% 0px' });
 for (const v of document.querySelectorAll('.project video.preview')) io.observe(v);
 const SLOPE = .55;   // how much of the clip one pass through the viewport covers (1 = all of it)
 const EASE = .07;    // per-frame catch-up toward the target frame; lower is smoother and lazier
 const eased = new WeakMap();
 function update(instant) {
  const vh = innerHeight;
  for (const v of live) {
   if (!v.duration || v.seeking) continue;
   const r = v.getBoundingClientRect();
   const raw = 1 - (r.top + r.height) / (vh + r.height);          // 0 entering at the bottom, 1 gone off the top
   const p = Math.min(1, Math.max(0, .5 + (raw - .5) * SLOPE));    // centred, so mid-screen is mid-clip
   const target = p * (v.duration - .08);
   let cur = eased.has(v) ? eased.get(v) : target;
   cur += (target - cur) * (instant ? 1 : EASE);
   eased.set(v, cur);
   if (Math.abs(v.currentTime - cur) > .025) v.currentTime = cur;
  }
 }
 addEventListener('scroll', () => update(false), { passive: true });
 (function tick() { update(false); requestAnimationFrame(tick); })();
})();
