const projects = [
 {name:'MySites Motion',image:'mysites-organic-concept',width:1448,height:1086,category:'creative',kind:'Brand & digital studio',description:'Sculptural moss, confident typography and an organic visual identity.',path:'mysites-organic',colour:'#15180f',status:'Design concept'},
 {name:'Terrain Surrey',image:'terrain',category:'business',kind:'Gardens & landscaping',description:'A fresh, image-led home for a family garden business.',path:'terrain-surrey',colour:'#b8c8f3',status:'Design concept'},
 {name:'Annexe',image:'annexe-hq',width:2295,height:1350,category:'creative',kind:'Spatial experience',description:'A walk through a courtyard. Six material studies. A different way to explore.',path:'showroom',colour:'#c4ccda',status:'Experimental build'},
 {name:'MySites Studio',image:'mysites-architecture-concept',width:1448,height:1086,category:'business',kind:'Architecture & interiors',description:'Considered architecture, a natural setting and a refined digital presence.',path:'mysites-architecture',colour:'#25311c',status:'Design concept'},
 {name:'MySites Industrial',image:'mysites-industrial-concept',width:1448,height:1086,category:'business',kind:'Engineering & product design',description:'A precise industrial direction. Machined details, monochrome and purposeful design.',path:'mysites-industrial',colour:'#c6c7ca',status:'Design concept'},
];
const root = document.querySelector('#projects');
for (const project of projects) {
 const article=document.createElement('article');article.className='project';article.dataset.category=project.category;article.dataset.site=project.path;
 const url='../05-example-sites/'+project.path+'/';
 article.innerHTML=`<a class="project-visual" href="${url}" target="_blank" rel="noopener" aria-label="Open ${project.name} preview" style="--project-bg:${project.colour}"><img src="assets/${project.image}.webp" width="${project.width||1280}" height="${project.height||720}" loading="lazy" alt="${project.name} website preview"></a><div class="project-meta"><h3><a href="${url}" target="_blank" rel="noopener">${project.name} ↗</a></h3><span class="project-type">${project.kind}</span></div><p class="project-desc">${project.description}</p><div class="project-links"><span>${project.status}</span><a href="${url}" target="_blank" rel="noopener">Open site ↗</a>${(project.versions||[]).map(([label,path])=>`<a href="../05-example-sites/${path}/" target="_blank" rel="noopener">${label} ↗</a>`).join('')}</div>`;
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
 event.preventDefault();const values=new FormData(event.target);
 const text=`MYSITES — PROJECT BRIEF\n\nBusiness: ${values.get('business').trim()}\nProject: ${values.get('service')}\n\n${values.get('details').trim()}\n\nPrepared locally. Nothing has been sent.\n`;
 const blob=new Blob([text],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='mysites-project-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 document.querySelector('#brief-status').textContent='Your brief has been downloaded. Nothing has been sent.';
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
