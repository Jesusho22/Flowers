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

  const el = {};

  function cacheEls() {
    el.screenWelcome = document.getElementById('screen-welcome');
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
  }

  function showScreen(screen) {
    [el.screenWelcome, el.screenCard, el.screenBouquet].forEach((s) => {
      s.classList.toggle('active', s === screen);
    });
  }

  /* ---------------- pantalla de bienvenida ---------------- */

  function initWelcome() {
    el.btnStart.addEventListener('click', () => {
      state.name = el.nameInput.value.trim();
      showScreen(el.screenCard);
    });
    el.nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') el.btnStart.click();
    });
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

    setTimeout(() => {
      startExplosion(origin);
    }, 650);
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

  function pickExplosionColors(progress) {
    const yellowWeight = 0.15 + progress * 0.55;
    if (Math.random() < yellowWeight) {
      const c = randomFrom(EXPLOSION_COLORS.amarillo);
      return { petal: c, center: '#8C5A1B' };
    }
    const family = randomFrom(PASTEL_FAMILIES);
    const c = randomFrom(EXPLOSION_COLORS[family]);
    return { petal: c, center: '#F9A825' };
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

  function spawnExplosionFlower(origin, target, progress) {
    const size = 34 + Math.random() * Math.random() * 42;
    const { petal, center } = pickExplosionColors(progress);
    const svg = window.Flowers.simpleBlossomSVG(petal, center);
    const wrap = document.createElement('div');
    wrap.className = 'explosion-flower';
    wrap.style.width = `${size}px`;
    wrap.style.height = `${size}px`;
    wrap.innerHTML = `<svg viewBox="0 0 100 100" width="100%" height="100%">${svg}</svg>`;

    const rot = Math.random() * 360;
    const startX = origin.x - size / 2;
    const startY = origin.y - size / 2;
    const dx = target.x - origin.x;
    const dy = target.y - origin.y;

    wrap.style.transform = `translate(${startX}px, ${startY}px) scale(0.25) rotate(0deg)`;
    wrap.style.opacity = '0';
    el.explosionLayer.appendChild(wrap);

    if (reducedMotion) {
      wrap.style.transition = 'opacity .6s ease';
      requestAnimationFrame(() => {
        wrap.style.transform = `translate(${startX + dx}px, ${startY + dy}px) scale(1) rotate(${rot}deg)`;
        wrap.style.opacity = '0.95';
      });
      return;
    }

    const duration = 900 + Math.random() * 500;
    const delay = Math.random() * 120;
    wrap.style.transition = `transform ${duration}ms cubic-bezier(.2,.65,.3,1) ${delay}ms, opacity 500ms ease ${delay}ms`;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        wrap.style.transform = `translate(${startX + dx}px, ${startY + dy}px) scale(1) rotate(${rot}deg)`;
        wrap.style.opacity = '0.95';
      });
    });
  }

  function startExplosion(origin) {
    el.explosionLayer.classList.add('active');
    el.explosionLayer.innerHTML = '';

    const area = window.innerWidth * window.innerHeight;
    const count = clamp(Math.round(area / 9000), 80, 220);
    const targets = buildTargetPositions(count);

    const totalDurationMs = reducedMotion ? 1200 : 5200;
    const intervalMs = 40;
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
        setTimeout(revealBouquet, reducedMotion ? 500 : 1300);
      }
    }, intervalMs);
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
    el.bouquetContainer.classList.remove('pop-in');
    el.bouquetContainer.innerHTML = window.Flowers.buildBouquetSVG({ type: state.type, palette: state.palette });
    // fuerza reflow para reiniciar animación
    void el.bouquetContainer.offsetWidth;
    el.bouquetContainer.classList.add('pop-in');
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
      regenerateBouquet();
    });
    buildChips(el.colorChoices, window.Flowers.COLOR_PALETTES, state.palette, (key) => {
      state.palette = key;
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

  function exportCard() {
    const bouquetSvgEl = el.bouquetContainer.querySelector('svg');
    if (!bouquetSvgEl) return;
    const bouquetInner = bouquetSvgEl.innerHTML;

    const title = state.name ? `Para ti, ${state.name}` : 'Para ti';
    const dedication = el.dedicationText.textContent || '';
    const lines = wrapSvgText(dedication, 40);
    const lineHeight = 30;
    const textStartY = 760;
    const tspans = lines
      .map((line, i) => `<tspan x="400" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
      .join('');

    const svgMarkup = `
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

    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = el.exportCanvas;
      canvas.width = 800;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 800, 1000);
      URL.revokeObjectURL(url);
      canvas.toBlob((pngBlob) => {
        const link = document.createElement('a');
        const safeName = (state.name || 'amiga').toLowerCase().replace(/[^a-z0-9ñáéíóúü]+/gi, '-');
        link.download = `tarjeta-flores-amarillas-${safeName}.png`;
        link.href = URL.createObjectURL(pngBlob);
        link.click();
      });
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }

  /* ---------------- arranque ---------------- */

  document.addEventListener('DOMContentLoaded', () => {
    cacheEls();
    initWelcome();
    initCard();
    initCustomizer();
  });
}());
