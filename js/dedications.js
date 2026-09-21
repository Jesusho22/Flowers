/* ============================================================
   dedications.js
   Banco de dedicatorias para el Día de las Flores Amarillas,
   con tono tierno, cálido y un poco coqueto (de amistad).
   ============================================================ */

(function (global) {
  'use strict';

  const TEMPLATES = [
    '{name}, hoy el amarillo se viste de amistad para recordarte lo mucho que iluminas mi vida. ¡Feliz Día de las Flores Amarillas! 🌻',
    'Dicen que las flores amarillas representan la alegría… y tú, {name}, eres la alegría que no necesita fecha para brillar. 💛',
    '{name}, si la amistad tuviera un color, sin duda sería amarillo, como este ramo que te mereces todos los días del año.',
    'Eres de esas personas que uno quisiera coleccionar, {name}. Hoy te regalo flores; siempre te regalaré mi cariño. 🌼',
    'No hacía falta una fecha para quererte, {name}, pero qué bonito tener una excusa perfecta para decírtelo con flores amarillas.',
    '{name}, tu amistad es como un girasol: siempre encuentra la manera de girar hacia la luz y contagiarla a los demás. ☀️',
    'Un ramo se marchita, {name}, pero lo que siento por ti como amiga no tiene fecha de caducidad. Feliz Día de las Flores Amarillas.',
    'Hoy quiero confesarte algo, {name}: me robaste una sonrisa desde el día que te conocí, y no pienso devolvértela. 😄🌼',
    '{name}, que este amarillo te recuerde que hay alguien que celebra cada una de tus victorias como si fueran propias.',
    'Las flores se marchitan, pero los recuerdos contigo, {name}, permanecen frescos como el primer día. Gracias por tanto.',
    '{name}, eres la clase de amistad que no se busca, se agradece. Feliz Día de las Flores Amarillas, mereces un jardín entero.',
    'Si pudiera regalarte cada flor amarilla del mundo, {name}, aún así se quedarían cortas para expresar lo especial que eres.',
    '{name}, contigo hasta los días grises se sienten amarillos. Gracias por ser mi lugar seguro y mi motivo de risa.',
    'Hoy el mundo se llena de flores amarillas, pero ninguna brilla tanto como tu amistad, {name}. 🌟',
    '{name}, que la calidez de estas flores te recuerde cuánto valoro cada mensaje, cada risa y cada momento compartido contigo.',
    'No todos los días se puede decir "te quiero" sin que suene raro… así que hoy lo digo con flores amarillas, {name}. 💛',
    '{name}, ojalá supieras cuánto alegras mi día con solo existir. Este ramo es pequeño comparado con lo grande que es mi cariño.',
    'Feliz Día de las Flores Amarillas, {name}. Que la vida te regale tantos motivos para sonreír como pétalos tiene este ramo.',
    '{name}, eres mi persona favorita para compartir tonterías, secretos y flores amarillas. No cambies nunca. 🌷',
    'Hay amistades que son como girasoles: encuentran la luz incluso en los días nublados. Gracias por ser esa luz, {name}.'
  ];

  let lastIndex = -1;

  function pickIndex() {
    if (TEMPLATES.length <= 1) return 0;
    let idx;
    do {
      idx = Math.floor(Math.random() * TEMPLATES.length);
    } while (idx === lastIndex);
    lastIndex = idx;
    return idx;
  }

  function fillName(text, rawName) {
    const name = (rawName || '').trim();
    return text.replace(/\{name\}/g, name || 'amiga');
  }

  function getRandomDedication(name) {
    const idx = pickIndex();
    return fillName(TEMPLATES[idx], name);
  }

  global.Dedications = { getRandomDedication, TEMPLATES };
}(window));
