/* ============================================================
   dedications.js
   Banco de mensajes lindos para el Día de las Flores Amarillas:
   no son dedicatorias formales, son frases cálidas y con un
   toque de coqueteo sano, pensadas para leerse bien con o sin
   el nombre de la persona.

   Convención de autoría: {name} aparece siempre precedido por
   ", " (coma + espacio) y nunca al inicio de la frase, para que
   pueda quitarse limpiamente cuando no hay nombre.

   Además, cuando hay nombre, se busca una palabra que rime con su
   terminación (p. ej. "Valentina" -> "divina", "cristalina") para
   que algunos mensajes tengan un toque de poema personalizado.
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

  // mensajes que llevan además una palabra que rima con el nombre, para un
  // toque de poema personalizado. Solo se usan cuando hay nombre y se
  // encontró una rima razonable.
  //
  // Importante: cada palabra de RHYME_GROUPS es un ADJETIVO real (nunca un
  // sustantivo como "estrella" o "candela"), para que concuerde en género
  // con la persona en cualquiera de los patrones de abajo ("tan {rhyme}",
  // "eres {rhyme}", "una forma {rhyme}"...) sin romper la gramática.
  const RHYME_TEMPLATES = [
    '{name}, tan {rhyme} como cada pétalo de este ramo. 🌼',
    'Si tuviera que resumirte en una sola palabra, sería {rhyme}, {name}.',
    '{name}, tienes una forma {rhyme} de iluminar todo a tu paso.',
    'Eres {rhyme} de una manera que no todos logran ser, {name}. 💛',
    '{name}, tu forma de ser es {rhyme} y no se olvida fácilmente.',
    'Que este amarillo te recuerde lo {rhyme} que eres, {name}.',
    '{name}, mereces sentirte tan {rhyme} como eres.',
    '{name}, eres tan {rhyme} que no hace falta decir más.',
    '{name}, si las flores pudieran hablar, dirían que eres {rhyme}.'
  ];

  // grupos ordenados del sufijo más largo (y por lo tanto más preciso) al
  // más corto; se usa el primero que calce con el final del nombre
  const RHYME_GROUPS = [
    { suffix: 'ella', words: ['bella'] },
    { suffix: 'ina', words: ['divina', 'cristalina', 'genuina'] },
    { suffix: 'ana', words: ['soberana', 'cercana'] },
    { suffix: 'osa', words: ['hermosa', 'preciosa', 'luminosa', 'maravillosa'] },
    { suffix: 'ita', words: ['bonita', 'exquisita', 'infinita'] },
    { suffix: 'era', words: ['sincera', 'verdadera', 'hechicera'] },
    { suffix: 'ada', words: ['delicada', 'dorada'] },
    { suffix: 'ia', words: ['sabia'] },
    { suffix: 'a', words: ['especial', 'radiante', 'increíble', 'admirable'] },
    { suffix: 'o', words: ['especial', 'radiante', 'increíble', 'admirable'] }
  ].sort((a, b) => b.suffix.length - a.suffix.length);

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function stripAccents(str) {
    return str.normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function findRhyme(rawName) {
    const n = stripAccents(rawName.trim().toLowerCase());
    if (!n) return null;
    const group = RHYME_GROUPS.find((g) => n.endsWith(g.suffix));
    return group ? randomFrom(group.words) : null;
  }

  let lastIndex = -1;
  let lastRhymeIndex = -1;

  function pickIndex(list, getLast, setLast) {
    if (list.length <= 1) return 0;
    let idx;
    do {
      idx = Math.floor(Math.random() * list.length);
    } while (idx === getLast());
    setLast(idx);
    return idx;
  }

  function fillName(text, rawName) {
    const name = (rawName || '').trim();
    if (name) return text.replace(/\{name\}/g, name);
    // sin nombre: se quita limpiamente la coma + el hueco del nombre
    return text.replace(/,\s*\{name\}/g, '').replace(/\{name\}/g, '');
  }

  function fillRhymeTemplate(text, name, rhyme) {
    return text.replace(/\{name\}/g, name).replace(/\{rhyme\}/g, rhyme);
  }

  function getRandomDedication(name) {
    const trimmed = (name || '').trim();
    const rhyme = trimmed ? findRhyme(trimmed) : null;

    if (rhyme && Math.random() < 0.5) {
      const idx = pickIndex(RHYME_TEMPLATES, () => lastRhymeIndex, (i) => { lastRhymeIndex = i; });
      return fillRhymeTemplate(RHYME_TEMPLATES[idx], trimmed, rhyme);
    }

    const idx = pickIndex(TEMPLATES, () => lastIndex, (i) => { lastIndex = i; });
    return fillName(TEMPLATES[idx], name);
  }

  global.Dedications = { getRandomDedication, TEMPLATES, RHYME_TEMPLATES, findRhyme };
}(window));
