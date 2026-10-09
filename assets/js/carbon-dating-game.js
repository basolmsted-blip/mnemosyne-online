(() => {
  const root = document.querySelector('[data-carbon-game]');
  if (!root) return;

  const assetRoot = root.dataset.assetRoot;
  const discoveries = [
    {
      id: 'animal-bone', name: 'Animal Bone', image: 'carbon-game-animal-bone.png', round: 1, correctAnswer: 'lab',
      question: 'Can we radiocarbon date this animal bone?',
      correct: '<strong>Excellent!</strong> Bones contain carbon from the animals they belonged to. If enough original material has survived, scientists can use it to estimate when the animal died.',
      incorrect: '<strong>Take another look!</strong> Bones come from living animals, which contain carbon. If the original material survives, scientists can sometimes radiocarbon date it.'
    },
    {
      id: 'stone-tool', name: 'Stone Tool', image: 'carbon-game-stone-tool.png', round: 1, correctAnswer: 'not-suitable',
      question: 'Can we radiocarbon date this stone tool?',
      correct: '<strong>That\'s right!</strong> Stone was never alive, so we can\'t radiocarbon date the stone itself. But archaeologists might date charcoal or bones found in the same archaeological layer.',
      incorrect: '<strong>Not quite!</strong> This tool was made by people, but its material is stone. Stone itself cannot be radiocarbon dated using the usual method.'
    },
    {
      id: 'charcoal', name: 'Charcoal', image: 'carbon-game-charcoal.png', round: 1, correctAnswer: 'lab',
      question: 'Can we radiocarbon date this charcoal?',
      correct: '<strong>Great discovery!</strong> Charcoal is made from burned plants, often wood. Some of their original carbon survives burning, allowing scientists to investigate when the plant stopped taking in carbon.',
      incorrect: '<strong>Here\'s something interesting!</strong> Even though charcoal has been burned, it still contains carbon from the plants it came from. That\'s why archaeologists often send charcoal to radiocarbon laboratories.'
    },
    {
      id: 'iron-nail', name: 'Iron Nail', image: 'carbon-game-iron-nail.png', round: 1, correctAnswer: 'not-suitable',
      question: 'Can we radiocarbon date this iron nail?',
      correct: '<strong>Correct!</strong> Iron is a metal, not an organic material. An ordinary iron nail isn\'t suitable for standard radiocarbon dating, so archaeologists usually need other clues to investigate its age.',
      incorrect: '<strong>Not this one!</strong> The nail is made from iron. Although some specialized radiocarbon techniques can investigate carbon in certain iron objects, an ordinary iron nail isn\'t a good candidate for our laboratory.'
    },
    {
      id: 'rope', name: 'Rope', image: 'carbon-game-rope.png', round: 1, correctAnswer: 'lab',
      question: 'Can we radiocarbon date this rope?',
      correct: '<strong>Excellent!</strong> This rope was made from plant fibres. Those fibres once belonged to living plants, so they may contain carbon that scientists can use for radiocarbon dating.',
      incorrect: '<strong>Look closely at what the rope is made from!</strong> Ancient ropes were often made from plant fibres. Because plants were once alive, their fibres may be suitable for radiocarbon dating.'
    },
    {
      id: 'charred-grain', name: 'Charred Grain', image: 'carbon-game-charred-grain.png', round: 2, correctAnswer: 'lab',
      question: 'Can we radiocarbon date this ancient grain?',
      correct: '<strong>Excellent!</strong> This grain came from a living plant. When it burned, it became charcoal-like and could survive in the ground for thousands of years. Archaeologists often use charred seeds and grains for radiocarbon dating.',
      incorrect: '<strong>Here\'s a useful clue!</strong> This grain was once part of a living plant. Even after burning, it can preserve carbon that scientists can measure.'
    },
    {
      id: 'pottery', name: 'Pottery', image: 'carbon-game-pottery.png', round: 2, correctAnswer: 'not-suitable',
      question: 'Can we radiocarbon date this pottery?',
      correct: '<strong>That\'s right!</strong> The pottery itself is made from clay, which cannot normally be radiocarbon dated. But sometimes ancient food residue or soot stuck to a pot contains carbon that scientists can date! <em>Archaeologist\'s note: Sometimes the most useful clue isn\'t the object itself, but something stuck to it!</em>',
      incorrect: '<strong>Almost!</strong> The pottery is made from clay, which was never alive. But you might be onto something: organic residues stuck to pottery can sometimes be radiocarbon dated.'
    },
    {
      id: 'coin', name: 'Coin', image: 'carbon-game-coin.png', round: 2, correctAnswer: 'not-suitable',
      question: 'Can we radiocarbon date this coin?',
      correct: '<strong>Correct!</strong> Coins are usually made from metal, which isn\'t suitable for ordinary radiocarbon dating. But pictures, inscriptions, and the names of rulers can help archaeologists investigate when a coin was made.',
      incorrect: '<strong>Not this time!</strong> A metal coin cannot normally be radiocarbon dated. But archaeologists have another trick: they can examine its inscriptions and images for clues about its age.'
    },
    {
      id: 'shell', name: 'Shell', image: 'carbon-game-shell.png', round: 2, correctAnswer: 'lab',
      question: 'Can we radiocarbon date this shell?',
      correct: '<strong>Yes — but be careful!</strong> Shells contain carbon and can sometimes be radiocarbon dated. However, carbon from seawater can make them appear older than they really are. Scientists must take this into account when interpreting the results. <em>Archaeologist\'s note: Scientists call this the marine reservoir effect.</em>',
      incorrect: '<strong>This one\'s tricky!</strong> Shells are made by living organisms and contain carbon. They can sometimes be radiocarbon dated, although scientists need to be careful because seawater can affect the results.'
    }
  ];

  const tutorialObservations = {
    'animal-bone': ['Animal Bone', 'This bone once belonged to a living animal. Its material can sometimes preserve clues about when the animal died.'],
    pottery: ['Pottery', 'Someone shaped this vessel from clay and heated it in a fire. Clay comes from the earth, rather than from a living organism.'],
    'stone-tool': ['Stone Tool', 'Someone carefully shaped this piece of stone into a tool. The stone itself was never alive.']
  };
  const stageOrder = ['welcome', 'mystery', 'carbon-clock', 'practice', 'investigation', 'report', 'complete'];
  const stageNames = { welcome: 'Welcome', mystery: 'A Mystery of Time', 'carbon-clock': 'The Carbon-14 Clock', practice: 'Your First Discovery', investigation: 'The Dating Detective', report: 'Laboratory Report', 'final-question': 'One Final Mystery', complete: 'Mission Complete' };
  const state = { stage: 'welcome', examined: new Set(), practiceComplete: false, currentIndex: 0, answers: {}, unlockedNotes: new Set(), soundEnabled: false };
  let audioContext;

  const $ = (selector) => root.querySelector(selector);
  const $$ = (selector) => [...root.querySelectorAll(selector)];
  const announce = (message) => { $('[data-announcer]').textContent = ''; window.setTimeout(() => { $('[data-announcer]').textContent = message; }, 20); };

  function tone(kind) {
    if (!state.soundEnabled) return;
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const frequencies = { correct: [523, 659], incorrect: [330, 277], complete: [523, 659, 784] };
    const notes = frequencies[kind] || frequencies.correct;
    oscillator.connect(gain); gain.connect(audioContext.destination);
    oscillator.type = 'sine'; gain.gain.setValueAtTime(.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.08, audioContext.currentTime + .02);
    notes.forEach((frequency, index) => oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + index * .12));
    gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + notes.length * .12 + .18);
    oscillator.start(); oscillator.stop(audioContext.currentTime + notes.length * .12 + .2);
  }

  function showStage(name) {
    state.stage = name;
    $$('[data-stage]').forEach((stage) => { const active = stage.dataset.stage === name; stage.hidden = !active; stage.classList.toggle('is-active', active); });
    const progressName = name === 'final-question' ? 'report' : name;
    const index = Math.max(0, stageOrder.indexOf(progressName));
    $('[data-stage-label]').textContent = stageNames[name];
    $('.carbon-game__progress > span:nth-child(2)').textContent = `${index + 1} / 7`;
    $('[data-stage-progress]').style.width = `calc((100% - 3rem) * ${(index + 1) / 7})`;
    if (name === 'report') buildReport();
    if (name === 'complete') tone('complete');
    announce(stageNames[name]);
    root.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    const heading = root.querySelector(`[data-stage="${name}"] h1, [data-stage="${name}"] h2`);
    heading?.setAttribute('tabindex', '-1'); heading?.focus({ preventScroll: true });
  }

  $$('[data-go]').forEach((button) => button.addEventListener('click', () => showStage(button.dataset.go)));

  $$('[data-examine]').forEach((button) => button.addEventListener('click', () => {
    const id = button.dataset.examine;
    state.examined.add(id); button.classList.add('is-examined');
    const [title, copy] = tutorialObservations[id];
    $('[data-examine-feedback]').innerHTML = `<h3>${title}</h3><p>${copy}</p>`;
    if (state.examined.size === 3) $('[data-mystery-complete]').hidden = false;
    announce(`${title}. ${copy}`);
  }));

  $('[data-carbon-next]').addEventListener('click', () => {
    $('[data-carbon-screen="living"]').hidden = true; $('[data-carbon-screen="living"]').classList.remove('is-active');
    $('[data-carbon-screen="decay"]').hidden = false; $('[data-carbon-screen="decay"]').classList.add('is-active');
    $('[data-carbon-screen="decay"] h2').focus?.();
  });
  $('[data-carbon-back]').addEventListener('click', () => {
    $('[data-carbon-screen="decay"]').hidden = true; $('[data-carbon-screen="decay"]').classList.remove('is-active');
    $('[data-carbon-screen="living"]').hidden = false; $('[data-carbon-screen="living"]').classList.add('is-active');
  });
  const slider = $('[data-carbon-slider]');
  slider.addEventListener('input', () => {
    const years = Number(slider.value); const fraction = Math.pow(.5, years / 5730); const percent = fraction * 100;
    $('[data-carbon-percent]').textContent = `${percent < .1 ? percent.toFixed(2) : percent.toFixed(1)}%`;
    $('[data-carbon-meter]').style.width = `${percent}%`;
    $('[data-carbon-years]').textContent = `${years.toLocaleString()} years`;
    $('.carbon-meter').setAttribute('aria-label', `${percent.toFixed(1)} percent carbon-14 remaining after ${years.toLocaleString()} years`);
  });

  $$('[data-practice]').forEach((button) => button.addEventListener('click', () => {
    const correct = button.dataset.practice === 'animal-bone';
    const feedback = $('[data-practice-feedback]');
    $$('[data-practice]').forEach((item) => item.classList.remove('is-correct', 'is-incorrect'));
    button.classList.add(correct ? 'is-correct' : 'is-incorrect');
    feedback.className = `game-feedback ${correct ? 'is-correct' : 'is-incorrect'}`;
    if (correct) {
      feedback.innerHTML = '<h3>Excellent discovery!</h3><p>This bone came from a living animal. If enough of its original material survives, scientists may be able to radiocarbon date it!</p>';
      $('[data-practice-complete]').hidden = false; state.practiceComplete = true; tone('correct');
    } else {
      feedback.innerHTML = '<h3>Not quite!</h3><p>Stone was never alive, so we can\'t radiocarbon date the stone itself. But archaeologists can sometimes date other materials found nearby. Try again!</p>';
      tone('incorrect');
    }
  }));

  $('[data-start-round]').addEventListener('click', () => { $('[data-round-intro]').hidden = true; $('[data-investigation]').hidden = false; renderDiscovery(); });
  $('[data-continue-round]').addEventListener('click', () => { $('[data-round-transition]').hidden = true; $('[data-investigation]').hidden = false; renderDiscovery(); });

  function renderDiscovery() {
    const item = discoveries[state.currentIndex];
    $('[data-discovery-image]').src = `${assetRoot}${item.image}`;
    $('[data-discovery-image]').alt = item.name;
    $('[data-discovery-name]').textContent = item.name;
    $('[data-discovery-question]').textContent = item.question;
    $('[data-discovery-progress]').textContent = `${Object.keys(state.answers).length} / ${discoveries.length}`;
    $('[data-discovery-feedback]').hidden = true; $('[data-next-discovery]').hidden = true;
    $$('[data-answer]').forEach((button) => { button.disabled = false; button.classList.remove('is-selected'); });
  }

  $$('[data-answer]').forEach((button) => button.addEventListener('click', () => {
    const item = discoveries[state.currentIndex];
    if (state.answers[item.id]) return;
    const answer = button.dataset.answer; const correct = answer === item.correctAnswer;
    state.answers[item.id] = { answer, correct };
    if (item.id === 'pottery') state.unlockedNotes.add('pottery');
    if (item.id === 'shell') state.unlockedNotes.add('shell');
    button.classList.add('is-selected');
    $$('[data-answer]').forEach((answerButton) => { answerButton.disabled = true; });
    const feedback = $('[data-discovery-feedback]');
    feedback.hidden = false; feedback.className = `game-feedback ${correct ? 'is-correct' : 'is-incorrect'}`;
    feedback.innerHTML = `<h3>${correct ? 'Good detective work' : 'A useful discovery'}</h3><p>${correct ? item.correct : item.incorrect}</p><p><strong>Classification:</strong> ${item.correctAnswer === 'lab' ? 'Send to the laboratory' : 'Investigate using other methods'}.</p>`;
    $('[data-next-discovery]').hidden = false;
    $('[data-discovery-progress]').textContent = `${Object.keys(state.answers).length} / ${discoveries.length}`;
    tone(correct ? 'correct' : 'incorrect'); announce(`Answer recorded. ${correct ? 'Correct.' : 'The explanation reveals the classification.'}`);
  }));

  $('[data-next-discovery]').addEventListener('click', () => {
    if (state.currentIndex === 4) {
      state.currentIndex = 5; $('[data-investigation]').hidden = true; $('[data-round-transition]').hidden = false; return;
    }
    if (state.currentIndex === discoveries.length - 1) { showStage('report'); return; }
    state.currentIndex += 1; renderDiscovery();
  });

  function buildReport() {
    ['lab', 'not-suitable'].forEach((classification) => {
      const container = root.querySelector(`[data-lab-items="${classification}"]`);
      container.innerHTML = discoveries.filter((item) => item.correctAnswer === classification).map((item) => {
        const result = state.answers[item.id];
        return `<article class="lab-card"><img src="${assetRoot}${item.image}" alt="${item.name}"><h4>${item.name}</h4><p>${classification === 'lab' ? '✓ Send to laboratory' : '⌕ Use other methods'}</p><p>${result?.correct ? '✓ Your first answer was correct' : '○ You learned from this discovery'}</p><details><summary>Review explanation</summary><p>${item.correct}</p></details></article>`;
      }).join('');
    });
  }

  $$('[data-final-answer]').forEach((button) => button.addEventListener('click', () => {
    $$('[data-final-answer]').forEach((choice) => { choice.disabled = true; }); button.classList.add('is-selected');
    const correct = button.dataset.finalAnswer === 'yes'; const feedback = $('[data-final-feedback]');
    feedback.hidden = false; feedback.className = `game-feedback ${correct ? 'is-correct' : 'is-incorrect'}`;
    feedback.innerHTML = correct
      ? '<h3>Excellent reasoning!</h3><p>Yes, it could! If the charcoal and stone tool were deposited around the same time, dating the charcoal could help archaeologists investigate the age of the tool\'s archaeological context. But we must be careful: finding two objects together doesn\'t automatically mean they\'re the same age.</p>'
      : '<h3>Think about their context!</h3><p>We can\'t radiocarbon date the stone itself, but the charcoal might help us investigate the age of the archaeological layer. If both discoveries belong to the same period of activity, the charcoal could provide an important clue.</p>';
    $('[data-final-complete]').hidden = false; tone(correct ? 'correct' : 'incorrect');
  }));

  const notesDialog = $('[data-notes-dialog]');
  $('[data-notes-open]').addEventListener('click', () => {
    const unlocked = $('[data-unlocked-notes]'); const notes = [];
    if (state.unlockedNotes.has('pottery')) notes.push('Sometimes organic material stuck to an object can be dated even when the object itself cannot.');
    if (state.unlockedNotes.has('shell')) notes.push('Shells can contain carbon from water. Scientists must account for this when interpreting radiocarbon results.');
    unlocked.innerHTML = notes.map((note) => `<p class="field-note-unlocked">${note}</p>`).join('');
    notesDialog.showModal();
  });
  $('[data-sound-toggle]').addEventListener('click', (event) => {
    state.soundEnabled = !state.soundEnabled;
    event.currentTarget.setAttribute('aria-pressed', String(state.soundEnabled));
    event.currentTarget.querySelector('[data-sound-icon]').textContent = state.soundEnabled ? '🔊' : '🔇';
    event.currentTarget.querySelector('[data-sound-label]').textContent = state.soundEnabled ? 'Sound on' : 'Sound off';
    if (state.soundEnabled) tone('correct');
  });
  $('[data-print]').addEventListener('click', () => window.print());
  $('[data-restart]').addEventListener('click', () => window.location.reload());
})();
