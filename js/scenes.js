/* ==================================================================
   Virtual Artifact Hunt — gallery thumbnails
   Flat illustrated SVG backdrops, one per region, shown on the home
   screen's gallery cards. (The galleries themselves are 3D — see
   world.js.) Drawn entirely with shapes and gradients, no images.
   ================================================================== */

const SCENES = (() => {

  function cloudPuff(x, y, s, fill) {
    return `<g opacity=".8" transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx="0" cy="0" rx="60" ry="22" fill="${fill}"/>
      <ellipse cx="34" cy="-8" rx="34" ry="18" fill="${fill}"/>
      <ellipse cx="-34" cy="-6" rx="30" ry="16" fill="${fill}"/>
    </g>`;
  }

  function tuft(x, y, scale, color) {
    return `<g transform="translate(${x} ${y}) scale(${scale})" fill="${color}">
      <path d="M0,0 Q-6,-30 -2,-46 Q2,-30 0,0 Z"/>
      <path d="M6,0 Q6,-38 12,-54 Q14,-36 6,0 Z"/>
      <path d="M-8,0 Q-14,-34 -22,-44 Q-16,-28 -8,0 Z"/>
    </g>`;
  }

  // A zigzag mountain/hill silhouette spanning the full canvas width,
  // varied deterministically (no Math.random, so it's stable) via sin().
  function ridge(width, baseY, amp, color, opacity, seed) {
    const step = 210;
    const n = Math.ceil(width / step) + 2;
    let d = `M0,${baseY + amp}`;
    for (let i = 0; i <= n; i++) {
      const x = i * step;
      const peak = baseY - amp * 0.55 - ((Math.sin(i * 1.7 + seed) + 1) / 2) * amp * 0.75;
      d += ` L${x.toFixed(0)},${peak.toFixed(0)}`;
    }
    d += ` L${width},${baseY + amp} L${width},900 L0,900 Z`;
    return `<path d="${d}" fill="${color}" opacity="${opacity}"/>`;
  }

  function repeat(width, spacing, startX, fn) {
    const out = [];
    for (let x = startX; x < width - spacing * 0.3; x += spacing) out.push(fn(x));
    return out.join('');
  }

  // ---------------------------------------------------------------- ASIA
  function asiaTree(x, scale = 1) {
    return `<g transform="translate(${x} 540) scale(${scale})">
      <path d="M0,260 L0,60" stroke="#5e2f19" stroke-width="26" stroke-linecap="round"/>
      <path d="M0,140 Q-60,120 -90,60 M0,120 Q60,100 100,40 M0,90 Q-30,60 -20,10" stroke="#5e2f19" stroke-width="12" fill="none" stroke-linecap="round"/>
      <circle cx="-10" cy="10" r="90" fill="#5a8f3c"/>
      <circle cx="60" cy="30" r="70" fill="#4a7a30"/>
      <circle cx="-80" cy="50" r="60" fill="#4a7a30"/>
    </g>`;
  }
  function asiaShrine(x, big = false) {
    const s = big ? 1 : 0.7;
    return `<g transform="translate(${x} 380) scale(${s})">
      <path d="M0,220 L0,120 Q-70,120 -70,220 Z" fill="#7a3f22"/>
      <path d="M0,220 L0,120 Q70,120 70,220 Z" fill="#5e2f19"/>
      <rect x="-14" y="60" width="28" height="66" fill="#5e2f19"/>
      <path d="M-30,60 L30,60 L0,10 Z" fill="#7a3f22"/>
      <circle cx="0" cy="-2" r="7" fill="#f2a63d"/>
    </g>`;
  }
  function asiaLantern(x) {
    return `<g transform="translate(${x} 610)">
      <rect x="-10" y="-90" width="20" height="60" fill="#7a3f22" stroke="#5e2f19" stroke-width="2"/>
      <path d="M-16,-90 L16,-90 L10,-104 L-10,-104 Z" fill="#5e2f19"/>
      <rect x="-6" y="-30" width="12" height="30" fill="#5e2f19"/>
      <circle cx="0" cy="-60" r="5" fill="#f2a63d"/>
    </g>`;
  }
  function asiaBg(width) {
    const back = `
      <defs>
        <linearGradient id="skyAsia" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f7c789"/>
          <stop offset="45%" stop-color="#f2a05a"/>
          <stop offset="100%" stop-color="#d9603b"/>
        </linearGradient>
        <linearGradient id="groundAsia" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#c98a52"/>
          <stop offset="100%" stop-color="#a3652f"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="900" fill="url(#skyAsia)"/>
      ${repeat(width, 900, 250, x => `<circle cx="${x}" cy="200" r="80" fill="#fff3c6" opacity=".7"/>`)}
      ${repeat(width, 640, 300, x => cloudPuff(x, 140, 1.2, '#ffe6c4'))}
      ${ridge(width, 470, 130, '#8c4a2c', .5, 0)}
      <path d="M0,560 Q${width * 0.25},500 ${width * 0.5},560 T${width},560 L${width},900 L0,900 Z" fill="url(#groundAsia)"/>
      <path d="M0,600 Q${width * 0.25},548 ${width * 0.5},600 T${width},600" fill="none" stroke="#8c5a34" stroke-width="6" opacity=".5"/>
      <!-- temple wall -->
      <rect x="0" y="330" width="640" height="280" fill="#b6472a"/>
      <rect x="0" y="330" width="640" height="18" fill="#7a3f22"/>
      ${repeat(640, 104, 20, x => `<rect x="${x}" y="348" width="70" height="240" fill="#a3652f"/>`)}
      <path d="M0,610 L640,610 L640,900 L0,900 Z" fill="#8c5a34"/>
      ${asiaShrine(width * 0.52)}
      ${repeat(width, 420, width * 0.7, x => asiaLantern(x))}
    `;
    const front = `${asiaTree(width - 240)} ${asiaTree(width * 0.36, .75)}`;
    return { back, front };
  }

  // -------------------------------------------------------------- AFRICA
  function africaTree(x, scale = 1) {
    return `<g transform="translate(${x} 470) scale(${scale})">
      <path d="M0,220 L10,60" stroke="#6b4423" stroke-width="20" stroke-linecap="round"/>
      <path d="M10,120 Q-40,100 -80,110 M10,90 Q60,70 110,86" stroke="#6b4423" stroke-width="10" fill="none" stroke-linecap="round"/>
      <ellipse cx="0" cy="40" rx="150" ry="34" fill="#7a8f3c"/>
      <ellipse cx="-60" cy="60" rx="90" ry="24" fill="#6a7f34"/>
    </g>`;
  }
  function africaHut(x, big = true) {
    const s = big ? 1 : 0.65;
    return `<g transform="translate(${x} 690) scale(${s})">
      <path d="M-60,40 Q0,-40 60,40 Z" fill="#a3652f"/>
      <rect x="-40" y="40" width="80" height="60" fill="#dbb15c"/>
    </g>`;
  }
  function africaBg(width) {
    const back = `
      <defs>
        <linearGradient id="skyAfrica" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fbe3a0"/>
          <stop offset="55%" stop-color="#f2a63d"/>
          <stop offset="100%" stop-color="#d9871c"/>
        </linearGradient>
        <linearGradient id="groundAfrica" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#dbb15c"/>
          <stop offset="100%" stop-color="#b6892f"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="900" fill="url(#skyAfrica)"/>
      ${repeat(width, 820, 260, x => `<circle cx="${x}" cy="220" r="90" fill="#fff3c6" opacity=".8"/>`)}
      ${ridge(width, 480, 110, '#a3652f', .5, 1.3)}
      <path d="M0,600 Q${width * 0.25},540 ${width * 0.5},600 T${width},600 L${width},900 L0,900 Z" fill="url(#groundAfrica)"/>
      ${repeat(width, 150, 60, x => tuft(x, 700 + ((x / 150) % 3) * 30, 1.4, '#8c9a3c'))}
      ${repeat(width, 520, 220, x => africaHut(x, (x / 520) % 2 === 0))}
    `;
    const front = `${africaTree(width - 260)} ${africaTree(width * 0.42, .8)}`;
    return { back, front };
  }

  // -------------------------------------------------------------- EUROPE
  function europeStone(x, h) {
    return `<g transform="translate(${x} ${640 - h})">
      <rect x="-26" y="0" width="52" height="${h}" rx="10" fill="#8a8578" stroke="#2b1c10" stroke-width="4"/>
      <rect x="-26" y="0" width="52" height="16" fill="#a49d8c"/>
    </g>`;
  }
  function europeTree(x, scale = 1) {
    return `<g transform="translate(${x} 560) scale(${scale})">
      <path d="M0,140 L14,40" stroke="#3a5a26" stroke-width="14" stroke-linecap="round"/>
      <path d="M14,0 L-40,70 L68,70 Z" fill="#2f6b40"/>
      <path d="M14,-40 L-28,30 L56,30 Z" fill="#3c8048"/>
    </g>`;
  }
  function europeBg(width) {
    const back = `
      <defs>
        <linearGradient id="skyEurope" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#cfe0ea"/>
          <stop offset="55%" stop-color="#9fc2cf"/>
          <stop offset="100%" stop-color="#3c8c8c"/>
        </linearGradient>
        <linearGradient id="groundEurope" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7fae6a"/>
          <stop offset="100%" stop-color="#5a8f3c"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="900" fill="url(#skyEurope)"/>
      ${repeat(width, 520, 200, x => cloudPuff(x, 150, 1.3, '#ffffff'))}
      ${ridge(width, 460, 100, '#3c6a52', .5, 2.1)}
      <path d="M0,600 Q${width * 0.25},550 ${width * 0.5},600 T${width},600 L${width},900 L0,900 Z" fill="url(#groundEurope)"/>
      ${repeat(width, 140, 500, x => europeStone(x, 150 + (x % 3) * 20))}
      ${repeat(width, 480, 120, x => europeTree(x, .85 + (x % 2) * .2))}
    `;
    const front = `${europeTree(width - 160, 1.1)}`;
    return { back, front };
  }

  // ------------------------------------------------------------- OCEANIA
  function oceaniaPalm(x, scale = 1) {
    return `<g transform="translate(${x} 640) scale(${scale})">
      <path d="M0,180 Q30,80 6,0" stroke="#8c5a34" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M6,0 Q-70,-30 -110,10 M6,0 Q70,-40 110,-20 M6,0 Q-30,-70 -10,-110 M6,0 Q40,-70 70,-100" stroke="#3c8048" stroke-width="14" fill="none" stroke-linecap="round"/>
    </g>`;
  }
  function oceaniaIsle(x, s = 1) {
    return `<g transform="translate(${x} 0) scale(${s})">
      <path d="M0,560 L220,300 L460,560 Z" fill="#5a8f3c" opacity=".85"/>
      <path d="M180,420 L260,340 L340,420 Z" fill="#8c5a34" opacity=".8"/>
    </g>`;
  }
  function oceaniaBg(width) {
    const back = `
      <defs>
        <linearGradient id="skyOceania" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#bdeef0"/>
          <stop offset="50%" stop-color="#6fd0c6"/>
          <stop offset="100%" stop-color="#1f8a83"/>
        </linearGradient>
        <linearGradient id="waterOceania" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2fb0a8"/>
          <stop offset="100%" stop-color="#146962"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="900" fill="url(#skyOceania)"/>
      ${repeat(width, 760, 260, x => `<circle cx="${x}" cy="190" r="70" fill="#fff8ec" opacity=".9"/>`)}
      ${oceaniaIsle(60)} ${oceaniaIsle(width * 0.55, .8)}
      <path d="M0,600 Q${width * 0.25},560 ${width * 0.5},600 T${width},600 L${width},900 L0,900 Z" fill="url(#waterOceania)"/>
      <path d="M0,640 Q${width * 0.2},610 ${width * 0.4},640 T${width * 0.8},640 T${width},640" stroke="#bdeef0" stroke-width="5" fill="none" opacity=".5"/>
      <path d="M0,700 Q${width * 0.2},672 ${width * 0.4},700 T${width * 0.8},700 T${width},700" stroke="#bdeef0" stroke-width="5" fill="none" opacity=".4"/>
    `;
    const front = repeat(width, 620, 180, x => oceaniaPalm(x, x % 250 > 120 ? 1 : .85));
    return { back, front };
  }

  // ------------------------------------------------------- NORTH AMERICA
  function namericaPyramid(x, big = true) {
    const s = big ? 1 : 0.6;
    return `<g transform="translate(${x} 620) scale(${s})">
      <path d="M-160,0 L160,0 L120,-60 L-120,-60 Z" fill="#a3652f"/>
      <path d="M-120,-60 L120,-60 L88,-120 L-88,-120 Z" fill="#8c5a34"/>
      <path d="M-88,-120 L88,-120 L56,-180 L-56,-180 Z" fill="#7a3f22"/>
      <path d="M-56,-180 L56,-180 L28,-224 L-28,-224 Z" fill="#6b3319"/>
      <rect x="-16" y="-224" width="32" height="44" fill="#3a2a1e"/>
    </g>`;
  }
  function namericaJungleTree(x, scale = 1) {
    return `<g transform="translate(${x} 540) scale(${scale})">
      <path d="M0,260 L14,80" stroke="#3a5a26" stroke-width="20" stroke-linecap="round"/>
      <ellipse cx="0" cy="50" rx="120" ry="50" fill="#2f6b40"/>
      <ellipse cx="-70" cy="90" rx="80" ry="36" fill="#3c8048"/>
    </g>`;
  }
  function namericaTotem(x) {
    return `<g transform="translate(${x} 480)">
      <rect x="-16" y="0" width="32" height="220" fill="#6b4423" stroke="#2b1c10" stroke-width="3"/>
      <circle cx="0" cy="30" r="26" fill="#b6472a" stroke="#2b1c10" stroke-width="3"/>
      <ellipse cx="0" cy="90" rx="30" ry="22" fill="#1f8a83" stroke="#2b1c10" stroke-width="3"/>
      <path d="M-30,140 Q0,120 30,140 L26,190 Q0,204 -26,190 Z" fill="#f2a63d" stroke="#2b1c10" stroke-width="3"/>
    </g>`;
  }
  function namericaPine(x, scale = 1) {
    return `<g transform="translate(${x} 560) scale(${scale})">
      <path d="M0,180 L10,40" stroke="#2f4a2a" stroke-width="16" stroke-linecap="round"/>
      <path d="M10,0 L-46,60 L66,60 Z" fill="#2f6b40"/>
      <path d="M10,-46 L-32,20 L52,20 Z" fill="#3c8048"/>
      <path d="M10,-84 L-20,-24 L40,-24 Z" fill="#4a9a56"/>
    </g>`;
  }
  function namericaBg(width) {
    const jungleEnd = width * 0.42;
    const back = `
      <defs>
        <linearGradient id="skyNAm" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#f2c98a"/>
          <stop offset="${(jungleEnd / width * 100).toFixed(0)}%" stop-color="#e8b370"/>
          <stop offset="${(jungleEnd / width * 100 + 3).toFixed(0)}%" stop-color="#b7cdd6"/>
          <stop offset="100%" stop-color="#7fa3b3"/>
        </linearGradient>
        <linearGradient id="groundJungle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4a7a30"/>
          <stop offset="100%" stop-color="#3a5a26"/>
        </linearGradient>
        <linearGradient id="groundCoast" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#6a8f6a"/>
          <stop offset="100%" stop-color="#3f6a4a"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="900" fill="url(#skyNAm)"/>
      <!-- jungle side -->
      <path d="M0,560 Q${jungleEnd * 0.5},500 ${jungleEnd},560 L${jungleEnd},900 L0,900 Z" fill="url(#groundJungle)"/>
      ${namericaPyramid(jungleEnd * 0.35)}
      ${namericaPyramid(jungleEnd * 0.75, false)}
      <circle cx="${jungleEnd * 0.2}" cy="190" r="70" fill="#fff3c6" opacity=".8"/>
      <!-- coast side -->
      <path d="M${jungleEnd},560 Q${jungleEnd + (width - jungleEnd) * 0.5},510 ${width},560 L${width},900 L${jungleEnd},900 Z" fill="url(#groundCoast)"/>
      <path d="M${jungleEnd},640 Q${jungleEnd + (width - jungleEnd) * 0.5},600 ${width},640 L${width},900 L${jungleEnd},900 Z" fill="#4a7fae" opacity=".65"/>
      ${repeat(width - jungleEnd, 320, jungleEnd + 160, x => namericaTotem(x))}
      <path d="M${jungleEnd},560 L${jungleEnd},900" stroke="#3a2a1e" stroke-width="2" opacity=".2"/>
    `;
    const front = `
      ${namericaJungleTree(70)}
      ${namericaJungleTree(jungleEnd - 60, .85)}
      ${namericaPine(width - 120, 1.05)}
      ${namericaPine(jungleEnd + (width - jungleEnd) * 0.45, .9)}
    `;
    return { back, front };
  }

  // Backdrop definitions — used for the gallery thumbnails on the home screen.
  const REGION_SCENES = {
    asia: {
      width: 3400,
      bg: asiaBg,
    },
    africa: {
      width: 3400,
      bg: africaBg,
    },
    europe: {
      width: 2600,
      bg: europeBg,
    },
    oceania: {
      width: 2600,
      bg: oceaniaBg,
    },
    namerica: {
      width: 3000,
      bg: namericaBg,
    },
  };

  const built = {};
  Object.keys(REGION_SCENES).forEach(key => {
    const def = REGION_SCENES[key];
    const { back, front } = def.bg(def.width);
    built[key] = { width: def.width, back, front };
  });
  return built;
})();
