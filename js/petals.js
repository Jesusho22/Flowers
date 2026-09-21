/* ============================================================
   petals.js
   Efecto oculto: agitar el celular (devicemotion) o mover el
   cursor de forma errática hace caer pétalos desde arriba, que
   se amontonan cerca del borde inferior por unos segundos y
   luego se desvanecen. Totalmente independiente del resto de la
   app (no depende de main.js ni viceversa).
   ============================================================ */

(function (global) {
  'use strict';

  const PETAL_COLORS = ['#FFD54F', '#FFB6D1', '#FFC896', '#C9A6E8', '#AEEAD0', '#F9A825', '#FF9EC4'];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let layer = null;
  let raining = false;
  let particles = [];

  function ensureLayer() {
    if (layer) return layer;
    layer = document.createElement('div');
    layer.className = 'petal-rain-layer';
    document.body.appendChild(layer);
    return layer;
  }

  function spawnPetal() {
    const w = window.innerWidth;
    const size = 14 + Math.random() * 15;
    const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
    const el = document.createElement('div');
    el.className = 'falling-petal';
    el.style.width = `${size}px`;
    el.style.height = `${size * 1.35}px`;
    el.innerHTML = `<svg viewBox="0 0 20 27" width="100%" height="100%"><path d="M10,0 C16,5 16,17 10,27 C4,17 4,5 10,0 Z" fill="${color}"/></svg>`;
    ensureLayer().appendChild(el);

    particles.push({
      el,
      x: Math.random() * w,
      y: -30,
      vx: (Math.random() - 0.5) * 1.4,
      vy: 1 + Math.random() * 1.6,
      rot: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 4,
      swayPhase: Math.random() * Math.PI * 2,
      groundY: window.innerHeight - (10 + Math.random() * 54),
      resting: false
    });
  }

  function step(now) {
    particles.forEach((p) => {
      if (p.resting) return;
      p.vy += 0.22;
      p.x += p.vx + Math.sin(now / 260 + p.swayPhase) * 0.7;
      p.y += p.vy;
      p.rot += p.vrot;
      if (p.y >= p.groundY) {
        p.y = p.groundY;
        p.resting = true;
      }
      p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`;
    });
    if (raining) requestAnimationFrame(step);
  }

  function clearAll() {
    particles.forEach((p) => {
      p.el.style.transition = 'opacity .9s ease';
      p.el.style.opacity = '0';
    });
    const toRemove = particles;
    particles = [];
    setTimeout(() => toRemove.forEach((p) => p.el.remove()), 950);
  }

  function trigger() {
    if (raining) return;
    raining = true;

    if (reducedMotion) {
      // respeta la preferencia de menos movimiento: un puñado de pétalos
      // aparecen ya asentados, sin animación de caída
      const count = 14;
      for (let i = 0; i < count; i++) {
        spawnPetal();
        const p = particles[particles.length - 1];
        p.y = p.groundY;
        p.resting = true;
        p.el.style.transition = 'opacity .5s ease';
        p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`;
        p.el.style.opacity = '0.95';
      }
      setTimeout(() => {
        clearAll();
        setTimeout(() => { raining = false; }, 1000);
      }, 2600);
      return;
    }

    const count = 46 + Math.floor(Math.random() * 24);
    let spawned = 0;
    const spawnTimer = setInterval(() => {
      spawnPetal();
      spawned++;
      if (spawned >= count) clearInterval(spawnTimer);
    }, 28);

    requestAnimationFrame(step);

    setTimeout(() => {
      clearAll();
      setTimeout(() => { raining = false; }, 1000);
    }, 4600);
  }

  /* ---- detección de "agitado": devicemotion en móvil, cursor errático en escritorio ---- */

  function initShakeDetection() {
    let lastAcc = null;
    let lastTime = 0;

    function onMotion(e) {
      const acc = e.accelerationIncludingGravity || e.acceleration;
      if (!acc || acc.x === null || acc.x === undefined) return;
      const now = Date.now();
      if (now - lastTime < 100) return;
      if (lastAcc) {
        const delta = Math.abs(acc.x - lastAcc.x) + Math.abs(acc.y - lastAcc.y) + Math.abs(acc.z - lastAcc.z);
        if (delta > 22) trigger();
      }
      lastAcc = acc;
      lastTime = now;
    }

    function enableMotion() {
      window.addEventListener('devicemotion', onMotion);
    }

    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      // iOS 13+: el permiso solo puede pedirse dentro de un gesto del usuario
      const requestOnce = () => {
        DeviceMotionEvent.requestPermission().then((state) => {
          if (state === 'granted') enableMotion();
        }).catch(() => {});
        document.removeEventListener('touchend', requestOnce);
        document.removeEventListener('click', requestOnce);
      };
      document.addEventListener('touchend', requestOnce, { once: true });
      document.addEventListener('click', requestOnce, { once: true });
    } else if (typeof DeviceMotionEvent !== 'undefined') {
      enableMotion();
    }

    // escritorio: varios cambios de dirección rápidos del cursor = "agitar"
    let history = [];
    window.addEventListener('mousemove', (e) => {
      const now = Date.now();
      history.push({ x: e.clientX, y: e.clientY, t: now });
      history = history.filter((h) => now - h.t < 700);
      if (history.length < 6) return;
      let reversals = 0;
      let dist = 0;
      for (let i = 2; i < history.length; i++) {
        const dx1 = history[i - 1].x - history[i - 2].x;
        const dx2 = history[i].x - history[i - 1].x;
        if (dx1 !== 0 && dx2 !== 0 && Math.sign(dx1) !== Math.sign(dx2)) reversals++;
        dist += Math.hypot(history[i].x - history[i - 1].x, history[i].y - history[i - 1].y);
      }
      if (reversals >= 4 && dist > 420) {
        trigger();
        history = [];
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initShakeDetection);

  global.PetalRain = { trigger };
}(window));
