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

const carousel = document.querySelector('[data-article-carousel]');

if (carousel) {
  const track = carousel.querySelector('[data-carousel-track]');
  const slides = [...carousel.querySelectorAll('[data-carousel-slide]')];
  const previous = carousel.querySelector('[data-carousel-previous]');
  const next = carousel.querySelector('[data-carousel-next]');
  const status = carousel.querySelector('[data-carousel-status]');
  let active = 0;
  let timer;

  const showSlide = (index) => {
    active = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${active * 100}%)`;
    slides.forEach((slide, slideIndex) => {
      const hidden = slideIndex !== active;
      slide.setAttribute('aria-hidden', String(hidden));
      slide.toggleAttribute('inert', hidden);
    });
    if (status) status.textContent = `${active + 1} / ${slides.length}`;
  };

  const stopRotation = () => window.clearInterval(timer);
  const startRotation = () => {
    stopRotation();
    if (slides.length > 1 && !reducedMotion) timer = window.setInterval(() => showSlide(active + 1), 7000);
  };

  previous?.addEventListener('click', () => { showSlide(active - 1); startRotation(); });
  next?.addEventListener('click', () => { showSlide(active + 1); startRotation(); });
  carousel.addEventListener('mouseenter', stopRotation);
  carousel.addEventListener('mouseleave', startRotation);
  carousel.addEventListener('focusin', stopRotation);
  carousel.addEventListener('focusout', startRotation);
  startRotation();
}
