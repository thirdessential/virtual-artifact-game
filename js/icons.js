/* ==================================================================
   Virtual Artifact Hunt — icon library
   Every artifact is drawn as inline SVG, generated here. No external
   images, no licensing exposure. Icons are intentionally stylized
   flat-color folk-art shapes, not museum-accurate reproductions.
   Each ICONS[key](size) returns a full <svg>...</svg> string sized
   to `size` px square (default 200), viewBox fixed at 0 0 200 220.
   ================================================================== */

const ICONS = (() => {

  const STROKE = '#2b1c10';

  function wrap(inner, vb = '0 0 200 220', size = 200) {
    return `<svg viewBox="${vb}" width="${size}" height="${size * (vb.split(' ')[3] / vb.split(' ')[2])}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  }

  // Generic mask silhouette path, reused as the base of most icons.
  const FACE_PATH = 'M100,18 C146,18 172,58 168,108 C164,168 138,206 100,212 C62,206 36,168 32,108 C28,58 54,18 100,18 Z';

  function face(fill) {
    return `<path d="${FACE_PATH}" fill="${fill}" stroke="${STROKE}" stroke-width="4"/>`;
  }

  function eye(cx, cy, r, fill = '#1c130b') {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${STROKE}" stroke-width="2.5"/>`;
  }

  function almondEye(cx, cy, w, h, rot = 0) {
    return `<ellipse cx="${cx}" cy="${cy}" rx="${w}" ry="${h}" fill="#1c130b" transform="rotate(${rot} ${cx} ${cy})"/>`;
  }

  // ------------------------------------------------------------ ASIA

  function chamMask() {
    return wrap(`
      ${face('#d9603b')}
      <path d="M46,64 Q100,30 154,64 L150,86 Q100,58 50,86 Z" fill="#f2a63d" stroke="${STROKE}" stroke-width="3"/>
      ${eye(72, 100, 11)}${eye(128, 100, 11)}
      <path d="M60,150 Q100,178 140,150" stroke="${STROKE}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M70,150 Q100,168 130,150" fill="#b6472a"/>
      <circle cx="100" cy="60" r="10" fill="#f2a63d" stroke="${STROKE}" stroke-width="3"/>
    `);
  }

  function nohMask() {
    return wrap(`
      ${face('#fbead0')}
      <path d="M58,84 Q72,74 86,84" stroke="${STROKE}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M114,84 Q128,74 142,84" stroke="${STROKE}" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${almondEye(72, 96, 9, 4)}${almondEye(128, 96, 9, 4)}
      <path d="M96,110 Q100,124 104,110" stroke="${STROKE}" stroke-width="3" fill="none"/>
      <path d="M84,158 Q100,150 116,158" stroke="${STROKE}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M40,26 Q100,4 160,26 L160,10 Q100,-10 40,10 Z" fill="#1c130b"/>
      <path d="M30,40 Q20,110 40,190" stroke="#1c130b" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M170,40 Q180,110 160,190" stroke="#1c130b" stroke-width="10" fill="none" stroke-linecap="round"/>
    `);
  }

  function barongMask() {
    return wrap(`
      <path d="M40,110 Q20,60 60,40 Q60,20 90,26 Q100,14 110,26 Q140,20 140,40 Q180,60 160,110 Q170,170 100,210 Q30,170 40,110 Z" fill="#d9603b" stroke="${STROKE}" stroke-width="4"/>
      ${[...Array(9)].map((_,i)=>`<path d="M${28+i*16},46 l-6,-22 l14,16 Z" fill="#f2a63d" stroke="${STROKE}" stroke-width="2"/>`).join('')}
      ${eye(76, 96, 14, '#fff8ec')}${eye(76,96,7)}
      ${eye(124, 96, 14, '#fff8ec')}${eye(124,96,7)}
      <path d="M50,130 Q100,110 150,130 L146,168 Q100,190 54,168 Z" fill="#fff8ec" stroke="${STROKE}" stroke-width="3"/>
      ${[...Array(6)].map((_,i)=>`<path d="M${60+i*16},150 l6,26 l8,-26 Z" fill="#fff8ec" stroke="${STROKE}" stroke-width="2"/>`).join('')}
      <circle cx="100" cy="56" r="7" fill="#f2a63d" stroke="${STROKE}" stroke-width="2"/>
    `);
  }

  function mahakalaMask() {
    return wrap(`
      ${face('#3c4a8c')}
      <path d="M100,18 L86,-6 L100,4 L114,-6 Z" fill="#f2a63d" stroke="${STROKE}" stroke-width="3"/>
      <path d="M40,60 Q20,44 34,20" stroke="#d9603b" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M160,60 Q180,44 166,20" stroke="#d9603b" stroke-width="8" fill="none" stroke-linecap="round"/>
      ${eye(72, 92, 13, '#f2a63d')}${eye(72,92,6)}
      ${eye(128, 92, 13, '#f2a63d')}${eye(128,92,6)}
      <path d="M92,80 L108,80 L100,64 Z" fill="#f2a63d" stroke="${STROKE}" stroke-width="2"/>
      <path d="M58,150 Q100,182 142,150 Q100,170 58,150 Z" fill="#1c130b"/>
      ${[...Array(6)].map((_,i)=>`<path d="M${66+i*13},150 l-3,20 l9,-8 Z" fill="#fff8ec"/>`).join('')}
    `);
  }

  function poNagarStatue() {
    return wrap(`
      <path d="M100,10 Q80,10 78,28 Q60,34 60,54 L60,70 Q40,80 40,110 L40,180 Q40,206 70,210 L130,210 Q160,206 160,180 L160,110 Q160,80 140,70 L140,54 Q140,34 122,28 Q120,10 100,10 Z" fill="#c1416a" stroke="${STROKE}" stroke-width="4"/>
      <path d="M20,110 Q10,120 20,150" stroke="#c1416a" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M180,110 Q190,120 180,150" stroke="#c1416a" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M25,150 Q10,160 22,180" stroke="#c1416a" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M175,150 Q190,160 178,180" stroke="#c1416a" stroke-width="12" fill="none" stroke-linecap="round"/>
      ${eye(86, 62, 5)}${eye(114, 62, 5)}
      <path d="M90,76 Q100,84 110,76" stroke="${STROKE}" stroke-width="3" fill="none"/>
      <path d="M70,54 Q100,40 130,54" stroke="#f2a63d" stroke-width="6" fill="none"/>
      <circle cx="100" cy="24" r="10" fill="#f2a63d" stroke="${STROKE}" stroke-width="3"/>
      <path d="M70,130 h60 M70,150 h60 M70,170 h60" stroke="#8c2c4d" stroke-width="3"/>
    `);
  }

  // ---------------------------------------------------------- AFRICA

  function nguniMask() {
    return wrap(`
      ${face('#a3652f')}
      ${eye(74, 96, 10)}${eye(126, 96, 10)}
      <path d="M100,96 L92,130 L108,130 Z" fill="#3a2a1e"/>
      <path d="M70,158 Q100,180 130,158" stroke="${STROKE}" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${[...Array(5)].map((_,i)=>`<circle cx="${60+i*20}" cy="70" r="4" fill="#f2a63d"/>`).join('')}
      ${[...Array(5)].map((_,i)=>`<rect x="${58+i*20}" y="182" width="10" height="10" fill="#1f8a83"/>`).join('')}
    `);
  }

  function geledeMask() {
    return wrap(`
      <ellipse cx="100" cy="40" rx="70" ry="26" fill="#1f8a83" stroke="${STROKE}" stroke-width="4"/>
      ${[...Array(5)].map((_,i)=>`<circle cx="${50+i*25}" cy="40" r="8" fill="#f2a63d" stroke="${STROKE}" stroke-width="2"/>`).join('')}
      ${face('#e4a45c')}
      ${eye(74, 100, 9)}${eye(126, 100, 9)}
      <path d="M100,104 L94,128 L106,128 Z" fill="#3a2a1e"/>
      <path d="M76,158 Q100,172 124,158" stroke="${STROKE}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M60,66 Q100,52 140,66" stroke="#c1416a" stroke-width="5" fill="none"/>
    `);
  }

  function kanagaMask() {
    return wrap(`
      <path d="M30,50 L100,20 L170,50 L150,50 L100,34 L50,50 Z" fill="#fff8ec" stroke="${STROKE}" stroke-width="4"/>
      <path d="M20,20 L100,50 L180,20 M20,80 L100,50 L180,80" stroke="#fff8ec" stroke-width="10" stroke-linecap="round" fill="none"/>
      <path d="M20,20 L100,50 L180,20 M20,80 L100,50 L180,80" stroke="${STROKE}" stroke-width="3" fill="none"/>
      ${face('#b6472a')}
      ${eye(76, 108, 9, '#fff8ec')}${eye(76,108,4)}
      ${eye(124, 108, 9, '#fff8ec')}${eye(124,108,4)}
      <path d="M100,116 L92,140 L108,140 Z" fill="#1c130b"/>
      <path d="M0,0" />
      ${[...Array(6)].map((_,i)=>`<rect x="${44+i*19}" y="160" width="10" height="30" fill="${i%2?'#1c130b':'#fff8ec'}" stroke="${STROKE}" stroke-width="1.5"/>`).join('')}
    `);
  }

  function punuMask() {
    return wrap(`
      ${face('#fbead0')}
      <path d="M60,30 Q100,10 140,30 L136,60 Q100,42 64,60 Z" fill="#1c130b"/>
      ${[...Array(5)].map((_,i)=>`<circle cx="${64+i*18}" cy="34" r="6" fill="#1c130b"/>`).join('')}
      ${almondEye(74, 96, 10, 5)}${almondEye(126, 96, 10, 5)}
      <path d="M96,108 Q100,120 104,108" stroke="${STROKE}" stroke-width="2.5" fill="none"/>
      <path d="M80,150 Q100,142 120,150" stroke="#c1416a" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M64,70 Q60,90 68,110 M136,70 Q140,90 132,110" stroke="#c1416a" stroke-width="4" fill="none"/>
    `);
  }

  function goldenStool() {
    return wrap(`
      <path d="M40,90 Q100,120 160,90 L160,108 Q100,138 40,108 Z" fill="#f2a63d" stroke="${STROKE}" stroke-width="4"/>
      <path d="M55,108 L48,190 M145,108 L152,190 M85,116 L80,190 M115,116 L120,190" stroke="#d9871c" stroke-width="9" stroke-linecap="round"/>
      <path d="M55,108 L48,190 M145,108 L152,190 M85,116 L80,190 M115,116 L120,190" stroke="${STROKE}" stroke-width="2" fill="none"/>
      <path d="M40,190 L160,190 L156,204 L44,204 Z" fill="#d9871c" stroke="${STROKE}" stroke-width="3"/>
      <ellipse cx="100" cy="82" rx="58" ry="14" fill="#ffd479" stroke="${STROKE}" stroke-width="3"/>
      <path d="M60,80 Q100,64 140,80" stroke="#b6472a" stroke-width="4" fill="none"/>
    `, '0 0 200 220');
  }

  // ---------------------------------------------------------- EUROPE

  function celticHornedMask() {
    return wrap(`
      <path d="M52,50 Q20,10 10,60 Q30,50 48,70" fill="#5a8f3c" stroke="${STROKE}" stroke-width="4"/>
      <path d="M148,50 Q180,10 190,60 Q170,50 152,70" fill="#5a8f3c" stroke="${STROKE}" stroke-width="4"/>
      ${face('#a3652f')}
      ${eye(74, 98, 10)}${eye(126, 98, 10)}
      <path d="M100,98 L92,128 L108,128 Z" fill="#3a2a1e"/>
      <path d="M66,156 Q100,180 134,156" stroke="${STROKE}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M60,58 Q100,44 140,58" stroke="#5a8f3c" stroke-width="5" fill="none"/>
    `);
  }

  function mamuthonesMask() {
    return wrap(`
      ${face('#2b1c10')}
      ${eye(74, 96, 9, '#fff8ec')}${eye(74,96,4)}
      ${eye(126, 96, 9, '#fff8ec')}${eye(126,96,4)}
      <path d="M92,108 L84,136 L116,136 L108,108 Z" fill="#1c130b" stroke="${STROKE}" stroke-width="2"/>
      <path d="M70,166 Q100,150 130,166" stroke="#5a3a20" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M40,192 Q100,210 160,192" stroke="#8a6a3a" stroke-width="8" fill="none" stroke-linecap="round"/>
      <circle cx="46" cy="196" r="8" fill="#f2a63d" stroke="${STROKE}" stroke-width="2"/>
      <circle cx="154" cy="196" r="8" fill="#f2a63d" stroke="${STROKE}" stroke-width="2"/>
    `);
  }

  function cernunnosFigure() {
    return wrap(`
      <path d="M60,50 Q30,10 16,54 Q40,46 56,66" fill="#5a8f3c" stroke="${STROKE}" stroke-width="4"/>
      <path d="M140,50 Q170,10 184,54 Q160,46 144,66" fill="#5a8f3c" stroke="${STROKE}" stroke-width="4"/>
      <circle cx="100" cy="76" r="36" fill="#a3652f" stroke="${STROKE}" stroke-width="4"/>
      ${eye(88, 72, 6)}${eye(112,72,6)}
      <path d="M92,88 Q100,94 108,88" stroke="${STROKE}" stroke-width="2.5" fill="none"/>
      <path d="M60,110 Q100,90 140,110 L146,190 Q100,210 54,190 Z" fill="#d9603b" stroke="${STROKE}" stroke-width="4"/>
      <circle cx="100" cy="150" r="22" fill="none" stroke="#f2a63d" stroke-width="7"/>
      <circle cx="100" cy="150" r="22" fill="none" stroke="${STROKE}" stroke-width="2"/>
    `);
  }

  // --------------------------------------------------------- OCEANIA

  function tiwiMask() {
    return wrap(`
      ${face('#b6472a')}
      ${[...Array(4)].map((_,i)=>`<circle cx="${52+i*12}" cy="${40+i*4}" r="4" fill="#fff8ec"/>`).join('')}
      ${[...Array(4)].map((_,i)=>`<circle cx="${100+i*12}" cy="${44-i*4}" r="4" fill="#fff8ec"/>`).join('')}
      ${eye(74, 100, 11, '#f2a63d')}${eye(74,100,5)}
      ${eye(126, 100, 11, '#f2a63d')}${eye(126,100,5)}
      <path d="M100,112 L88,140 L112,140 Z" fill="#fff8ec" stroke="${STROKE}" stroke-width="2"/>
      <path d="M70,166 Q100,182 130,166" stroke="#fff8ec" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${[...Array(10)].map((_,i)=>`<circle cx="${34+i*14}" cy="190" r="3.5" fill="${i%2?'#f2a63d':'#fff8ec'}"/>`).join('')}
    `);
  }

  function asmatMask() {
    return wrap(`
      <path d="M100,10 C130,10 148,50 144,100 C140,170 122,214 100,218 C78,214 60,170 56,100 C52,50 70,10 100,10 Z" fill="#5a3a20" stroke="${STROKE}" stroke-width="4"/>
      ${eye(80, 90, 8, '#fff8ec')}${eye(80,90,3)}
      ${eye(120, 90, 8, '#fff8ec')}${eye(120,90,3)}
      <path d="M92,104 L80,150 L120,150 L108,104 Z" fill="#3a2a1e" stroke="${STROKE}" stroke-width="2"/>
      <path d="M70,166 Q100,158 130,166" stroke="#fff8ec" stroke-width="4" fill="none" stroke-linecap="round"/>
      ${[...Array(8)].map((_,i)=>`<path d="M${58+i*11},210 l-4,${8+((i%3)*6)}" stroke="#a3652f" stroke-width="4" stroke-linecap="round"/>`).join('')}
    `);
  }

  function tikiFigure() {
    return wrap(`
      <circle cx="100" cy="70" r="52" fill="#1f8a83" stroke="${STROKE}" stroke-width="4"/>
      <path d="M70,58 a12,12 0 1,1 0.1,0" fill="none" stroke="#146962" stroke-width="6"/>
      <path d="M130,58 a12,12 0 1,1 0.1,0" fill="none" stroke="#146962" stroke-width="6"/>
      ${eye(76, 66, 11, '#fff8ec')}${eye(76,66,5)}
      ${eye(124, 66, 11, '#fff8ec')}${eye(124,66,5)}
      <path d="M84,94 Q100,88 116,94 Q112,108 100,110 Q88,108 84,94 Z" fill="#146962" stroke="${STROKE}" stroke-width="2"/>
      <path d="M96,110 Q100,124 104,110" fill="#d9603b" stroke="${STROKE}" stroke-width="2"/>
      <path d="M62,120 Q100,104 138,120 L146,200 Q100,214 54,200 Z" fill="#1f8a83" stroke="${STROKE}" stroke-width="4"/>
      <path d="M70,150 a10,10 0 1,1 0.1,0 M130,150 a10,10 0 1,1 0.1,0" fill="none" stroke="#146962" stroke-width="5"/>
    `);
  }

  // ---------------------------------------------------- NORTH AMERICA

  function jadeMask() {
    const tiles = [];
    const rows = 9;
    for (let r = 0; r < rows; r++) {
      const y = 26 + r * 18;
      const widthAt = 62 * Math.sin(Math.PI * (r + 1) / (rows + 1)) + 14;
      const cols = Math.max(3, Math.round(widthAt / 14));
      for (let c = 0; c < cols; c++) {
        const x = 100 - widthAt + (c * (widthAt * 2 / cols));
        const shade = (r + c) % 2 === 0 ? '#2f7d4f' : '#3f9963';
        tiles.push(`<rect x="${x.toFixed(1)}" y="${y}" width="13" height="15" rx="2" fill="${shade}" stroke="#1c4a30" stroke-width="1"/>`);
      }
    }
    return wrap(`
      <path d="${FACE_PATH}" fill="#1c4a30" stroke="${STROKE}" stroke-width="4"/>
      <clipPath id="jadeClip"><path d="${FACE_PATH}"/></clipPath>
      <g clip-path="url(#jadeClip)">${tiles.join('')}</g>
      ${eye(74, 100, 13, '#fff8ec')}${eye(74,100,6,'#1c130b')}
      ${eye(126, 100, 13, '#fff8ec')}${eye(126,100,6,'#1c130b')}
      <path d="M90,150 L110,150 L106,168 L94,168 Z" fill="#fff8ec" stroke="${STROKE}" stroke-width="2"/>
      <path d="${FACE_PATH}" fill="none" stroke="${STROKE}" stroke-width="4"/>
    `);
  }

  function chaacStatue() {
    return wrap(`
      <rect x="46" y="70" width="108" height="130" rx="10" fill="#5a8f3c" stroke="${STROKE}" stroke-width="4"/>
      <path d="M60,70 Q40,40 60,20 Q80,30 76,70 Z" fill="#5a8f3c" stroke="${STROKE}" stroke-width="4"/>
      <path d="M46,70 Q20,80 22,110 Q10,100 18,60 Q34,50 46,70 Z" fill="#5a8f3c" stroke="${STROKE}" stroke-width="3"/>
      ${eye(76, 96, 11, '#f2a63d')}${eye(76,96,5)}
      ${eye(124, 96, 11, '#f2a63d')}${eye(124,96,5)}
      <path d="M100,104 Q60,130 78,150" stroke="#3a5a26" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M70,170 h60 M70,182 h60" stroke="#3a5a26" stroke-width="5"/>
      <path d="M60,200 h80" stroke="#f2a63d" stroke-width="6"/>
    `);
  }

  function transformMask(open = false) {
    if (!open) {
      return wrap(`
        <path d="M40,110 Q20,50 100,30 Q180,50 160,110 Q170,180 100,214 Q30,180 40,110 Z" fill="#b6472a" stroke="${STROKE}" stroke-width="4"/>
        <path d="M40,110 Q100,130 160,110" stroke="${STROKE}" stroke-width="3" fill="none" stroke-dasharray="4 5"/>
        ${eye(72, 88, 11, '#f2a63d')}${eye(72,88,5)}
        ${eye(128, 88, 11, '#f2a63d')}${eye(128,88,5)}
        <path d="M60,60 Q100,36 140,60" fill="none" stroke="#1c130b" stroke-width="6"/>
        <path d="M70,150 Q100,172 130,150" stroke="${STROKE}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M46,130 Q100,150 154,130" stroke="#1f8a83" stroke-width="5" fill="none"/>
      `);
    }
    return wrap(`
      <path d="M20,60 Q10,110 36,140 L20,120 Z" fill="#b6472a" stroke="${STROKE}" stroke-width="4"/>
      <path d="M180,60 Q190,110 164,140 L180,120 Z" fill="#b6472a" stroke="${STROKE}" stroke-width="4"/>
      ${face('#fbead0')}
      ${eye(74, 96, 9)}${eye(126, 96, 9)}
      <path d="M96,112 Q100,122 104,112" stroke="${STROKE}" stroke-width="2.5" fill="none"/>
      <path d="M78,156 Q100,170 122,156" stroke="${STROKE}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M60,40 Q100,20 140,40" stroke="#1f8a83" stroke-width="6" fill="none"/>
    `);
  }

  function hamatsaMask() {
    return wrap(`
      <path d="M100,20 C60,20 40,60 60,90 L20,96 L60,104 C50,150 70,190 100,200 C130,190 150,150 140,104 L180,96 L140,90 C160,60 140,20 100,20 Z" fill="#1c130b" stroke="${STROKE}" stroke-width="4"/>
      <path d="M60,90 L14,80 L20,96 L14,112 L60,104 Z" fill="#b6472a" stroke="${STROKE}" stroke-width="3"/>
      <path d="M140,90 L186,80 L180,96 L186,112 L140,104 Z" fill="#b6472a" stroke="${STROKE}" stroke-width="3"/>
      ${eye(78, 66, 10, '#f2a63d')}${eye(78,66,4)}
      ${eye(122, 66, 10, '#f2a63d')}${eye(122,66,4)}
      <path d="M70,54 Q100,40 130,54" stroke="#fff8ec" stroke-width="5" fill="none"/>
      <path d="M76,150 h48 M76,166 h48" stroke="#fff8ec" stroke-width="5"/>
    `);
  }

  return {
    chamMask, nohMask, barongMask, mahakalaMask, poNagarStatue,
    nguniMask, geledeMask, kanagaMask, punuMask, goldenStool,
    celticHornedMask, mamuthonesMask, cernunnosFigure,
    tiwiMask, asmatMask, tikiFigure,
    jadeMask, chaacStatue, transformMask, hamatsaMask,
  };
})();
