/* ==================================================================
   Virtual Artifact Hunt — game flow
   search (3D world) → find → restore (puzzle) → learn (card)
   → end of gallery: curator's quiz on what you found → results
   The timer only runs while you're searching; puzzles, cards and the
   quiz pause it.
   ================================================================== */

(() => {
  const LS_FOUND = 'vah_found_v1';
  const LS_BEST = 'vah_best_v1';
  const LS_SEEN_TUTORIAL = 'vah_seen_tutorial_v3';
  const STREAK_WINDOW_MS = 25000;
  const HINTS_PER_REGION = 3;
  const RESTORE_BONUS = 40;
  const QUIZ_POINTS = 50, PEEK_COST = 10;

  const state = {
    everFound: new Set(loadFound()),
    best: loadBest(),
    region: null,
    artifacts: [],
    found: [],          // artifact ids in the order found this round
    restored: new Set(),
    score: 0,
    timeLeft: 0,
    duration: 0,
    timer: null,
    paused: false,
    ended: false,
    streak: 0,
    lastFoundAt: 0,
    hintsLeft: HINTS_PER_REGION,
    puzzleOffset: 0,
    quiz: { list: [], i: 0, correct: 0, peeked: false },
  };

  let worldReady = false;

  function loadFound() {
    try { return JSON.parse(localStorage.getItem(LS_FOUND)) || []; } catch { return []; }
  }
  function saveFound() {
    try { localStorage.setItem(LS_FOUND, JSON.stringify([...state.everFound])); } catch {}
  }
  function loadBest() {
    try { return JSON.parse(localStorage.getItem(LS_BEST)) || {}; } catch { return {}; }
  }
  function saveBest() {
    try { localStorage.setItem(LS_BEST, JSON.stringify(state.best)); } catch {}
  }

  const el = (id) => document.getElementById(id);
  const byId = (id) => ARTIFACTS.find(a => a.id === id);
  const shuffle = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };

  function iconStandalone(key, arg) {
    const svgStr = ICONS[key](arg);
    const vb = (svgStr.match(/viewBox="([^"]+)"/) || [, '0 0 200 220'])[1];
    const inner = svgStr.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  }
  const svgUrl = (key) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ICONS[key]());
  const imageFor = (a) => a.photo || svgUrl(a.icon);

  const screens = { intro: el('screen-intro'), play: el('screen-play'), results: el('screen-results') };
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
    document.body.classList.toggle('playing', name === 'play');
  }

  // ------------------------------------------------ on-screen 3D controls
  function onInspect(active, label) {
    el('view-back').hidden = !active;
    el('view-label').textContent = active && label ? `· ${label} · drag to peek around` : '';
  }
  el('view-back').addEventListener('click', () => { SOUND.click(); WORLD.exitInspect(); });

  // Hold an arrow to keep turning (in a close-up it peeks around the object).
  function holdButton(btn, step) {
    let raf = 0;
    const tick = () => { WORLD.nudge(step); raf = requestAnimationFrame(tick); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    btn.addEventListener('pointerdown', (e) => { e.preventDefault(); btn.setPointerCapture(e.pointerId); stop(); tick(); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => btn.addEventListener(ev, stop));
    btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); WORLD.nudge(step * 6); } });
  }
  holdButton(el('vc-left'), 0.03);
  holdButton(el('vc-right'), -0.03);
  el('vc-zoom-in').addEventListener('click', () => WORLD.zoom(-6));
  el('vc-zoom-out').addEventListener('click', () => WORLD.zoom(6));

  function toast(msg) {
    const t = el('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._h);
    toast._h = setTimeout(() => t.classList.remove('show'), 2000);
  }

  // ---------------------------------------------------------- confetti
  const CONFETTI_COLORS = ['#f2a63d', '#d9603b', '#1f8a83', '#c1416a', '#5a8f3c'];
  function burstConfettiAt(xFrac, yFrac, count = 16, big = false) {
    const layer = el('confetti-layer');
    const rect = layer.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const dist = (big ? 140 : 70) + Math.random() * (big ? 100 : 40);
      const size = big ? 8 + Math.random() * 8 : 5 + Math.random() * 5;
      piece.style.left = `${xFrac * rect.width}px`;
      piece.style.top = `${yFrac * rect.height}px`;
      piece.style.width = piece.style.height = `${size}px`;
      piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      piece.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
      piece.style.setProperty('--dy', `${Math.sin(angle) * dist - (big ? 40 : 20)}px`);
      piece.style.animationDuration = `${0.7 + Math.random() * 0.5}s`;
      layer.appendChild(piece);
      piece.addEventListener('animationend', () => piece.remove());
    }
  }

  // ------------------------------------------------------------- intro
  function regionThumb(key) {
    const scene = SCENES[key];
    return `<svg viewBox="0 0 ${scene.width} 900" preserveAspectRatio="xMidYMid slice">${scene.back}${scene.front}</svg>`;
  }

  function renderIntro() {
    const grid = el('region-grid');
    grid.innerHTML = REGIONS.map(r => {
      const artifacts = ARTIFACTS_BY_REGION[r.key];
      const foundCount = artifacts.filter(a => state.everFound.has(a.id)).length;
      const pct = Math.round((foundCount / artifacts.length) * 100);
      const best = state.best[r.key];
      const complete = foundCount === artifacts.length;
      return `
        <button class="region-card ${complete ? 'complete' : ''}" data-region="${r.key}" type="button">
          ${best ? `<span class="best-badge">Best ${best}</span>` : ''}
          ${complete ? `<span class="complete-badge">&#10003; Complete</span>` : ''}
          <span class="thumb">${regionThumb(r.key)}</span>
          <span class="body">
            <h3>${r.name}</h3>
            <span class="region-meta">${r.subtitle} &middot; ${artifacts.length} artifacts</span>
            <span class="progress-row">
              <span class="progress-bar"><i style="width:${pct}%"></i></span>
              <span>${foundCount}/${artifacts.length}</span>
            </span>
          </span>
        </button>`;
    }).join('');
    [...grid.querySelectorAll('.region-card')].forEach(btn => {
      btn.addEventListener('click', () => { SOUND.click(); startRegion(btn.dataset.region); });
    });
    renderNotebook(el('notebook-grid'));
  }

  function renderNotebook(container) {
    container.innerHTML = REGIONS.map(r => {
      const artifacts = ARTIFACTS_BY_REGION[r.key];
      const foundCount = artifacts.filter(a => state.everFound.has(a.id)).length;
      return `
        <div class="notebook-region">
          <h4>${r.name} <em>${foundCount}/${artifacts.length}</em></h4>
          <ul class="notebook-list">
            ${artifacts.map(a => `
              <li class="${state.everFound.has(a.id) ? 'found' : ''}">
                <span class="dot"></span>${state.everFound.has(a.id) ? a.name : '???'}
              </li>`).join('')}
          </ul>
        </div>`;
    }).join('');
  }

  // -------------------------------------------------------------- play
  function startRegion(key) {
    const region = REGIONS.find(r => r.key === key);
    const artifacts = ARTIFACTS_BY_REGION[key];
    Object.assign(state, {
      region, artifacts, found: [], restored: new Set(), score: 0, ended: false, paused: false,
      streak: 0, lastFoundAt: 0, hintsLeft: HINTS_PER_REGION,
      puzzleOffset: Math.floor(Math.random() * PUZZLES.TYPES.length),
      duration: artifacts.length * 45 + 30,
      quiz: { list: [], i: 0, correct: 0, peeked: false },
    });
    state.timeLeft = state.duration;

    el('hud-region').textContent = region.name;
    el('hud-sub').textContent = region.subtitle;
    el('streak-stat').hidden = true;
    showScreen('play');

    if (!WORLD.supported()) {
      el('world-fallback').hidden = false;
      return;
    }
    if (!worldReady) {
      WORLD.init(el('world'), { onPick, onToast: toast, onInspect });
      worldReady = true;
    }
    WORLD.loadRegion(key, artifacts);
    WORLD.setActive(true);
    const help = el('world-help');
    help.classList.remove('hide');
    el('world').addEventListener('pointerdown', () => setTimeout(() => help.classList.add('hide'), 2500), { once: true });

    updateHintBtn();
    renderChecklist();
    updateHud();
    startTimer();
    toast(`${artifacts.length} artifacts are hidden in this gallery. Start searching!`);
  }

  function updateHud() {
    el('hud-progress').textContent = `${state.found.length}/${state.artifacts.length}`;
    el('hud-score').textContent = state.score;
    const m = Math.floor(state.timeLeft / 60), s = String(state.timeLeft % 60).padStart(2, '0');
    el('hud-time').textContent = `${m}:${s}`;
    const low = state.timeLeft <= 20;
    el('timer-stat').classList.toggle('low', low);
    el('timebar').classList.toggle('low', low);
    document.querySelector('.scene-wrap').classList.toggle('low', low);
    el('timebar').querySelector('i').style.transform = `scaleX(${Math.max(0, state.timeLeft / state.duration)})`;
  }

  function updateHintBtn() {
    const btn = el('hint-btn');
    btn.textContent = `Hint (${state.hintsLeft})`;
    btn.disabled = state.hintsLeft <= 0;
  }

  function renderChecklist() {
    const box = el('checklist');
    const hidden = state.artifacts.length - state.found.length;
    box.innerHTML = `<span class="checklist-label">${hidden ? `${hidden} still hidden` : 'All found!'}</span>` +
      state.artifacts.map(a => {
        if (!state.found.includes(a.id)) return `<span class="chk chk-unknown" title="Not found yet">?</span>`;
        return `<button type="button" class="chk chk-found" data-id="${a.id}" title="${a.name} — tap to reread">
          <img src="${imageFor(a)}" alt="${a.name}"></button>`;
      }).join('');
    box.querySelectorAll('.chk-found').forEach(b => b.addEventListener('click', () => {
      state.paused = true;
      openCard(byId(b.dataset.id), null);
    }));
  }

  function startTimer() {
    clearInterval(state.timer);
    state.timer = setInterval(() => {
      if (state.paused || state.ended) return;
      state.timeLeft--;
      updateHud();
      if (state.timeLeft <= 10 && state.timeLeft > 0) SOUND.tick();
      if (state.timeLeft <= 0) { SOUND.timeout(); finishRound(false); }
    }, 1000);
  }

  function onPick(id) {
    if (state.ended || state.paused || state.found.includes(id)) return;
    const artifact = byId(id);
    state.paused = true;
    state.found.push(id);
    state.everFound.add(id);
    saveFound();

    const now = Date.now();
    state.streak = state.lastFoundAt && now - state.lastFoundAt <= STREAK_WINDOW_MS ? state.streak + 1 : 1;
    state.lastFoundAt = now;
    const streakBonus = Math.min((state.streak - 1) * 20, 100);
    state.score += artifact.points + streakBonus;
    if (state.streak >= 2) { el('streak-stat').hidden = false; el('hud-streak').textContent = `×${state.streak}`; }

    const pos = WORLD.screenPos(id);
    burstConfettiAt(pos.x, pos.y, 16);
    WORLD.markFound(id);
    SOUND.found();
    updateHud();
    renderChecklist();
    toast(streakBonus ? `You found something! Streak ×${state.streak} (+${streakBonus})` : 'You found something!');

    const type = PUZZLES.TYPES[(state.found.length - 1 + state.puzzleOffset) % PUZZLES.TYPES.length];
    setTimeout(() => PUZZLES.open({
      src: imageFor(artifact),
      name: artifact.culture,
      type,
      onDone(solved) {
        if (solved) { state.restored.add(id); state.score += RESTORE_BONUS; updateHud(); }
        openCard(artifact, { solved, streakBonus });
      },
    }), 650);
  }

  // -------------------------------------------------------------- card
  function openCard(artifact, fresh) {
    renderCardArt(artifact);
    el('card-culture').textContent = artifact.culture;
    el('card-title').textContent = artifact.name;
    el('card-desc').textContent = artifact.desc;
    el('card-use').innerHTML = `<b>Use:</b> ${artifact.use}`;
    const note = el('card-note');
    const noteText = [artifact.note, artifact.interactive === 'transform' ? 'Tap the mask to open it.' : ''].filter(Boolean).join(' ');
    note.hidden = !noteText;
    note.textContent = noteText;

    if (fresh) {
      const parts = [`+${artifact.points} found`];
      if (fresh.streakBonus) parts.push(`+${fresh.streakBonus} streak`);
      parts.push(fresh.solved ? `+${RESTORE_BONUS} restored` : 'puzzle skipped');
      el('card-points').textContent = parts.join(' · ');
      el('card-next').textContent = 'Add to collection';
    } else {
      el('card-points').textContent = 'In your collection';
      el('card-next').textContent = 'Back to searching';
    }

    el('card-overlay').classList.add('show');
    el('card-next').onclick = () => {
      el('card-overlay').classList.remove('show');
      SOUND.click();
      state.paused = false;
      if (fresh && state.found.length === state.artifacts.length) finishRound(true);
    };
  }

  function renderCardArt(artifact) {
    const art = el('card-art');
    let open = false;
    art.onclick = null;
    art.style.cursor = 'default';
    if (artifact.interactive === 'transform') {
      art.innerHTML = iconStandalone(artifact.icon, false);
      art.style.cursor = 'pointer';
      art.onclick = () => { open = !open; SOUND.click(); art.innerHTML = iconStandalone(artifact.icon, open); };
    } else if (artifact.photo) {
      art.innerHTML = `<img src="${artifact.photo}" alt="${artifact.name}">`;
    } else {
      art.innerHTML = iconStandalone(artifact.icon);
    }
  }

  // ------------------------------------------------------------ hints
  el('hint-btn').addEventListener('click', () => {
    if (state.hintsLeft <= 0 || state.paused || state.ended) return;
    const target = state.artifacts.find(a => !state.found.includes(a.id));
    if (!target) return;
    state.hintsLeft--;
    updateHintBtn();
    SOUND.click();
    WORLD.hint(target.id);
    toast('Look where the light is pointing…');
  });

  // ------------------------------------------------------------ finish
  function finishRound(allFound) {
    if (state.ended) return;
    state.ended = true;
    clearInterval(state.timer);
    if (allFound) {
      const bonus = state.timeLeft * 2;
      state.score += bonus;
      SOUND.complete();
      burstConfettiAt(0.5, 0.35, 40, true);
      setTimeout(() => burstConfettiAt(0.25, 0.55, 24, true), 150);
      setTimeout(() => burstConfettiAt(0.75, 0.55, 24, true), 300);
      toast(`Gallery cleared! +${bonus} time bonus`);
    } else {
      toast('Time’s up! Let’s see what you learned.');
    }
    updateHud();
    setTimeout(() => {
      WORLD.setActive(false);
      if (state.found.length) startQuiz(allFound);
      else showResults(allFound);
    }, allFound ? 1400 : 1100);
  }

  // --------------------------------------------------- curator's quiz
  // Questions only ever cover artifacts the player found and read about
  // this round, and every answer is on the card they just read.
  function buildQuiz() {
    const found = shuffle(state.found.map(byId));
    const list = [];
    found.filter(a => a.quiz).slice(0, 2).forEach(a => {
      const order = shuffle(a.quiz.options.map((_, i) => i));
      list.push({ kind: 'text', artifact: a, q: a.quiz.q, options: order.map(i => a.quiz.options[i]), answer: order.indexOf(a.quiz.answer) });
    });
    const rest = found.filter(a => !list.some(x => x.artifact === a));
    const want = Math.min(4, found.length + list.length);
    let k = 0;
    while (list.length < want && rest.length) {
      const a = rest.shift();
      if (k++ % 2 === 0) {
        const pool = shuffle(ARTIFACTS.filter(x => x.id !== a.id && x.region === a.region));
        const opts = shuffle([a, ...pool.slice(0, 3)]);
        list.push({ kind: 'picture', artifact: a, q: `Which of these is the ${a.name}?`, options: opts, answer: opts.indexOf(a) });
      } else {
        const cultures = [...new Set(ARTIFACTS.filter(x => x.culture !== a.culture).map(x => x.culture))];
        const opts = shuffle([a.culture, ...shuffle(cultures).slice(0, 3)]);
        list.push({ kind: 'text', artifact: a, q: `Which people or culture made the ${a.name}?`, options: opts, answer: opts.indexOf(a.culture) });
      }
    }
    if (!list.length && found.length) {
      const a = found[0];
      const pool = shuffle(ARTIFACTS.filter(x => x.id !== a.id));
      const opts = shuffle([a, ...pool.slice(0, 3)]);
      list.push({ kind: 'picture', artifact: a, q: `Which of these is the ${a.name}?`, options: opts, answer: opts.indexOf(a) });
    }
    return shuffle(list);
  }

  function startQuiz(allFound) {
    state.quiz = { list: buildQuiz(), i: 0, correct: 0, peeked: false, allFound };
    el('quiz-overlay').classList.add('show');
    renderQuestion();
  }

  function renderQuestion() {
    const qz = state.quiz, item = qz.list[qz.i];
    qz.peeked = false;
    el('rq-progress').textContent = `Question ${qz.i + 1} of ${qz.list.length} · ${QUIZ_POINTS} points each`;
    el('rq-q').textContent = item.q;
    el('rq-note').textContent = '';
    el('rq-peek-box').hidden = true;
    el('rq-peek').hidden = false;
    el('rq-peek').disabled = false;
    el('rq-next').hidden = true;
    const opts = el('rq-opts');
    opts.className = `rq-opts ${item.kind === 'picture' ? 'rq-pictures' : ''}`;
    opts.innerHTML = item.options.map((o, i) => item.kind === 'picture'
      ? `<button type="button" class="rq-pic" data-i="${i}" aria-label="Option ${i + 1}"><img src="${imageFor(o)}" alt=""></button>`
      : `<button type="button" data-i="${i}">${o}</button>`).join('');
    [...opts.children].forEach(btn => btn.addEventListener('click', () => answer(Number(btn.dataset.i))));
  }

  function answer(i) {
    const qz = state.quiz, item = qz.list[qz.i];
    const btns = [...el('rq-opts').children];
    btns.forEach((b, j) => {
      b.disabled = true;
      if (j === item.answer) b.classList.add('correct');
      else if (j === i) b.classList.add('wrong');
    });
    el('rq-peek').hidden = true;
    const correct = i === item.answer;
    if (correct) {
      qz.correct++;
      const pts = QUIZ_POINTS - (qz.peeked ? PEEK_COST : 0);
      state.score += pts;
      SOUND.correct();
      el('rq-note').textContent = `Correct! +${pts}`;
    } else {
      SOUND.wrong();
      const a = item.artifact;
      el('rq-note').textContent = item.kind === 'picture'
        ? `Not quite — the highlighted one is the ${a.name}.`
        : `Not quite — from the card: ${a.desc.split('. ')[0]}.`;
    }
    el('rq-next').textContent = qz.i === qz.list.length - 1 ? 'See results' : 'Next';
    el('rq-next').hidden = false;
  }

  el('rq-peek').addEventListener('click', () => {
    const item = state.quiz.list[state.quiz.i];
    state.quiz.peeked = true;
    el('rq-peek').disabled = true;
    const box = el('rq-peek-box');
    box.hidden = false;
    box.textContent = item.kind === 'picture'
      ? `${item.artifact.name}: ${item.artifact.desc}`
      : `${item.artifact.name} (${item.artifact.culture}): ${item.artifact.desc} Use: ${item.artifact.use}`;
  });

  el('rq-next').addEventListener('click', () => {
    SOUND.click();
    const qz = state.quiz;
    if (qz.i < qz.list.length - 1) { qz.i++; renderQuestion(); return; }
    el('quiz-overlay').classList.remove('show');
    showResults(qz.allFound);
  });

  // ----------------------------------------------------------- results
  function showResults(allFound) {
    if (!state.best[state.region.key] || state.score > state.best[state.region.key]) {
      state.best[state.region.key] = state.score;
      saveBest();
    }
    const qz = state.quiz;
    const total = state.artifacts.length, n = state.found.length;
    el('res-grade').textContent = allFound
      ? (qz.correct === qz.list.length && state.restored.size === n ? 'Master Curator' : 'Gallery Complete')
      : (n ? 'Time’s Up' : 'Nothing Found');
    el('res-sub').textContent = allFound
      ? `You found and studied every artifact in the ${state.region.name} gallery.`
      : `You found ${n} of ${total} artifacts before time ran out.`;
    el('res-score').textContent = state.score;
    el('res-found').textContent = `${n}/${total}`;
    el('res-puzzles').textContent = `${state.restored.size}/${n}`;
    el('res-quiz').textContent = `${qz.correct}/${qz.list.length}`;
    showScreen('results');
  }

  // ---------------------------------------------------------- notebook
  function openNotebook() {
    state.paused = true;
    renderNotebook(el('notebook-grid-modal'));
    el('notebook-overlay').classList.add('show');
  }
  function closeNotebook() {
    el('notebook-overlay').classList.remove('show');
    state.paused = false;
  }

  // ---------------------------------------------------------- tutorial
  const TUTORIAL_SLIDES = [
    {
      title: 'Welcome, Curator!',
      text: 'The museum is closed for the night. Five galleries — Asia, Africa, Europe, Oceania and North America — each have real artifacts hidden somewhere in their storerooms.',
      art: `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="#1f8a83"/>
        <path d="M100,20 Q140,60 100,100 Q60,140 100,180" stroke="#fff8ec" stroke-width="5" fill="none"/>
        <path d="M20,100 Q60,60 100,100 Q140,140 180,100" stroke="#fff8ec" stroke-width="5" fill="none"/>
        ${[[100, 40], [160, 80], [150, 150], [60, 160], [45, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#f2a63d" stroke="#3a2a1e" stroke-width="3"/>`).join('')}
      </svg>`,
    },
    {
      title: 'Search with your flashlight',
      text: 'It’s dark in there. Drag to look around the room, or hold the big arrow buttons. Your flashlight shines wherever you last touched. Pinch or use + and − to zoom.',
      art: `<svg viewBox="0 0 200 200"><rect width="200" height="200" rx="16" fill="#1a120c"/>
        <path d="M30,170 L130,60 L170,100 Z" fill="#fff1d6" opacity=".35"/>
        <rect x="16" y="160" width="40" height="22" rx="6" fill="#d9603b" transform="rotate(-40 36 171)"/>
        <circle cx="140" cy="82" r="14" fill="#f2a63d"/></svg>`,
    },
    {
      title: 'Open everything',
      text: 'Artifacts hide inside chests, drawers, crates and baskets, under cloths, on shelves and behind pillars. Tap any of them to open it and move in for a close look — drag to peek around, then tap “Back to room”. Watch for a faint glint.',
      art: `<svg viewBox="0 0 200 200"><rect x="40" y="100" width="120" height="70" rx="6" fill="#6b2f1a" stroke="#3a2a1e" stroke-width="4"/>
        <path d="M36,100 L60,50 L164,50 L164,100 Z" fill="#8c3a22" stroke="#3a2a1e" stroke-width="4"/>
        <circle cx="100" cy="92" r="16" fill="#f2a63d"/><path d="M100,64 v-16 M80,72 l-10,-10 M120,72 l10,-10" stroke="#fff3c6" stroke-width="5" stroke-linecap="round"/></svg>`,
    },
    {
      title: 'Restore what you find',
      text: 'Every artifact needs restoring before it joins your collection: a jigsaw, broken shards, sliding tiles, or a layer of dust to brush away. You can skip a puzzle, but restoring earns a bonus.',
      art: `<svg viewBox="0 0 200 200">${[0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${40 + c * 42}" y="${40 + r * 42}" width="38" height="38" rx="4" fill="${(r + c) % 2 ? '#f2a63d' : '#d9603b'}" ${r === 2 && c === 2 ? 'transform="translate(14 18) rotate(12 140 140)"' : ''}/>`).join('')).join('')}</svg>`,
    },
    {
      title: 'Read, then take the quiz',
      text: 'Each card tells the artifact’s real story. When the gallery is done, the curator asks a few questions — only about artifacts you found, and every answer is on their cards. Stuck? Peek at the card for a small cost.',
      art: `<svg viewBox="0 0 200 200"><rect x="40" y="30" width="120" height="140" rx="14" fill="#fff8ec" stroke="#3a2a1e" stroke-width="4"/>
        <rect x="58" y="52" width="84" height="10" rx="5" fill="#d9603b"/>
        <rect x="58" y="74" width="84" height="7" rx="3.5" fill="#e8cf9d"/>
        <rect x="58" y="90" width="60" height="7" rx="3.5" fill="#e8cf9d"/>
        <circle cx="100" cy="135" r="22" fill="#5a8f3c"/>
        <path d="M90,135 l7,8 l14,-16" stroke="#fff8ec" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    },
  ];

  let tutorialIndex = 0;
  function renderTutorial() {
    const slide = TUTORIAL_SLIDES[tutorialIndex];
    el('tutorial-art').innerHTML = slide.art;
    el('tutorial-title').textContent = slide.title;
    el('tutorial-text').textContent = slide.text;
    el('tutorial-dots').innerHTML = TUTORIAL_SLIDES.map((_, i) => `<span class="dot ${i === tutorialIndex ? 'active' : ''}"></span>`).join('');
    el('tutorial-back').disabled = tutorialIndex === 0;
    el('tutorial-next').textContent = tutorialIndex === TUTORIAL_SLIDES.length - 1 ? 'Let’s go!' : 'Next';
  }
  let pausedBeforeTutorial = false;
  function openTutorial() {
    pausedBeforeTutorial = state.paused;
    state.paused = true;
    tutorialIndex = 0;
    renderTutorial();
    el('tutorial-overlay').classList.add('show');
  }
  function closeTutorial() {
    el('tutorial-overlay').classList.remove('show');
    state.paused = pausedBeforeTutorial;
    try { localStorage.setItem(LS_SEEN_TUTORIAL, '1'); } catch {}
  }
  el('tutorial-next').addEventListener('click', () => {
    SOUND.click();
    if (tutorialIndex === TUTORIAL_SLIDES.length - 1) { closeTutorial(); return; }
    tutorialIndex++;
    renderTutorial();
  });
  el('tutorial-back').addEventListener('click', () => {
    if (tutorialIndex === 0) return;
    SOUND.click();
    tutorialIndex--;
    renderTutorial();
  });
  el('tutorial-skip').addEventListener('click', closeTutorial);
  el('tutorial-overlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeTutorial(); });
  el('howto-btn').addEventListener('click', openTutorial);

  // ------------------------------------------------------------ sound
  const soundBtn = el('sound-btn');
  function refreshSoundBtn() {
    soundBtn.textContent = SOUND.isMuted() ? '\u{1F507}' : '\u{1F50A}';
    soundBtn.setAttribute('aria-pressed', String(SOUND.isMuted()));
  }
  soundBtn.addEventListener('click', () => {
    SOUND.setMuted(!SOUND.isMuted());
    refreshSoundBtn();
    if (!SOUND.isMuted()) SOUND.click();
  });
  refreshSoundBtn();

  // ----------------------------------------------------------- wiring
  function leaveToMenu() {
    clearInterval(state.timer);
    state.ended = true;
    if (worldReady) WORLD.setActive(false);
    renderIntro();
    showScreen('intro');
  }
  el('quit-btn').addEventListener('click', () => { SOUND.click(); leaveToMenu(); });
  el('notebook-btn').addEventListener('click', () => { SOUND.click(); openNotebook(); });
  el('notebook-close').addEventListener('click', () => { SOUND.click(); closeNotebook(); });
  el('notebook-overlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) closeNotebook(); });
  el('replay-btn').addEventListener('click', () => { SOUND.click(); startRegion(state.region.key); });
  el('menu-btn').addEventListener('click', () => { SOUND.click(); leaveToMenu(); });

  renderIntro();
  let seenTutorial = false;
  try { seenTutorial = localStorage.getItem(LS_SEEN_TUTORIAL) === '1'; } catch {}
  if (!seenTutorial) openTutorial();
})();
