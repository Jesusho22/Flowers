/* ============================================================
   main.js
   Orquesta la experiencia: tarjeta -> explosión de flores ->
   ramo amarillo + dedicatoria -> personalización.
   ============================================================ */

(function () {
  'use strict';

  const { randomFrom, shuffle, clamp } = window.Flowers.utils;

  const state = {
    name: '',
    type: 'variado',
    palette: 'amarillo'
  };

  const audioEngine = new window.AmbientAudio();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const PREFS_KEY = 'flores-amarillas-prefs-v1';

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function savePrefs() {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({
        name: state.name,
        type: state.type,
        palette: state.palette
      }));
    } catch (e) {
      /* almacenamiento no disponible: se continúa sin recordar preferencias */
    }
  }

  const el = {};

  function cacheEls() {
    el.welcomeOverlay = document.getElementById('welcomeOverlay');
    el.screenCard = document.getElementById('screen-card');
    el.screenBouquet = document.getElementById('screen-bouquet');
    el.explosionLayer = document.getElementById('explosionLayer');
    el.nameInput = document.getElementById('nameInput');
    el.btnStart = document.getElementById('btnStart');
    el.vintageCard = document.getElementById('vintageCard');
    el.bouquetContainer = document.getElementById('bouquetContainer');
    el.dedicationText = document.getElementById('dedicationText');
    el.btnShuffle = document.getElementById('btnShuffle');
    el.flowerChoices = document.getElementById('flowerChoices');
    el.colorChoices = document.getElementById('colorChoices');
    el.btnDownload = document.getElementById('btnDownload');
    el.btnRestart = document.getElementById('btnRestart');
    el.soundToggle = document.getElementById('soundToggle');
    el.greetingName = document.getElementById('greetingName');
    el.exportCanvas = document.getElementById('exportCanvas');
    el.btnShare = document.getElementById('btnShare');
    el.rememberedHint = document.getElementById('rememberedHint');
  }

  function showScreen(screen) {
    [el.screenCard, el.screenBouquet].forEach((s) => {
      s.classList.toggle('active', s === screen);
    });
  }

  /* ---------------- ventana emergente de bienvenida ---------------- */

  function initWelcome() {
    const prefs = loadPrefs();
    if (prefs) {
      if (prefs.name) {
        el.nameInput.value = prefs.name;
        state.name = prefs.name;
      }
      if (prefs.type && window.Flowers.FLOWER_TYPES[prefs.type]) state.type = prefs.type;
      if (prefs.palette && window.Flowers.COLOR_PALETTES[prefs.palette]) state.palette = prefs.palette;
      if (prefs.name && el.rememberedHint) {
        el.rememberedHint.textContent = `Qué alegría verte de nuevo, ${prefs.name} ✿`;
        el.rememberedHint.hidden = false;
      }
    }

    function closeWelcome() {
      state.name = el.nameInput.value.trim();
      savePrefs();
      el.welcomeOverlay.classList.add('closed');
      setTimeout(() => { el.welcomeOverlay.style.display = 'none'; }, 500);
    }

    el.btnStart.addEventListener('click', closeWelcome);
    el.nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') closeWelcome();
    });
    // el nombre es opcional: el foco automático invita a escribirlo sin bloquear la vista de la tarjeta
    setTimeout(() => el.nameInput.focus({ preventScroll: true }), 400);
  }

  /* ---------------- pantalla de la tarjeta ---------------- */

  function initCard() {
    el.vintageCard.addEventListener('click', onCardOpen, { once: true });
  }

  function onCardOpen() {
    audioEngine.ensureContext();
    el.vintageCard.classList.add('opening');
    el.vintageCard.disabled = true;

    const rect = el.vintageCard.getBoundingClientRect();
    const origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

    spawnSparkleBurst(origin);

    setTimeout(() => {
      startExplosion(origin);
    }, 650);
  }

  function spawnSparkleBurst(origin) {
    const layer = document.createElement('div');
    layer.className = 'sparkle-layer';
    document.body.appendChild(layer);
    const count = reducedMotion ? 6 : 18;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const dist = 55 + Math.random() * 95;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const s = document.createElement('span');
      s.className = 'sparkle';
      s.style.left = `${origin.x}px`;
      s.style.top = `${origin.y}px`;
      s.style.setProperty('--dx', `${dx}px`);
      s.style.setProperty('--dy', `${dy}px`);
      s.style.animationDelay = `${Math.random() * 140}ms`;
      layer.appendChild(s);
    }
    setTimeout(() => layer.remove(), 1500);
  }

  /* ---------------- explosión de flores ---------------- */

  const EXPLOSION_COLORS = {
    rosa: ['#FFC9DE', '#FFB6D1', '#FF9EC4'],
    lavanda: ['#E3D1F4', '#D2B8ED', '#C9A6E8'],
    durazno: ['#FFD9B3', '#FFC896', '#FFB37C'],
    menta: ['#C9F2DF', '#AEEAD0', '#8FE0BF'],
    cielo: ['#CDEBFF', '#B3DBFF', '#9AC8F2'],
    amarillo: ['#FFE68A', '#FFD54F', '#FFC107', '#F9A825']
  };
  const PASTEL_FAMILIES = ['rosa', 'lavanda', 'durazno', 'menta', 'cielo'];
  // mapeo a paletas reales de flowers.js para poder usar especies con nombre
  // (rosa, margarita, girasol, dalia, hortensia) durante la explosión
  const FAMILY_TO_PALETTE = { rosa: 'rosa', lavanda: 'lavanda', durazno: 'durazno', menta: 'pastel', cielo: 'cielo', amarillo: 'amarillo' };
  const NAMED_SPECIES = ['rosa', 'margarita', 'girasol', 'dalia', 'hortensia'];

  function pickExplosionColors(progress) {
    const yellowWeight = 0.15 + progress * 0.55;
    if (Math.random() < yellowWeight) {
      const c = randomFrom(EXPLOSION_COLORS.amarillo);
      return { petal: c, center: '#8C5A1B', family: 'amarillo' };
    }
    const family = randomFrom(PASTEL_FAMILIES);
    const c = randomFrom(EXPLOSION_COLORS[family]);
    return { petal: c, center: '#F9A825', family };
  }

  // elige el arte para una flor de la explosión: para las grandes, alterna
  // entre el "blossom" genérico y especies con nombre reales (rosa,
  // margarita, girasol, dalia, hortensia) para que el mosaico final se vea
  // tan variado como un ramo de verdad, no flores repetidas
  function pickExplosionArt(big, progress) {
    const { petal, center, family } = pickExplosionColors(progress);
    if (!big) return window.Flowers.simpleBlossomSVG(petal, center);
    if (Math.random() < 0.55) {
      const paletteKey = FAMILY_TO_PALETTE[family] || 'amarillo';
      const namedType = randomFrom(NAMED_SPECIES);
      return window.Flowers.flowerHeadSVG(namedType, paletteKey).markup;
    }
    return window.Flowers.lushBlossomSVG(petal, center);
  }

  function buildTargetPositions(count) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cols = Math.ceil(Math.sqrt((count * vw) / vh));
    const rows = Math.ceil(count / cols);
    const cellW = vw / cols;
    const cellH = vh / rows;
    const positions = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (positions.length >= count) break;
        const jitterX = (Math.random() - 0.5) * cellW * 0.7;
        const jitterY = (Math.random() - 0.5) * cellH * 0.7;
        positions.push({
          x: c * cellW + cellW / 2 + jitterX,
          y: r * cellH + cellH / 2 + jitterY
        });
      }
    }
    return shuffle(positions);
  }

  /* ---- vuelo con arco orgánico y "bloom" (rAF, no transiciones CSS) ---- */

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function quadBezier(p0, p1, p2, t) {
    const u = 1 - t;
    return u * u * p0 + 2 * u * t * p1 + t * t * p2;
  }

  const activeFlights = [];
  let flightLoopRunning = false;

  function stepFlights(now) {
    for (let i = activeFlights.length - 1; i >= 0; i--) {
      const f = activeFlights[i];
      const elapsed = now - f.start;
      const t = clamp(elapsed / f.duration, 0, 1);
      const posT = easeOutCubic(t);
      const x = quadBezier(f.sx, f.cx, f.tx, posT);
      const y = quadBezier(f.sy, f.cy, f.ty, posT);
      const scale = clamp(easeOutBack(t), 0, 1.18);
      const rot = f.rotStart + (f.rotEnd - f.rotStart) * posT;
      const opacity = clamp(elapsed / (f.duration * 0.18), 0, 1) * 0.96;

      if (t >= 1) {
        f.el.style.transform = `translate(${f.tx}px, ${f.ty}px) scale(1) rotate(${f.restRot}deg)`;
        f.el.style.opacity = '0.96';
        activeFlights.splice(i, 1);
      } else {
        f.el.style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${rot}deg)`;
        f.el.style.opacity = String(opacity);
      }
    }
    if (activeFlights.length > 0) {
      requestAnimationFrame(stepFlights);
    } else {
      flightLoopRunning = false;
    }
  }

  function ensureFlightLoop() {
    if (!flightLoopRunning) {
      flightLoopRunning = true;
      requestAnimationFrame(stepFlights);
    }
  }

  function spawnExplosionFlower(origin, target, progress, forceBig) {
    // conforme avanza la explosión aparecen más flores grandes y "pomposas",
    // dando la sensación de que el ramo final ya se está formando y que la
    // pantalla se llena por completo, como un mosaico de flores sin huecos
    const big = forceBig || Math.random() < 0.35 + progress * 0.35;
    const size = big ? 74 + Math.random() * 70 : 42 + Math.random() * Math.random() * 46;
    const svg = pickExplosionArt(big, progress);

    const wrap = document.createElement('div');
    wrap.className = 'explosion-flower';
    wrap.style.width = `${size}px`;
    wrap.style.height = `${size}px`;
    // el balanceo vive en un hijo independiente para no chocar con la
    // transformación de vuelo (posición/escala/rotación) del contenedor
    wrap.innerHTML = `<span class="explosion-flower-sway"><svg viewBox="0 0 100 100" width="100%" height="100%">${svg}</svg></span>`;
    if (!reducedMotion) {
      wrap.style.setProperty('--sway-dur', `${2.8 + Math.random() * 2.4}s`);
      wrap.style.setProperty('--sway-delay', `${Math.random() * 2}s`);
    }
    el.explosionLayer.appendChild(wrap);

    const startX = origin.x - size / 2;
    const startY = origin.y - size / 2;
    const targetX = target.x - size / 2;
    const targetY = target.y - size / 2;
    const restRot = (Math.random() - 0.5) * 26;

    if (reducedMotion) {
      wrap.style.transform = `translate(${startX}px, ${startY}px) scale(0.3) rotate(0deg)`;
      wrap.style.opacity = '0';
      wrap.style.transition = 'transform .6s ease, opacity .6s ease';
      requestAnimationFrame(() => {
        wrap.style.transform = `translate(${targetX}px, ${targetY}px) scale(1) rotate(${restRot}deg)`;
        wrap.style.opacity = '0.95';
      });
      return;
    }

    // punto de control perpendicular a la línea recta origen->destino, para
    // que cada flor dibuje un arco orgánico (con un pequeño impulso hacia
    // arriba) en vez de volar en línea recta
    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.hypot(dx, dy) || 1;
    const perpX = -dy / dist;
    const perpY = dx / dist;
    const bow = (Math.random() - 0.5) * Math.min(220, dist * 0.9);
    const midX = (startX + targetX) / 2 + perpX * bow;
    const midY = (startY + targetY) / 2 + perpY * bow - 30 - Math.random() * 50;

    const spins = (1 + Math.random() * 1.4) * (Math.random() > 0.5 ? 1 : -1);

    wrap.style.transform = `translate(${startX}px, ${startY}px) scale(0) rotate(0deg)`;
    wrap.style.opacity = '0';

    activeFlights.push({
      el: wrap,
      sx: startX,
      sy: startY,
      cx: midX,
      cy: midY,
      tx: targetX,
      ty: targetY,
      rotStart: 0,
      rotEnd: restRot + spins * 360,
      restRot,
      start: performance.now() + Math.random() * 90,
      duration: 1150 + Math.random() * 800
    });
    ensureFlightLoop();
  }

  function startExplosion(origin) {
    el.explosionLayer.classList.add('active');
    el.explosionLayer.innerHTML = '';
    activeFlights.length = 0;

    // densidad alta a propósito: el tamaño de las flores supera el tamaño
    // de celda de la grilla, así que se solapan mucho y el mosaico final
    // cubre la pantalla por completo, sin fondo visible entre flores
    const area = window.innerWidth * window.innerHeight;
    const count = clamp(Math.round(area / 5200), 170, 340);
    const targets = buildTargetPositions(count);

    const totalDurationMs = reducedMotion ? 1200 : 5600;
    const intervalMs = 32;
    const totalSteps = Math.ceil(totalDurationMs / intervalMs);
    const batchSize = Math.max(1, Math.ceil(count / totalSteps));

    let spawned = 0;
    const timer = setInterval(() => {
      for (let i = 0; i < batchSize && spawned < count; i++, spawned++) {
        const progress = spawned / count;
        spawnExplosionFlower(origin, targets[spawned], progress);
      }
      if (spawned >= count) {
        clearInterval(timer);
        spawnFillGapsPass(origin);
        // deja terminar los últimos vuelos (arco + rebote de aterrizaje)
        setTimeout(revealBouquet, reducedMotion ? 500 : 2500);
      }
    }, intervalMs);
  }

  // pasada final: unas cuantas flores grandes más en posiciones totalmente
  // aleatorias (no en la grilla) para tapar cualquier hueco que haya
  // quedado y reforzar la sensación de pantalla completamente cubierta,
  // justo como remate antes de revelar el ramo
  function spawnFillGapsPass(origin) {
    if (reducedMotion) return;
    const extra = 16 + Math.floor(Math.random() * 10);
    for (let i = 0; i < extra; i++) {
      const target = { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight };
      spawnExplosionFlower(origin, target, 1, true);
    }
  }

  /* ---------------- pantalla del ramo ---------------- */

  function revealBouquet() {
    el.explosionLayer.classList.add('settled');
    showScreen(el.screenBouquet);
    if (el.greetingName) {
      el.greetingName.textContent = state.name ? `, ${state.name}` : '';
    }
    regenerateBouquet();
    showDedication();
    audioEngine.start();
  }

  function regenerateBouquet() {
    el.bouquetContainer.classList.remove('pop-in', 'swaying');
    el.bouquetContainer.innerHTML = window.Flowers.buildBouquetSVG({ type: state.type, palette: state.palette });
    // fuerza reflow para reiniciar animación
    void el.bouquetContainer.offsetWidth;
    el.bouquetContainer.classList.add('pop-in');
    if (!reducedMotion) {
      setTimeout(() => el.bouquetContainer.classList.add('swaying'), 1150);
    }
  }

  function showDedication() {
    const text = window.Dedications.getRandomDedication(state.name);
    el.dedicationText.classList.remove('fade-in');
    void el.dedicationText.offsetWidth;
    el.dedicationText.textContent = text;
    el.dedicationText.classList.add('fade-in');
  }

  /* ---------------- personalización (chips) ---------------- */

  function buildChips(container, entries, selectedKey, onSelect) {
    container.innerHTML = '';
    Object.keys(entries).forEach((key) => {
      const info = entries[key];
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.dataset.key = key;
      chip.classList.toggle('selected', key === selectedKey);

      if (info.swatch) {
        const dot = document.createElement('span');
        dot.className = 'chip-swatch';
        dot.style.background = info.swatch;
        chip.appendChild(dot);
      }
      const label = document.createElement('span');
      label.textContent = info.emoji ? `${info.emoji} ${info.label}` : info.label;
      chip.appendChild(label);

      chip.addEventListener('click', () => {
        container.querySelectorAll('.chip').forEach((c) => c.classList.remove('selected'));
        chip.classList.add('selected');
        onSelect(key);
      });
      container.appendChild(chip);
    });
  }

  function initCustomizer() {
    buildChips(el.flowerChoices, window.Flowers.FLOWER_TYPES, state.type, (key) => {
      state.type = key;
      savePrefs();
      regenerateBouquet();
    });
    buildChips(el.colorChoices, window.Flowers.COLOR_PALETTES, state.palette, (key) => {
      state.palette = key;
      savePrefs();
      regenerateBouquet();
    });

    el.btnShuffle.addEventListener('click', showDedication);
    el.btnRestart.addEventListener('click', () => {
      audioEngine.stop();
      window.location.reload();
    });
    el.soundToggle.addEventListener('click', () => {
      const playing = audioEngine.toggle();
      el.soundToggle.textContent = playing ? '🔊' : '🔇';
      el.soundToggle.setAttribute('aria-label', playing ? 'Silenciar sonido' : 'Activar sonido');
    });
    el.btnDownload.addEventListener('click', exportCard);
    initShare();
  }

  /* ---------------- compartir nativo (Web Share API) ---------------- */

  function initShare() {
    if (!el.btnShare) return;
    if (!navigator.share) {
      el.btnShare.style.display = 'none';
      return;
    }
    el.btnShare.addEventListener('click', shareCard);
  }

  async function shareCard() {
    try {
      const blob = await buildCardBlob();
      const shareData = {
        title: 'Feliz Día de las Flores Amarillas',
        text: el.dedicationText.textContent || ''
      };
      if (blob && window.File && navigator.canShare) {
        const file = new File([blob], 'tarjeta-flores-amarillas.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
      }
      await navigator.share(shareData);
    } catch (e) {
      /* el usuario canceló el diálogo de compartir o no es compatible: no hacer nada */
    }
  }

  /* ---------------- exportar tarjeta como imagen ---------------- */

  function wrapSvgText(text, maxChars) {
    const words = text.split(' ');
    const lines = [];
    let current = '';
    words.forEach((word) => {
      const test = current ? `${current} ${word}` : word;
      if (test.length > maxChars) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    });
    if (current) lines.push(current);
    return lines;
  }

  function escapeXml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function buildCardSvgMarkup() {
    const bouquetSvgEl = el.bouquetContainer.querySelector('svg');
    if (!bouquetSvgEl) return null;
    const bouquetInner = bouquetSvgEl.innerHTML;

    const title = state.name ? `Para ti, ${state.name}` : 'Para ti';
    const dedication = el.dedicationText.textContent || '';
    const lines = wrapSvgText(dedication, 40);
    const lineHeight = 30;
    const textStartY = 760;
    const tspans = lines
      .map((line, i) => `<tspan x="400" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
      .join('');

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
        <defs>
          <linearGradient id="cardBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FFF8F0"/>
            <stop offset="100%" stop-color="#FFEFD9"/>
          </linearGradient>
        </defs>
        <rect width="800" height="1000" fill="url(#cardBg)"/>
        <rect x="24" y="24" width="752" height="952" rx="28" fill="none" stroke="#F4CE8E" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round"/>
        <text x="400" y="110" text-anchor="middle" font-family="Georgia, 'Playfair Display', serif" font-size="42" fill="#8A5A3B">${escapeXml(title)}</text>
        <text x="400" y="150" text-anchor="middle" font-family="Georgia, serif" font-size="20" fill="#B98A5A">Feliz Día de las Flores Amarillas 🌻</text>
        <g transform="translate(240,180) scale(1)">${bouquetInner}</g>
        <text x="400" y="${textStartY}" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="#6b4f3a" line-height="1.4">${tspans}</text>
        <text x="400" y="950" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#C79A5F">21 de septiembre · Día de las Flores Amarillas</text>
      </svg>
    `;
  }

  function buildCardBlob() {
    return new Promise((resolve, reject) => {
      const svgMarkup = buildCardSvgMarkup();
      if (!svgMarkup) return reject(new Error('No hay ramo para exportar'));

      const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        const canvas = el.exportCanvas;
        canvas.width = 800;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 800, 1000);
        URL.revokeObjectURL(url);
        canvas.toBlob((pngBlob) => {
          if (pngBlob) resolve(pngBlob);
          else reject(new Error('No se pudo generar la imagen'));
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('No se pudo cargar el SVG de la tarjeta'));
      };
      img.src = url;
    });
  }

  function exportCard() {
    buildCardBlob().then((pngBlob) => {
      const link = document.createElement('a');
      const safeName = (state.name || 'sorpresa').toLowerCase().replace(/[^a-z0-9ñáéíóúü]+/gi, '-');
      link.download = `tarjeta-flores-amarillas-${safeName}.png`;
      link.href = URL.createObjectURL(pngBlob);
      link.click();
    }).catch(() => { /* si falla la exportación, simplemente no se descarga nada */ });
  }

  /* ---------------- arranque ---------------- */

  document.addEventListener('DOMContentLoaded', () => {
    cacheEls();
    initWelcome();
    initCard();
    initCustomizer();
  });
}());
