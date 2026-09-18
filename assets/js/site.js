const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.site-nav');

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    navigation.classList.toggle('is-open', !open);
  });
}

const intro = document.querySelector('[data-intro]');
const video = document.querySelector('[data-intro-video]');
const skip = document.querySelector('[data-intro-skip]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const introSeen = sessionStorage.getItem('mnemosyne-intro-seen') === 'true';

function closeIntro() {
  if (!intro || intro.classList.contains('intro--closing')) return;
  sessionStorage.setItem('mnemosyne-intro-seen', 'true');
  intro.classList.add('intro--closing');
  document.body.classList.remove('intro-active');
  window.setTimeout(() => {
    intro.hidden = true;
    video?.pause();
  }, 700);
}

if (intro && video && !reducedMotion && !introSeen) {
  intro.hidden = false;
  document.body.classList.add('intro-active');
  video.addEventListener('ended', closeIntro, { once: true });
  video.addEventListener('error', closeIntro, { once: true });
  skip?.addEventListener('click', closeIntro);
  video.play().catch(closeIntro);
} else if (intro) {
  intro.hidden = true;
}

