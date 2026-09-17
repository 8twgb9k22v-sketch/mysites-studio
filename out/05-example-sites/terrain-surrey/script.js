const $ = selector => document.querySelector(selector);
const header = $('.site-header');
const nav = $('#navigation');
const menu = $('.menu-toggle');
const motionButton = $('.motion-toggle');
const walk = $('.walk');
const video = $('.garden-video');
const heroCopy = $('.hero-copy');
const thought = $('.walk-thought');
const detail = $('.walk-detail');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = value => Math.max(0, Math.min(1, value));
let lenis;
let stopMotion = () => {};
let motionPaused = false;

function closeMenu() {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  nav.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); }
});

// Native observers keep the rest of the page usable without animation libraries.
if ('IntersectionObserver' in window) {
  const headerObserver = new IntersectionObserver(entries => {
    header.classList.toggle('on-page', !entries[0].isIntersecting);
  }, { threshold: 0, rootMargin: '-80px 0px 0px 0px' });
  headerObserver.observe(walk);
  if (!reducedMotion.matches) {
    document.documentElement.classList.add('reveal-enabled');
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
    }), { threshold: .12, rootMargin: '0px 0px -25px 0px' });
    document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
  }
}

function startMotion() {
  stopMotion();
  if (motionPaused || reducedMotion.matches || navigator.connection?.saveData || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const abort = new AbortController();
  let alive = true;
  let blobUrl;
  let trigger;
  let progress = 0;
  let smoothTime = 0;
  let tick;
  let ready = false;
  let lenisTick;

  function apply(value) {
    progress = value;
    walk.dataset.progress = value.toFixed(4);
    const departure = clamp((value - .08) / .16);
    heroCopy.style.opacity = String(1 - departure);
    heroCopy.style.transform = `translate3d(0,${-departure * 32}px,0)`;
    heroCopy.inert = departure > .97;
    const arrival = clamp((value - .74) / .16);
    thought.style.opacity = String(arrival);
    thought.style.transform = `translate3d(0,${(1 - arrival) * 14}px,0)`;
    const detailArrival = clamp((value - .36) / .06);
    const detailDeparture = clamp((value - .60) / .07);
    detail.style.opacity = String(detailArrival * (1 - detailDeparture));
    detail.style.transform = `translate3d(0,${(1 - detailArrival) * 14}px,0)`;
    if (value <= .08) video.style.opacity = '0';
  }

  function showFrame() {
    if (!alive) return;
    video.style.opacity = progress > .08 && video.currentTime > .025 ? '1' : '0';
    walk.dataset.frameTime = video.currentTime.toFixed(3);
  }

  function enable() {
    if (!alive || ready || !Number.isFinite(video.duration) || video.readyState < 2) return;
    ready = true;
    walk.classList.add('motion-ready');
    walk.dataset.videoState = 'ready';
    motionButton.hidden = false;
    motionButton.textContent = 'Pause motion';
    motionButton.setAttribute('aria-pressed', 'false');
    if (window.Lenis) {
      lenis = new Lenis({ lerp: .085, wheelMultiplier: .9, smoothWheel: true, syncTouch: false, anchors: { offset: -90 } });
      lenis.on('scroll', ScrollTrigger.update);
      lenisTick = time => lenis?.raf(time * 1000);
      gsap.ticker.add(lenisTick);
    }
    trigger = ScrollTrigger.create({
      trigger: walk, start: 'top top', end: 'bottom bottom',
      invalidateOnRefresh: true, onUpdate: self => apply(self.progress),
      onRefresh: self => apply(self.progress)
    });
    tick = () => {
      if (!alive || document.hidden) return;
      const target = clamp((progress - .08) / .82) * Math.max(0, video.duration - .045);
      smoothTime += (target - smoothTime) * .14;
      if (Math.abs(smoothTime - target) < .005) smoothTime = target;
      if (!video.seeking && video.readyState >= 2 && Math.abs(video.currentTime - smoothTime) > .018) {
        video.currentTime = smoothTime;
      }
    };
    gsap.ticker.add(tick);
    ScrollTrigger.refresh();
    apply(trigger.progress);
  }

  function cleanup() {
    alive = false;
    abort.abort();
    trigger?.kill();
    if (tick) gsap.ticker.remove(tick);
    if (lenisTick) gsap.ticker.remove(lenisTick);
    lenis?.destroy(); lenis = undefined;
    video.removeEventListener('loadeddata', enable);
    video.removeEventListener('canplay', enable);
    video.removeEventListener('seeked', showFrame);
    video.removeEventListener('error', failed);
    video.pause();
    video.removeAttribute('src'); video.load();
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    walk.classList.remove('motion-ready');
    video.style.opacity = '0';
    heroCopy.style.removeProperty('opacity'); heroCopy.style.removeProperty('transform');
    heroCopy.inert = false;
    thought.style.opacity = '0';
    detail.style.opacity = '0';
    walk.dataset.progress = '0';
    ScrollTrigger.refresh();
  }
  function failed() {
    if (!alive) return;
    cleanup();
    walk.dataset.videoState = 'still';
    motionButton.hidden = true;
  }
  stopMotion = cleanup;
  video.addEventListener('loadeddata', enable);
  video.addEventListener('canplay', enable);
  video.addEventListener('seeked', showFrame);
  video.addEventListener('error', failed);
  video.muted = true;
  video.playsInline = true;
  walk.dataset.videoState = 'loading';
  const source = matchMedia('(max-width: 760px)').matches ? 'assets/hero-story-mobile-v3.mp4' : 'assets/hero-story-v3.mp4';
  // Full-file Blob loading avoids server range and stale streamed-cache differences.
  fetch(source, { signal: abort.signal }).then(response => {
    if (!response.ok) throw new Error(`Video response ${response.status}`);
    return response.blob();
  }).then(blob => {
    if (!alive) return;
    blobUrl = URL.createObjectURL(blob);
    video.src = blobUrl;
    video.preload = 'auto';
    video.load();
  }).catch(error => { if (error.name !== 'AbortError') failed(); });
}

motionButton.addEventListener('click', () => {
  motionPaused = !motionPaused;
  if (motionPaused) {
    const top = walk.getBoundingClientRect().top + scrollY;
    stopMotion();
    window.scrollTo({ top, behavior: 'instant' });
    motionButton.textContent = 'Enable motion';
    motionButton.setAttribute('aria-pressed', 'true');
    walk.dataset.videoState = 'paused';
  } else startMotion();
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    stopMotion();
    motionButton.hidden = true;
    document.documentElement.classList.remove('reveal-enabled');
  } else startMotion();
});
startMotion();

// Service selection feeds the enquiry, rather than opening another page.
document.querySelectorAll('.service-list details').forEach(item => item.addEventListener('toggle', () => {
  if (item.open) document.querySelectorAll('.service-list details').forEach(other => { if (other !== item) other.open = false; });
  window.ScrollTrigger?.refresh();
  lenis?.resize();
}));
document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => { $('#service').value = link.dataset.service; }));

const photos = [
  { src: 'assets/published-2.webp', alt: 'Striped lawn and gravel surrounds outside a timber-framed country house', caption: 'Lawns and gravel surrounds' },
  { src: 'assets/published-3.webp', alt: 'Freshly striped lawn beside a timber outbuilding with mature hedges behind', caption: 'Lawn beside a timber outbuilding' }
];
const lightbox = $('#lightbox');
let photoIndex = 0;
let returnFocus;
function showPhoto(index) {
  photoIndex = (index + photos.length) % photos.length;
  $('#lightbox-image').src = photos[photoIndex].src;
  $('#lightbox-image').alt = photos[photoIndex].alt;
  $('#lightbox-caption').textContent = photos[photoIndex].caption;
}
document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
  returnFocus = button;
  showPhoto(Number(button.dataset.photo));
  lenis?.stop();
  lightbox.showModal();
}));
$('.close-lightbox').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('close', () => { lenis?.start(); returnFocus?.focus({ preventScroll: true }); });
$('#previous-photo').addEventListener('click', () => showPhoto(photoIndex - 1));
$('#next-photo').addEventListener('click', () => showPhoto(photoIndex + 1));
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') showPhoto(photoIndex - 1);
  if (event.key === 'ArrowRight') showPhoto(photoIndex + 1);
});
lightbox.addEventListener('click', event => {
  if (event.target !== lightbox) return;
  const rect = lightbox.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) lightbox.close();
});
let touchStart;
lightbox.addEventListener('touchstart', event => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', event => {
  const distance = event.changedTouches[0].clientX - touchStart;
  if (Math.abs(distance) > 60) showPhoto(photoIndex + (distance < 0 ? 1 : -1));
}, { passive: true });

const enquiry = $('#enquiry');
const result = $('#enquiry-result');
const prepared = $('#prepared');
const copyStatus = $('#copy-status');
enquiry.addEventListener('submit', event => {
  event.preventDefault();
  const service = $('#service').value;
  const postcode = $('#postcode').value.trim().toUpperCase();
  const details = $('#details').value.trim();
  if (details.length < 10) { $('#details').setCustomValidity('Please add a little more detail about the work.'); $('#details').reportValidity(); return; }
  prepared.value = `Hi Sam, I'd like a quote for ${service.toLowerCase()} in ${postcode}.\n\n${details}\n\nPlease let me know if you cover my area and what the next step would be. Thank you.`;
  result.hidden = false;
  copyStatus.textContent = 'Ready to copy and send through Checkatrade.';
  prepared.focus({ preventScroll: true });
  lenis?.resize();
});
$('#details').addEventListener('input', event => event.target.setCustomValidity(''));
enquiry.addEventListener('input', event => { if (event.target !== prepared) result.hidden = true; });
$('#copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(prepared.value); copyStatus.textContent = 'Copied. Open Checkatrade and paste your enquiry into a quote request.'; }
  catch { prepared.focus(); prepared.select(); copyStatus.textContent = 'Select and copy the enquiry above, then paste it into Checkatrade.'; }
});
