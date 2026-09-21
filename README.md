# 🌼 Flores Amarillas — Una sorpresa interactiva

Aplicación web (HTML/CSS/JS puro, sin dependencias ni build) pensada para
celebrar el **Día de las Flores Amarillas** (21 de septiembre) con una
experiencia visual e interactiva dirigida a un público femenino.

## Experiencia

1. **Tarjeta vintage** — es lo primero que se ve al abrir la app: una tarjeta
   floreada con animación de espera. Un popup opcional pide el nombre de la
   persona para personalizar todo lo que sigue, sin tapar la tarjeta.
2. **Apertura** — al tocar la tarjeta se abre con un destello de chispas.
3. **Explosión de flores** — cientos de flores nacen desde la tarjeta y
   vuelan en arcos orgánicos (con un ligero rebote tipo "bloom" al aterrizar)
   hasta llenar toda la pantalla, con colores pastel que se van tiñendo de
   amarillo y flores cada vez más grandes y vistosas conforme avanza.
4. **Ramo amarillo + mensaje** — aparece un ramo de flores amarillas con una
   animación de entrada, un balanceo continuo y sutil, sonido ambiente
   generado con Web Audio API, y un mensaje aleatorio, cálido y cercano
   (no una dedicatoria formal) con el nombre de la persona si lo dio.
5. **Personalización** — se puede elegir el tipo de flor (girasol, margarita,
   rosa, tulipán, lirio o una mezcla sorpresa) y la paleta de colores, pedir
   otro mensaje, y descargar el ramo + mensaje como una tarjeta PNG para
   compartir (o usar el botón de compartir nativo si el navegador lo admite).

Todas las flores y el ramo se generan de forma **procedural en SVG** por
JavaScript (`js/flowers.js`), así que cada combinación de tipo/color produce
una ilustración distinta, sin necesidad de imágenes externas.

## Estructura

```
index.html        Marcado y flujo de pantallas
css/style.css      Diseño floreado vintage, paleta pastel + dorado
js/flowers.js       Generador procedural de flores y ramos en SVG
js/dedications.js   Banco de mensajes cálidos personalizables
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
