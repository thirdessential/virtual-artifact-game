/* ==================================================================
   Virtual Artifact Hunt — culturally themed gallery rooms
   Every region gets its own architecture, materials, light, furniture
   styling, props and clutter, all drawn from primitives and canvas-
   painted textures in code. Decor is *inspired by* each region's broad
   visual traditions (lacquer and lattice, earth and thatch, stone and
   timber, weave and bamboo, cedar and carved stone) and deliberately
   avoids replicating specific sacred objects.

   ROOMS.build(key, K) builds the room into K.scene and returns
   { spots, filler(spot), tick(now) }. K is the toolkit world.js passes
   in (THREE, sizes, mesh helpers, makeContainer, tag…). Furniture keeps
   the same geometry, hiding spots and close-up views in every region —
   only its look changes — so gameplay is identical everywhere.
   ================================================================== */

const ROOMS = (() => {
  let T, K, H, HEIGHT;           // set per build
  let lamps = [], flames = [];

  // ===================================================== paint helpers
  const rnd = Math.random;
  const hex = (n) => '#' + n.toString(16).padStart(6, '0');
  function shade(n, f) {
    const r = Math.min(255, ((n >> 16) & 255) * f), g = Math.min(255, ((n >> 8) & 255) * f), b = Math.min(255, (n & 255) * f);
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  }
  function noise(g, w, h, n, a, s = 3, light = false) {
    for (let i = 0; i < n; i++) {
      g.fillStyle = light ? `rgba(255,255,255,${rnd() * a})` : `rgba(0,0,0,${rnd() * a})`;
      g.fillRect(rnd() * w, rnd() * h, s, s);
    }
  }
  function tex(w, h, draw, rx = 1, ry = rx) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(rx, ry);
    t.anisotropy = 4;
    return t;
  }
  const m = (color, rough = 0.85, metal = 0, extra = {}) =>
    new T.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
  const tm = (painter, w, h, rx, ry, extra = {}) =>
    new T.MeshStandardMaterial({ map: tex(w, h, painter, rx, ry), roughness: 0.9, ...extra });

  // -------------------------------------------------------- painters
  const P = {
    planks: (base, rows = 8, vertical = false) => (g, w, h) => {
      for (let i = 0; i < rows; i++) {
        g.fillStyle = shade(base, 0.8 + ((i * 37) % 5) * 0.07);
        if (vertical) g.fillRect(i * w / rows, 0, w / rows, h); else g.fillRect(0, i * h / rows, w, h / rows);
        g.strokeStyle = 'rgba(0,0,0,.09)';
        for (let k = 0; k < 7; k++) {
          g.beginPath();
          if (vertical) { const x = i * w / rows + rnd() * w / rows; g.moveTo(x, 0); g.bezierCurveTo(x + 4, h * 0.3, x - 4, h * 0.6, x + 2, h); }
          else { const y = i * h / rows + rnd() * h / rows; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 3, w * 0.6, y - 3, w, y + 1); }
          g.stroke();
        }
        g.fillStyle = 'rgba(0,0,0,.4)';
        if (vertical) g.fillRect(i * w / rows, 0, 2, h); else { g.fillRect(0, i * h / rows, w, 2); g.fillRect(((i * 97) % (w - 30)) + 15, i * h / rows, 2, h / rows); }
      }
    },
    plaster: (base, blot = 0.06) => (g, w, h) => {
      g.fillStyle = hex(base); g.fillRect(0, 0, w, h);
      for (let i = 0; i < 60; i++) {
        g.fillStyle = `rgba(${rnd() < 0.5 ? '0,0,0' : '255,240,220'},${rnd() * blot})`;
        g.beginPath(); g.arc(rnd() * w, rnd() * h, 10 + rnd() * 40, 0, 7); g.fill();
      }
      noise(g, w, h, 900, 0.07, 2);
    },
    stone: (base) => (g, w, h) => {
      g.fillStyle = '#2a2622'; g.fillRect(0, 0, w, h);
      const rows = 8, bh = h / rows;
      for (let r = 0; r < rows; r++) {
        let x = r % 2 ? -bh * 0.8 : 0;
        while (x < w) {
          const bw = bh * (1.3 + rnd() * 1.2);
          g.fillStyle = shade(base, 0.75 + rnd() * 0.45);
          g.beginPath();
          g.roundRect ? g.roundRect(x + 3, r * bh + 3, bw - 6, bh - 6, 6) : g.rect(x + 3, r * bh + 3, bw - 6, bh - 6);
          g.fill();
          x += bw;
        }
      }
      noise(g, w, h, 1600, 0.12, 2);
      noise(g, w, h, 300, 0.06, 3, true);
    },
    rock: (base) => (g, w, h) => {
      g.fillStyle = hex(base); g.fillRect(0, 0, w, h);
      for (let i = 0; i < 90; i++) {
        g.fillStyle = `rgba(${rnd() < 0.5 ? '0,0,0' : '255,250,235'},${rnd() * 0.12})`;
        g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 6 + rnd() * 30, 4 + rnd() * 14, rnd() * 3, 0, 7); g.fill();
      }
      g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1.5;
      for (let i = 0; i < 10; i++) { g.beginPath(); let x = rnd() * w, y = rnd() * h; g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (rnd() - 0.5) * 30; y += 10 + rnd() * 25; g.lineTo(x, y); } g.stroke(); }
      for (let i = 0; i < 40; i++) { g.fillStyle = rnd() < 0.6 ? 'rgba(150,170,90,.5)' : 'rgba(210,200,120,.45)'; g.beginPath(); g.arc(rnd() * w, rnd() * h, 2 + rnd() * 6, 0, 7); g.fill(); }
      noise(g, w, h, 1500, 0.14, 2);
    },
    flagstone: (base) => (g, w, h) => {
      g.fillStyle = '#1e1b18'; g.fillRect(0, 0, w, h);
      const n = 5, cs = w / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const j1 = () => (rnd() - 0.5) * cs * 0.16;
        g.fillStyle = shade(base, 0.7 + rnd() * 0.5);
        g.beginPath();
        g.moveTo(i * cs + 4 + j1(), j * cs + 4 + j1());
        g.lineTo((i + 1) * cs - 4 + j1(), j * cs + 4 + j1());
        g.lineTo((i + 1) * cs - 4 + j1(), (j + 1) * cs - 4 + j1());
        g.lineTo(i * cs + 4 + j1(), (j + 1) * cs - 4 + j1());
        g.closePath(); g.fill();
      }
      noise(g, w, h, 2000, 0.12, 2);
    },
    earth: (base) => (g, w, h) => {
      g.fillStyle = hex(base); g.fillRect(0, 0, w, h);
      for (let i = 0; i < 2600; i++) {
        g.fillStyle = shade(base, 0.7 + rnd() * 0.6);
        g.fillRect(rnd() * w, rnd() * h, 2, 2);
      }
      g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 1;
      for (let i = 0; i < 14; i++) {
        g.beginPath(); let x = rnd() * w, y = rnd() * h; g.moveTo(x, y);
        for (let k = 0; k < 5; k++) { x += (rnd() - 0.5) * 40; y += (rnd() - 0.5) * 40; g.lineTo(x, y); }
        g.stroke();
      }
    },
    sand: (base) => (g, w, h) => {
      g.fillStyle = hex(base); g.fillRect(0, 0, w, h);
      for (let i = 0; i < 4000; i++) { g.fillStyle = shade(base, 0.82 + rnd() * 0.35); g.fillRect(rnd() * w, rnd() * h, 1.5, 1.5); }
      g.strokeStyle = 'rgba(255,255,255,.06)';
      for (let y = 10; y < h; y += 22) { g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x / 20) * 3); g.stroke(); }
    },
    weave: (c1, c2, cells = 8) => (g, w, h) => {
      const s = w / cells;
      for (let i = 0; i < cells; i++) for (let j = 0; j < cells; j++) {
        const horiz = (i + j) % 2 === 0;
        const grd = horiz ? g.createLinearGradient(0, j * s, 0, (j + 1) * s) : g.createLinearGradient(i * s, 0, (i + 1) * s, 0);
        grd.addColorStop(0, shade(c1, 0.7)); grd.addColorStop(0.5, hex(horiz ? c1 : c2)); grd.addColorStop(1, shade(c1, 0.7));
        g.fillStyle = grd; g.fillRect(i * s, j * s, s, s);
        g.strokeStyle = 'rgba(0,0,0,.18)';
        for (let k = 1; k < 3; k++) {
          g.beginPath();
          if (horiz) { g.moveTo(i * s, j * s + k * s / 3); g.lineTo((i + 1) * s, j * s + k * s / 3); }
          else { g.moveTo(i * s + k * s / 3, j * s); g.lineTo(i * s + k * s / 3, (j + 1) * s); }
          g.stroke();
        }
      }
    },
    thatch: (base) => (g, w, h) => {
      g.fillStyle = shade(base, 0.55); g.fillRect(0, 0, w, h);
      for (let i = 0; i < 2600; i++) {
        const x = rnd() * w, y = rnd() * h, l = 10 + rnd() * 18;
        g.strokeStyle = shade(base, 0.7 + rnd() * 0.6); g.lineWidth = 1 + rnd();
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + l * 0.25, y + l); g.stroke();
      }
    },
    coffer: (beam, panel, accent) => (g, w, h) => {
      g.fillStyle = hex(beam); g.fillRect(0, 0, w, h);
      const n = 4, s = w / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        g.fillStyle = hex(panel); g.fillRect(i * s + 10, j * s + 10, s - 20, s - 20);
        g.strokeStyle = hex(accent); g.lineWidth = 3; g.strokeRect(i * s + 16, j * s + 16, s - 32, s - 32);
        g.fillStyle = hex(accent); g.beginPath(); g.arc(i * s + s / 2, j * s + s / 2, s * 0.14, 0, 7); g.fill();
        g.fillStyle = hex(panel); g.beginPath(); g.arc(i * s + s / 2, j * s + s / 2, s * 0.07, 0, 7); g.fill();
      }
    },
    shoji: (g, w, h) => {
      g.fillStyle = '#f3e6c8'; g.fillRect(0, 0, w, h);
      noise(g, w, h, 600, 0.04, 2);
      g.fillStyle = '#2b1710';
      const cols = 4, rows = 6;
      for (let i = 0; i <= cols; i++) g.fillRect(i * (w - 8) / cols, 0, 8, h);
      for (let j = 0; j <= rows; j++) g.fillRect(0, j * (h - 8) / rows, w, 8);
    },
    cloud: (base, fg) => (g, w, h) => {
      g.fillStyle = hex(base); g.fillRect(0, 0, w, h);
      g.strokeStyle = hex(fg); g.lineWidth = 4;
      const s = h * 0.8;
      for (let x = s / 2; x < w + s; x += s * 1.15) {
        const y = h / 2;
        g.beginPath(); g.arc(x, y, s * 0.32, Math.PI * 0.2, Math.PI * 1.9); g.stroke();
        g.beginPath(); g.arc(x + s * 0.12, y + s * 0.02, s * 0.15, Math.PI * 1.1, Math.PI * 2.8); g.stroke();
        g.beginPath(); g.moveTo(x + s * 0.3, y + s * 0.14); g.quadraticCurveTo(x + s * 0.55, y + s * 0.35, x + s * 0.8, y + s * 0.05); g.stroke();
      }
      g.fillStyle = hex(fg); g.fillRect(0, 0, w, 5); g.fillRect(0, h - 5, w, 5);
    },
    brocade: (base, fg) => (g, w, h) => {
      g.fillStyle = hex(base); g.fillRect(0, 0, w, h);
      g.strokeStyle = hex(fg); g.lineWidth = 3;
      for (let y = 20; y < h; y += 50) for (let x = (y / 50) % 2 ? 25 : 0; x < w + 50; x += 50) {
        g.beginPath(); g.arc(x, y, 12, 0, 7); g.stroke();
        g.beginPath(); g.arc(x, y, 5, 0, 7); g.stroke();
      }
      g.fillStyle = hex(fg); g.fillRect(0, 0, w, 8); g.fillRect(0, h - 8, w, 8);
    },
    porcelain: (g, w, h) => {
      g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#2a4f9a';
      [0.12, 0.88].forEach(f => g.fillRect(0, h * f - 4, w, 8));
      g.strokeStyle = '#2a4f9a'; g.lineWidth = 3;
      for (let x = 10; x < w; x += 40) { g.beginPath(); g.arc(x, h * 0.5, 14, 0, 7); g.stroke(); g.beginPath(); g.moveTo(x - 14, h * 0.5); g.lineTo(x + 14, h * 0.5); g.stroke(); }
    },
    ndebele: (g, w, h) => {
      g.fillStyle = '#efe6d2'; g.fillRect(0, 0, w, h);
      const cols = ['#c9302c', '#f2b632', '#2f6db0', '#3a8d4f'];
      const cw = w / 4;
      g.lineWidth = 7; g.strokeStyle = '#1c1c1c';
      for (let i = 0; i < 4; i++) {
        const x = i * cw;
        g.fillStyle = cols[i % 4];
        g.beginPath();
        g.moveTo(x + cw * 0.08, h * 0.9); g.lineTo(x + cw * 0.08, h * 0.38); g.lineTo(x + cw * 0.28, h * 0.38);
        g.lineTo(x + cw * 0.28, h * 0.12); g.lineTo(x + cw * 0.72, h * 0.12); g.lineTo(x + cw * 0.72, h * 0.38);
        g.lineTo(x + cw * 0.92, h * 0.38); g.lineTo(x + cw * 0.92, h * 0.9); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = cols[(i + 2) % 4]; g.fillRect(x + cw * 0.36, h * 0.46, cw * 0.28, h * 0.32); g.strokeRect(x + cw * 0.36, h * 0.46, cw * 0.28, h * 0.32);
        g.fillStyle = '#1c1c1c';
        for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x + cw * (0.38 + k * 0.08), h * 0.46); g.lineTo(x + cw * (0.42 + k * 0.08), h * 0.36); g.lineTo(x + cw * (0.46 + k * 0.08), h * 0.46); g.fill(); }
      }
      g.fillStyle = '#1c1c1c'; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 10, w, 10);
    },
    bogolan: (g, w, h) => {
      g.fillStyle = '#4a3020'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#e8dcc0'; g.fillStyle = '#e8dcc0'; g.lineWidth = 4;
      const rows = 5, rh = h / rows;
      for (let r = 0; r < rows; r++) {
        g.fillRect(0, r * rh, w, 3);
        const y = r * rh + rh / 2;
        if (r % 3 === 0) for (let x = 12; x < w; x += 24) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
        else if (r % 3 === 1) { g.beginPath(); for (let x = 0; x <= w; x += 18) g.lineTo(x, y + ((x / 18) % 2 ? -rh * 0.25 : rh * 0.25)); g.stroke(); }
        else for (let x = 16; x < w; x += 32) { g.beginPath(); g.moveTo(x - 9, y); g.lineTo(x + 9, y); g.moveTo(x, y - 9); g.lineTo(x, y + 9); g.stroke(); }
      }
    },
    chevron: (base, fg) => (g, w, h) => {
      g.fillStyle = hex(base); g.fillRect(0, 0, w, h);
      g.strokeStyle = hex(fg); g.lineWidth = 5;
      for (let y = 14; y < h; y += 22) { g.beginPath(); for (let x = 0; x <= w; x += 20) g.lineTo(x, y + ((x / 20) % 2 ? -7 : 7)); g.stroke(); }
      noise(g, w, h, 400, 0.12, 2);
    },
    knot: (base, fg, border) => (g, w, h) => {
      g.fillStyle = hex(base); g.fillRect(0, 0, w, h);
      g.fillStyle = hex(border); g.fillRect(0, 0, w, h * 0.08); g.fillRect(0, h * 0.92, w, h * 0.08);
      g.lineWidth = w * 0.045; g.strokeStyle = hex(fg);
      const r = w * 0.17;
      for (let y = h * 0.2; y < h * 0.85; y += r * 1.6) {
        for (let k = 0; k < 2; k++) {
          const x = w * (0.33 + k * 0.34);
          g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
        }
        g.strokeStyle = hex(base); g.lineWidth = w * 0.02;
        g.beginPath(); g.moveTo(w * 0.5, y - r * 0.5); g.lineTo(w * 0.5, y + r * 0.5); g.stroke();
        g.lineWidth = w * 0.045; g.strokeStyle = hex(fg);
      }
    },
    plaid: (base, c1, c2) => (g, w, h) => {
      g.fillStyle = hex(base); g.fillRect(0, 0, w, h);
      g.globalAlpha = 0.55;
      for (let i = 0; i < w; i += 64) {
        g.fillStyle = hex(c1); g.fillRect(i, 0, 22, h); g.fillRect(0, i, w, 22);
        g.fillStyle = hex(c2); g.fillRect(i + 34, 0, 6, h); g.fillRect(0, i + 34, w, 6);
      }
      g.globalAlpha = 1;
    },
    tapa: (g, w, h) => {
      g.fillStyle = '#e6d6b4'; g.fillRect(0, 0, w, h);
      const rows = 6, rh = h / rows;
      for (let r = 0; r < rows; r++) {
        g.fillStyle = '#3a2216'; g.fillRect(0, r * rh, w, 4); g.fillRect(0, r * rh + 8, w, 2);
        g.fillStyle = r % 2 ? '#5a2e18' : '#1e1410';
        const n = 8, tw = w / n;
        for (let k = 0; k < n; k++) {
          g.beginPath();
          if (r % 2) { g.moveTo(k * tw, r * rh + rh); g.lineTo(k * tw + tw / 2, r * rh + 14); g.lineTo((k + 1) * tw, r * rh + rh); }
          else { g.moveTo(k * tw + tw * 0.2, r * rh + rh / 2 + 6); g.lineTo(k * tw + tw / 2, r * rh + 16); g.lineTo(k * tw + tw * 0.8, r * rh + rh / 2 + 6); g.lineTo(k * tw + tw / 2, r * rh + rh - 4); }
          g.fill();
        }
      }
    },
    greca: (base, fg) => (g, w, h) => {
      g.fillStyle = hex(base); g.fillRect(0, 0, w, h);
      noise(g, w, h, 500, 0.12, 2);
      g.strokeStyle = hex(fg); g.lineWidth = h * 0.1; g.lineJoin = 'miter';
      const s = h * 0.8, y0 = h * 0.1;
      for (let x = 0; x < w + s; x += s * 1.1) {
        g.beginPath();
        g.moveTo(x, y0 + s); g.lineTo(x + s * 0.5, y0 + s); g.lineTo(x + s * 0.5, y0 + s * 0.25);
        g.lineTo(x + s * 0.2, y0 + s * 0.25); g.lineTo(x + s * 0.2, y0 + s * 0.55); g.lineTo(x + s * 0.35, y0 + s * 0.55);
        g.moveTo(x + s * 0.5, y0 + s * 0.25); g.lineTo(x + s * 0.5, y0); g.lineTo(x + s * 1.1, y0);
        g.stroke();
      }
    },
    formline: (base) => (g, w, h) => {
      g.fillStyle = hex(base); g.fillRect(0, 0, w, h);
      noise(g, w, h, 300, 0.1, 2);
      const ovoid = (cx, cy, rw, rh, fill) => {
        g.beginPath(); g.ellipse(cx, cy, rw, rh, 0, 0, 7); g.fillStyle = '#1a1310'; g.fill();
        g.beginPath(); g.ellipse(cx, cy, rw * 0.72, rh * 0.62, 0, 0, 7); g.fillStyle = fill; g.fill();
        g.beginPath(); g.ellipse(cx, cy, rw * 0.4, rh * 0.3, 0, 0, 7); g.fillStyle = '#1a1310'; g.fill();
      };
      ovoid(w * 0.3, h * 0.28, w * 0.2, h * 0.11, hex(base));
      ovoid(w * 0.7, h * 0.28, w * 0.2, h * 0.11, hex(base));
      g.lineWidth = w * 0.06; g.strokeStyle = '#a3261c';
      g.beginPath(); g.moveTo(w * 0.15, h * 0.48); g.quadraticCurveTo(w * 0.5, h * 0.75, w * 0.85, h * 0.48); g.stroke();
      ovoid(w * 0.5, h * 0.8, w * 0.28, h * 0.1, '#a3261c');
      g.strokeStyle = '#1a1310'; g.lineWidth = w * 0.04; g.strokeRect(w * 0.04, h * 0.03, w * 0.92, h * 0.94);
    },
    blanket: (g, w, h) => {
      const bands = ['#7a1f14', '#1c1c1c', '#e8dcc0', '#24456e', '#e8dcc0', '#1c1c1c', '#7a1f14'];
      bands.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * h / bands.length, w, h / bands.length); });
      g.fillStyle = '#c98a2a';
      for (let x = w / 8; x < w; x += w / 4) { g.beginPath(); g.moveTo(x, h * 0.3); g.lineTo(x + w * 0.08, h * 0.5); g.lineTo(x, h * 0.7); g.lineTo(x - w * 0.08, h * 0.5); g.fill(); }
    },
    glyphs: (base) => (g, w, h) => {
      g.fillStyle = hex(base); g.fillRect(0, 0, w, h);
      noise(g, w, h, 1500, 0.14, 2);
      const cols = 2, rows = 5, cw = w / cols, rh = h / rows;
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const x = i * cw + 8, y = j * rh + 8, ww = cw - 16, hh = rh - 16;
        g.fillStyle = shade(base, 0.72); g.beginPath();
        g.roundRect ? g.roundRect(x, y, ww, hh, 12) : g.rect(x, y, ww, hh); g.fill();
        g.fillStyle = shade(base, 1.15);
        g.beginPath(); g.arc(x + ww * 0.35, y + hh * 0.4, hh * 0.18, 0, 7); g.fill();
        g.fillRect(x + ww * 0.55, y + hh * 0.25, ww * 0.25, hh * 0.5);
      }
    },
    lagoon: (g, w, h) => {
      const sky = g.createLinearGradient(0, 0, 0, h * 0.6);
      sky.addColorStop(0, '#0b1d33'); sky.addColorStop(1, '#2b5a78');
      g.fillStyle = sky; g.fillRect(0, 0, w, h * 0.6);
      for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,255,255,${rnd() * 0.8})`; g.fillRect(rnd() * w, rnd() * h * 0.5, 1.5, 1.5); }
      g.fillStyle = '#fff6d8'; g.beginPath(); g.arc(w * 0.7, h * 0.22, h * 0.08, 0, 7); g.fill();
      const sea = g.createLinearGradient(0, h * 0.6, 0, h);
      sea.addColorStop(0, '#1d4a5e'); sea.addColorStop(1, '#0a1f2a');
      g.fillStyle = sea; g.fillRect(0, h * 0.6, w, h * 0.4);
      g.fillStyle = 'rgba(255,246,216,.5)';
      for (let y = h * 0.64; y < h; y += 8) g.fillRect(w * 0.7 - 20 + (rnd() - 0.5) * 20, y, 40 * (1 - (y - h * 0.6) / h), 2);
      g.fillStyle = '#0a1a14';
      g.beginPath(); g.moveTo(0, h * 0.6); g.quadraticCurveTo(w * 0.15, h * 0.45, w * 0.3, h * 0.6); g.fill();
    },
    net: (g, w, h) => {
      g.clearRect(0, 0, w, h);
      g.strokeStyle = 'rgba(214,196,150,.9)'; g.lineWidth = 2;
      for (let i = -h; i < w; i += 18) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); g.beginPath(); g.moveTo(i + h, 0); g.lineTo(i, h); g.stroke(); }
    },
    rings: (c1, c2) => (g, w, h) => {
      g.fillStyle = hex(c1); g.fillRect(0, 0, w, h);
      for (let r = w / 2; r > 4; r -= 10) { g.strokeStyle = (r / 10) % 2 < 1 ? hex(c2) : shade(c1, 0.75); g.lineWidth = 5; g.beginPath(); g.arc(w / 2, h / 2, r, 0, 7); g.stroke(); }
    },
    bands: (base, c1, c2) => (g, w, h) => {
      g.fillStyle = hex(base); g.fillRect(0, 0, w, h);
      g.fillStyle = hex(c1); g.fillRect(0, h * 0.25, w, h * 0.12); g.fillRect(0, h * 0.68, w, h * 0.08);
      g.fillStyle = hex(c2);
      for (let x = 0; x < w; x += 24) { g.beginPath(); g.moveTo(x, h * 0.48); g.lineTo(x + 12, h * 0.4); g.lineTo(x + 24, h * 0.48); g.lineTo(x + 12, h * 0.56); g.fill(); }
    },
  };

  // ===================================================== mesh helpers
  const mesh = (geo, mt, x = 0, y = 0, z = 0) => K.mesh(geo, mt, x, y, z);
  const box = (w, h, d, mt, x = 0, y = 0, z = 0) => K.box(w, h, d, mt, x, y, z);
  const cyl = (rt, rb, h, mt, x = 0, y = 0, z = 0, seg = 16, open = false) => mesh(new T.CylinderGeometry(rt, rb, h, seg, 1, open), mt, x, y, z);
  const sph = (r, mt, x = 0, y = 0, z = 0) => mesh(new T.SphereGeometry(r, 16, 12), mt, x, y, z);
  const lathe = (profile, scale, mt, seg = 20) => mesh(new T.LatheGeometry(profile.map(([x, y]) => new T.Vector2(x * scale, y * scale)), seg), mt);
  const plane = (w, h, mt, x = 0, y = 0, z = 0) => { const p = new T.Mesh(new T.PlaneGeometry(w, h), mt); p.position.set(x, y, z); p.receiveShadow = true; return p; };
  const decoy = (obj, label) => K.tag(obj, 'decoy', { label });

  function beam(a, b, r, mt) {
    const va = new T.Vector3(...a), vb = new T.Vector3(...b);
    const len = va.distanceTo(vb);
    const c = cyl(r, r, len, mt, 0, 0, 0, 10);
    c.position.copy(va).add(vb).multiplyScalar(0.5);
    c.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
    return c;
  }

  // Lights that flicker (fire, lanterns) and flames that dance.
  function lamp(parent, x, y, z, color, intensity, distance = 6) {
    const l = new T.PointLight(color, intensity, distance, 1.6);
    l.position.set(x, y, z);
    l.userData.base = intensity;
    parent.add(l);
    lamps.push(l);
    return l;
  }
  function flame(parent, x, y, z, s = 1) {
    const g = new T.Group();
    g.position.set(x, y, z);
    const outer = new T.Mesh(new T.ConeGeometry(0.07 * s, 0.24 * s, 10), new T.MeshBasicMaterial({ color: 0xff8a2a, transparent: true, opacity: 0.85 }));
    const inner = new T.Mesh(new T.ConeGeometry(0.04 * s, 0.15 * s, 8), new T.MeshBasicMaterial({ color: 0xffe28a }));
    outer.position.y = 0.12 * s; inner.position.y = 0.08 * s;
    g.add(outer, inner);
    parent.add(g);
    flames.push(g);
    return g;
  }

  function forEachWall(fn) {
    [[0, -H, 0], [0, H, Math.PI], [-H, 0, Math.PI / 2], [H, 0, -Math.PI / 2]].forEach(([x, z, ry], i) => {
      const g = new T.Group();
      g.position.set(x, 0, z);
      g.rotation.y = ry;
      K.scene.add(g);
      fn(g, i);
    });
  }
  function floorPlane(mt) {
    const f = plane(H * 2, H * 2, mt);
    f.rotation.x = -Math.PI / 2;
    K.scene.add(f);
  }
  function ceilingPlane(mt, y = HEIGHT) {
    const c = plane(H * 2, H * 2, mt);
    c.rotation.x = Math.PI / 2;
    c.position.y = y;
    K.scene.add(c);
  }
  function wallPlane(g, mt) {
    const w = plane(H * 2, HEIGHT, mt, 0, HEIGHT / 2, 0);
    g.add(w);
  }
  function rug(mt, w, d, x, z, ry = 0, round = false) {
    const r = round ? new T.Mesh(new T.CircleGeometry(w, 40), mt) : new T.Mesh(new T.PlaneGeometry(w, d), mt);
    r.rotation.x = -Math.PI / 2;
    r.rotation.z = ry;
    r.position.set(x, 0.006, z);
    r.receiveShadow = true;
    K.scene.add(r);
  }

  // ============================================ shared furniture forms
  // Geometry, hiding spots and close-up views match the original builders
  // exactly; region styles only swap materials, labels and trimmings.

  function chest(S) {
    const g = new T.Group();
    const wood = S.mat.chest, metal = S.mat.metal;
    g.add(K.hollow(1.0, 0.5, 0.6, 0.05, wood));
    g.add(box(0.9, 0.2, 0.5, wood, 0, 0.1, 0));
    const face = plane(0.88, 0.38, S.mat.panel, 0, 0.26, 0.302);
    g.add(face);
    if (S.chestBands) [-0.34, 0.34].forEach(x => { g.add(box(0.07, 0.52, 0.015, metal, x, 0.26, 0.305)); g.add(box(0.07, 0.52, 0.015, metal, x, 0.26, -0.305)); });
    else g.add(box(1.02, 0.04, 0.015, metal, 0, 0.47, 0.305));
    const pivot = new T.Group();
    pivot.position.set(0, 0.5, -0.3);
    pivot.add(box(1.04, 0.1, 0.64, wood, 0, 0.05, 0.32));
    if (S.chestBands) [-0.34, 0.34].forEach(x => pivot.add(box(0.07, 0.11, 0.66, metal, x, 0.05, 0.32)));
    pivot.add(box(0.1, 0.12, 0.04, metal, 0, 0, 0.64));
    g.add(pivot);
    const c = K.makeContainer(g, S.label.chest, (t) => { pivot.rotation.x = -t * 1.9; },
      { anchor: g, cam: [0, 1.45, 1.15], look: [0, 0.3, 0] });
    return { group: g, spots: [{ parent: g, pos: [0, 0.2, 0], scale: 0.75, container: c }] };
  }

  function cabinet(S) {
    const g = new T.Group();
    const wood = S.mat.cabinet, dark = m(0x1e130c);
    g.add(box(0.04, 1.2, 0.55, wood, -0.63, 0.6, 0));
    g.add(box(0.04, 1.2, 0.55, wood, 0.63, 0.6, 0));
    g.add(box(1.3, 0.04, 0.55, wood, 0, 1.2, 0));
    g.add(box(1.3, 0.04, 0.55, wood, 0, 0.02, 0));
    g.add(box(1.3, 1.2, 0.04, wood, 0, 0.6, -0.255));
    if (S.cabinetTop) g.add(S.cabinetTop());
    const spots = [];
    for (let i = 0; i < 3; i++) {
      const d = new T.Group();
      d.position.y = 0.06 + i * 0.38;
      d.add(box(1.18, 0.02, 0.48, dark, 0, 0.01, 0));
      d.add(box(0.02, 0.26, 0.48, wood, -0.59, 0.13, 0));
      d.add(box(0.02, 0.26, 0.48, wood, 0.59, 0.13, 0));
      d.add(box(1.18, 0.26, 0.02, wood, 0, 0.13, -0.23));
      d.add(box(1.24, 0.34, 0.03, wood, 0, 0.17, 0.255));
      d.add(plane(1.12, 0.26, S.mat.drawer, 0, 0.17, 0.272));
      d.add(mesh(new T.SphereGeometry(0.03, 10, 8), S.mat.metal, 0, 0.18, 0.29));
      g.add(d);
      const c = K.makeContainer(d, 'drawer', (t) => { d.position.z = t * 0.5; },
        { anchor: d, cam: [0, 1.2, 0.7], look: [0, 0.05, 0.02] });
      spots.push({ parent: d, pos: [0, 0.05, 0], scale: 0.6, lying: true, container: c });
    }
    const drawers = spots.map(sp => sp.container);
    drawers.forEach(c => { c.siblings = drawers.filter(o => o !== c); });
    return { group: g, spots };
  }

  function clothTable(S) {
    const g = new T.Group();
    const wood = S.mat.table;
    g.add(box(1.5, 0.06, 0.9, wood, 0, 0.75, 0));
    [[-0.68, -0.38], [0.68, -0.38], [-0.68, 0.38], [0.68, 0.38]].forEach(([x, z]) => g.add(box(0.06, 0.72, 0.06, wood, x, 0.36, z)));
    const clothMat = new T.MeshStandardMaterial({ map: S.clothTex, roughness: 0.95, transparent: true, opacity: 1 });
    const cloth = new T.Group();
    const TOP = 1.32, SKIRT = 0.86;
    cloth.add(box(1.62, 0.02, 1.02, clothMat, 0, TOP, 0));
    cloth.add(box(1.62, SKIRT, 0.02, clothMat, 0, TOP - SKIRT / 2, 0.51));
    cloth.add(box(1.62, SKIRT, 0.02, clothMat, 0, TOP - SKIRT / 2, -0.51));
    cloth.add(box(0.02, SKIRT, 1.02, clothMat, 0.81, TOP - SKIRT / 2, 0));
    cloth.add(box(0.02, SKIRT, 1.02, clothMat, -0.81, TOP - SKIRT / 2, 0));
    if (rnd() < 0.6) {
      const lump = mesh(new T.SphereGeometry(0.2, 12, 8), clothMat, (rnd() - 0.5) * 0.8, TOP + 0.01, (rnd() - 0.5) * 0.4);
      lump.scale.y = 0.45;
      cloth.add(lump);
    }
    g.add(cloth);
    const c = K.makeContainer(cloth, S.label.cloth, (t) => {
      cloth.position.y = t * 1.0;
      cloth.rotation.z = t * 0.25;
      clothMat.opacity = 1 - t;
      cloth.visible = t < 0.98;
    }, { anchor: g, cam: [0, 1.85, 1.45], look: [0, 0.95, 0] });
    return { group: g, spots: [{ parent: g, pos: [(rnd() - 0.5) * 0.6, 0.78, 0], scale: 1, container: c }] };
  }

  function crate(S) {
    const g = new T.Group();
    const view = { anchor: g, cam: [0, 1.55, 1.1], look: [0, 0.45, 0] };
    if (S.crate === 'barrel') {
      const staves = new T.MeshStandardMaterial({ map: S.mat.crate.map, color: S.mat.crate.color, roughness: 0.9, side: T.DoubleSide });
      g.add(cyl(0.4, 0.36, 0.72, staves, 0, 0.36, 0, 18, true));
      g.add(cyl(0.36, 0.36, 0.32, S.mat.crate, 0, 0.16, 0, 18));
      [0.08, 0.36, 0.64].forEach(y => { const r = mesh(new T.TorusGeometry(0.4 - (y < 0.36 ? 0.02 : 0) , 0.018, 6, 28), S.mat.metal, 0, y, 0); r.rotation.x = Math.PI / 2; g.add(r); });
      const lid = cyl(0.41, 0.41, 0.05, S.mat.crate, 0, 0.74, 0, 18);
      g.add(lid);
      const c = K.makeContainer(g, S.label.crate, (t) => {
        lid.position.set(t * 0.62, 0.74 + Math.sin(Math.PI * t) * 0.3 - t * 0.7, 0);
        lid.rotation.z = -t * 1.2;
      }, view);
      return { group: g, spots: [{ parent: g, pos: [0, 0.32, 0], scale: 0.85, container: c }] };
    }
    g.add(K.hollow(0.8, 0.7, 0.8, 0.05, S.mat.crate));
    g.add(box(0.7, 0.32, 0.7, S.mat.crate, 0, 0.16, 0));
    [[0, 0.41, 0], [0, -0.41, Math.PI], [0.41, 0, Math.PI / 2], [-0.41, 0, -Math.PI / 2]].forEach(([x, z, ry]) => {
      const p = plane(0.74, 0.62, S.mat.crateFace, x, 0.36, z);
      p.rotation.y = ry;
      p.position.x += Math.sign(x) * 0.003; p.position.z += Math.sign(z) * 0.003;
      g.add(p);
    });
    const lid = box(0.84, 0.06, 0.84, S.mat.crate, 0, 0.73, 0);
    g.add(lid);
    const c = K.makeContainer(g, S.label.crate, (t) => {
      lid.position.x = t * 0.95;
      lid.position.y = 0.73 + Math.sin(Math.PI * t) * 0.3 - t * 0.68;
    }, view);
    return { group: g, spots: [{ parent: g, pos: [0, 0.32, 0], scale: 0.85, container: c }] };
  }

  function basket(S) {
    const g = new T.Group();
    const weave = S.mat.weave;
    const wallMat = new T.MeshStandardMaterial({ map: weave.map, roughness: 1, side: T.DoubleSide });
    g.add(cyl(0.36, 0.3, 0.5, wallMat, 0, 0.25, 0, 18, true));
    g.add(cyl(0.3, 0.3, 0.26, weave, 0, 0.13, 0, 18));
    [0.12, 0.3, 0.45].forEach(y => {
      const ring = mesh(new T.TorusGeometry(0.34 - y * 0.08, 0.014, 6, 24), S.mat.band, 0, y, 0);
      ring.rotation.x = Math.PI / 2;
      g.add(ring);
    });
    const lid = new T.Group();
    lid.position.y = 0.52;
    lid.add(cyl(0.39, 0.39, 0.05, weave, 0, 0, 0, 18));
    lid.add(sph(0.05, S.mat.band, 0, 0.05, 0));
    g.add(lid);
    const c = K.makeContainer(g, S.label.basket, (t) => {
      lid.position.set(t * 0.55, 0.52 + Math.sin(Math.PI * t) * 0.35, 0);
      lid.rotation.z = -t * 0.6;
    }, { anchor: g, cam: [0, 1.35, 0.95], look: [0, 0.35, 0] });
    return { group: g, spots: [{ parent: g, pos: [0, 0.26, 0], scale: 0.6, container: c }] };
  }

  function shelf(S) {
    const g = new T.Group();
    const wood = S.mat.shelf;
    g.add(box(0.04, 1.9, 0.4, wood, -0.8, 0.95, 0));
    g.add(box(0.04, 1.9, 0.4, wood, 0.8, 0.95, 0));
    g.add(box(1.64, 1.9, 0.03, S.mat.shelfBack || wood, 0, 0.95, -0.185));
    const boards = [0.05, 0.62, 1.22, 1.88];
    boards.forEach(y => g.add(box(1.6, 0.04, 0.4, wood, 0, y, 0)));
    const xs = [-0.55, -0.18, 0.18, 0.55];
    const slots = [];
    boards.slice(0, 3).forEach(y => xs.forEach(x => slots.push([x, y + 0.02])));
    K.shuffle(slots);
    const spots = slots.splice(0, 2).map(([x, y]) => ({ parent: g, pos: [x, y, 0.02], scale: 0.55 }));
    slots.splice(0, 7).forEach(([x, y]) => {
      const d = S.shelfItems[Math.floor(rnd() * S.shelfItems.length)]();
      d.position.set(x, y, 0);
      g.add(d);
    });
    K.tag(g, 'inspect', { label: S.label.shelf, view: { anchor: g, cam: [0, 1.1, 2.25], look: [0, 0.92, 0] } });
    return { group: g, spots };
  }

  function displayCase(S) {
    const g = new T.Group();
    g.add(box(0.6, 0.9, 0.6, S.mat.plinth, 0, 0.45, 0));
    const glass = box(0.56, 0.62, 0.56, new T.MeshStandardMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.16, roughness: 0.05 }), 0, 1.22, 0);
    glass.userData.passThrough = true;
    glass.castShadow = false;
    g.add(glass);
    g.add(box(0.62, 0.04, 0.62, S.mat.plinth, 0, 1.55, 0));
    K.tag(g, 'inspect', { label: 'display case', view: { anchor: g, cam: [0, 1.45, 1.3], look: [0, 1.12, 0] } });
    return { group: g, spots: [{ parent: g, pos: [0, 0.9, 0], scale: 1 }] };
  }

  // Region-styled pillar around a fixed hiding pedestal behind it.
  function pillar(S) {
    const g = new T.Group();
    S.pillar(g);
    g.add(box(0.36, 0.38, 0.36, S.mat.pedestal, 0, 0.19, -0.78));
    K.tag(g, 'inspect', { label: S.label.pillar, view: { anchor: g, cam: [1.25, 1.25, -1.55], look: [0, 0.55, -0.78] } });
    return { group: g, spots: [{ parent: g, pos: [0, 0.38, -0.78], scale: 0.8 }] };
  }

  const wrap = (group) => ({ group, spots: [] });

  // ======================================================= ASIA
  // Temple hall: red lacquer and gold, glowing paper lattice screens,
  // cloud-scroll frieze, coffered ceiling, hanging lanterns.
  function asia() {
    const C = { lacquer: 0x8e1e12, dark: 0x22100a, gold: 0xd4a23c, jade: 0x2f6650, paper: 0xf3e6c8 };
    const gold = m(C.gold, 0.35, 0.7);
    const S = {
      fog: [0x140805, 9, 23], hemi: [0xffc8a0, 0x1a0805, 0.36], spot: 0xffe6c8,
      chestBands: false, crate: 'box',
      label: { chest: 'lacquered chest', crate: 'lacquer box', basket: 'bamboo basket', cloth: 'brocade-covered table', shelf: 'shelf of tea wares', pillar: 'lacquered column' },
      clothTex: tex(256, 256, P.brocade(0x8e1e12, C.gold), 2, 2),
      mat: {
        chest: m(C.lacquer, 0.35), metal: gold, panel: tm(P.cloud(C.lacquer, C.gold), 256, 96, 1, 1, { roughness: 0.4 }),
        cabinet: m(0x2a140c, 0.4), drawer: tm(P.cloud(0x2a140c, C.gold), 256, 64, 1, 1, { roughness: 0.4 }),
        table: m(C.dark, 0.4), crate: m(0x1c0d08, 0.3), crateFace: tm(P.coffer(0x1c0d08, 0x1c0d08, C.gold), 128, 128, 1, 1, { roughness: 0.35 }),
        weave: tm(P.weave(0xc9b27a, 0xa8925a, 10), 128, 128, 2, 1), band: m(C.lacquer, 0.5),
        shelf: m(0x2a140c, 0.45), plinth: m(C.lacquer, 0.35), pedestal: m(0x5a4a3c, 0.9),
      },
      pillar(g) {
        g.add(cyl(0.4, 0.4, HEIGHT - 0.6, m(C.lacquer, 0.35), 0, HEIGHT / 2, 0, 24));
        g.add(cyl(0.55, 0.62, 0.32, m(0x5a4a3c, 0.9), 0, 0.16, 0, 20));
        [0.5, HEIGHT - 0.7].forEach(y => g.add(cyl(0.43, 0.43, 0.12, gold, 0, y, 0, 24)));
        g.add(box(1.2, 0.18, 0.5, m(C.dark, 0.5), 0, HEIGHT - 0.42, 0));
        g.add(box(0.5, 0.18, 1.2, m(C.dark, 0.5), 0, HEIGHT - 0.24, 0));
        g.add(box(0.9, 0.12, 0.9, m(C.jade, 0.6), 0, HEIGHT - 0.08, 0));
      },
      shelfItems: [
        () => { const gg = new T.Group(); [-0.07, 0.07].forEach(x => gg.add(cyl(0.05, 0.035, 0.06, m(0xe8e2d0, 0.3), x, 0.03, 0, 14))); return decoy(gg, 'Just a pair of tea bowls.'); },
        () => { const gg = new T.Group(); const pot = sph(0.09, m(0x3a2a20, 0.5), 0, 0.09, 0); pot.scale.y = 0.8; gg.add(pot); const sp = cyl(0.015, 0.02, 0.1, m(0x3a2a20), 0.1, 0.11, 0); sp.rotation.z = -1; gg.add(sp); gg.add(cyl(0.035, 0.035, 0.03, m(0x3a2a20), 0, 0.17, 0)); return decoy(gg, 'Just an iron teapot.'); },
        () => { const gg = new T.Group(); [0, 0.07].forEach(z => { const s = cyl(0.03, 0.03, 0.34, m(0xe9dcbc, 0.8), 0, 0.03 + z * 0.5, z); s.rotation.z = Math.PI / 2; gg.add(s); }); return decoy(gg, 'Just some rolled paper scrolls.'); },
        () => { const v = lathe([[0, 0], [0.06, 0], [0.09, 0.08], [0.08, 0.16], [0.04, 0.2], [0.05, 0.24]], 1, tm(P.porcelain, 128, 64, 1, 1, { roughness: 0.3 })); return decoy(v, 'Just a blue-and-white porcelain vase.'); },
      ],
      filler: () => decoy(new T.Group().add(...[0, 1, 2, 3].map(i => cyl(0.03, 0.03, 0.006, gold, (rnd() - 0.5) * 0.2, 0.005 + i * 0.006, (rnd() - 0.5) * 0.2, 12))), 'Just a few old coins.'),
    };

    S.shell = () => {
      floorPlane(tm(P.planks(0x3b1d10, 10), 256, 256, 4, 4, { roughness: 0.45 }));
      const runner = tm(P.brocade(0x5a140c, 0x9a7430), 128, 256, 1, 4, { roughness: 0.95 });
      rug(runner, 2.2, 16.4, 0, 0, 0);
      rug(runner, 2.2, 16.4, 0, 0, Math.PI / 2);
      const wall = tm(P.plaster(0x7a1c12, 0.05), 256, 128, 3, 1, { roughness: 0.75 });
      const shoji = new T.MeshStandardMaterial({ map: tex(128, 192, P.shoji), emissive: 0x6a3a10, emissiveIntensity: 0.55, roughness: 0.9 });
      shoji.emissiveMap = shoji.map;
      const frieze = tm(P.cloud(C.jade, C.gold), 512, 64, 6, 1, { roughness: 0.6 });
      const colMat = m(C.lacquer, 0.35);
      forEachWall((g) => {
        wallPlane(g, wall);
        g.add(box(H * 2, 0.5, 0.06, m(C.dark, 0.5), 0, 0.25, 0.03));
        [-6.35, -2.12, 2.12, 6.35].forEach(x => {
          g.add(plane(3.1, 2.9, shoji, x, 2.15, 0.02));
          g.add(box(3.26, 0.12, 0.1, m(C.dark, 0.5), x, 3.66, 0.04));
          g.add(box(3.26, 0.12, 0.1, m(C.dark, 0.5), x, 0.66, 0.04));
        });
        [-8.3, -4.25, 0, 4.25, 8.3].forEach(x => {
          g.add(box(0.36, HEIGHT, 0.18, colMat, x, HEIGHT / 2, 0.09));
          g.add(box(0.44, 0.18, 0.22, gold, x, 3.75, 0.1));
        });
        g.add(plane(H * 2, 0.7, frieze, 0, 4.2, 0.03));
        g.add(box(H * 2, 0.24, 0.24, m(C.dark, 0.5), 0, 4.68, 0.12));
      });
      ceilingPlane(tm(P.coffer(0x24120a, 0x1f4a3a, C.gold), 256, 256, 4, 4, { roughness: 0.7 }));
      [[-4.6, 0], [4.6, 0], [0, -4.6], [0, 4.6]].forEach(([x, z], i) => {
        const g = new T.Group();
        g.position.set(x, 0, z);
        g.add(cyl(0.008, 0.008, 1.0, m(0x111111), 0, HEIGHT - 0.5, 0, 4));
        const lan = sph(0.3, new T.MeshStandardMaterial({ color: 0xc8281c, emissive: 0xff4a1e, emissiveIntensity: 0.85, roughness: 0.7 }), 0, HEIGHT - 1.25, 0);
        lan.scale.y = 1.25;
        g.add(lan);
        [HEIGHT - 0.86, HEIGHT - 1.64].forEach(y => g.add(cyl(0.15, 0.15, 0.06, gold, 0, y, 0, 12)));
        g.add(cyl(0.01, 0.01, 0.3, m(C.gold), 0, HEIGHT - 1.82, 0, 4));
        K.scene.add(decoy(g, 'Just a red paper lantern.'));
        if (i % 2 === 0) lamp(g, 0, HEIGHT - 1.25, 0, 0xff5a2a, 3.2, 7);
      });
    };

    S.props = [
      () => { const g = new T.Group(); [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(([x, z]) => g.add(box(0.05, 1.0, 0.05, m(C.dark), x, 0.5, z)));
        g.add(box(0.46, 0.6, 0.46, new T.MeshStandardMaterial({ map: tex(64, 96, P.shoji), emissive: 0xffa040, emissiveIntensity: 0.9 }), 0, 0.75, 0));
        g.add(box(0.56, 0.06, 0.56, m(C.dark), 0, 1.08, 0));
        lamp(g, 0, 0.8, 0, 0xffa050, 2.4, 6);
        return wrap(decoy(g, 'Just a paper floor lantern.')); },
      () => { const g = new T.Group(); const st = m(0x7a7468, 0.95);
        g.add(cyl(0.3, 0.38, 0.12, st, 0, 0.06, 0, 6)); g.add(cyl(0.1, 0.12, 0.7, st, 0, 0.47, 0, 6)); g.add(cyl(0.34, 0.28, 0.1, st, 0, 0.87, 0, 6));
        g.add(box(0.36, 0.32, 0.36, st, 0, 1.08, 0)); g.add(cyl(0.05, 0.45, 0.28, st, 0, 1.38, 0, 6)); g.add(sph(0.07, st, 0, 1.56, 0));
        return wrap(decoy(g, 'Just a stone garden lantern.')); },
      () => { const g = new T.Group(); [-0.55, 0.55].forEach(x => g.add(box(0.08, 1.7, 0.08, m(C.lacquer, 0.4), x, 0.85, 0)));
        g.add(box(1.3, 0.1, 0.1, m(C.lacquer, 0.4), 0, 1.65, 0));
        const gong = cyl(0.42, 0.42, 0.04, m(0xb08a3a, 0.3, 0.8), 0, 1.0, 0, 32); gong.rotation.x = Math.PI / 2; g.add(gong);
        const boss = sph(0.08, m(0xd4a23c, 0.3, 0.8), 0, 1.0, 0.03); g.add(boss);
        return wrap(decoy(g, 'Just a bronze gong on its stand.')); },
      () => { const g = new T.Group(); g.add(cyl(0.28, 0.22, 0.45, tm(P.porcelain, 128, 64, 1, 1, { roughness: 0.3 }), 0, 0.22, 0, 18));
        for (let i = 0; i < 7; i++) { const a = rnd() * 6.28, r = rnd() * 0.12; const c = cyl(0.025, 0.025, 1.4 + rnd() * 0.7, m(0x5f8a3a, 0.6), Math.cos(a) * r, 1.0, Math.sin(a) * r, 8); c.rotation.z = (rnd() - 0.5) * 0.2; g.add(c); }
        return wrap(decoy(g, 'Just a pot of bamboo.')); },
    ];
    S.decoys = [
      () => { const g = new T.Group(); [[0, 0, 0.5], [0.4, 0.15, 0.36], [-0.32, 0.2, 0.3]].forEach(([x, z, s]) => { const v = lathe([[0, 0], [0.12, 0], [0.2, 0.2], [0.18, 0.42], [0.08, 0.5], [0.1, 0.56]], s * 1.6, tm(P.porcelain, 128, 64, 1, 1, { roughness: 0.3 })); v.position.set(x, 0, z); g.add(v); }); return wrap(decoy(g, 'Just some porcelain vases.')); },
      () => { const g = new T.Group(); g.add(box(1.0, 0.06, 0.6, m(C.lacquer, 0.35), 0, 0.34, 0)); [[-0.44, -0.24], [0.44, -0.24], [-0.44, 0.24], [0.44, 0.24]].forEach(([x, z]) => g.add(box(0.06, 0.32, 0.06, m(C.dark), x, 0.16, z)));
        const pot = sph(0.09, m(0x3a2a20, 0.5), 0, 0.45, 0); pot.scale.y = 0.8; g.add(pot); [-0.2, 0.2].forEach(x => g.add(cyl(0.045, 0.035, 0.06, m(0xe8e2d0, 0.3), x, 0.4, 0.1, 12)));
        return wrap(decoy(g, 'Just a low tea table.')); },
      () => { const g = new T.Group(); const art = tm(P.cloud(0xe8d8b0, C.jade), 128, 192, 1, 1); [-0.62, 0, 0.62].forEach((x, i) => { const p = box(0.6, 1.6, 0.03, art, x, 0.82, 0); p.rotation.y = i === 1 ? 0 : (i ? -0.5 : 0.5); g.add(p); }); return wrap(decoy(g, 'Just a painted folding screen.')); },
      () => { const g = new T.Group(); for (let i = 0; i < 3; i++) g.add(box(0.5 - i * 0.06, 0.16, 0.36 - i * 0.04, m([C.lacquer, C.dark, C.jade][i], 0.35), 0, 0.08 + i * 0.16, 0)); return wrap(decoy(g, 'Just a stack of empty lacquer boxes.')); },
    ];
    return S;
  }

  // ===================================================== AFRICA
  // Earth-and-thatch house: packed earth, ochre mud walls with a bold
  // painted geometric band, woven wall plates, mud-cloth hangings,
  // thatched roof on radial poles, carved posts, a fire brazier.
  function africa() {
    const C = { mud: 0xa8642e, earth: 0x8a5a34, wood: 0x4a2c18, ochre: 0xc8762e, straw: 0xc9a25a, clay: 0x9c4e24 };
    const S = {
      fog: [0x120a04, 9, 23], hemi: [0xffd49a, 0x24140a, 0.44], spot: 0xffe8c0,
      chestBands: false, crate: 'box',
      label: { chest: 'carved wooden chest', crate: 'carved storage box', basket: 'woven grain basket', cloth: 'mud-cloth-covered table', shelf: 'shelf of gourds and pots', pillar: 'carved wooden post' },
      clothTex: tex(256, 256, P.bogolan, 2, 2),
      mat: {
        chest: m(C.wood, 0.8), metal: m(0xb07a30, 0.4, 0.6), panel: tm(P.chevron(C.wood, 0xc8945a), 256, 96),
        cabinet: m(C.wood, 0.85), drawer: tm(P.chevron(C.wood, 0xb07a40), 256, 64),
        table: m(C.wood, 0.85), crate: m(0x6a4024, 0.85), crateFace: tm(P.chevron(0x6a4024, 0xd8a868), 128, 128),
        weave: tm(P.weave(0xd8b070, 0x9a6a30, 8), 128, 128, 2, 1), band: m(0x2a1a10, 0.8),
        shelf: m(C.wood, 0.85), plinth: m(0x7a4a28, 0.9), pedestal: m(C.mud, 0.95),
      },
      pillar(g) {
        const wood = tm(P.chevron(C.wood, 0x2a160a), 128, 256, 2, 4, { roughness: 0.85 });
        g.add(cyl(0.34, 0.42, HEIGHT, wood, 0, HEIGHT / 2, 0, 14));
        [0.7, 1.6, 2.6, 3.6].forEach(y => { const r = mesh(new T.TorusGeometry(0.39, 0.05, 8, 20), m(C.ochre, 0.8), 0, y, 0); r.rotation.x = Math.PI / 2; g.add(r); });
        g.add(cyl(0.55, 0.6, 0.3, m(C.mud, 0.95), 0, 0.15, 0, 16));
      },
      shelfItems: [
        () => { const gg = new T.Group(); const b = sph(0.09, m(0xc8a060, 0.6), 0, 0.09, 0); gg.add(b); gg.add(cyl(0.025, 0.035, 0.1, m(0xc8a060), 0, 0.2, 0, 10)); return decoy(gg, 'Just a dried calabash gourd.'); },
        () => decoy(lathe([[0, 0], [0.06, 0], [0.1, 0.08], [0.09, 0.15], [0.05, 0.2], [0.06, 0.22]], 1, m(C.clay, 0.7)), 'Just a small clay pot.'),
        () => { const gg = new T.Group(); const st = cyl(0.01, 0.012, 0.28, m(0x6a4024), 0, 0.03, 0); st.rotation.z = Math.PI / 2; gg.add(st); const bw = sph(0.04, m(0x6a4024), 0.16, 0.03, 0); bw.scale.y = 0.5; gg.add(bw); return decoy(gg, 'Just a carved wooden spoon.'); },
        () => decoy(cyl(0.1, 0.07, 0.08, tm(P.bands(0x2a1a10, 0xd84a2a, 0xf2c94a), 128, 32), 0, 0.04, 0, 16), 'Just a beaded bowl.'),
      ],
      filler: () => decoy(new T.Group().add(...[0, 1, 2, 3, 4].map(() => { const s = sph(0.025, m(0xf0e8d4, 0.3), (rnd() - 0.5) * 0.2, 0.015, (rnd() - 0.5) * 0.2); s.scale.y = 0.55; return s; })), 'Just a few cowrie shells.'),
    };

    S.shell = () => {
      floorPlane(tm(P.earth(C.earth), 256, 256, 4, 4));
      const mat = tm(P.rings(0xc9a25a, 0x7a4a20), 256, 256);
      rug(mat, 2.4, 0, 0, 0, 0, true);
      [[5.6, 1.6], [-5.6, -1.8], [1.8, -5.7], [-1.6, 5.6]].forEach(([x, z]) => rug(mat, 0.9, 0, x, z, 0, true));
      const wall = tm(P.plaster(C.mud, 0.08), 256, 128, 3, 1, { roughness: 1 });
      const band = tm(P.ndebele, 512, 128, 4, 1, { roughness: 0.9 });
      const plates = [0xc9a25a, 0xd8b070, 0xb08040].map((c, i) => tm(P.rings(c, [0x7a2a1a, 0x2a3a6a, 0x1c1c1c][i]), 128, 128, 1, 1, { roughness: 0.95 }));
      const cloth = tm(P.bogolan, 128, 192);
      forEachWall((g, wi) => {
        wallPlane(g, wall);
        g.add(plane(H * 2, 1.4, band, 0, 1.0, 0.02));
        g.add(box(H * 2, 0.3, 0.3, m(0x7a4220, 1), 0, 0.15, 0.15));
        [-6.4, -2.1, 2.1, 6.4].forEach((x, i) => {
          const d = new T.Mesh(new T.CircleGeometry(0.5 - (i % 2) * 0.12, 32), plates[(i + wi) % 3]);
          d.position.set(x, 3.0 + (i % 2) * 0.5, 0.03);
          g.add(decoy(d, 'Just a woven wall plate.'));
        });
        [-4.25, 4.25].forEach(x => {
          g.add(beam([x - 0.7, 4.0, 0.06], [x + 0.7, 4.0, 0.06], 0.03, m(C.wood)));
          g.add(decoy(plane(1.3, 1.9, cloth, x, 3.0, 0.04), 'Just a mud-cloth hanging.'));
        });
      });
      ceilingPlane(tm(P.thatch(C.straw), 256, 256, 3, 3, { roughness: 1 }));
      const pole = m(0x3a2412, 0.9);
      // Radial roof poles from the centre out to the walls (and corners).
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + Math.PI / 4;
        const R = H / Math.max(Math.abs(Math.sin(a)), Math.abs(Math.cos(a)));
        K.scene.add(beam([0, HEIGHT - 0.02, 0], [Math.sin(a) * R, HEIGHT - 0.14, Math.cos(a) * R], 0.07, pole));
      }
      const ring = mesh(new T.TorusGeometry(4.2, 0.07, 8, 48), pole, 0, HEIGHT - 0.1, 0);
      ring.rotation.x = Math.PI / 2;
      K.scene.add(ring);
    };

    S.props = [
      () => { const g = new T.Group(); [0, 2.1, 4.2].forEach(a => { const l = cyl(0.03, 0.03, 0.55, m(0x1c1c1c, 0.6, 0.5), Math.sin(a) * 0.22, 0.25, Math.cos(a) * 0.22, 6); l.rotation.set(Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3); g.add(l); });
        g.add(lathe([[0, 0], [0.32, 0.02], [0.4, 0.16], [0.38, 0.2]], 1, m(C.clay, 0.8)).translateY(0.42));
        [0, 1, 2].forEach(i => flame(g, (i - 1) * 0.1, 0.56, (i % 2) * 0.06, 1.6));
        lamp(g, 0, 0.9, 0, 0xff8a3a, 4.2, 8);
        return wrap(decoy(g, 'Just a clay fire brazier.')); },
      () => { const g = new T.Group(); [[0, 0, 1], [0.48, 0.16, 0.8]].forEach(([x, z, s]) => {
          const d = lathe([[0, 0], [0.16, 0], [0.12, 0.2], [0.1, 0.32], [0.22, 0.52], [0.24, 0.62]], s, tm(P.bands(0x6a3a1c, 0xc8762e, 0x2a1a10), 128, 64)); d.position.set(x, 0, z); g.add(d);
          g.add(cyl(0.24 * s, 0.24 * s, 0.02, m(0xe8d8b8, 0.8), x, 0.62 * s, z, 20)); });
        return wrap(decoy(g, 'Just a pair of djembe drums.')); },
      () => { const g = new T.Group(); [[0, 0], [0.5, 0.2], [-0.45, 0.25]].forEach(([x, z]) => { g.add(cyl(0.2, 0.2, 0.05, m(C.wood), x, 0.36, z, 16)); g.add(cyl(0.08, 0.14, 0.34, m(C.wood), x, 0.17, z, 10)); g.add(cyl(0.18, 0.2, 0.04, m(C.wood), x, 0.02, z, 16)); });
        return wrap(decoy(g, 'Just some carved wooden stools.')); },
      () => { const g = new T.Group(); const p = lathe([[0, 0], [0.18, 0], [0.32, 0.25], [0.3, 0.55], [0.14, 0.75], [0.12, 0.86], [0.16, 0.9]], 1, m(C.clay, 0.65)); g.add(p);
        g.add(mesh(new T.TorusGeometry(0.2, 0.04, 8, 20), m(0x5a3a1c), 0, 0.04, 0).rotateX(Math.PI / 2));
        return wrap(decoy(g, 'Just a tall water pot.')); },
    ];
    S.decoys = [
      () => { const g = new T.Group(); [[0, 0, 1], [0.42, 0.18, 0.75], [-0.36, 0.22, 0.65]].forEach(([x, z, s]) => { const p = lathe([[0, 0], [0.2, 0], [0.3, 0.18], [0.26, 0.36], [0.12, 0.44], [0.14, 0.48]], s, m(C.clay, 0.7)); p.position.set(x, 0, z); g.add(p); }); return wrap(decoy(g, 'Just some clay cooking pots.')); },
      () => { const g = new T.Group(); g.add(cyl(0.2, 0.16, 0.5, m(C.wood), 0, 0.25, 0, 14)); g.add(cyl(0.14, 0.14, 0.02, m(0x2a1a10), 0, 0.5, 0, 14)); const p = cyl(0.03, 0.04, 1.2, m(0x6a4024), 0.05, 0.75, 0, 8); p.rotation.z = 0.2; g.add(p); return wrap(decoy(g, 'Just a wooden mortar and pestle.')); },
      () => { const g = new T.Group(); [[0, 0], [0.32, 0.1], [-0.28, 0.16], [0.08, -0.3]].forEach(([x, z]) => { const s = sph(0.16, m(0xc8a060, 0.6), x, 0.15, z); s.scale.set(1, 0.9, 1); g.add(s); }); return wrap(decoy(g, 'Just a pile of calabash gourds.')); },
      () => { const g = new T.Group(); [0, 0.3].forEach((z, i) => { const r = cyl(0.13, 0.13, 1.3, tm(P.weave(0xd8b070, 0x9a6a30, 6), 64, 64, 4, 1), 0, 0.13 + i * 0.24, z * 0.4, 14); r.rotation.z = Math.PI / 2; g.add(r); }); return wrap(decoy(g, 'Just some rolled sleeping mats.')); },
    ];
    return S;
  }

  // ===================================================== EUROPE
  // Iron Age stone hall: flagstones, rough stone walls with iron torches,
  // knotwork tapestries, heavy timber rafters, standing stones, barrels,
  // cool misty moonlight against warm torchlight.
  function europe() {
    const C = { stone: 0x7e7a72, oak: 0x4a3420, iron: 0x3a3a3c, green: 0x2f5a3a, red: 0x8a2a1c, wool: 0x5a4a3a };
    const iron = m(C.iron, 0.6, 0.6);
    const S = {
      fog: [0x0b0e12, 7, 21], hemi: [0xa9bcd8, 0x14120f, 0.4], spot: 0xf4f0ff,
      chestBands: true, crate: 'barrel',
      label: { chest: 'iron-bound chest', crate: 'oak barrel', basket: 'wicker basket', cloth: 'wool-covered table', shelf: 'shelf of candles and jugs', pillar: 'standing stone' },
      clothTex: tex(256, 256, P.plaid(0x2f4a3a, 0x8a2a1c, 0xd8c890), 2, 2),
      mat: {
        chest: m(C.oak, 0.85), metal: iron, panel: tm(P.planks(C.oak, 4, true), 128, 64),
        cabinet: m(C.oak, 0.85), drawer: tm(P.planks(0x3e2a18, 2), 128, 32),
        table: m(0x3e2a18, 0.9), crate: tm(P.planks(0x5a3e24, 10, true), 128, 128, 2, 1),
        weave: tm(P.weave(0xa8885a, 0x80643c, 8), 128, 128, 2, 1), band: m(0x5a4028, 0.9),
        shelf: m(C.oak, 0.85), plinth: m(0x6e6a62, 0.95), pedestal: m(C.stone, 0.95),
      },
      pillar(g) {
        const st = tm(P.rock(0x8a8678), 128, 256, 1, 1, { roughness: 1 });
        const geo = new T.BoxGeometry(0.95, 3.6, 0.62, 2, 6, 2);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const y = pos.getY(i);
          const taper = 1 - Math.max(0, y + 1.8) / 3.6 * 0.3;
          pos.setX(i, pos.getX(i) * taper + (rnd() - 0.5) * 0.06);
          pos.setZ(i, pos.getZ(i) * taper + (rnd() - 0.5) * 0.06);
        }
        geo.computeVertexNormals();
        const s = mesh(geo, st, 0, 1.8, 0);
        s.rotation.z = (rnd() - 0.5) * 0.08;
        g.add(s);
        const moss = sph(0.2, m(0x4a5a34, 1), 0.28, 0.06, 0.22);
        moss.scale.set(1.5, 0.35, 1);
        g.add(moss);
      },
      shelfItems: [
        () => { const gg = new T.Group(); gg.add(cyl(0.035, 0.035, 0.16, m(0xe8dcc0, 0.6), 0, 0.08, 0, 10)); const f = new T.Mesh(new T.ConeGeometry(0.014, 0.04, 6), new T.MeshBasicMaterial({ color: 0xffc860 })); f.position.y = 0.18; gg.add(f); return decoy(gg, 'Just a tallow candle.'); },
        () => decoy(lathe([[0, 0], [0.06, 0], [0.08, 0.06], [0.06, 0.16], [0.04, 0.2], [0.05, 0.22]], 1, m(0x8a8a90, 0.35, 0.8)), 'Just a pewter jug.'),
        () => decoy(cyl(0.11, 0.07, 0.06, m(0x6a4a2a, 0.7), 0, 0.03, 0, 16), 'Just a wooden bowl.'),
        () => { const gg = new T.Group(); let x = 0; for (let i = 0; i < 3; i++) { const w = 0.06; gg.add(box(w, 0.24 + i * 0.02, 0.17, m([0x5a2a1a, 0x2a3a2a, 0x4a3a2a][i]), x, 0.12 + i * 0.01, 0)); x += w + 0.005; } return decoy(gg, 'Just some leather-bound books.'); },
      ],
      filler: () => decoy(new T.Group().add(...[0, 1, 2].map(() => { const r = box(0.12, 0.02, 0.06, m(0x6a6058, 1), (rnd() - 0.5) * 0.2, 0.01, (rnd() - 0.5) * 0.2); r.rotation.y = rnd() * 3; return r; })), 'Just some old rags and rusty nails.'),
    };

    S.shell = () => {
      floorPlane(tm(P.flagstone(0x6a6660), 256, 256, 3, 3, { roughness: 0.95 }));
      rug(tm(P.plaid(0x3a2a20, 0x6a2a1c, 0xb8a070), 256, 256, 2, 2), 2.6, 0, 0, 0, 0, true);
      const wall = tm(P.stone(C.stone), 256, 128, 4, 1.6, { roughness: 1 });
      const tapestries = [tm(P.knot(C.green, 0xd8b860, C.red), 128, 192), tm(P.knot(C.red, 0xd8b860, C.green), 128, 192)];
      let torchLights = 0;
      forEachWall((g, wi) => {
        wallPlane(g, wall);
        g.add(beam([-0.85, 4.25, 0.12], [0.85, 4.25, 0.12], 0.04, m(C.oak)));
        g.add(decoy(plane(1.5, 2.3, tapestries[wi % 2], 0, 3.05, 0.1), 'Just a woven wool tapestry.'));
        [-4.25, 4.25].forEach((x, k) => {
          const t = new T.Group();
          t.position.set(x, 2.5, 0.05);
          t.add(box(0.12, 0.3, 0.06, iron, 0, 0, 0));
          const arm = cyl(0.025, 0.025, 0.4, iron, 0, 0.12, 0.16, 6); arm.rotation.x = 0.9; t.add(arm);
          t.add(cyl(0.07, 0.05, 0.16, iron, 0, 0.3, 0.3, 8));
          flame(t, 0, 0.36, 0.3, 1.3);
          if (torchLights < 3 && (wi + k) % 3 === 0) { lamp(t, 0, 0.6, 0.45, 0xff8a3a, 3.4, 8); torchLights++; }
          g.add(decoy(t, 'Just an iron wall torch.'));
        });
      });
      ceilingPlane(tm(P.planks(0x2a1e14, 8), 256, 256, 3, 3, { roughness: 0.95 }));
      const timber = m(0x3a2a1a, 0.95);
      for (let x = -H + 1; x < H; x += 2.1) K.scene.add(box(0.3, 0.36, H * 2, timber, x, HEIGHT - 0.18, 0));
      [-4.25, 0, 4.25].forEach(z => K.scene.add(box(H * 2, 0.32, 0.3, timber, 0, HEIGHT - 0.55, z)));
    };

    S.props = [
      () => { const g = new T.Group(); g.add(cyl(0.22, 0.28, 0.06, iron, 0, 0.03, 0, 12)); g.add(cyl(0.03, 0.03, 1.3, iron, 0, 0.68, 0, 8));
        [-0.2, 0, 0.2].forEach((x, i) => { g.add(cyl(0.035, 0.035, 0.14 + i * 0.03, m(0xe8dcc0, 0.6), x, 1.38, 0, 10)); flame(g, x, 1.46 + i * 0.015, 0, 0.6); });
        g.add(box(0.5, 0.04, 0.06, iron, 0, 1.32, 0));
        lamp(g, 0, 1.6, 0, 0xffb060, 2.4, 6);
        return wrap(decoy(g, 'Just an iron candle stand.')); },
      () => { const g = new T.Group(); [[0, 0], [0.62, 0.1], [0.3, 0.55]].forEach(([x, z]) => { g.add(cyl(0.3, 0.3, 0.8, tm(P.planks(0x5a3e24, 10, true), 128, 128, 2, 1), x, 0.4, z, 16)); [0.12, 0.68].forEach(y => g.add(mesh(new T.TorusGeometry(0.31, 0.015, 6, 24), iron, x, y, z).rotateX(Math.PI / 2))); }); return wrap(decoy(g, 'These barrels are sealed with pitch.')); },
      () => { const g = new T.Group(); const wl = mesh(new T.TorusGeometry(0.55, 0.05, 8, 28), m(0x4a3420), 0, 0.6, 0); g.add(wl);
        for (let i = 0; i < 8; i++) { const sp = cyl(0.02, 0.02, 1.0, m(0x4a3420), 0, 0.6, 0, 6); sp.rotation.z = (i / 8) * Math.PI; g.add(sp); }
        g.add(cyl(0.1, 0.1, 0.16, m(0x3a2a1a), 0, 0.6, 0, 10).rotateX(Math.PI / 2)); g.rotation.x = -0.2; g.position.z = -0.2;
        return wrap(decoy(g, 'Just an old cart wheel.')); },
      () => { const g = new T.Group(); [-0.6, 0.6].forEach(x => g.add(box(0.08, 1.7, 0.08, m(C.oak), x, 0.85, 0))); [0.25, 1.6].forEach(y => g.add(box(1.3, 0.08, 0.08, m(C.oak), 0, y, 0)));
        g.add(plane(1.1, 1.2, new T.MeshStandardMaterial({ map: tex(128, 128, P.plaid(0x5a4a3a, 0x8a2a1c, 0xd8c890)), side: T.DoubleSide }), 0, 1.0, 0));
        return wrap(decoy(g, 'Just a weaving loom with half-finished cloth.')); },
    ];
    S.decoys = [
      () => { const g = new T.Group(); [[0, 0], [0.45, 0.2], [-0.4, 0.25], [0.1, 0.45]].forEach(([x, z]) => { const s = sph(0.24, m(0xb8a078, 1), x, 0.2, z); s.scale.set(1, 0.8, 0.85); g.add(s); }); return wrap(decoy(g, 'Just some sacks of grain.')); },
      () => { const g = new T.Group(); g.add(box(1.4, 0.07, 0.36, m(C.oak), 0, 0.45, 0)); [-0.55, 0.55].forEach(x => g.add(box(0.07, 0.43, 0.3, m(C.oak), x, 0.21, 0))); return wrap(decoy(g, 'Just a rough wooden bench.')); },
      () => { const g = new T.Group(); for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) { const l = cyl(0.09, 0.09, 0.9, m(0x5a4028, 1), (i - (3 - r) / 2) * 0.19, 0.09 + r * 0.17, 0, 8); l.rotation.x = Math.PI / 2; g.add(l); } return wrap(decoy(g, 'Just a stack of firewood.')); },
      () => { const g = new T.Group(); g.add(cyl(0.3, 0.3, 0.8, tm(P.planks(0x5a3e24, 10, true), 128, 128, 2, 1), 0, 0.4, 0, 16)); return wrap(decoy(g, 'This barrel is sealed with pitch.')); },
    ];
    return S;
  }

  // ===================================================== OCEANIA
  // Island house at night: sand floor and pandanus mats, woven palm walls
  // on bamboo posts, tapa-cloth panels, fishing nets, a window onto a
  // moonlit lagoon, thatch overhead, bamboo pillars, tiki torches.
  function oceania() {
    const C = { palm: 0xc2a46a, bamboo: 0xb8a060, sand: 0xd8c49a, wood: 0x6a4428, teal: 0x1f7a78 };
    const bamboo = m(C.bamboo, 0.6);
    const S = {
      fog: [0x061217, 9, 23], hemi: [0xe6dcc0, 0x1a140c, 0.44], spot: 0xfff6e6,
      chestBands: false, crate: 'box',
      label: { chest: 'carved wooden chest', crate: 'woven pandanus box', basket: 'coconut-frond basket', cloth: 'tapa-covered table', shelf: 'shelf of shells and bowls', pillar: 'bamboo pillar' },
      clothTex: tex(256, 256, P.tapa, 2, 2),
      mat: {
        chest: m(C.wood, 0.7), metal: m(0xd8c49a, 0.6), panel: tm(P.tapa, 256, 128),
        cabinet: m(C.wood, 0.75), drawer: tm(P.weave(0xc2a46a, 0x9a7c44, 10), 128, 32),
        table: bamboo, crate: tm(P.weave(0xd0b07a, 0xa08048, 6), 64, 64), crateFace: tm(P.weave(0xd0b07a, 0xa08048, 8), 128, 128),
        weave: tm(P.weave(0x9ab060, 0x6a8a40, 8), 128, 128, 2, 1), band: m(C.teal, 0.6),
        shelf: bamboo, shelfBack: tm(P.weave(0xc2a46a, 0x9a7c44, 10), 128, 128), plinth: m(C.wood, 0.7), pedestal: m(0x5a5248, 0.95),
      },
      pillar(g) {
        [[0, 0], [0.24, 0.14], [-0.22, 0.16], [0.02, -0.24]].forEach(([x, z], i) => {
          const r = i === 0 ? 0.2 : 0.14;
          g.add(cyl(r, r, HEIGHT, bamboo, x, HEIGHT / 2, z, 12));
          for (let y = 0.6; y < HEIGHT; y += 0.7) g.add(mesh(new T.TorusGeometry(r, 0.018, 6, 14), m(0x8a7440, 0.6), x, y + i * 0.1, z).rotateX(Math.PI / 2));
        });
        [1.2, 3.4].forEach(y => g.add(mesh(new T.TorusGeometry(0.42, 0.035, 6, 20), m(0x6a5030, 1), 0, y, 0).rotateX(Math.PI / 2)));
      },
      shelfItems: [
        () => { const c = new T.Mesh(new T.ConeGeometry(0.07, 0.2, 10), m(0xf0d8c0, 0.4)); c.rotation.z = Math.PI / 2; c.position.y = 0.07; c.castShadow = true; return decoy(c, 'Just a conch shell.'); },
        () => { const s = sph(0.08, m(0x5a3a22, 0.8), 0, 0.04, 0); s.scale.y = 0.6; return decoy(s, 'Just a coconut-shell cup.'); },
        () => decoy(cyl(0.12, 0.08, 0.07, m(C.wood, 0.6), 0, 0.035, 0, 18), 'Just a carved wooden bowl.'),
        () => decoy(new T.Group().add(...[0, 1, 2].map(i => sph(0.035 + i * 0.01, m(0xe87a6a, 0.8), (i - 1) * 0.06, 0.04, 0))), 'Just some pieces of coral.'),
      ],
      filler: () => decoy(new T.Group().add(...[0, 1, 2].map(() => { const c = new T.Mesh(new T.ConeGeometry(0.03, 0.08, 8), m(0xf0e0c8, 0.4)); c.position.set((rnd() - 0.5) * 0.2, 0.02, (rnd() - 0.5) * 0.2); c.rotation.z = Math.PI / 2; return c; })), 'Just a few small shells.'),
    };

    S.shell = () => {
      floorPlane(tm(P.sand(C.sand), 256, 256, 4, 4));
      const matTex = tm(P.weave(0xd8bc84, 0xb0905a, 12), 256, 256, 2, 2);
      rug(matTex, 3.0, 3.0, 0, 0, Math.PI / 4);
      [[5.4, 2], [-5.6, -1.6], [2, -5.5]].forEach(([x, z], i) => rug(matTex, 1.4, 2.0, x, z, i));
      const wall = tm(P.weave(C.palm, 0x9a7c44, 16), 256, 256, 6, 2, { roughness: 1 });
      const tapa = tm(P.tapa, 256, 256);
      const netMat = new T.MeshStandardMaterial({ map: tex(256, 256, P.net), transparent: true, side: T.DoubleSide, roughness: 1, alphaTest: 0.2 });
      const view = new T.MeshBasicMaterial({ map: tex(256, 160, P.lagoon) });
      forEachWall((g, wi) => {
        wallPlane(g, wall);
        [-8.3, -4.25, 0, 4.25, 8.3].forEach(x => g.add(cyl(0.13, 0.13, HEIGHT, bamboo, x, HEIGHT / 2, 0.13, 10)));
        g.add(beam([-H, 4.3, 0.15], [H, 4.3, 0.15], 0.08, bamboo));
        g.add(beam([-H, 0.9, 0.15], [H, 0.9, 0.15], 0.06, bamboo));
        [-2.12, 2.12].forEach(x => g.add(decoy(plane(2.0, 2.0, tapa, x, 3.0, 0.05), 'Just a tapa-cloth panel.')));
        if (wi === 0) {
          const win = plane(2.8, 1.75, view, 6.3, 2.75, 0.03);
          g.add(decoy(win, 'The lagoon outside, under the moon.'));
          [[6.3, 3.66, 3.0, 0.08], [6.3, 1.84, 3.0, 0.08]].forEach(([x, y, w]) => g.add(beam([x - w / 2, y, 0.1], [x + w / 2, y, 0.1], 0.07, bamboo)));
          [4.85, 7.75].forEach(x => g.add(beam([x, 1.8, 0.1], [x, 3.7, 0.1], 0.07, bamboo)));
          lamp(g, 6.3, 2.8, 1.2, 0x7ab8e0, 2.0, 7);
        } else if (wi === 2) {
          const n = plane(3.0, 2.4, netMat, -6.3, 3.0, 0.08);
          n.rotation.z = 0.04;
          g.add(decoy(n, 'Just a fishing net hung up to dry.'));
          [-7.4, -6.6, -5.8, -5.0].forEach((x, i) => g.add(sph(0.08, m(i % 2 ? 0xd8603a : 0xe8d8b0, 0.6), x, 1.85 + (i % 2) * 0.1, 0.12)));
        }
      });
      ceilingPlane(tm(P.thatch(0xb8984e), 256, 256, 3, 3, { roughness: 1 }));
      for (let x = -H + 0.8; x < H; x += 1.6) K.scene.add(beam([x, HEIGHT - 0.12, -H], [x, HEIGHT - 0.12, H], 0.07, bamboo));
      K.scene.add(beam([-H, HEIGHT - 0.3, 0], [H, HEIGHT - 0.3, 0], 0.16, m(C.wood, 0.8)));
    };

    S.props = [
      () => { const g = new T.Group(); [-0.35, 0.35].forEach(x => { g.add(cyl(0.04, 0.05, 1.8, bamboo, x, 0.9, 0, 8)); g.add(cyl(0.08, 0.05, 0.18, m(0x6a5030), x, 1.86, 0, 10)); flame(g, x, 1.95, 0, 1.4); });
        lamp(g, 0, 2.2, 0, 0xff8a3a, 3.6, 8);
        return wrap(decoy(g, 'Just a pair of tiki torches.')); },
      () => { const g = new T.Group(); const hull = sph(0.3, m(0x5a3a22, 0.75), 0, 0.28, 0); hull.scale.set(4.2, 0.9, 0.9); g.add(hull);
        g.add(box(2.2, 0.04, 0.5, m(0x3a2412), 0, 0.5, 0));
        const flt = sph(0.12, m(0x6a4a2a), 0, 0.14, 0.95); flt.scale.set(6, 1, 1); g.add(flt);
        [-0.6, 0.6].forEach(x => g.add(beam([x, 0.5, 0], [x, 0.22, 0.95], 0.025, bamboo)));
        return wrap(decoy(g, 'Just an outrigger canoe.')); },
      () => { const g = new T.Group(); for (let i = 0; i < 7; i++) { const s = sph(0.12, m(0x5a3a22, 0.85), (rnd() - 0.5) * 0.5, 0.11 + (i > 4 ? 0.18 : 0), (rnd() - 0.5) * 0.5); g.add(s); } return wrap(decoy(g, 'Just a pile of coconuts.')); },
      () => { const g = new T.Group(); const b = lathe([[0, 0], [0.3, 0.02], [0.5, 0.14], [0.52, 0.2]], 1, m(C.wood, 0.55)); b.position.y = 0.25; g.add(b);
        [0, 2.1, 4.2].forEach(a => g.add(cyl(0.04, 0.04, 0.26, m(C.wood), Math.sin(a) * 0.32, 0.13, Math.cos(a) * 0.32, 6)));
        return wrap(decoy(g, 'Just a large carved wooden bowl.')); },
    ];
    S.decoys = [
      () => { const g = new T.Group(); for (let i = 0; i < 5; i++) { const c = new T.Mesh(new T.ConeGeometry(0.1, 0.3, 10), m(0xf0d8c0, 0.4)); c.castShadow = true; c.position.set((rnd() - 0.5) * 0.6, 0.1, (rnd() - 0.5) * 0.5); c.rotation.set(0, rnd() * 3, Math.PI / 2); g.add(c); } return wrap(decoy(g, 'Just a heap of conch shells.')); },
      () => { const g = new T.Group(); for (let i = 0; i < 6; i++) g.add(mesh(new T.TorusGeometry(0.3 - i * 0.02, 0.035, 6, 24), m(0xa88a5a, 1), 0, 0.04 + i * 0.06, 0).rotateX(Math.PI / 2)); return wrap(decoy(g, 'Just a coil of coconut-fibre rope.')); },
      () => { const g = new T.Group(); [-0.3, 0.3].forEach((x, i) => { const f = new T.Mesh(new T.CircleGeometry(0.32, 20, 0, Math.PI), new T.MeshStandardMaterial({ map: tex(64, 64, P.weave(0xd0b07a, 0xa08048, 6)), side: T.DoubleSide })); f.position.set(x, 0.75, 0); f.rotation.z = i ? -0.3 : 0.3; g.add(f); g.add(cyl(0.015, 0.015, 0.75, m(C.wood), x, 0.37, 0, 6)); }); return wrap(decoy(g, 'Just a pair of woven fans.')); },
      () => { const g = new T.Group(); for (let i = 0; i < 7; i++) { const s = sph(0.12, m(0x5a3a22, 0.85), (rnd() - 0.5) * 0.5, 0.11 + (i > 4 ? 0.18 : 0), (rnd() - 0.5) * 0.5); g.add(s); } return wrap(decoy(g, 'Just a pile of coconuts.')); },
    ];
    return S;
  }

  // =============================================== NORTH AMERICA
  // Cedar plank house meets Maya stonework: cedar walls and floor, a
  // stepped-fret stone frieze, painted cedar panels, round log beams,
  // painted house posts, bentwood boxes, a carved stela, a hearth.
  function namerica() {
    const C = { cedar: 0x8a4a2a, cedarDark: 0x5a2e18, stone: 0x9a9284, red: 0xa3261c, black: 0x1a1310, teal: 0x2a6a66 };
    const cedar = m(C.cedar, 0.8);
    const S = {
      fog: [0x080a08, 9, 23], hemi: [0xb8d0bc, 0x18100a, 0.42], spot: 0xfff0dc,
      chestBands: false, crate: 'box',
      label: { chest: 'bentwood chest', crate: 'bentwood box', basket: 'cedar-bark basket', cloth: 'blanket-covered table', shelf: 'shelf of baskets and pots', pillar: 'painted house post' },
      clothTex: tex(256, 256, P.blanket, 2, 2),
      mat: {
        chest: cedar, metal: m(C.black, 0.6), panel: tm(P.formline(C.cedar), 256, 128),
        cabinet: m(C.cedarDark, 0.8), drawer: tm(P.greca(C.cedarDark, 0xc8a070), 256, 64),
        table: m(C.cedarDark, 0.85), crate: cedar, crateFace: tm(P.formline(0x9a5a34), 128, 128),
        weave: tm(P.weave(0x9a6a40, 0x6a4424, 8), 128, 128, 2, 1), band: m(C.black, 0.7),
        shelf: m(C.cedarDark, 0.85), plinth: m(C.stone, 0.95), pedestal: m(C.stone, 0.95),
      },
      pillar(g) {
        g.add(cyl(0.4, 0.46, HEIGHT, tm(P.formline(C.cedar), 128, 256, 2, 2.2, { roughness: 0.8 }), 0, HEIGHT / 2, 0, 16));
        g.add(cyl(0.6, 0.66, 0.3, m(C.stone, 0.95), 0, 0.15, 0, 12));
        g.add(box(1.0, 0.26, 1.0, m(C.cedarDark, 0.8), 0, HEIGHT - 0.13, 0));
      },
      shelfItems: [
        () => decoy(cyl(0.09, 0.07, 0.16, tm(P.weave(0x9a6a40, 0x6a4424, 6), 64, 64), 0, 0.08, 0, 14), 'Just a small woven basket.'),
        () => decoy(lathe([[0, 0], [0.07, 0], [0.09, 0.08], [0.08, 0.16], [0.07, 0.18]], 1, tm(P.bands(0xc8783a, C.black, C.red), 128, 32)), 'Just a painted clay cup.'),
        () => { const gg = new T.Group(); const st = cyl(0.012, 0.016, 0.24, m(C.black), 0, 0.03, 0); st.rotation.z = Math.PI / 2; gg.add(st); const bw = sph(0.045, m(C.black, 0.4), 0.14, 0.03, 0); bw.scale.y = 0.45; gg.add(bw); return decoy(gg, 'Just a carved horn spoon.'); },
        () => { const s = sph(0.08, m(0x7ab0a8, 0.25, 0.5), 0, 0.02, 0); s.scale.set(1.3, 0.3, 1); return decoy(s, 'Just an abalone shell.'); },
      ],
      filler: () => decoy(new T.Group().add(...[0, 1, 2].map(() => { const h = mesh(new T.TorusGeometry(0.03, 0.006, 4, 10, Math.PI * 1.4), m(0x9a9aa0, 0.4, 0.7), (rnd() - 0.5) * 0.2, 0.01, (rnd() - 0.5) * 0.2); h.rotation.x = Math.PI / 2; return h; })), 'Just some spare fish hooks.'),
    };

    S.shell = () => {
      floorPlane(tm(P.planks(0x7a4a2c, 6), 256, 256, 3, 3, { roughness: 0.85 }));
      rug(tm(P.weave(0x8a5a34, 0x5a3418, 10), 256, 256, 2, 2), 3.2, 3.2, 0, 0, 0);
      const wall = tm(P.planks(C.cedar, 10, true), 256, 256, 4, 1, { roughness: 0.85 });
      const frieze = tm(P.greca(C.stone, C.red), 512, 96, 6, 1, { roughness: 0.95 });
      const panel = tm(P.formline(0xa0603a), 128, 192);
      forEachWall((g) => {
        wallPlane(g, wall);
        g.add(box(H * 2, 0.75, 0.12, m(C.stone, 0.95), 0, 4.2, 0.06));
        g.add(plane(H * 2, 0.62, frieze, 0, 4.2, 0.125));
        g.add(box(H * 2, 0.3, 0.2, m(C.stone, 0.95), 0, 0.15, 0.1));
        g.add(decoy(plane(1.6, 2.4, panel, 0, 2.5, 0.03), 'Just a painted cedar panel.'));
        [-6.35, 6.35].forEach(x => {
          for (let k = 0; k < 3; k++) {
            const p = new T.Group();
            p.add(cyl(0.025, 0.025, 1.1, m(C.cedarDark), 0, 0.55, 0, 6));
            const blade = sph(0.14, tm(P.formline(0xb07040), 64, 64), 0, 1.3, 0); blade.scale.set(0.9, 2.0, 0.18); p.add(blade);
            p.position.set(x + (k - 1) * 0.35, 0.3, 0.12);
            p.rotation.z = (k - 1) * 0.12;
            p.rotation.x = -0.12;
            g.add(decoy(p, 'Just a carved canoe paddle.'));
          }
        });
      });
      ceilingPlane(tm(P.planks(0x4a2a18, 8, true), 256, 256, 3, 3, { roughness: 0.9 }));
      const log = m(0x6a3e22, 0.9);
      [-5, -1.7, 1.7, 5].forEach(z => K.scene.add(beam([-H, HEIGHT - 0.32, z], [H, HEIGHT - 0.32, z], 0.26, log)));
    };

    S.props = [
      () => { const g = new T.Group(); for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; g.add(sph(0.11, m(0x6a6660, 1), Math.sin(a) * 0.42, 0.08, Math.cos(a) * 0.42)); }
        [0, 1.1, 2.2].forEach(a => { const l = cyl(0.05, 0.05, 0.6, m(0x3a2412, 1), 0, 0.1, 0, 8); l.rotation.set(Math.PI / 2, 0, a); g.add(l); });
        [[0, 0], [0.1, 0.06], [-0.08, 0.05]].forEach(([x, z], i) => flame(g, x, 0.12, z, 1.8 - i * 0.3));
        lamp(g, 0, 0.6, 0, 0xff8a3a, 4.4, 9);
        return wrap(decoy(g, 'Just a stone-ringed hearth.')); },
      () => { const g = new T.Group(); g.add(box(0.75, 2.0, 0.3, tm(P.glyphs(C.stone), 128, 256, 1, 1, { roughness: 1 }), 0, 1.15, 0)); g.add(box(0.95, 0.15, 0.5, m(C.stone, 1), 0, 0.075, 0));
        return wrap(decoy(g, 'A replica carved stone stela.')); },
      () => { const g = new T.Group(); [[0, 0, 0.6], [0.05, 0.6, 0.48], [-0.02, 1.08, 0.36]].forEach(([x, y, s]) => g.add(box(s, s * 0.85, s, tm(P.formline(0x9a5a34), 128, 128), x, y + s * 0.42, 0)));
        return wrap(decoy(g, 'These bentwood boxes are lashed shut.')); },
      () => { const g = new T.Group(); [[0, 0, 1], [0.45, 0.2, 0.75], [-0.38, 0.22, 0.6]].forEach(([x, z, s]) => { const v = lathe([[0, 0], [0.14, 0], [0.22, 0.14], [0.2, 0.36], [0.16, 0.42]], s * 1.4, tm(P.bands(0xd89a5a, C.black, C.red), 128, 64)); v.position.set(x, 0, z); g.add(v); }); return wrap(decoy(g, 'Just some painted clay vessels.')); },
    ];
    S.decoys = [
      () => { const g = new T.Group(); [[0, 0, 1], [0.45, 0.2, 0.75], [-0.38, 0.22, 0.6]].forEach(([x, z, s]) => { const v = lathe([[0, 0], [0.14, 0], [0.22, 0.14], [0.2, 0.36], [0.16, 0.42]], s * 1.4, tm(P.bands(0xd89a5a, C.black, C.red), 128, 64)); v.position.set(x, 0, z); g.add(v); }); return wrap(decoy(g, 'Just some painted clay vessels.')); },
      () => { const g = new T.Group(); [[0, 0], [0.42, 0.16], [-0.36, 0.2]].forEach(([x, z], i) => g.add(cyl(0.22 - i * 0.03, 0.18 - i * 0.03, 0.4 - i * 0.06, tm(P.weave(0x9a6a40, 0x6a4424, 8), 64, 64), x, 0.2 - i * 0.03, z, 16))); return wrap(decoy(g, 'Just some cedar-bark baskets.')); },
      () => { const g = new T.Group(); [[0, 0, 0.6], [0.05, 0.6, 0.48]].forEach(([x, y, s]) => g.add(box(s, s * 0.85, s, tm(P.formline(0x9a5a34), 128, 128), x, y + s * 0.42, 0))); return wrap(decoy(g, 'These bentwood boxes are lashed shut.')); },
      () => { const g = new T.Group(); for (let i = 0; i < 6; i++) g.add(mesh(new T.TorusGeometry(0.3 - i * 0.02, 0.03, 6, 24), m(0x8a6a44, 1), 0, 0.04 + i * 0.05, 0).rotateX(Math.PI / 2)); return wrap(decoy(g, 'Just a coil of cedar-bark rope.')); },
    ];
    return S;
  }

  const REGIONS = { asia, africa, europe, oceania, namerica };

  // ============================================================ build
  function build(key, kit) {
    K = kit; T = kit.T; H = kit.HALF; HEIGHT = kit.HEIGHT;
    lamps = []; flames = [];
    const S = (REGIONS[key] || asia)();

    K.scene.background = new T.Color(S.fog[0]);
    K.scene.fog = new T.Fog(S.fog[0], S.fog[1], S.fog[2]);
    K.scene.add(new T.HemisphereLight(S.hemi[0], S.hemi[1], S.hemi[2]));
    K.spot.color.set(S.spot);

    S.shell();

    const perimeter = K.shuffle(['chest', 'chest', 'cabinet', 'crate', 'basket', 'shelf', 'shelf', 'decoy', 'decoy', 'prop', 'decoy', 'prop']);
    const middle = K.shuffle(['clothTable', 'clothTable', 'displayCase', 'decoy']);
    const props = [S.props[0], ...K.shuffle(S.props.slice(1))];  // the light-giving prop always appears
    const decoys = K.shuffle(S.decoys.slice());
    let pi = 0, di = 0;
    const make = (kind) => ({
      chest, cabinet, crate, basket, shelf, clothTable, displayCase,
      decoy: () => decoys[di++ % decoys.length](),
      prop: () => props[pi++ % props.length](),
    })[kind](S);
    const place = (item, x, z) => {
      item.group.position.set(x, 0, z);
      item.group.rotation.y = Math.atan2(-x, -z);
      K.scene.add(item.group);
    };

    const spots = [];
    perimeter.forEach((kind, i) => {
      const ang = (i / 12) * Math.PI * 2 + Math.PI / 12;
      const r = kind === 'shelf' ? 8.15 : 7.2;
      const item = make(kind);
      place(item, Math.sin(ang) * r, Math.cos(ang) * r);
      spots.push(...item.spots);
    });
    middle.forEach((kind, i) => {
      const ang = (i / 4) * Math.PI * 2;
      const item = make(kind);
      place(item, Math.sin(ang) * 4.7, Math.cos(ang) * 4.7);
      spots.push(...item.spots);
    });
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const item = pillar(S);
      place(item, Math.sin(ang) * 4.3, Math.cos(ang) * 4.3);
      spots.push(...item.spots);
    }

    const myLamps = lamps, myFlames = flames;
    return {
      spots,
      filler: S.filler,
      tick(now) {
        myLamps.forEach((l, i) => { l.intensity = l.userData.base * (0.86 + 0.1 * Math.sin(now * 0.011 + i * 1.7) + 0.05 * Math.sin(now * 0.037 + i)); });
        myFlames.forEach((f, i) => { const s = 0.9 + 0.12 * Math.sin(now * 0.02 + i * 2.3) + 0.06 * Math.sin(now * 0.053 + i); f.scale.set(1, s, 1); });
      },
    };
  }

  return { build };
})();
