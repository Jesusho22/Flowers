/* ============================================================
   flowers.js
   Generación procedural de flores y ramos en SVG (sin imágenes
   externas). Todo el "arte floral" se construye con matemáticas
   simples: pétalos como elipses/curvas distribuidas en radial.
   ============================================================ */

(function (global) {
  'use strict';

  /* ---------- utilidades de color y aleatoriedad ---------- */

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const bigint = parseInt(h.length === 3
      ? h.split('').map((c) => c + c).join('')
      : h, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

  function rgbToHex(r, g, b) {
    const toHex = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function shade(hex, amt) {
    // amt > 0 aclara, amt < 0 oscurece. amt en rango [-1, 1]
    const { r, g, b } = hexToRgb(hex);
    const t = amt > 0 ? amt : 0;
    const d = amt < 0 ? -amt : 0;
    const nr = r + (255 - r) * t - r * d;
    const ng = g + (255 - g) * t - g * d;
    const nb = b + (255 - b) * t - b * d;
    return rgbToHex(nr, ng, nb);
  }

  function mix(hexA, hexB, t) {
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    return rgbToHex(
      a.r + (b.r - a.r) * t,
      a.g + (b.g - a.g) * t,
      a.b + (b.b - a.b) * t
    );
  }

  /* ---------- paletas y tipos disponibles ---------- */

  const COLOR_PALETTES = {
    amarillo: { label: 'Amarillo clásico', swatch: '#FFC107', shades: ['#FFE082', '#FFD54F', '#FFC107', '#F9A825'] },
    pastel: { label: 'Amarillo pastel', swatch: '#FDE9A0', shades: ['#FFFAE3', '#FFF3B0', '#FDE9A0', '#FCE08C'] },
    durazno: { label: 'Durazno', swatch: '#FFB37C', shades: ['#FFE3C7', '#FFD1A3', '#FFB37C', '#FFA05C'] },
    rosa: { label: 'Rosa pastel', swatch: '#FFB0D1', shades: ['#FFE3EF', '#FFC9DE', '#FFB0D1', '#FF9EC4'] },
    lavanda: { label: 'Lavanda', swatch: '#C9A6E8', shades: ['#EFE5FA', '#D9C6F1', '#C9A6E8', '#B78CE0'] },
    cielo: { label: 'Cielo', swatch: '#9AC8F2', shades: ['#E7F2FF', '#B3DBFF', '#9AC8F2', '#7FB5EA'] },
    arcoiris: { label: 'Arcoíris pastel', swatch: 'conic-gradient(#FFE082,#FFC9DE,#C9A6E8,#B3DBFF,#AEEAD0,#FFE082)', shades: null }
  };

  const ALL_SHADES = Object.keys(COLOR_PALETTES)
    .filter((k) => COLOR_PALETTES[k].shades)
    .reduce((acc, k) => acc.concat(COLOR_PALETTES[k].shades), []);

  function paletteShades(paletteKey) {
    const p = COLOR_PALETTES[paletteKey];
    if (!p || !p.shades) {
      // arcoíris: mezcla de todas las paletas
      return shuffle(ALL_SHADES).slice(0, 4);
    }
    return p.shades;
  }

  const FLOWER_TYPES = {
    variado: { label: 'Mix sorpresa', emoji: '✿' },
    girasol: { label: 'Girasol', emoji: '🌻' },
    margarita: { label: 'Margarita', emoji: '🌼' },
    rosa: { label: 'Rosa', emoji: '🌹' },
    tulipan: { label: 'Tulipán', emoji: '🌷' },
    lirio: { label: 'Lirio', emoji: '🌸' },
    dalia: { label: 'Dalia', emoji: '🌺' },
    hortensia: { label: 'Hortensia', emoji: '💠' }
  };

  /* ---------- generadores de cabezas de flor (viewBox 0 0 100 100) ---------- */

  function radialPetals({ petals, dist, rx, ry, colorFn, roundedTip = true }) {
    let out = '';
    for (let i = 0; i < petals; i++) {
      const angle = (360 / petals) * i;
      const fill = colorFn(i);
      out += `<ellipse cx="50" cy="${(50 - dist).toFixed(2)}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(${angle.toFixed(2)} 50 50)"/>`;
    }
    return out;
  }

  function dotTexture(centerR, color) {
    let out = '';
    const rings = 3;
    for (let ring = 1; ring <= rings; ring++) {
      const r = (centerR / rings) * ring * 0.85;
      const count = 6 * ring;
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count + ring;
        const cx = 50 + Math.cos(a) * r;
        const cy = 50 + Math.sin(a) * r;
        out += `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="0.9" fill="${color}" opacity="0.55"/>`;
      }
    }
    return out;
  }

  function girasolHead(shades) {
    const base = shades[shades.length - 1] || '#F9A825';
    const petals = radialPetals({
      petals: 22,
      dist: 30,
      rx: 6.2,
      ry: 17,
      colorFn: (i) => (i % 2 === 0 ? shade(base, 0.18) : shade(base, -0.05))
    });
    const centerColor = '#5b3a22';
    const center = `<circle cx="50" cy="50" r="14.5" fill="${centerColor}"/>` + dotTexture(14.5, '#3c2415');
    return `<g class="flower-head flower-girasol">${petals}${center}</g>`;
  }

  function margaritaHead(shades) {
    const petalColor = shades[0] || '#FFFAE3';
    const petals = radialPetals({
      petals: 18,
      dist: 27,
      rx: 4.2,
      ry: 15,
      colorFn: (i) => (i % 3 === 0 ? shade(petalColor, -0.06) : petalColor)
    });
    const center = `<circle cx="50" cy="50" r="9.5" fill="#FFC107"/>` + dotTexture(9.5, '#E28F00');
    return `<g class="flower-head flower-margarita">${petals}${center}</g>`;
  }

  function lirioHead(shades) {
    const petalColor = shades[2] || shades[0] || '#FFC9DE';
    const petals = radialPetals({
      petals: 6,
      dist: 21,
      rx: 9.5,
      ry: 23,
      colorFn: (i) => mix(petalColor, shade(petalColor, 0.25), (i % 2) * 0.4)
    });
    let stamens = '';
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 * i) / 5;
      const x2 = 50 + Math.cos(a) * 10;
      const y2 = 50 + Math.sin(a) * 10;
      stamens += `<line x1="50" y1="50" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="#C87941" stroke-width="1.1"/>`;
      stamens += `<circle cx="${x2.toFixed(2)}" cy="${y2.toFixed(2)}" r="1.6" fill="#8C4A1F"/>`;
    }
    const center = `<circle cx="50" cy="50" r="3.2" fill="${shade(petalColor, -0.3)}"/>`;
    return `<g class="flower-head flower-lirio">${petals}${stamens}${center}</g>`;
  }

  function rosaHead(shades) {
    const c0 = shades[0] || '#FFE3EF';
    const c1 = shades[1] || c0;
    const c2 = shades[2] || c1;
    const c3 = shades[3] || c2;
    const rings = [
      { petals: 8, dist: 25, rx: 9.5, ry: 13, rot: 0, color: c3 },
      { petals: 8, dist: 16, rx: 8, ry: 11, rot: 22, color: c2 },
      { petals: 6, dist: 9, rx: 6, ry: 8, rot: 11, color: c1 },
      { petals: 5, dist: 3.5, rx: 4, ry: 5, rot: 30, color: c0 }
    ];
    let out = '';
    rings.forEach((ring) => {
      for (let i = 0; i < ring.petals; i++) {
        const angle = (360 / ring.petals) * i + ring.rot;
        out += `<ellipse cx="50" cy="${(50 - ring.dist).toFixed(2)}" rx="${ring.rx}" ry="${ring.ry}" fill="${ring.color}" opacity="0.96" transform="rotate(${angle.toFixed(2)} 50 50)"/>`;
      }
    });
    return `<g class="flower-head flower-rosa">${out}</g>`;
  }

  function tulipanHead(shades) {
    const color = shades[2] || shades[0] || '#FFC107';
    const petalPath = 'M50,90 C33,79 27,44 38,17 C43,5 57,5 62,17 C73,44 67,79 50,90 Z';
    const angles = [-25, -12, 0, 12, 25];
    let out = '';
    angles.forEach((a, i) => {
      const s = 1 - Math.abs(a) / 130;
      const fillColor = i === 2 ? shade(color, 0.12) : shade(color, -0.08 * Math.abs(i - 2));
      out += `<path d="${petalPath}" fill="${fillColor}" opacity="0.97" transform="rotate(${a} 50 88) scale(${s.toFixed(2)})" transform-origin="50px 88px"/>`;
    });
    return `<g class="flower-head flower-tulipan">${out}</g>`;
  }

  function daliaHead(shades) {
    const c0 = shades[0] || '#FFE082';
    const c1 = shades[1] || c0;
    const c2 = shades[2] || c1;
    const c3 = shades[3] || c2;
    const rings = [
      { petals: 14, dist: 29, rx: 3.4, ry: 12, rot: 0, color: c3 },
      { petals: 13, dist: 23, rx: 3.2, ry: 11, rot: 14, color: mix(c3, c2, 0.5) },
      { petals: 12, dist: 17, rx: 3, ry: 10, rot: 7, color: c2 },
      { petals: 11, dist: 11, rx: 2.6, ry: 8, rot: 18, color: mix(c2, c1, 0.5) },
      { petals: 9, dist: 5.5, rx: 2.2, ry: 6, rot: 9, color: c1 }
    ];
    let out = '';
    rings.forEach((ring) => {
      for (let i = 0; i < ring.petals; i++) {
        const angle = (360 / ring.petals) * i + ring.rot;
        out += `<ellipse cx="50" cy="${(50 - ring.dist).toFixed(2)}" rx="${ring.rx}" ry="${ring.ry}" fill="${ring.color}" transform="rotate(${angle.toFixed(2)} 50 50)"/>`;
      }
    });
    out += `<circle cx="50" cy="50" r="3" fill="${shade(c0, -0.25)}"/>`;
    return `<g class="flower-head flower-dalia">${out}</g>`;
  }

  function floretSVG(cx, cy, color, rot) {
    const s = 5.5;
    return `<g transform="translate(${cx.toFixed(2)},${cy.toFixed(2)}) rotate(${rot.toFixed(1)})">
      <ellipse cx="0" cy="-${s}" rx="3.2" ry="${s}" fill="${color}"/>
      <ellipse cx="0" cy="${s}" rx="3.2" ry="${s}" fill="${color}"/>
      <ellipse cx="-${s}" cy="0" rx="${s}" ry="3.2" fill="${color}"/>
      <ellipse cx="${s}" cy="0" rx="${s}" ry="3.2" fill="${color}"/>
      <circle cx="0" cy="0" r="1.6" fill="${shade(color, -0.25)}"/>
    </g>`;
  }

  function hortensiaHead(shades) {
    const palette = [shades[0], shades[1] || shades[0], shades[2] || shades[0], shades[3] || shades[0]];
    let florets = '';
    const count = 16;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 6 + Math.random() * 25;
      const cx = 50 + Math.cos(a) * r;
      const cy = 50 + Math.sin(a) * r;
      const color = randomFrom(palette);
      florets += floretSVG(cx, cy, color, Math.random() * 360);
    }
    return `<g class="flower-head flower-hortensia">${florets}</g>`;
  }

  const HEAD_BUILDERS = {
    girasol: girasolHead,
    margarita: margaritaHead,
    rosa: rosaHead,
    tulipan: tulipanHead,
    lirio: lirioHead,
    dalia: daliaHead,
    hortensia: hortensiaHead
  };

  function pickConcreteType(type) {
    if (type && type !== 'variado' && HEAD_BUILDERS[type]) return type;
    // "variado": el girasol predomina por ser la flor insignia del día
    const weighted = ['girasol', 'girasol', 'margarita', 'rosa', 'tulipan', 'lirio', 'dalia', 'hortensia'];
    return randomFrom(weighted);
  }

  function flowerHeadSVG(type, paletteKey) {
    const concreteType = pickConcreteType(type);
    const shades = paletteKey === 'arcoiris' ? shuffle(ALL_SHADES).slice(0, 4) : paletteShades(paletteKey);
    const builder = HEAD_BUILDERS[concreteType] || girasolHead;
    return { type: concreteType, markup: builder(shades) };
  }

  // flor pequeña y económica en recursos, usada para la explosión masiva
  function simpleBlossomSVG(petalColor, centerColor) {
    let petals = '';
    const n = 6;
    for (let i = 0; i < n; i++) {
      const angle = (360 / n) * i;
      petals += `<ellipse cx="50" cy="30" rx="12" ry="17" fill="${petalColor}" transform="rotate(${angle} 50 50)"/>`;
    }
    return `<g>${petals}<circle cx="50" cy="50" r="10" fill="${centerColor}"/></g>`;
  }

  // flor de dos capas, más "pomposa" y voluminosa, para el primer plano
  // de la explosión (economiza recursos usándola solo en flores grandes)
  function lushBlossomSVG(petalColor, centerColor) {
    const outerColor = petalColor;
    const innerColor = shade(petalColor, 0.16);
    let outer = '';
    const nOuter = 8;
    for (let i = 0; i < nOuter; i++) {
      const angle = (360 / nOuter) * i;
      outer += `<ellipse cx="50" cy="18" rx="13" ry="21" fill="${outerColor}" transform="rotate(${angle} 50 50)"/>`;
    }
    let inner = '';
    const nInner = 6;
    for (let i = 0; i < nInner; i++) {
      const angle = (360 / nInner) * i + 15;
      inner += `<ellipse cx="50" cy="27" rx="10" ry="16" fill="${innerColor}" opacity="0.95" transform="rotate(${angle} 50 50)"/>`;
    }
    return `<g>${outer}${inner}<circle cx="50" cy="50" r="11" fill="${centerColor}"/></g>`;
  }

  /* ---------- composición del ramo completo ---------- */

  const BOUQUET_VIEWBOX = { w: 320, h: 380 };
  const BIND_POINT = { x: 160, y: 336 };

  const SLOTS = [
    { x: 160, y: 190, size: 92, z: 6 },
    { x: 108, y: 168, size: 78, z: 5 },
    { x: 212, y: 168, size: 78, z: 5 },
    { x: 66, y: 138, size: 66, z: 4 },
    { x: 254, y: 138, size: 66, z: 4 },
    { x: 130, y: 112, size: 58, z: 3 },
    { x: 190, y: 112, size: 58, z: 3 },
    { x: 160, y: 86, size: 50, z: 2 },
    { x: 90, y: 200, size: 54, z: 5 },
    { x: 230, y: 200, size: 54, z: 5 }
  ];

  function stemPath(x, y) {
    const dx = (BIND_POINT.x - x) * 0.3;
    return `M${x},${y} C${x + dx},${y + 60} ${BIND_POINT.x - dx},${BIND_POINT.y - 70} ${BIND_POINT.x},${BIND_POINT.y}`;
  }

  function leafPath(x, y, side) {
    const dir = side === 'left' ? -1 : 1;
    const midX = x + dir * 22;
    const midY = y + 46;
    return `M${x},${y + 20} Q${midX},${midY} ${x + dir * 4},${y + 80} Q${x - dir * 10},${midY + 6} ${x},${y + 20} Z`;
  }

  function paperWrap() {
    const grad = 'wrapGrad';
    return `
      <defs>
        <linearGradient id="${grad}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFFDF7"/>
          <stop offset="100%" stop-color="#FFE9C7"/>
        </linearGradient>
      </defs>
      <path d="M70,376 C60,300 90,220 160,150 C230,220 260,300 250,376 Z" fill="url(#${grad})" stroke="#F4CE8E" stroke-width="2" opacity="0.95"/>
      <path d="M110,376 C104,300 128,236 160,190 C192,236 216,300 210,376 Z" fill="#FFF6E3" opacity="0.55"/>
    `;
  }

  function ribbonBow() {
    const cx = BIND_POINT.x;
    const cy = BIND_POINT.y - 4;
    return `
      <g class="ribbon">
        <path d="M${cx},${cy} C${cx - 34},${cy - 22} ${cx - 40},${cy + 18} ${cx - 6},${cy + 6} Z" fill="#FFD54F" stroke="#F4A300" stroke-width="1.5"/>
        <path d="M${cx},${cy} C${cx + 34},${cy - 22} ${cx + 40},${cy + 18} ${cx + 6},${cy + 6} Z" fill="#FFC107" stroke="#F4A300" stroke-width="1.5"/>
        <circle cx="${cx}" cy="${cy}" r="6.5" fill="#F9A825" stroke="#E08E00" stroke-width="1.5"/>
        <path d="M${cx - 4},${cy + 5} L${cx - 16},${cy + 34} L${cx - 4},${cy + 24} Z" fill="#FFCA28"/>
        <path d="M${cx + 4},${cy + 5} L${cx + 16},${cy + 34} L${cx + 4},${cy + 24} Z" fill="#FFD54F"/>
      </g>
    `;
  }

  function buildBouquetSVG(selection) {
    const { type = 'variado', palette = 'amarillo' } = selection || {};
    const order = SLOTS.slice().sort((a, b) => a.z - b.z);
    let stemsMarkup = '';
    let flowersMarkup = '';

    order.forEach((slot) => {
      const green = shade('#6F8F4E', -0.08 + Math.random() * 0.12);
      stemsMarkup += `<path d="${stemPath(slot.x, slot.y + slot.size * 0.32)}" stroke="${green}" stroke-width="4.5" fill="none" opacity="0.9"/>`;
      if (Math.random() > 0.4) {
        const side = Math.random() > 0.5 ? 'left' : 'right';
        stemsMarkup += `<path d="${leafPath(slot.x, slot.y + slot.size * 0.5, side)}" fill="${shade(green, -0.05)}" opacity="0.9"/>`;
      }
      const { markup } = flowerHeadSVG(type, palette);
      const half = slot.size / 2;
      // el balanceo de cada flor se anima con SMIL (animateTransform) en vez
      // de CSS sobre <svg> anidados: es la técnica que funciona de forma
      // fiable en todos los navegadores reales (incluidos móviles)
      const swaySpan = (2.4 + Math.random() * 2.4).toFixed(2);
      const swayDur = (3.2 + Math.random() * 2.6).toFixed(2);
      const swayDelay = (Math.random() * 2).toFixed(2);
      flowersMarkup += `<svg x="${slot.x - half}" y="${slot.y - half}" width="${slot.size}" height="${slot.size}" viewBox="0 0 100 100"><g>${markup}<animateTransform attributeName="transform" type="rotate" values="-${swaySpan} 50 68; ${swaySpan} 50 68; -${swaySpan} 50 68" dur="${swayDur}s" begin="${swayDelay}s" repeatCount="indefinite"/></g></svg>`;
    });

    const filler = shade('#FFF6E3', 0);
    let sprigs = '';
    for (let i = 0; i < 6; i++) {
      const fx = 90 + Math.random() * 140;
      const fy = 96 + Math.random() * 70;
      sprigs += `<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="${(3 + Math.random() * 3).toFixed(1)}" fill="${filler}" opacity="0.8"/>`;
    }

    return `
      <svg viewBox="0 0 ${BOUQUET_VIEWBOX.w} ${BOUQUET_VIEWBOX.h}" xmlns="http://www.w3.org/2000/svg" class="bouquet-svg">
        ${paperWrap()}
        ${stemsMarkup}
        ${sprigs}
        ${flowersMarkup}
        ${ribbonBow()}
      </svg>
    `;
  }

  /* ---------- export global ---------- */

  global.Flowers = {
    COLOR_PALETTES,
    FLOWER_TYPES,
    paletteShades,
    flowerHeadSVG,
    simpleBlossomSVG,
    lushBlossomSVG,
    buildBouquetSVG,
    utils: { clamp, randomFrom, shuffle, hexToRgb, rgbToHex, shade, mix }
  };
}(window));
