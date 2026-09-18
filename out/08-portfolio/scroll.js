import Lenis from './assets/vendor/lenis.mjs';

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let smooth;
function configureScroll() {
  smooth?.destroy();
  smooth = reduced.matches ? null : new Lenis({
    autoRaf: true,
    smoothWheel: true,
    syncTouch: false,
    lerp: .085,
    wheelMultiplier: .8,
    prevent: node => node.closest('dialog, textarea, [data-lenis-prevent]')
  });
}
configureScroll();
reduced.addEventListener('change', configureScroll);

// Use layout positions so the film's moving reveal doesn't shift anchor targets.
for (const link of document.querySelectorAll('a[href^="#"]')) {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute('href');
    const target = hash === '#' ? document.body : document.querySelector(hash);
    if (!target) return;
    event.preventDefault();
    history.replaceState(null, '', hash);
    const top = hash === '#' ? 0 : Math.max(0, target.offsetTop - (hash === '#work' ? 0 : 70));
    if (smooth) smooth.scrollTo(top, { duration: .9 });
    else window.scrollTo({ top, behavior: 'instant' });
    if (link.classList.contains('skip')) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
  });
}
