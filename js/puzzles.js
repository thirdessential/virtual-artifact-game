/* ==================================================================
   Virtual Artifact Hunt — restoration puzzles
   Finding an artifact opens one of four small puzzles that "restore"
   it before it joins the collection: jigsaw, broken shards, sliding
   tiles, or dust-off. All are DOM + CSS background-image based (no
   canvas reads of the photo), so they work from file:// too.
   PUZZLES.open({ src, name, type, onDone(solved) })
   ================================================================== */

const PUZZLES = (() => {
  const TYPES = ['jigsaw', 'shards', 'sliding', 'dust'];
  const COPY = {
    jigsaw: ['Piece it together', 'Drag each piece onto the faint outline. Pieces snap into place when they’re close.'],
    shards: ['Mend the broken pieces', 'This artifact cracked into shards. Drag each shard back to where it belongs.'],
    sliding: ['Slide it back in order', 'Tap a tile next to the gap to slide it. Rebuild the picture shown in the corner.'],
    dust: ['Dust it off', 'This artifact is buried in dust. Rub across it to brush the dirt away.'],
  };

  const el = (id) => document.getElementById(id);
  const shuffleInPlace = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let finish = null;

  function loadCover(src, S) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || 200, h = img.naturalHeight || 220;
        const scale = Math.max(S / w, S / h);
        const bw = w * scale, bh = h * scale;
        resolve({ bw, bh, ox: (bw - S) / 2, oy: (bh - S) / 2 });
      };
      img.onerror = () => resolve({ bw: S, bh: S, ox: 0, oy: 0 });
      img.src = src;
    });
  }

  function bg(node, src, cover, x = 0, y = 0) {
    node.style.backgroundImage = `url("${src}")`;
    node.style.backgroundSize = `${cover.bw}px ${cover.bh}px`;
    node.style.backgroundPosition = `${-(x + cover.ox)}px ${-(y + cover.oy)}px`;
  }

  function dragify(node, { onMove, onDrop }) {
    let sx = 0, sy = 0, active = false;
    node.addEventListener('pointerdown', (e) => {
      if (node.classList.contains('placed')) return;
      active = true; sx = e.clientX; sy = e.clientY;
      node.setPointerCapture(e.pointerId);
      node.style.zIndex = String(Date.now() % 100000);
      node.classList.add('dragging');
      e.preventDefault();
    });
    node.addEventListener('pointermove', (e) => {
      if (!active) return;
      onMove(e.clientX - sx, e.clientY - sy);
      sx = e.clientX; sy = e.clientY;
    });
    const end = () => { if (!active) return; active = false; node.classList.remove('dragging'); onDrop(); };
    node.addEventListener('pointerup', end);
    node.addEventListener('pointercancel', end);
  }

  // ------------------------------------------------------------ jigsaw
  function jigsaw(stage, src, cover, S, solved) {
    const n = 3, p = S / n, T = Math.round(S * 0.78);
    // Scatter pieces over a jittered 4×3 grid in the tray so they overlap
    // only partly and every piece stays grabbable.
    const slots = [];
    for (let row = 0; row < 3; row++) for (let col = 0; col < 4; col++) {
      slots.push([col * (S - p) / 3, S + 8 + row * (T - p - 8) / 2]);
    }
    shuffleInPlace(slots);
    stage.style.height = `${S + T}px`;
    const board = document.createElement('div');
    board.className = 'pz-board pz-ghost';
    board.style.width = board.style.height = `${S}px`;
    bg(board, src, cover);
    stage.appendChild(board);
    let left = n * n;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      const piece = document.createElement('div');
      piece.className = 'pz-piece';
      piece.style.width = piece.style.height = `${p}px`;
      bg(piece, src, cover, c * p, r * p);
      const [sx, sy] = slots.pop();
      let x = Math.min(S - p, Math.max(0, sx + (Math.random() - 0.5) * 14));
      let y = Math.min(S + T - p, Math.max(S + 4, sy + (Math.random() - 0.5) * 10));
      const place = () => { piece.style.left = `${x}px`; piece.style.top = `${y}px`; };
      place();
      dragify(piece, {
        onMove(dx, dy) {
          x = Math.min(Math.max(x + dx, 0), S - p);
          y = Math.min(Math.max(y + dy, 0), S + T - p);
          place();
        },
        onDrop() {
          if (Math.hypot(x - c * p, y - r * p) < p * 0.3) {
            x = c * p; y = r * p; place();
            piece.classList.add('placed'); piece.style.zIndex = '0';
            SOUND.click();
            if (--left === 0) solved();
          }
        },
      });
      stage.appendChild(piece);
    }
  }

  // ------------------------------------------------------------ shards
  const SHARD_POLYS = (() => {
    const P = {
      A: [0, 0], B: [.38, 0], C: [.7, 0], D: [1, 0],
      E: [0, .52], F: [.42, .46], G: [.66, .56], H: [1, .44],
      I: [0, 1], J: [.34, 1], K: [.72, 1], L: [1, 1],
      bf: [.45, .24], cg: [.62, .28], ef: [.2, .56], fg: [.55, .44],
      gh: [.83, .53], fj: [.33, .74], gk: [.74, .79],
    };
    return [
      ['A', 'B', 'bf', 'F', 'ef', 'E'],
      ['B', 'C', 'cg', 'G', 'fg', 'F', 'bf'],
      ['C', 'D', 'H', 'gh', 'G', 'cg'],
      ['E', 'ef', 'F', 'fj', 'J', 'I'],
      ['F', 'fg', 'G', 'gk', 'K', 'J', 'fj'],
      ['G', 'gh', 'H', 'L', 'K', 'gk'],
    ].map(keys => keys.map(k => P[k]));
  })();

  function shards(stage, src, cover, S, solved) {
    const T = Math.round(S * 0.92);
    stage.style.height = `${S + T}px`;
    const board = document.createElement('div');
    board.className = 'pz-board pz-ghost';
    board.style.width = board.style.height = `${S}px`;
    bg(board, src, cover);
    stage.appendChild(board);
    let left = SHARD_POLYS.length;
    // Lay shards out on a 3×2 grid in the tray, centred on each cell.
    const cells = shuffleInPlace([0, 1, 2, 3, 4, 5]).map(k => [S * (1 / 6 + (k % 3) / 3), S + T * (k < 3 ? 0.28 : 0.72)]);
    SHARD_POLYS.forEach((poly, idx) => {
      const shard = document.createElement('div');
      shard.className = 'pz-shard';
      shard.style.width = shard.style.height = `${S}px`;
      shard.style.clipPath = `polygon(${poly.map(([x, y]) => `${x * 100}% ${y * 100}%`).join(',')})`;
      bg(shard, src, cover);
      const cx = poly.reduce((s, q) => s + q[0], 0) / poly.length;
      const cy = poly.reduce((s, q) => s + q[1], 0) / poly.length;
      const [tx, ty] = cells[idx];
      let dx = tx - S * cx, dy = ty - S * cy;
      const place = () => { shard.style.transform = `translate(${dx}px, ${dy}px)`; };
      place();
      dragify(shard, {
        onMove(mx, my) { dx += mx; dy += my; place(); },
        onDrop() {
          if (Math.hypot(dx, dy) < S * 0.08) {
            dx = 0; dy = 0; place();
            shard.classList.add('placed'); shard.style.zIndex = '0';
            SOUND.click();
            if (--left === 0) solved();
          }
        },
      });
      stage.appendChild(shard);
    });
  }

  // ----------------------------------------------------------- sliding
  function sliding(stage, src, cover, S, solved) {
    const n = 3, p = S / n;
    stage.style.height = `${S}px`;
    const board = document.createElement('div');
    board.className = 'pz-board';
    board.style.width = board.style.height = `${S}px`;
    stage.appendChild(board);

    const order = [...Array(n * n).keys()]; // order[pos] = tile id; id 8 = gap
    let gap = n * n - 1, prev = -1;
    const neighbours = (i) => [i - n, i + n, i % n ? i - 1 : -1, i % n < n - 1 ? i + 1 : -1].filter(j => j >= 0 && j < n * n);
    for (let k = 0; k < 90; k++) {
      const opts = neighbours(gap).filter(j => j !== prev);
      const j = opts[Math.floor(Math.random() * opts.length)];
      [order[gap], order[j]] = [order[j], order[gap]];
      prev = gap; gap = j;
    }
    if (order.every((t, i) => t === i)) { [order[0], order[1]] = [order[1], order[0]]; }

    const tiles = {};
    const position = (id) => {
      const pos = order.indexOf(id);
      tiles[id].style.transform = `translate(${(pos % n) * p}px, ${Math.floor(pos / n) * p}px)`;
    };
    for (let id = 0; id < n * n - 1; id++) {
      const t = document.createElement('button');
      t.type = 'button';
      t.className = 'pz-tile';
      t.style.width = t.style.height = `${p}px`;
      t.setAttribute('aria-label', `Tile ${id + 1}`);
      bg(t, src, cover, (id % n) * p, Math.floor(id / n) * p);
      tiles[id] = t;
      t.addEventListener('click', () => {
        const pos = order.indexOf(id);
        if (!neighbours(gap).includes(pos)) return;
        [order[gap], order[pos]] = [order[pos], order[gap]];
        gap = pos;
        position(id);
        SOUND.click();
        if (order.every((tid, i) => tid === i)) solved();
      });
      board.appendChild(t);
      position(id);
    }
    el('puzzle-preview').hidden = false;
  }

  // -------------------------------------------------------------- dust
  function dust(stage, src, cover, S, solved) {
    stage.style.height = `${S}px`;
    const board = document.createElement('div');
    board.className = 'pz-board';
    board.style.width = board.style.height = `${S}px`;
    bg(board, src, cover);
    stage.appendChild(board);

    const canvas = document.createElement('canvas');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.height = Math.round(S * dpr);
    canvas.className = 'pz-dust';
    canvas.style.width = canvas.style.height = `${S}px`;
    board.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#8a6a44';
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 260; i++) {
      ctx.fillStyle = ['#7a5c38', '#9c7c52', '#6b4f30', '#a8875c'][i % 4];
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(Math.random() * S, Math.random() * S, 4 + Math.random() * 18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineWidth = S * 0.2;

    let last = null, done = false, moves = 0;
    const pt = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const cleared = () => {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0, total = 0;
      for (let i = 3; i < data.length; i += 4 * 16) { total++; if (data[i] < 40) clear++; }
      return clear / total;
    };
    const check = () => {
      if (done || cleared() < 0.62) return;
      done = true;
      canvas.classList.add('gone');
      solved();
    };
    canvas.addEventListener('pointerdown', (e) => { canvas.setPointerCapture(e.pointerId); last = pt(e); e.preventDefault(); });
    canvas.addEventListener('pointermove', (e) => {
      if (!last || done) return;
      const p = pt(e);
      ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
      last = p;
      if (++moves % 6 === 0) check();
    });
    const up = () => { if (last) check(); last = null; };
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
  }

  const BUILDERS = { jigsaw, shards, sliding, dust };

  async function open({ src, name, type, onDone }) {
    const overlay = el('puzzle-overlay');
    const stage = el('puzzle-stage');
    // Size the board to the screen (big tablet → big pieces). Jigsaw and
    // shards also need a tray below the board, so budget for its height.
    const tall = { jigsaw: 1.78, shards: 1.92, sliding: 1, dust: 1 }[type];
    const S = Math.round(Math.max(220, Math.min(460, window.innerWidth - 80, (window.innerHeight * 0.88 - 300) / tall)));
    stage.innerHTML = '';
    stage.style.width = `${S}px`;
    el('puzzle-title').textContent = COPY[type][0];
    el('puzzle-instr').textContent = COPY[type][1];
    el('puzzle-name').textContent = name;
    el('puzzle-status').textContent = '';
    const preview = el('puzzle-preview');
    preview.hidden = true;
    preview.style.backgroundImage = `url("${src}")`;
    el('puzzle-skip').hidden = false;
    overlay.classList.add('show');

    finish = (solved) => {
      finish = null;
      overlay.classList.remove('show');
      onDone(solved);
    };

    const cover = await loadCover(src, S);
    BUILDERS[type](stage, src, cover, S, () => {
      SOUND.correct();
      el('puzzle-status').textContent = 'Restored!';
      el('puzzle-skip').hidden = true;
      setTimeout(() => finish && finish(true), 800);
    });
  }

  el('puzzle-skip').addEventListener('click', () => finish && finish(false));

  return { open, TYPES };
})();
