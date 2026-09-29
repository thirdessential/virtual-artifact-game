/* ==================================================================
   Virtual Artifact Hunt — game engine
   ================================================================== */

(() => {
  const LS_FOUND = 'vah_found_v1';
  const LS_BEST = 'vah_best_v1';
  const LS_SEEN_TUTORIAL = 'vah_seen_tutorial_v1';
  const LS_SEEN_SCROLL_HINT = 'vah_seen_scroll_hint_v1';
  const STREAK_WINDOW_MS = 11000;
  const HINTS_PER_REGION = 3;
  const GLINT_EVERY_MS = 7000;
  const GLINT_STAGGER_MS = 1500;
  const GLINT_DURATION_MS = 550;

  const state = {
    everFound: new Set(loadFound()),
    best: loadBest(),
    // per-round state
    region: null,
    artifacts: [],
    foundThisRound: new Set(),
    quizResult: {},   // id -> true/false
    score: 0,
    timeLeft: 0,
    timer: null,
    duration: 0,
    ended: false,
    transformOpen: false,
    streak: 0,
    lastFoundAt: 0,
    hintsLeft: HINTS_PER_REGION,
    glintNextAt: {},  // artifact id -> timestamp
    glintTimer: null,
  };

  function loadFound() {
    try { return JSON.parse(localStorage.getItem(LS_FOUND)) || []; }
    catch { return []; }
  }
  function saveFound() {
    try { localStorage.setItem(LS_FOUND, JSON.stringify([...state.everFound])); }
    catch {}
  }
  function loadBest() {
    try { return JSON.parse(localStorage.getItem(LS_BEST)) || {}; }
    catch { return {}; }
  }
  function saveBest() {
    try { localStorage.setItem(LS_BEST, JSON.stringify(state.best)); }
    catch {}
  }

  function iconParts(key, arg) {
    const svgStr = ICONS[key](arg);
    const vb = (svgStr.match(/viewBox="([^"]+)"/) || [,'0 0 200 220'])[1];
    const inner = svgStr.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    return { vb, inner };
  }

  function iconStandalone(key, arg) {
    const { vb, inner } = iconParts(key, arg);
    return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  }

  // ---------------------------------------------------------- elements
  const el = (id) => document.getElementById(id);
  const screens = {
    intro: el('screen-intro'),
    play: el('screen-play'),
    results: el('screen-results'),
  };

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  function toast(msg) {
    const t = el('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._h);
    toast._h = setTimeout(() => t.classList.remove('show'), 1700);
  }

  // ---------------------------------------------------------- confetti

  const CONFETTI_COLORS = ['#f2a63d', '#d9603b', '#1f8a83', '#c1416a', '#5a8f3c'];

  function spawnConfetti(x, y, count, big) {
    const layer = el('confetti-layer');
    if (!layer) return;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const dist = (big ? 140 : 70) + Math.random() * (big ? 100 : 40);
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - (big ? 40 : 20);
      const size = big ? 8 + Math.random() * 8 : 5 + Math.random() * 5;
      piece.style.left = `${x}px`;
      piece.style.top = `${y}px`;
      piece.style.width = `${size}px`;
      piece.style.height = `${size}px`;
      piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      piece.style.setProperty('--dx', `${dx}px`);
      piece.style.setProperty('--dy', `${dy}px`);
      piece.style.animationDuration = `${0.7 + Math.random() * 0.5}s`;
      layer.appendChild(piece);
      piece.addEventListener('animationend', () => piece.remove());
    }
  }

  // Decorative bursts positioned as a fraction of the visible window.
  function burstConfettiAt(xFrac, yFrac, count = 16, big = false) {
    const layer = el('confetti-layer');
    if (!layer) return;
    const rect = layer.getBoundingClientRect();
    spawnConfetti(xFrac * rect.width, yFrac * rect.height, count, big);
  }

  // Per-artifact bursts, positioned from scene (viewBox) coordinates —
  // accounts for the current horizontal scroll offset and scale.
  function burstConfettiAtScene(sceneX, sceneY, count = 14) {
    const wrap = el('scene-scroll');
    if (!wrap) return;
    const scale = wrap.clientHeight / 900;
    spawnConfetti(sceneX * scale - wrap.scrollLeft, sceneY * scale, count, false);
  }

  // ---------------------------------------------------------- intro screen

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
            <span class="region-meta">${r.subtitle}</span>
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

  // ------------------------------------------------------------ playing

  function startRegion(key) {
    const region = REGIONS.find(r => r.key === key);
    const artifacts = ARTIFACTS_BY_REGION[key];

    state.region = region;
    state.artifacts = artifacts;
    state.foundThisRound = new Set();
    state.quizResult = {};
    state.score = 0;
    state.ended = false;
    state.streak = 0;
    state.lastFoundAt = 0;
    state.hintsLeft = HINTS_PER_REGION;
    state.duration = artifacts.length * 45 + 30;
    state.timeLeft = state.duration;

    el('hud-region').textContent = region.name;
    el('hud-sub').textContent = region.subtitle;
    el('streak-stat').hidden = true;
    document.querySelector('.scene-wrap').classList.remove('low');
    updateHintBtn();
    updateHud();

    showScreen('play');
    el('scene-scroll').scrollLeft = 0;
    renderScene();
    startTimer();
    startGlintLoop();
    toast(`Find all ${artifacts.length} artifacts in the ${region.name} gallery!`);

    let seenScrollHint = false;
    try { seenScrollHint = localStorage.getItem(LS_SEEN_SCROLL_HINT) === '1'; } catch {}
    const hintEl = el('scroll-hint');
    if (!seenScrollHint) {
      hintEl.classList.add('show');
      const dismiss = () => {
        hintEl.classList.remove('show');
        try { localStorage.setItem(LS_SEEN_SCROLL_HINT, '1'); } catch {}
      };
      el('scene-scroll').addEventListener('scroll', dismiss, { once: true });
      setTimeout(dismiss, 5000);
    } else {
      hintEl.classList.remove('show');
    }
  }

  function sceneScale() {
    const wrap = el('scene-scroll');
    return wrap.clientHeight / 900 || 1;
  }

  function sizeScene() {
    const wrap = el('scene-scroll');
    const svg = el('scene');
    if (!state.region) return;
    const h = wrap.clientHeight;
    const scale = h / 900;
    svg.setAttribute('width', Math.round(SCENES[state.region.key].width * scale));
    svg.setAttribute('height', Math.round(h));
    updateScrollBtns();
  }

  function updateScrollBtns() {
    const wrap = el('scene-scroll');
    const max = wrap.scrollWidth - wrap.clientWidth;
    el('scroll-left-btn').classList.toggle('hidden', wrap.scrollLeft <= 2);
    el('scroll-right-btn').classList.toggle('hidden', wrap.scrollLeft >= max - 2);
  }

  function renderScene() {
    const scene = SCENES[state.region.key];
    const svg = el('scene');
    svg.setAttribute('viewBox', `0 0 ${scene.width} 900`);

    const hotspotMarkup = scene.hotspots.map((h, i) => {
      const artifact = state.artifacts.find(a => a.id === h.id);
      if (!artifact) return '';
      const found = state.foundThisRound.has(artifact.id);
      const { vb, inner } = iconParts(artifact.icon);
      const w = h.r * 1.3, hgt = h.r * 1.42;
      const label = found ? `${artifact.name}, found` : `Hidden artifact ${i + 1} of ${scene.hotspots.length}`;
      return `
        <g class="hotspot ${found ? 'found' : ''}" data-id="${artifact.id}" tabindex="0" role="button"
           aria-label="${label}">
          <ellipse class="shadow" cx="${h.x}" cy="${h.y + h.r * 0.58}" rx="${h.r * 0.52}" ry="${h.r * 0.15}"></ellipse>
          <svg class="art" x="${h.x - w / 2}" y="${h.y - hgt * 0.62}" width="${w}" height="${hgt}" viewBox="${vb}">${inner}</svg>
        </g>`;
    }).join('');

    svg.innerHTML = `<g>${scene.back}</g><g class="hotspot-layer">${hotspotMarkup}</g><g>${scene.front}</g>`;
    sizeScene();

    [...svg.querySelectorAll('.hotspot')].forEach(g => {
      g.addEventListener('click', () => onHotspotClick(g.dataset.id));
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onHotspotClick(g.dataset.id); }
      });
    });
  }

  let justDragged = false;

  function onHotspotClick(id) {
    if (justDragged) return;
    const artifact = state.artifacts.find(a => a.id === id);
    if (!artifact) return;
    SOUND.open();
    openCard(artifact);
  }

  function updateHud() {
    el('hud-progress').textContent = `${state.foundThisRound.size}/${state.artifacts.length}`;
    el('hud-score').textContent = state.score;
    const m = Math.floor(state.timeLeft / 60);
    const s = String(state.timeLeft % 60).padStart(2, '0');
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

  function startTimer() {
    clearInterval(state.timer);
    updateHud();
    state.timer = setInterval(() => {
      state.timeLeft--;
      updateHud();
      if (state.timeLeft <= 10 && state.timeLeft > 0) SOUND.tick();
      if (state.timeLeft <= 0) {
        clearInterval(state.timer);
        SOUND.timeout();
        endRound(false);
      }
    }, 1000);
  }

  // ------------------------------------------------------------ glint cue

  function startGlintLoop() {
    clearInterval(state.glintTimer);
    state.glintNextAt = {};
    const now = Date.now();
    state.artifacts.forEach((a, i) => {
      state.glintNextAt[a.id] = now + 2500 + i * GLINT_STAGGER_MS;
    });
    state.glintTimer = setInterval(tickGlint, 500);
  }

  function stopGlintLoop() {
    clearInterval(state.glintTimer);
  }

  function visibleSceneRange() {
    const wrap = el('scene-scroll');
    const scale = sceneScale();
    return { min: wrap.scrollLeft / scale, max: (wrap.scrollLeft + wrap.clientWidth) / scale };
  }

  function tickGlint() {
    if (state.ended) return;
    const now = Date.now();
    const scene = SCENES[state.region.key];
    const range = visibleSceneRange();
    scene.hotspots.forEach(h => {
      if (state.foundThisRound.has(h.id)) return;
      if (now < (state.glintNextAt[h.id] || 0)) return;
      if (h.x < range.min - h.r || h.x > range.max + h.r) {
        state.glintNextAt[h.id] = now + 1200; // check again soon in case they scroll here
        return;
      }
      glintHotspot(h.id, GLINT_DURATION_MS, false);
      state.glintNextAt[h.id] = now + GLINT_EVERY_MS;
    });
  }

  function glintHotspot(id, duration, strong) {
    const g = el('scene').querySelector(`.hotspot[data-id="${id}"]`);
    if (!g) return;
    g.classList.add(strong ? 'hint-glow' : 'glint');
    setTimeout(() => g.classList.remove(strong ? 'hint-glow' : 'glint'), duration);
  }

  // -------------------------------------------------------------- hints

  el('hint-btn').addEventListener('click', () => {
    if (state.hintsLeft <= 0) return;
    const scene = SCENES[state.region.key];
    const target = scene.hotspots.find(h => !state.foundThisRound.has(h.id));
    if (!target) return;
    state.hintsLeft--;
    updateHintBtn();
    SOUND.click();

    const wrap = el('scene-scroll');
    const scale = sceneScale();
    const targetLeft = Math.max(0, target.x * scale - wrap.clientWidth / 2);
    wrap.scrollTo({ left: targetLeft, behavior: 'smooth' });
    setTimeout(() => glintHotspot(target.id, 1800, true), 350);
  });

  // ---------------------------------------------------------- scroll ergonomics

  (() => {
    const wrap = el('scene-scroll');
    let dragging = false, startX = 0, startScroll = 0, moved = 0;

    wrap.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      wrap.scrollLeft += e.deltaY;
    }, { passive: false });

    wrap.addEventListener('mousedown', (e) => {
      dragging = true; moved = 0;
      startX = e.clientX;
      startScroll = wrap.scrollLeft;
      wrap.classList.add('dragging');
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      wrap.scrollLeft = startScroll - dx;
    });
    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      wrap.classList.remove('dragging');
      if (moved > 6) {
        justDragged = true;
        setTimeout(() => { justDragged = false; }, 50);
      }
    });

    el('scroll-left-btn').addEventListener('click', () => {
      wrap.scrollBy({ left: -0.8 * wrap.clientWidth, behavior: 'smooth' });
    });
    el('scroll-right-btn').addEventListener('click', () => {
      wrap.scrollBy({ left: 0.8 * wrap.clientWidth, behavior: 'smooth' });
    });

    wrap.addEventListener('scroll', updateScrollBtns);

    window.addEventListener('resize', () => {
      if (state.region && screens.play.classList.contains('active')) sizeScene();
    });
  })();

  function endRound(allFound) {
    if (state.ended) return;
    state.ended = true;
    clearInterval(state.timer);
    stopGlintLoop();

    const timeBonus = allFound ? state.timeLeft * 2 : 0;
    state.score += timeBonus;
    if (timeBonus) toast(`+${timeBonus} time bonus!`);
    if (allFound) {
      SOUND.complete();
      burstConfettiAt(0.5, 0.33, 40, true);
      setTimeout(() => burstConfettiAt(0.25, 0.55, 24, true), 150);
      setTimeout(() => burstConfettiAt(0.75, 0.55, 24, true), 300);
    }

    if (!state.best[state.region.key] || state.score > state.best[state.region.key]) {
      state.best[state.region.key] = state.score;
      saveBest();
    }

    setTimeout(() => showResults(allFound), allFound ? 900 : 300);
  }

  function showResults(allFound) {
    const quizTotal = state.artifacts.filter(a => a.quiz).length;
    const quizCorrect = Object.values(state.quizResult).filter(Boolean).length;

    el('res-grade').textContent = allFound
      ? (state.timeLeft > state.duration * 0.4 ? 'Master Curator' : 'Gallery Complete')
      : 'Time’s Up';
    el('res-sub').textContent = allFound
      ? `You found every artifact in the ${state.region.name} gallery.`
      : `You found ${state.foundThisRound.size} of ${state.artifacts.length} artifacts before time ran out.`;
    el('res-score').textContent = state.score;
    el('res-found').textContent = `${state.foundThisRound.size}/${state.artifacts.length}`;
    el('res-quiz').textContent = `${quizCorrect}/${quizTotal}`;
    const m = Math.floor(Math.max(0, state.timeLeft) / 60);
    const s = String(Math.max(0, state.timeLeft) % 60).padStart(2, '0');
    el('res-time').textContent = `${m}:${s}`;

    showScreen('results');
  }

  // ------------------------------------------------------------- card modal

  function openCard(artifact) {
    const overlay = el('card-overlay');
    const firstView = !state.foundThisRound.has(artifact.id);

    state.transformOpen = false;
    renderCardArt(artifact);

    el('card-culture').textContent = artifact.culture;
    el('card-title').textContent = artifact.name;
    el('card-desc').textContent = artifact.desc;
    el('card-use').innerHTML = `<b>Use:</b> ${artifact.use}`;

    const note = el('card-note');
    if (artifact.note) { note.hidden = false; note.textContent = artifact.note; }
    else { note.hidden = true; note.textContent = ''; }

    const quizBlock = el('quiz-block');
    const alreadyAnswered = artifact.id in state.quizResult;

    if (artifact.quiz && (firstView || alreadyAnswered)) {
      quizBlock.hidden = false;
      renderQuiz(artifact, alreadyAnswered);
    } else {
      quizBlock.hidden = true;
    }

    const streakEl = el('streak-stat');
    let pointsMsg = '';
    if (firstView) {
      state.foundThisRound.add(artifact.id);
      state.everFound.add(artifact.id);
      saveFound();

      const now = Date.now();
      if (state.lastFoundAt && now - state.lastFoundAt <= STREAK_WINDOW_MS) state.streak++;
      else state.streak = 1;
      state.lastFoundAt = now;

      const streakBonus = Math.min((state.streak - 1) * 20, 100);
      state.score += artifact.points + streakBonus;
      pointsMsg = streakBonus
        ? `+${artifact.points} points  ·  +${streakBonus} streak bonus`
        : `+${artifact.points} points`;

      if (state.streak >= 2) {
        streakEl.hidden = false;
        el('hud-streak').textContent = `×${state.streak}`;
        toast(`Found: ${artifact.name} — Streak ×${state.streak}!`);
      } else {
        toast(`Found: ${artifact.name}`);
      }

      SOUND.found();
      renderScene();
      updateHud();

      const hotspot = SCENES[state.region.key].hotspots.find(h => h.id === artifact.id);
      if (hotspot) burstConfettiAtScene(hotspot.x, hotspot.y, 14);
    } else {
      pointsMsg = 'Already identified — reviewing card';
    }
    el('card-points').textContent = pointsMsg;

    overlay.classList.add('show');

    el('card-next').onclick = () => {
      overlay.classList.remove('show');
      SOUND.click();
      if (state.foundThisRound.size === state.artifacts.length) {
        endRound(true);
      }
    };
  }

  function renderCardArt(artifact) {
    const art = el('card-art');
    if (artifact.interactive === 'transform') {
      art.innerHTML = iconStandalone(artifact.icon, state.transformOpen);
      art.style.cursor = 'pointer';
      art.onclick = () => {
        state.transformOpen = !state.transformOpen;
        SOUND.click();
        art.innerHTML = iconStandalone(artifact.icon, state.transformOpen);
      };
      el('card-note').hidden = false;
      el('card-note').textContent = (artifact.note ? artifact.note + ' ' : '') + 'Tap the mask to open it.';
    } else if (artifact.photo) {
      art.innerHTML = `<img src="${artifact.photo}" alt="${artifact.name}">`;
      art.style.cursor = 'default';
      art.onclick = null;
    } else {
      art.innerHTML = iconStandalone(artifact.icon);
      art.style.cursor = 'default';
      art.onclick = null;
    }
  }

  function renderQuiz(artifact, alreadyAnswered) {
    el('quiz-q').textContent = artifact.quiz.q;
    const opts = el('quiz-opts');
    const noteEl = el('quiz-note');
    noteEl.textContent = '';
    opts.innerHTML = artifact.quiz.options.map((opt, i) =>
      `<button type="button" data-i="${i}">${opt}</button>`).join('');

    const settle = (correct) => {
      [...opts.children].forEach((b, i) => {
        b.disabled = true;
        if (i === artifact.quiz.answer) b.classList.add('correct');
        else if (Number(b.dataset.i) === Number(opts._picked)) b.classList.add('wrong');
      });
      noteEl.textContent = correct
        ? 'Correct! Bonus points added.'
        : `Not quite — the correct answer is highlighted.`;
    };

    if (alreadyAnswered) {
      opts._picked = -1;
      settle(state.quizResult[artifact.id]);
      return;
    }

    [...opts.children].forEach(btn => {
      btn.addEventListener('click', () => {
        if (artifact.id in state.quizResult) return;
        const i = Number(btn.dataset.i);
        opts._picked = i;
        const correct = i === artifact.quiz.answer;
        state.quizResult[artifact.id] = correct;
        if (correct) { state.score += 50; updateHud(); SOUND.correct(); }
        else SOUND.wrong();
        settle(correct);
      });
    });
  }

  // ---------------------------------------------------------------- notebook modal

  function openNotebook() {
    renderNotebook(el('notebook-grid-modal'));
    el('notebook-overlay').classList.add('show');
  }

  // ---------------------------------------------------------------- tutorial

  const TUTORIAL_SLIDES = [
    {
      title: 'Welcome, Curator!',
      text: 'Five illustrated galleries from around the world are waiting — Asia, Africa, Europe, Oceania and North America — each hiding real artifacts from native communities.',
      art: `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="#1f8a83"/>
        <path d="M100,20 Q140,60 100,100 Q60,140 100,180" stroke="#fff8ec" stroke-width="5" fill="none"/>
        <path d="M20,100 Q60,60 100,100 Q140,140 180,100" stroke="#fff8ec" stroke-width="5" fill="none"/>
        ${[[100,40],[160,80],[150,150],[60,160],[45,70]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="10" fill="#f2a63d" stroke="#3a2a1e" stroke-width="3"/>`).join('')}
      </svg>`,
    },
    {
      title: 'Explore & Look Closely',
      text: 'Each gallery is wider than your screen — scroll, drag, or use the arrow buttons to look around. Artifacts blend into the scene, so watch for a faint glint that hints where to look.',
      art: `<svg viewBox="0 0 200 200">
        <rect x="10" y="60" width="180" height="90" rx="10" fill="none" stroke="#3a2a1e" stroke-width="4"/>
        <circle cx="70" cy="105" r="14" fill="#a3652f"/>
        <circle cx="140" cy="105" r="10" fill="#f2a63d" opacity=".9"/>
        <path d="M20,170 L40,170 M160,170 L180,170" stroke="#d9603b" stroke-width="6" stroke-linecap="round"/>
        <path d="M30,160 l-10,10 l10,10 M170,160 l10,10 l-10,10" stroke="#d9603b" stroke-width="5" fill="none" stroke-linecap="round"/>
      </svg>`,
    },
    {
      title: 'Learn & Answer',
      text: 'Each card tells the real story — who made it and how it was used. Some hide a bonus trivia question: answer correctly for +50 points.',
      art: `<svg viewBox="0 0 200 200"><rect x="40" y="30" width="120" height="140" rx="14" fill="#fff8ec" stroke="#3a2a1e" stroke-width="4"/>
        <rect x="58" y="52" width="84" height="10" rx="5" fill="#d9603b"/>
        <rect x="58" y="74" width="84" height="7" rx="3.5" fill="#e8cf9d"/>
        <rect x="58" y="90" width="60" height="7" rx="3.5" fill="#e8cf9d"/>
        <circle cx="100" cy="135" r="22" fill="#5a8f3c"/>
        <path d="M90,135 l7,8 l14,-16" stroke="#fff8ec" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    },
    {
      title: 'Beat the Clock',
      text: 'Find everything before time runs out for a big completion bonus. Chain quick finds together to build a streak multiplier, and spend a Hint if one artifact is hiding too well — you get three per gallery.',
      art: `<svg viewBox="0 0 200 200"><circle cx="100" cy="110" r="70" fill="#fff8ec" stroke="#3a2a1e" stroke-width="6"/>
        <path d="M100,110 L100,60 M100,110 L135,120" stroke="#d9603b" stroke-width="6" stroke-linecap="round"/>
        <rect x="85" y="24" width="30" height="12" rx="4" fill="#3a2a1e"/>
        ${[[40,50],[160,50],[30,150],[170,150]].map(([x,y])=>`<path d="M${x},${y} l6,6 m0,-6 l-6,6" stroke="#f2a63d" stroke-width="4" stroke-linecap="round"/>`).join('')}
      </svg>`,
    },
  ];

  let tutorialIndex = 0;

  function renderTutorial() {
    const slide = TUTORIAL_SLIDES[tutorialIndex];
    el('tutorial-art').innerHTML = slide.art;
    el('tutorial-title').textContent = slide.title;
    el('tutorial-text').textContent = slide.text;
    el('tutorial-dots').innerHTML = TUTORIAL_SLIDES.map((_, i) =>
      `<span class="dot ${i === tutorialIndex ? 'active' : ''}"></span>`).join('');
    el('tutorial-back').disabled = tutorialIndex === 0;
    el('tutorial-next').textContent = tutorialIndex === TUTORIAL_SLIDES.length - 1 ? 'Let’s go!' : 'Next';
  }

  function openTutorial() {
    tutorialIndex = 0;
    renderTutorial();
    el('tutorial-overlay').classList.add('show');
  }
  function closeTutorial() {
    el('tutorial-overlay').classList.remove('show');
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
  el('tutorial-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeTutorial();
  });
  el('howto-btn').addEventListener('click', openTutorial);

  // ---------------------------------------------------------------- sound toggle

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

  // ---------------------------------------------------------------- wiring

  el('quit-btn').addEventListener('click', () => {
    clearInterval(state.timer);
    stopGlintLoop();
    SOUND.click();
    renderIntro();
    showScreen('intro');
  });
  el('notebook-btn').addEventListener('click', () => { SOUND.click(); openNotebook(); });
  el('notebook-close').addEventListener('click', () => { SOUND.click(); el('notebook-overlay').classList.remove('show'); });
  el('replay-btn').addEventListener('click', () => { SOUND.click(); startRegion(state.region.key); });
  el('menu-btn').addEventListener('click', () => { SOUND.click(); renderIntro(); showScreen('intro'); });

  el('card-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) el('card-next').click();
  });
  el('notebook-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) el('notebook-overlay').classList.remove('show');
  });

  renderIntro();

  let seenTutorial = false;
  try { seenTutorial = localStorage.getItem(LS_SEEN_TUTORIAL) === '1'; } catch {}
  if (!seenTutorial) openTutorial();
})();
