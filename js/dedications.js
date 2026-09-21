/* ============================================================
   dedications.js
   Banco de mensajes lindos para el Día de las Flores Amarillas:
   no son dedicatorias formales, son frases cálidas y con un
   toque de coqueteo sano, pensadas para leerse bien con o sin
   el nombre de la persona.

   Convención de autoría: {name} aparece siempre precedido por
   ", " (coma + espacio) y nunca al inicio de la frase, para que
   pueda quitarse limpiamente cuando no hay nombre.
   ============================================================ */

(function (global) {
  'use strict';

  const TEMPLATES = [
    'Hoy el amarillo se viste de alegría solo para recordarte lo mucho que iluminas todo a tu alrededor, {name}. 🌻',
    'Dicen que las flores amarillas representan la alegría… y esa alegría te queda perfecta, {name}. 💛',
    'Si la amistad tuviera un color, sin duda sería amarillo, como este ramo que mereces todos los días del año, {name}.',
    'Eres de esas personas que uno quisiera coleccionar, {name}. Hoy te regalo flores; siempre te regalaré cariño.',
    'No hacía falta una fecha para quererte tanto, {name}, pero qué bonito tener una excusa perfecta para decírtelo con flores amarillas.',
    'Tu forma de ser es como un girasol: siempre encuentra la manera de girar hacia la luz y contagiarla a los demás, {name}. ☀️',
    'Un ramo se marchita, pero lo que siento por ti no tiene fecha de caducidad, {name}. Feliz Día de las Flores Amarillas.',
    'Quiero confesarte algo: me robaste una sonrisa desde el primer momento, y no pienso devolvértela, {name}. 😄🌼',
    'Que este amarillo te recuerde que hay alguien que celebra cada una de tus victorias como si fueran propias, {name}.',
    'Las flores se marchitan, pero los recuerdos contigo permanecen frescos como el primer día, {name}. Gracias por tanto.',
    'Eres la clase de persona que no se busca, se agradece, {name}. Mereces un jardín entero.',
    'Si pudiera regalarte cada flor amarilla del mundo, aún así se quedarían cortas para lo especial que eres, {name}.',
    'Contigo hasta los días grises se sienten amarillos, {name}. Gracias por ser mi lugar seguro y mi motivo de risa.',
    'Hoy el mundo se llena de flores amarillas, pero ninguna brilla tanto como tú, {name}. 🌟',
    'Que la calidez de estas flores te recuerde cuánto valoro cada risa y cada momento compartido, {name}.',
    'No todos los días se puede decir algo bonito sin que suene raro… así que hoy lo digo con flores amarillas, {name}. 💛',
    'Ojalá supieras cuánto alegra el día tenerte cerca. Este ramo es pequeño comparado con lo grande que es el cariño que te tengo, {name}.',
    'Feliz Día de las Flores Amarillas. Que la vida te regale tantos motivos para sonreír como pétalos tiene este ramo, {name}.',
    'Eres de mis personas favoritas para compartir tonterías, secretos y flores amarillas. No cambies nunca, {name}. 🌷',
    'Hay personas que son como girasoles: encuentran la luz incluso en los días nublados. Gracias por ser esa luz, {name}.'
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
    if (name) return text.replace(/\{name\}/g, name);
    // sin nombre: se quita limpiamente la coma + el hueco del nombre
    return text.replace(/,\s*\{name\}/g, '').replace(/\{name\}/g, '');
  }

  function getRandomDedication(name) {
    const idx = pickIndex();
    return fillName(TEMPLATES[idx], name);
  }

  global.Dedications = { getRandomDedication, TEMPLATES };
}(window));
