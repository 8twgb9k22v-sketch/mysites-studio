const identity = document.querySelector('.identity-remix');
const identityPanel = identity.closest('.experiment');
const identityIndex = document.querySelector('.identity-index');
function remixIdentity() {
 const layout = (Number(identity.dataset.layout) + 1) % 3;
 identity.dataset.layout = String(layout);
 identityIndex.textContent = `0${layout + 1} / 03`;
}
identity.addEventListener('click', remixIdentity);
setInterval(() => {
 if (!document.hidden && !identityPanel.classList.contains('demo-paused') && identityPanel.dataset.demo === '3d') remixIdentity();
}, 3400);
