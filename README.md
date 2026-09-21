# 🌼 Flores Amarillas — Una sorpresa interactiva

Aplicación web (HTML/CSS/JS puro, sin dependencias ni build) pensada para
celebrar el **Día de las Flores Amarillas** (21 de septiembre) con una
experiencia visual e interactiva dirigida a un público femenino.

## Experiencia

1. **Bienvenida** — se pide el nombre de la persona para personalizar todo lo
   que sigue.
2. **Tarjeta vintage** — una tarjeta floreada con animación de espera; al
   tocarla se abre con un destello.
3. **Explosión de flores** — cientos de flores nacen desde la tarjeta a
   velocidad constante hasta llenar toda la pantalla, con colores pastel que
   se van tiñendo de amarillo.
4. **Ramo amarillo + dedicatoria** — aparece un ramo de flores amarillas con
   una animación de entrada, sonido ambiente generado con Web Audio API, y
   una dedicatoria aleatoria y cariñosa con el nombre de la persona.
5. **Personalización** — se puede elegir el tipo de flor (girasol, margarita,
   rosa, tulipán, lirio o una mezcla sorpresa) y la paleta de colores, pedir
   otra dedicatoria, y descargar el ramo + dedicatoria como una tarjeta PNG
   para compartir.

Todas las flores y el ramo se generan de forma **procedural en SVG** por
JavaScript (`js/flowers.js`), así que cada combinación de tipo/color produce
una ilustración distinta, sin necesidad de imágenes externas.

## Estructura

```
index.html        Marcado y flujo de pantallas
css/style.css      Diseño floreado vintage, paleta pastel + dorado
js/flowers.js       Generador procedural de flores y ramos en SVG
js/dedications.js   Banco de dedicatorias personalizables
js/audio.js         Sonido ambiente sintetizado (Web Audio API)
js/main.js           Orquestación: pantallas, explosión, personalización, export
```

## Cómo ejecutarlo

No requiere instalación. Basta con servir la carpeta como sitio estático,
por ejemplo:

```bash
python3 -m http.server 8000
```

y abrir `http://localhost:8000` en el navegador.
