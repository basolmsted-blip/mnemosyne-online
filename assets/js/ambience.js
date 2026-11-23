function createHomepageAudio(button, soundtrack, isMobileDevice, status, { inheritTrack = false } = {}) {
  const key = 'mnemosyne.ambience.v1';
  function read() {
    try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; }
  }
  function save(value) {
    try { if (value) sessionStorage.setItem(key, JSON.stringify(value)); else sessionStorage.removeItem(key); } catch {}
  }
  const tracks = {
    '/assets/audio/homepage-ambience.wav': { volume: .22, name: 'Awestruck — isaiah658', url: 'https://opengameart.org/content/awestruck', license: 'CC0' },
    '/assets/audio/about-ambience-loop.mp3': { volume: .10, name: 'Nature Ambient — YuraSoop', url: 'https://pixabay.com/music/ambient-nature-ambient-329432/', license: 'Pixabay' }
  };
  const defaultPath = new URL(soundtrack.src, document.baseURI).pathname;
  let path = defaultPath;
  let context, scratch, request = 0, wanted = false;
  const audio = new Audio(); audio.loop = true; audio.preload = 'none'; audio.volume = 0;
  audio.addEventListener('playing', () => { button.dataset.playing = 'true'; });
  for (const event of ['pause', 'ended', 'error', 'waiting']) audio.addEventListener(event, () => { delete button.dataset.playing; });
  function display() { button.setAttribute('aria-pressed', String(wanted)); button.querySelector('span').textContent = wanted ? 'Sound On' : 'Sound Off'; }
  function stopWriting() { if (scratch) { try { scratch.stop(); } catch {} scratch = null; } delete button.dataset.writingActive; }
  function credit() {
    const line = document.querySelector('[data-sound-credit]');
    if (!line) return;
    const track = tracks[path], link = document.createElement('a');
    link.href = track.url; link.target = '_blank'; link.rel = 'noopener';
    link.textContent = track.name;
    line.replaceChildren(link, ' · ' + track.license);
  }
  function stop() {
    ++request; wanted = false; audio.pause(); stopWriting(); context?.suspend();
    save(null); path = defaultPath; credit(); display();
  }
  async function start(saved, fromClick = false) {
    if (isMobileDevice) return;
    const current = ++request;
    path = inheritTrack && saved && tracks[saved.path] ? saved.path : defaultPath;
    wanted = true; display(); credit();
    try {
      if (audio.getAttribute('src') !== path) audio.src = path;
      audio.currentTime = saved?.path === path ? Number(saved.time) || 0 : 0;
      audio.volume = tracks[path].volume;
      if (fromClick && !context && (window.AudioContext || window.webkitAudioContext)) {
        context = new (window.AudioContext || window.webkitAudioContext)();
      }
      context?.resume().catch(() => {});
      await audio.play();
      if (current !== request) return;
      save({path, time: audio.currentTime});
      status.textContent = '';
    } catch {
      if (current !== request) return;
      wanted = false; display();
      status.textContent = 'Select the sound control to resume playback.';
    }
  }
  function playWriting(seconds) {
    stopWriting(); if (!wanted || isMobileDevice || context?.state !== 'running') return;
    const length = Math.ceil(context.sampleRate * seconds), noise = context.createBuffer(1, length, context.sampleRate), samples = noise.getChannelData(0);
    for (let i = 0; i < length; i++) { const t = i / context.sampleRate, stroke = Math.max(0, Math.sin(t * 48) + .3 * Math.sin(t * 91)); samples[i] = (Math.random() * 2 - 1) * stroke * .025 * Math.min(1, t * 30, (seconds - t) * 20); }
    scratch = context.createBufferSource(); scratch.buffer = noise;
    const filter = context.createBiquadFilter(), gain = context.createGain(); filter.type = 'bandpass'; filter.frequency.value = 2200; filter.Q.value = .7; gain.gain.value = .45;
    scratch.connect(filter).connect(gain).connect(context.destination); const current = scratch; button.dataset.writingActive = 'true';
    current.onended = () => { current.disconnect(); filter.disconnect(); gain.disconnect(); if (scratch === current) { scratch = null; delete button.dataset.writingActive; } }; current.start();
  }
  button.addEventListener('click', () => wanted ? stop() : start(read(), true));
  window.addEventListener('pagehide', () => {
    if (wanted) save({path, time: audio.currentTime});
    ++request; wanted = false; audio.pause(); stopWriting();
  });
  function restore() {
    const saved = read();
    if (saved && tracks[saved.path]) start(saved);
    else display();
  }
  window.addEventListener('pageshow', event => { if (event.persisted) restore(); });
  restore();
  return { playWriting, stopWriting };
}

