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

const siteHeader = document.querySelector('[data-site-header]');

if (siteHeader && document.body.classList.contains('home-page')) {
  const updateHeader = () => siteHeader.classList.toggle('is-scrolled', window.scrollY > 48);
  updateHeader();
  window.requestAnimationFrame(updateHeader);
  window.addEventListener('load', updateHeader);
  window.addEventListener('hashchange', updateHeader);
  window.addEventListener('scroll', updateHeader, { passive: true });
}

const objectFocus = document.querySelector('[data-object-focus]');

if (objectFocus) {
  const dataNode = objectFocus.querySelector('[data-object-data]');
  const hotspots = JSON.parse(dataNode?.textContent || '[]');
  const visited = new Set();
  const markerButtons = [...objectFocus.querySelectorAll('[data-hotspot]')];
  const indexButtons = [...objectFocus.querySelectorAll('[data-index]')];
  const openingPanel = objectFocus.querySelector('[data-opening-panel]');
  const interpretation = objectFocus.querySelector('[data-interpretation]');
  const pointLabel = objectFocus.querySelector('[data-point-label]');
  const pointTitle = objectFocus.querySelector('[data-point-title]');
  const pointShort = objectFocus.querySelector('[data-point-short]');
  const pointLong = objectFocus.querySelector('[data-point-long]');
  const moreButton = objectFocus.querySelector('[data-more]');
  const counter = objectFocus.querySelector('[data-counter]');
  const sideLabel = objectFocus.querySelector('[data-side-label]');
  const modeToggle = objectFocus.querySelector('[data-mode-toggle]');
  const conclusion = objectFocus.querySelector('[data-conclusion]');
  const detail = objectFocus.querySelector('[data-point-detail]');
  const detailImage = objectFocus.querySelector('[data-detail-image]');
  const detailCaption = objectFocus.querySelector('[data-detail-caption]');
  let activeIndex = -1;
  let currentSide = 'verso';

  const paragraphMarkup = (paragraphs = []) => paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('');

  function showSide(side) {
    currentSide = side;
    objectFocus.classList.toggle('is-recto', side === 'recto');
    objectFocus.querySelectorAll('[data-object-image]').forEach((image) => {
      const active = image.dataset.objectImage === side;
      image.hidden = !active;
      image.classList.toggle('is-active', active);
    });
    if (sideLabel) sideLabel.textContent = side === 'recto' ? 'Recto · Apricot' : 'Verso · Banana and orange';
    if (modeToggle) {
      modeToggle.setAttribute('aria-pressed', String(side === 'recto'));
      modeToggle.textContent = side === 'recto' ? 'View verso' : 'Turn the page';
    }
  }

  function unlockEligiblePoints() {
    objectFocus.querySelectorAll('[data-unlock-after][hidden]').forEach((button) => {
      if (visited.size >= Number(button.dataset.unlockAfter)) {
        button.hidden = false;
        button.classList.remove('is-locked');
        button.classList.add('is-unlocking');
      }
    });
  }

  function selectPoint(index, options = {}) {
    const hotspot = hotspots[index];
    if (!hotspot) return;
    if (hotspot.unlock_after && visited.size < Number(hotspot.unlock_after)) return;

    activeIndex = index;
    visited.add(hotspot.id);
    objectFocus.classList.add('is-exploring');
    openingPanel.hidden = true;
    interpretation.hidden = false;
    showSide(hotspot.side || 'verso');

    pointLabel.textContent = hotspot.type === 'page-turn'
      ? `Object interaction · ${String(hotspot.number).padStart(2, '0')}`
      : `Point ${String(hotspot.number).padStart(2, '0')}`;
    pointTitle.textContent = hotspot.title;
    pointShort.innerHTML = paragraphMarkup(hotspot.short);
    pointLong.innerHTML = paragraphMarkup(hotspot.long);
    pointLong.hidden = true;
    moreButton.hidden = !(hotspot.long && hotspot.long.length);
    moreButton.textContent = 'Why does this matter?';
    counter.textContent = `${hotspot.number} / ${hotspots.length}`;

    if (hotspot.detail_image) {
      detail.hidden = false;
      detailImage.src = hotspot.detail_image;
      detailImage.alt = hotspot.detail_image_alt || '';
      detailCaption.textContent = hotspot.detail_caption || '';
    } else {
      detail.hidden = true;
      detailImage.removeAttribute('src');
      detailImage.alt = '';
      detailCaption.textContent = '';
    }

    markerButtons.forEach((button) => {
      const selected = Number(button.dataset.hotspot) === index;
      const wasVisited = visited.has(hotspots[Number(button.dataset.hotspot)]?.id);
      button.classList.toggle('is-active', selected);
      button.classList.toggle('is-visited', wasVisited);
      button.setAttribute('aria-pressed', String(selected));
    });
    indexButtons.forEach((button) => {
      const selected = Number(button.dataset.index) === index;
      const wasVisited = visited.has(hotspots[Number(button.dataset.index)]?.id);
      button.classList.toggle('is-active', selected);
      button.classList.toggle('is-visited', wasVisited);
      button.setAttribute('aria-current', selected ? 'true' : 'false');
    });

    unlockEligiblePoints();
    if (options.scroll) {
      window.requestAnimationFrame(() => {
        pointTitle.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      });
    }
    if (options.focus) pointTitle.focus?.();
  }

  objectFocus.querySelector('[data-explore]')?.addEventListener('click', () => selectPoint(0, { scroll: true }));
  markerButtons.forEach((button) => button.addEventListener('click', () => selectPoint(Number(button.dataset.hotspot), { scroll: true })));
  indexButtons.forEach((button) => button.addEventListener('click', () => selectPoint(Number(button.dataset.index), { scroll: true })));

  modeToggle?.addEventListener('click', () => {
    if (currentSide === 'verso') {
      const rectoIndex = hotspots.findIndex((hotspot) => hotspot.type === 'page-turn');
      selectPoint(rectoIndex, { scroll: true });
    } else {
      showSide('verso');
    }
  });

  moreButton?.addEventListener('click', () => {
    const expanding = pointLong.hidden;
    pointLong.hidden = !expanding;
    moreButton.textContent = expanding ? 'Close deeper interpretation' : 'Why does this matter?';
    moreButton.setAttribute('aria-expanded', String(expanding));
  });

  objectFocus.querySelector('[data-previous]')?.addEventListener('click', () => {
    let index = activeIndex;
    do index = (index - 1 + hotspots.length) % hotspots.length;
    while (hotspots[index].unlock_after && visited.size < Number(hotspots[index].unlock_after));
    selectPoint(index);
  });

  objectFocus.querySelector('[data-next]')?.addEventListener('click', () => {
    let index = activeIndex;
    do index = (index + 1) % hotspots.length;
    while (hotspots[index].unlock_after && visited.size < Number(hotspots[index].unlock_after));
    selectPoint(index);
  });

  objectFocus.querySelector('[data-whole]')?.addEventListener('click', () => {
    showSide('verso');
    objectFocus.classList.add('is-concluding');
    conclusion?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    conclusion?.focus({ preventScroll: true });
  });
}

const objectsCarousel = document.querySelector('[data-objects-carousel]');

if (objectsCarousel) {
  const carouselTrack = objectsCarousel.querySelector('[data-carousel-track]');
  const carouselSlides = [...objectsCarousel.querySelectorAll('[data-carousel-slide]')];
  const carouselStatus = objectsCarousel.querySelector('[data-carousel-status]');
  const previousObject = objectsCarousel.querySelector('[data-carousel-previous]');
  const nextObject = objectsCarousel.querySelector('[data-carousel-next]');
  let carouselIndex = 0;
  let carouselTimer;

  function showObjectSlide(index) {
    carouselIndex = (index + carouselSlides.length) % carouselSlides.length;
    carouselTrack.style.transform = `translateX(-${carouselIndex * 100}%)`;
    carouselSlides.forEach((slide, slideIndex) => {
      const active = slideIndex === carouselIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.querySelectorAll('a, button').forEach((control) => {
        control.tabIndex = active ? 0 : -1;
      });
    });
    if (carouselStatus) carouselStatus.textContent = `${carouselIndex + 1} / ${carouselSlides.length}`;
  }

  function stopCarousel() {
    window.clearInterval(carouselTimer);
  }

  function startCarousel() {
    stopCarousel();
    if (carouselSlides.length > 1 && !reducedMotion) {
      carouselTimer = window.setInterval(() => showObjectSlide(carouselIndex + 1), 8000);
    }
  }

  previousObject?.addEventListener('click', () => {
    showObjectSlide(carouselIndex - 1);
    startCarousel();
  });
  nextObject?.addEventListener('click', () => {
    showObjectSlide(carouselIndex + 1);
    startCarousel();
  });
  objectsCarousel.addEventListener('mouseenter', stopCarousel);
  objectsCarousel.addEventListener('mouseleave', startCarousel);
  objectsCarousel.addEventListener('focusin', stopCarousel);
  objectsCarousel.addEventListener('focusout', startCarousel);

  showObjectSlide(0);
  startCarousel();
}
