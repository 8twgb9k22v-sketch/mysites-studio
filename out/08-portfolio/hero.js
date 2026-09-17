const runway = document.querySelector('#hero-runway');
const stage = document.querySelector('#stage');
const video = document.querySelector('#hero-film');
const controls = document.querySelector('#film-controls');
const play = document.querySelector('#film-play');
const pause = document.querySelector('#film-pause');
const work = document.querySelector('#work');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let targetTime = 0, paused = false, previewing = false;
let frame = 0, lastFrame = 0;
let showcaseProgress = 0;

function syncShowcase() {
  if (!runway.classList.contains('film-ready')) return;
  const height = stage.clientHeight;
  const start = runway.offsetTop + runway.offsetHeight - height;
  const shift = Math.max(0, Math.min(height, start - window.scrollY));
  const progress = Math.min(1, Math.max(0, (window.scrollY - (start - height * .7)) / (height * .45)));
  const filmReady = paused || window.scrollY >= start ? 1 : Math.min(1, Math.max(0, (video.currentTime - 7.15) / .45));
  const arrival = Math.min(1, Math.max(0, (progress - .14) / .86));
  showcaseProgress = arrival * arrival * (3 - 2 * arrival) * filmReady;
  runway.style.setProperty('--hero-presence', (1 - Math.min(1, progress / .2) * filmReady).toFixed(4));
  work.style.setProperty('--showcase-shift', `${shift}px`);
  work.style.setProperty('--showcase-reveal', showcaseProgress.toFixed(4));
  work.classList.toggle('showcase-visible', showcaseProgress > .01);
  runway.style.setProperty('--showcase-reveal', showcaseProgress.toFixed(4));
}

function syncScroll() {
  if (!runway.classList.contains('film-ready')) return;
  // Keep the established film pace, followed by a short reveal of the showcase.
  const filmDistance = stage.clientHeight * 4.215;
  targetTime = Math.min(1, Math.max(0, -runway.getBoundingClientRect().top / filmDistance)) * Math.max(0, video.duration - .04);
  syncShowcase();
  if (previewing) resetPreview();
  startScrub();
}

function scrub() {
  frame = 0;
  if (paused || previewing || video.readyState < 2 || reduced.matches) return;
  const now = performance.now();
  const dt = Math.min((now - lastFrame) / 1000, .06);
  lastFrame = now;
  const gap = targetTime - video.currentTime;
  if (!video.seeking && Math.abs(gap) > .025) {
    const step = gap * (1 - Math.exp(-dt / .24));
    video.currentTime += Math.max(-dt * 2.04, Math.min(dt * 2.04, step));
  }
  if (Math.abs(gap) > .025 || video.seeking) frame = setTimeout(scrub, 1000 / 30);
}
function startScrub() {
  if (!frame && !paused && !previewing) {
    lastFrame = performance.now();
    frame = setTimeout(scrub, 1000 / 30);
  }
}
function resetPreview() {
  previewing = false;
  video.pause();
  play.textContent = 'Play film ▷';
}
function revealOutro() {
  const fade = Math.min(1, Math.max(0, (video.currentTime - 6.9) / .65));
  const eased = fade * fade * (3 - 2 * fade);
  runway.style.setProperty('--outro', eased.toFixed(4));
  runway.style.setProperty('--white-blend', Math.min(1, Math.max(0, (video.currentTime - 6.6) / .95)).toFixed(4));
  runway.classList.toggle('film-outro', fade > 0);
  syncShowcase();
}
function still() {
  resetPreview();
  clearTimeout(frame);frame = 0;
  runway.classList.remove('film-ready','film-outro');
  stage.classList.remove('film-loaded');
  controls.hidden = true;
}
function connect() {
  if (!runway.dataset.film || reduced.matches) return;
  try {
    video.src = runway.dataset.film;
    video.preload = 'auto';
    video.load();
  } catch (error) {
    console.warn('The hero film is unavailable; retaining the chrome still.', error);
    still();
  }
}
video.addEventListener('loadeddata',()=>{
  if (reduced.matches || !Number.isFinite(video.duration) || !video.duration) return;
  runway.classList.add('film-ready');
  stage.classList.add('film-loaded');
  controls.hidden = false;
  revealOutro();
  syncScroll();
});
video.addEventListener('timeupdate',revealOutro);
video.addEventListener('seeked',()=>{
  revealOutro();
  if (!previewing && Math.abs(targetTime - video.currentTime) > .025) {
    clearTimeout(frame);frame = 0;startScrub();
  }
});
video.addEventListener('error',still);
video.addEventListener('ended',resetPreview);
play.addEventListener('click',async()=>{
  if(previewing){resetPreview();return;}
  paused=false;pause.textContent='Pause motion Ⅱ';pause.setAttribute('aria-pressed','false');
  previewing=true;video.currentTime=0;video.playbackRate=.663;
  try {await video.play();play.textContent='Stop film □';}
  catch {resetPreview();}
});
pause.addEventListener('click',()=>{
  paused=!paused;resetPreview();pause.textContent=paused?'Enable motion ▷':'Pause motion Ⅱ';pause.setAttribute('aria-pressed',String(paused));
  syncShowcase();
  if(!paused)startScrub();
});
reduced.addEventListener('change',()=>{if(reduced.matches)still();else connect()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetPreview()});
window.addEventListener('scroll',syncScroll,{passive:true});
window.addEventListener('resize',syncScroll);
window.addEventListener('pagehide',()=>{video.pause();clearTimeout(frame);frame=0;});
connect();
