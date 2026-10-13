(() => {
  const root = document.querySelector('[data-food-game]');
  if (!root) return;

  const assetRoot = root.dataset.assetRoot;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, scope = root) => scope.querySelector(selector);
  const $$ = (selector, scope = root) => [...scope.querySelectorAll(selector)];
  const stageOrder = ['welcome', 'introduction', 'excavation', 'menu', 'complete'];
  const stageNames = {
    welcome: 'A Mystery Beneath the Ground',
    introduction: 'A Mystery Beneath the Ground',
    excavation: 'Explore the Excavation',
    investigation: 'Examine the Evidence',
    menu: 'The Ancient Menu',
    reconstruct: 'The Ancient Menu',
    reflection: 'Case Closed?',
    complete: 'Case Closed?'
  };

  const introductions = [
    '<h2>A Mystery Beneath the Ground</h2><p>Archaeologists have discovered the remains of an ancient settlement!</p><p>Thousands of years ago, people lived here, prepared their food, and gathered around cooking fires.</p><p><strong>But there\'s a mystery waiting to be solved...</strong></p>',
    '<h2>What did these people eat?</h2><p>Nobody left behind a recipe, a menu, or a photograph.</p><p>But archaeologists have discovered something almost as useful: <strong>evidence!</strong></p>',
    '<h2>Your mission</h2><p>Investigate the excavation, recover clues, and discover what the people of this settlement might have eaten.</p><p>You\'ll need sharp eyes, careful thinking, and a little archaeological detective work.</p>',
    '<h2>Ready, archaeologist?</h2><p>Grab your magnifying glass. Your investigation begins now!</p>'
  ];

  const artifacts = {
    grains: {
      name: 'Charred Cereal Grains', image: 'food-game-charred-grains.png', short: 'the fireplace',
      title: 'The Charred Grains',
      opening: '<p>You\'ve discovered something tiny among the remains of the ancient fireplace!</p><p>These little black objects appear to be charred cereal grains. But why would grains survive underground for thousands of years?</p>',
      question: 'What helped these grains survive?',
      answers: [['a', 'They were turned into gold.'], ['b', 'They were charred by fire.'], ['c', 'They were preserved by sunlight.']], correct: 'b',
      correctCopy: '<strong>Exactly!</strong> When plant remains are heated under certain conditions, they can become carbonized. Carbonization can help preserve grains that would otherwise decay in the soil.',
      incorrectCopy: '<strong>Not quite!</strong> Most plant remains eventually decompose, but fire can sometimes transform them into something that survives much longer. Try again!',
      observation: 'Small, blackened cereal grains were recovered from the fireplace.',
      interpretation: 'Cereal plants were present at the settlement and exposed to heat.',
      uncertainty: 'Were these grains deliberately cooked, accidentally burned, or discarded?',
      hints: ['Some ancient foods survived because they were exposed to fire.', 'Where might people have cooked their meals?', 'Look carefully around the fireplace.']
    },
    lentils: {
      name: 'Carbonized Lentils', image: 'food-game-lentils.png', short: 'the storage pit',
      title: 'The Storage Pit',
      opening: '<p>You\'ve discovered a collection of tiny plant remains inside an ancient pit!</p><p>Archaeobotanists have identified them as carbonized lentils. What might this discovery tell us?</p>',
      question: 'What can archaeologists reasonably conclude?',
      answers: [['a', 'Lentils were present at the settlement.'], ['b', 'Everyone ate lentil soup every day.'], ['c', 'The settlement\'s inhabitants invented lentils.']], correct: 'a',
      correctCopy: '<strong>Excellent!</strong> The lentils tell us that this plant was present at the settlement. But we cannot know exactly how people prepared them simply by finding their remains.',
      incorrectCopy: '<strong>Interesting idea!</strong> But does the evidence really tell us that much? Archaeologists must be careful not to make claims that go beyond their discoveries.',
      observation: 'Carbonized lentil remains were recovered from the pit.', interpretation: 'Lentils were present at the settlement.', uncertainty: 'Were they stored here, discarded, or deposited for another reason?',
      hints: ['People sometimes kept food in special places.', 'Archaeologists have discovered ancient storage pits.', 'Look inside the circular pit.']
    },
    bones: {
      name: 'Animal Bones with Cut Marks', image: 'food-game-animal-bone.png', short: 'the upper-right bone scatter',
      title: 'The Animal Bones',
      opening: '<p>You\'ve discovered a collection of animal bones!</p><p>Laboratory analysis identifies small marks on several bones as cut marks made by sharp tools.</p>',
      question: 'What might cut marks on animal bones suggest?',
      answers: [['a', 'The animals could talk.'], ['b', 'People may have butchered the animals.'], ['c', 'The bones were used to build the house.']], correct: 'b',
      correctCopy: '<strong>That\'s right!</strong> Cut marks can provide evidence that people used tools to remove meat or process animal carcasses. Archaeologists who study animal remains are called zooarchaeologists.',
      incorrectCopy: '<strong>Look carefully at the evidence.</strong> Why might someone use a sharp tool against an animal bone?',
      observation: 'Animal bones were recovered with marks consistent with butchery.', interpretation: 'People likely processed animals at the settlement.', uncertainty: 'Which animals were processed, and how was their meat prepared?',
      hints: ['Not all archaeological discoveries are made from stone or pottery.', 'Animal remains can tell us about ancient diets.', 'Look near the upper-right edge of the excavation.']
    },
    pottery: {
      name: 'Ancient Ceramic Vessel', image: 'food-game-pottery.png', short: 'the vessel beside the storage pit',
      title: 'The Ancient Pottery Vessel',
      opening: '<p>You\'ve found an ancient ceramic vessel!</p><p>Pottery is a common discovery during excavations. But how can a vessel help us investigate ancient food?</p>',
      question: 'What might an ancient pottery vessel have been used for?',
      answers: [['a', 'Cooking, storing, or serving food.'], ['b', 'Sending emails.'], ['c', 'Driving across the countryside.']], correct: 'a',
      correctCopy: '<strong>Exactly!</strong> Pottery vessels could serve many purposes, including cooking, storing, and serving food. Sometimes chemical residues can offer clues, although no residue analysis was performed here.',
      incorrectCopy: '<strong>Think about the containers we use today.</strong> What might ancient people have needed containers for?',
      observation: 'An ancient ceramic vessel was recovered from the settlement.', interpretation: 'The vessel may have been used for cooking, storage, serving, or another purpose.', uncertainty: 'What did the vessel contain?',
      hints: ['Ancient people needed containers, just like we do.', 'Pottery vessels can preserve clues about food preparation.', 'Look just to the left of the storage pit.']
    },
    grinding: {
      name: 'Grinding Stone', image: 'food-game-grinding-stone.png', short: 'the central excavation floor',
      title: 'The Grinding Stone',
      opening: '<p>You\'ve discovered a large stone with a smaller stone resting on top!</p><p>The surfaces appear worn and smooth. What might people have used these stones for?</p>',
      question: 'What is a likely use for this object?',
      answers: [['a', 'Grinding grains into flour or meal.'], ['b', 'Writing letters.'], ['c', 'Measuring the stars.']], correct: 'a',
      correctCopy: '<strong>Well done!</strong> Grinding stones were used to process plant foods, including cereal grains. Crushing grains into smaller pieces could help prepare foods such as bread or porridge.',
      incorrectCopy: '<strong>Imagine moving the smaller stone back and forth.</strong> What might happen to grains placed between the two stones?',
      observation: 'A stone grinding implement was recovered.', interpretation: 'People may have processed plant foods here.', uncertainty: 'Which plants were ground, and what foods were prepared from them?',
      hints: ['How might someone crush grains without a machine?', 'Some ancient tools were made from heavy stones.', 'Look near the center of the excavation.']
    }
  };

  const dishes = {
    flatbread: { name: 'Flatbread', image: 'food-game-flatbread.png', question: 'Could the people at this settlement have prepared something like flatbread?', required: ['grains', 'grinding'], classification: 'Plausible reconstruction', supported: true, feedback: 'A convincing possibility! Cereal grains and a grinding tool are consistent with cereal-based foods, including bread. But we have not found ancient bread here, so we cannot be certain.' },
    lentilDish: { name: 'Lentil Dish', image: 'food-game-lentil-soup.png', question: 'Could the settlement\'s inhabitants have prepared a dish using lentils?', required: ['lentils'], classification: 'Plausible reconstruction', supported: true, feedback: 'Excellent reasoning! Lentils make a lentil-based dish reasonable, and pottery may have helped prepare or store food. We do not know whether the lentils were boiled, roasted, ground, or prepared another way.' },
    meat: { name: 'Roasted Meat', image: 'food-game-roasted-meat.png', question: 'Could people have prepared roasted meat?', required: ['bones'], classification: 'Plausible reconstruction', supported: true, feedback: 'That is a reasonable interpretation! Cut marks suggest people processed animals, and the site has a fireplace. Together those clues make roasted meat plausible, but do not prove these bones were cooked over this fire.' },
    fish: { name: 'Fish', image: 'food-game-fish.png', question: 'What about fish? Could it have been on the menu?', required: [], classification: 'Not demonstrated', supported: false, feedback: 'People have eaten fish for thousands of years, but this excavation has no identified fish remains. That does not mean fish was impossible. It only means we do not have enough evidence to include it confidently.' },
    cake: { name: 'Chocolate Cake', image: 'food-game-chocolate-cake.png', question: 'Could the inhabitants have prepared chocolate cake?', required: [], classification: 'Unsupported reconstruction', supported: false, feedback: 'A surprising idea! But we found no evidence for the ingredients or preparation methods needed for this much more recent culinary tradition. Archaeologists consider both discoveries and wider historical context.' }
  };

  const state = { stage: 'welcome', introIndex: 0, discovered: new Set(), completed: new Set(), currentArtifact: null, hints: {}, evaluated: new Set(), currentDish: null, selectedEvidence: new Set(), sound: true };
  try { if (sessionStorage.getItem('mnemosyne-food-sound') === 'off') state.sound = false; } catch {}
  let audioContext;
  let ambientNodes = [];
  let birdTimer;

  function announce(message) {
    const node = $('[data-food-announcer]'); node.textContent = '';
    window.setTimeout(() => { node.textContent = message; }, 20);
  }

  function tone(kind) {
    if (!state.sound) return;
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const notes = { click: [330], discover: [659, 784], correct: [523, 659], incorrect: [300, 260], complete: [523, 659, 784, 1046] }[kind] || [440];
    const start = audioContext.currentTime;
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator(); const gain = audioContext.createGain();
      oscillator.connect(gain); gain.connect(audioContext.destination); oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, start + index * .1); gain.gain.exponentialRampToValueAtTime(.055, start + index * .1 + .012); gain.gain.exponentialRampToValueAtTime(.0001, start + index * .1 + .16);
      oscillator.start(start + index * .1); oscillator.stop(start + index * .1 + .18);
    });
  }

  function stopAmbient() {
    window.clearTimeout(birdTimer);
    birdTimer = undefined;
    ambientNodes.forEach((node) => {
      try { node.stop?.(); } catch {}
      try { node.disconnect?.(); } catch {}
    });
    ambientNodes = [];
  }

  function startAmbient() {
    if (!state.sound || state.stage !== 'excavation' || ambientNodes.length) return;
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * .38;
    const breeze = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    breeze.buffer = buffer; breeze.loop = true; filter.type = 'lowpass'; filter.frequency.value = 900; gain.gain.value = .018;
    breeze.connect(filter); filter.connect(gain); gain.connect(audioContext.destination); breeze.start();
    ambientNodes = [breeze, filter, gain];
    const birdPatterns = [
      [{ at: 0, from: 1650, to: 2350, length: .11 }, { at: .14, from: 1880, to: 2680, length: .1 }],
      [{ at: 0, from: 2800, to: 2050, length: .16, type: 'triangle' }, { at: .2, from: 2550, to: 1850, length: .18, type: 'triangle' }],
      [{ at: 0, from: 1350, to: 2050, length: .08 }, { at: .1, from: 2050, to: 1540, length: .08 }, { at: .2, from: 1480, to: 2300, length: .1 }],
      [{ at: 0, from: 980, to: 1160, length: .24, type: 'triangle' }, { at: .3, from: 920, to: 1080, length: .26, type: 'triangle' }],
      [{ at: 0, from: 3200, to: 3900, length: .07 }, { at: .09, from: 3000, to: 3700, length: .07 }, { at: .18, from: 3350, to: 4100, length: .08 }, { at: .29, from: 2850, to: 3500, length: .08 }]
    ];
    const birdCall = () => {
      if (!state.sound || state.stage !== 'excavation') return;
      const now = audioContext.currentTime;
      const pattern = birdPatterns[Math.floor(Math.random() * birdPatterns.length)];
      const pan = Math.random() * 1.4 - .7;
      pattern.forEach((note) => {
        const oscillator = audioContext.createOscillator(); const chirpGain = audioContext.createGain();
        const panner = audioContext.createStereoPanner?.();
        oscillator.type = note.type || 'sine'; oscillator.frequency.setValueAtTime(note.from, now + note.at); oscillator.frequency.exponentialRampToValueAtTime(note.to, now + note.at + note.length * .78);
        chirpGain.gain.setValueAtTime(.0001, now + note.at); chirpGain.gain.exponentialRampToValueAtTime(.018 + Math.random() * .014, now + note.at + .012); chirpGain.gain.exponentialRampToValueAtTime(.0001, now + note.at + note.length);
        oscillator.connect(chirpGain);
        if (panner) { panner.pan.value = pan; chirpGain.connect(panner); panner.connect(audioContext.destination); } else chirpGain.connect(audioContext.destination);
        oscillator.start(now + note.at); oscillator.stop(now + note.at + note.length + .02);
      });
      birdTimer = window.setTimeout(birdCall, 3200 + Math.random() * 6200);
    };
    birdTimer = window.setTimeout(birdCall, 900);
  }

  function celebrate() {
    if (reducedMotion) return;
    const layer = document.createElement('div'); layer.className = 'kids-confetti'; layer.setAttribute('aria-hidden', 'true');
    const colors = ['#d8aa59', '#34483b', '#d9987b', '#a9c8d7', '#bcc7a3'];
    layer.innerHTML = Array.from({ length: 70 }, (_, index) => `<i style="--x:${Math.random() * 100}%;--delay:${Math.random() * .8}s;--duration:${2.2 + Math.random() * 1.8}s;--spin:${240 + Math.random() * 720}deg;--color:${colors[index % colors.length]}"></i>`).join('');
    document.body.append(layer); window.setTimeout(() => layer.remove(), 5000);
  }

  function stageIndex(name) {
    if (['welcome', 'introduction'].includes(name)) return 0;
    if (['excavation'].includes(name)) return 1;
    if (['investigation'].includes(name)) return 2;
    if (['menu', 'reconstruct'].includes(name)) return 3;
    return 4;
  }

  function showStage(name) {
    if (state.stage === 'excavation' && name !== 'excavation') stopAmbient();
    state.stage = name;
    $$('[data-food-stage]').forEach((stage) => { const active = stage.dataset.foodStage === name; stage.hidden = !active; stage.classList.toggle('is-active', active); });
    const index = stageIndex(name);
    $('[data-food-stage-label]').textContent = stageNames[name];
    $('[data-food-stage-count]').textContent = `${index + 1} / 5`;
    $('[data-food-progress]').style.width = `calc((100% - 3rem) * ${(index + 1) / 5})`;
    if (name === 'excavation') { window.setTimeout(updateMagnifier, 50); if ($('[data-food-tutorial]').hidden) startAmbient(); }
    if (name === 'menu') renderDishes();
    if (name === 'reconstruct') renderReconstruction();
    if (name === 'complete') { tone('complete'); celebrate(); }
    const heading = $(`[data-food-stage="${name}"] h1, [data-food-stage="${name}"] h2`);
    root.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    window.setTimeout(() => { heading?.setAttribute('tabindex', '-1'); heading?.focus({ preventScroll: true }); }, reducedMotion ? 0 : 350);
    announce(stageNames[name]); tone('click');
  }

  $$('[data-food-go]').forEach((button) => button.addEventListener('click', () => showStage(button.dataset.foodGo)));

  function renderIntroduction() {
    $('[data-food-dialogue-copy]').innerHTML = introductions[state.introIndex];
    $('[data-food-dialogue-step]').textContent = `${state.introIndex + 1} / ${introductions.length}`;
    $('[data-food-dialogue-next]').innerHTML = state.introIndex === introductions.length - 1 ? 'Enter the Excavation <span aria-hidden="true">→</span>' : 'Continue <span aria-hidden="true">→</span>';
  }
  renderIntroduction();
  $('[data-food-dialogue-next]').addEventListener('click', () => { if (state.introIndex < introductions.length - 1) { state.introIndex += 1; renderIntroduction(); tone('click'); } else showStage('excavation'); });
  $('[data-food-skip]').addEventListener('click', () => showStage('excavation'));
  $('[data-food-tutorial-close]').addEventListener('click', (event) => {
    if (state.completed.size === Object.keys(artifacts).length) { showStage('menu'); return; }
    $('[data-food-tutorial]').hidden = true; announce('Search the excavation for five clues.'); tone('click'); startAmbient(); event.currentTarget.blur();
  });

  const excavation = $('[data-food-excavation]'); const magnifier = $('[data-food-magnifier]'); const zoomScene = $('[data-food-zoom-scene]');
  let pointer = { x: 0, y: 0 };
  function updateMagnifier(event) {
    const rect = excavation.getBoundingClientRect(); if (!rect.width) return;
    if (event) { pointer.x = Math.max(rect.width * .09, Math.min(rect.width * .91, event.clientX - rect.left)); pointer.y = Math.max(rect.height * .12, Math.min(rect.height * .88, event.clientY - rect.top)); }
    else if (!pointer.x) { pointer.x = rect.width * .5; pointer.y = rect.height * .5; }
    magnifier.style.left = `${pointer.x}px`; magnifier.style.top = `${pointer.y}px`;
    const lens = $('.food-magnifier__lens', magnifier); const lensRect = lens.getBoundingClientRect(); const zoom = 2.5;
    zoomScene.style.width = `${rect.width}px`; zoomScene.style.height = `${rect.height}px`;
    zoomScene.style.transform = `translate(${lensRect.width / 2 - pointer.x * zoom}px, ${lensRect.height / 2 - pointer.y * zoom}px) scale(${zoom})`;
  }
  excavation.addEventListener('pointermove', updateMagnifier);
  excavation.addEventListener('pointerenter', (event) => { magnifier.hidden = false; updateMagnifier(event); });
  excavation.addEventListener('pointerleave', (event) => { if (event.pointerType !== 'touch') magnifier.hidden = true; });
  window.addEventListener('resize', () => { if (state.stage === 'excavation') updateMagnifier(); });

  function openArtifact(id) {
    const item = artifacts[id]; state.currentArtifact = id; state.discovered.add(id); tone('discover');
    $('[data-investigation-image]').src = `${assetRoot}${item.image}`; $('[data-investigation-image]').alt = item.name; $('[data-investigation-name]').textContent = item.name;
    $('[data-investigation-title]').textContent = item.title; $('[data-investigation-opening]').innerHTML = item.opening; $('[data-investigation-question]').textContent = item.question;
    $('[data-investigation-answers]').innerHTML = item.answers.map(([value, label]) => `<button type="button" data-investigation-answer="${value}">${value.toUpperCase()}. ${label}</button>`).join('');
    $('[data-investigation-feedback]').hidden = true; $('[data-investigation-return]').hidden = true;
    $$('[data-investigation-answer]').forEach((button) => button.addEventListener('click', () => answerInvestigation(button.dataset.investigationAnswer)));
    showStage('investigation'); announce(`You've discovered ${item.name}.`);
  }
  $$('[data-artifact]').forEach((button) => button.addEventListener('click', () => openArtifact(button.dataset.artifact)));

  function answerInvestigation(answer) {
    const item = artifacts[state.currentArtifact]; const correct = answer === item.correct; const feedback = $('[data-investigation-feedback]');
    feedback.hidden = false; feedback.className = `game-feedback ${correct ? 'is-correct' : 'is-incorrect'}`; feedback.innerHTML = `<p>${correct ? item.correctCopy : item.incorrectCopy}</p>`;
    if (correct) { $$('[data-investigation-answer]').forEach((button) => { button.disabled = true; button.classList.toggle('is-selected', button.dataset.investigationAnswer === answer); }); $('[data-investigation-return]').hidden = false; tone('correct'); }
    else tone('incorrect');
  }

  $('[data-investigation-return]').addEventListener('click', () => {
    state.completed.add(state.currentArtifact); const hotspot = $(`[data-artifact="${state.currentArtifact}"]`); hotspot?.classList.add('is-found'); hotspot?.setAttribute('aria-label', `${artifacts[state.currentArtifact].name}, discovered`);
    renderNotebook(); showStage('excavation'); announce(`${artifacts[state.currentArtifact].name} recorded in your notebook.`);
  });

  function notebookEntry(id) {
    const item = artifacts[id];
    return `<details class="food-note"><summary><img src="${assetRoot}${item.image}" alt=""><span>${item.name}</span></summary><p><strong>Observation:</strong> ${item.observation}</p><p><strong>What it might suggest:</strong> ${item.interpretation}</p><p><strong>What remains uncertain:</strong> ${item.uncertainty}</p></details>`;
  }
  function renderNotebook() {
    const ids = [...state.completed]; const count = ids.length; const entries = ids.map(notebookEntry).join('');
    $('[data-notebook-count]').textContent = `${count} / 5`; $('[data-food-clue-count]').textContent = `${count} / 5`; $('[data-food-notebook-progress]').textContent = `${count} / 5`; $('[data-food-dialog-progress]').textContent = `${count} / 5`;
    $('[data-food-notebook-preview]').innerHTML = count ? entries : '<p class="food-notebook-empty">Your field notes will appear here as you examine the evidence.</p>';
    $('[data-food-dialog-entries]').innerHTML = count ? entries : '<p>Complete investigations to add field notes.</p>';
    const allFound = count === Object.keys(artifacts).length;
    $('[data-food-notebook-complete]').hidden = !allFound;
    if (allFound) {
      const tutorial = $('[data-food-tutorial]'); tutorial.hidden = false; tutorial.classList.add('is-complete');
      tutorial.querySelector('strong').textContent = 'You found all five objects!';
      tutorial.querySelector('p').textContent = 'Excellent fieldwork. Your notebook is complete, and you are ready to reconstruct the ancient menu.';
      $('[data-food-tutorial-close]').textContent = 'Continue';
    }
    renderAccessibleList();
    if (allFound) tone('complete');
  }
  function renderAccessibleList() {
    const remaining = Object.entries(artifacts).filter(([id]) => !state.completed.has(id));
    $('[data-food-accessible-list]').innerHTML = remaining.length ? remaining.map(([id, item]) => `<button type="button" data-accessible-artifact="${id}">Investigate ${item.short}</button>`).join('') : '<p>All discoveries have been investigated.</p>';
    $$('[data-accessible-artifact]').forEach((button) => button.addEventListener('click', () => openArtifact(button.dataset.accessibleArtifact)));
  }
  renderNotebook();

  $('[data-notebook-open]').addEventListener('click', () => $('[data-food-notebook]').showModal());
  $('[data-food-hint]').addEventListener('click', () => {
    const next = Object.keys(artifacts).find((id) => !state.completed.has(id));
    if (!next) { $('[data-food-hint-copy]').textContent = 'You found every clue! Open your notebook to continue.'; return; }
    const level = state.hints[next] || 0; $('[data-food-hint-copy]').textContent = artifacts[next].hints[Math.min(level, 2)]; state.hints[next] = level + 1;
    if (level >= 2) $(`[data-artifact="${next}"]`)?.classList.add('is-hinted');
    announce($('[data-food-hint-copy]').textContent); tone('click');
  });

  function renderDishes() {
    $('[data-food-dishes]').innerHTML = Object.entries(dishes).map(([id, dish]) => `<button type="button" class="food-dish${state.evaluated.has(id) ? ' is-evaluated' : ''}" data-dish="${id}"><img src="${assetRoot}${dish.image}" alt="${dish.name}"><span>${dish.name}</span>${state.evaluated.has(id) ? '<b>✓ Evaluated</b>' : ''}</button>`).join('');
    $$('[data-dish]').forEach((button) => button.addEventListener('click', () => openDish(button.dataset.dish)));
    const count = state.evaluated.size; const unlock = $('[data-reconstruct-unlock]');
    $('[data-food-menu-progress]').innerHTML = `${count === 5 ? 'All dishes evaluated. Build your possible meal!' : 'Evaluate all five dishes to continue.'} <strong>${count} / 5</strong>`;
    unlock.disabled = count !== 5; unlock.classList.toggle('is-ready', count === 5);
  }
  function openDish(id) {
    state.currentDish = id; state.selectedEvidence.clear(); const dish = dishes[id];
    $('[data-food-evidence-panel]').classList.remove('is-empty'); $('[data-evaluate-evidence]').disabled = false;
    $('[data-dish-image]').src = `${assetRoot}${dish.image}`; $('[data-dish-image]').alt = dish.name; $('[data-dish-question]').textContent = dish.question; $('[data-dish-status]').textContent = state.evaluated.has(id) ? 'Review this reconstruction' : 'Test a reconstruction';
    $('[data-evidence-tokens]').innerHTML = `${Object.entries(artifacts).map(([artifactId, item]) => `<button type="button" aria-pressed="false" data-evidence="${artifactId}">${item.name.replace(' with Cut Marks', '')}</button>`).join('')}<button type="button" aria-pressed="false" data-evidence="none">None of the Above</button>`;
    $$('[data-evidence]').forEach((button) => button.addEventListener('click', () => {
      const id = button.dataset.evidence; const selecting = !state.selectedEvidence.has(id);
      if (id === 'none' && selecting) state.selectedEvidence.clear();
      if (id !== 'none' && selecting) state.selectedEvidence.delete('none');
      selecting ? state.selectedEvidence.add(id) : state.selectedEvidence.delete(id);
      $$('[data-evidence]').forEach((token) => { const selected = state.selectedEvidence.has(token.dataset.evidence); token.setAttribute('aria-pressed', String(selected)); token.classList.toggle('is-selected', selected); });
      tone('click');
    }));
    $('[data-dish-feedback]').hidden = true; $('[data-food-evidence-panel]').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
  }
  $('[data-evaluate-evidence]').addEventListener('click', () => {
    const dish = dishes[state.currentDish]; const hasChoice = state.selectedEvidence.size > 0; const hasSupport = dish.required.length ? dish.required.some((id) => state.selectedEvidence.has(id)) : state.selectedEvidence.has('none'); const feedback = $('[data-dish-feedback]');
    feedback.hidden = false;
    if (!hasChoice) { feedback.className = 'game-feedback is-incorrect'; feedback.innerHTML = '<p><strong>Choose an answer.</strong> Select one or more clues, or choose “None of the Above.”</p>'; tone('incorrect'); return; }
    if (!hasSupport) { feedback.className = 'game-feedback is-incorrect'; feedback.innerHTML = dish.required.length ? '<p><strong>Look again.</strong> Which discovery connects most directly to this dish?</p>' : '<p><strong>Careful!</strong> None of the selected discoveries directly demonstrates this dish. Choose “None of the Above.”</p>'; tone('incorrect'); return; }
    feedback.className = 'game-feedback is-correct'; feedback.innerHTML = `<h4>${dish.classification}</h4><p>${dish.feedback}</p>`;
    dish.required.forEach((id) => { const token = $(`[data-evidence="${id}"]`); if (token && !state.selectedEvidence.has(id)) token.classList.add('is-supporting'); });
    state.evaluated.add(state.currentDish); tone('correct'); renderDishes();
  });

  function renderReconstruction() {
    const choices = Object.entries(dishes); choices.sort(() => Math.random() - .5);
    if (choices.every(([id], index) => id === Object.keys(dishes)[index])) choices.push(choices.shift());
    $('[data-reconstruct-options]').innerHTML = choices.map(([id, dish]) => `<label><input type="checkbox" value="${id}"><span><img src="${assetRoot}${dish.image}" alt=""><b>${dish.name}</b></span></label>`).join('');
    $('[data-reconstruction-feedback]').hidden = true; $('[data-reflection-unlock]').hidden = true;
  }
  $('[data-complete-reconstruction]').addEventListener('click', () => {
    const selected = $$('[data-reconstruct-options] input:checked').map((input) => input.value); const supported = selected.filter((id) => dishes[id].supported); const unsupported = selected.filter((id) => !dishes[id].supported); const feedback = $('[data-reconstruction-feedback]'); feedback.hidden = false;
    if (!selected.length) { feedback.className = 'game-feedback is-incorrect'; feedback.innerHTML = '<p>Choose at least one dish for your possible meal.</p>'; tone('incorrect'); return; }
    if (!supported.length || unsupported.length) { feedback.className = 'game-feedback is-incorrect'; feedback.innerHTML = `<p><strong>Interesting reconstruction!</strong> ${unsupported.length ? 'Fish is not demonstrated here, and chocolate cake is unsupported. Remove dishes that go beyond the evidence and try again.' : 'Choose at least one dish supported by discoveries from the site.'}</p>`; tone('incorrect'); return; }
    feedback.className = 'game-feedback is-correct'; feedback.innerHTML = '<h3>Wonderful work, archaeologist!</h3><p>You reconstructed a meal that fits the surviving evidence. These discoveries offer valuable clues, but they cannot tell us exactly what was served at any one meal. That uncertainty is part of the mystery of archaeology!</p>'; $('[data-reflection-unlock]').hidden = false; tone('complete');
  });

  $$('[data-reflection-answer]').forEach((button) => button.addEventListener('click', () => {
    const correct = button.dataset.reflectionAnswer === 'b'; const feedback = $('[data-reflection-feedback]'); feedback.hidden = false; feedback.className = `game-feedback ${correct ? 'is-correct' : 'is-incorrect'}`;
    feedback.innerHTML = correct ? '<p><strong>Exactly.</strong> Preservation is incomplete, and the same clues can sometimes support more than one careful interpretation.</p>' : '<p><strong>Not quite.</strong> Think about what happens to food and other evidence over thousands of years, and whether one clue can have several meanings.</p>';
    if (correct) { $$('[data-reflection-answer]').forEach((choice) => { choice.disabled = true; choice.classList.toggle('is-selected', choice === button); }); $('[data-completion-unlock]').hidden = false; tone('correct'); } else tone('incorrect');
  }));

  $('[data-food-sound]').addEventListener('click', (event) => {
    state.sound = !state.sound; event.currentTarget.setAttribute('aria-pressed', String(state.sound)); event.currentTarget.querySelector('span[aria-hidden]').textContent = state.sound ? '🔊' : '🔇'; event.currentTarget.lastElementChild.textContent = state.sound ? 'Sound on' : 'Sound off';
    try { sessionStorage.setItem('mnemosyne-food-sound', state.sound ? 'on' : 'off'); } catch {}
    if (state.sound) { tone('correct'); if (state.stage === 'excavation' && $('[data-food-tutorial]').hidden) startAmbient(); } else stopAmbient();
  });
  $('[data-food-restart]').addEventListener('click', () => window.location.reload());
})();
