# Tarjeta de Cumpleaños Interactiva

Proyecto pequeño que muestra una tarjeta de cumpleaños con animaciones: efecto de abrir, confeti, globos animados y música.

Archivos principales:
- `index.html` - estructura de la tarjeta
- `styles.css` - estilos y animaciones
- `script.js` - interacciones: abrir, confeti, globos y audio

Cómo probar localmente

1. Abrir `index.html` en un navegador moderno. Para evitar problemas con audio y rutas, se recomienda servir con un servidor estático.

Ejemplo con Python (macOS):

```bash
python3 -m http.server 8000
# luego abrir http://localhost:8000
```

Despliegue en Vercel

1. Instalar la CLI de Vercel si no la tienes: `npm i -g vercel`.
2. Iniciar sesión: `vercel login`.
3. Desde la carpeta del proyecto ejecutar: `vercel --prod`.

Despliegue detallado (opciones)

- Usando la interfaz web de Vercel:
	1. Ir a https://vercel.com y crear una cuenta o iniciar sesión.
	2. En el dashboard pulsar "New Project" → "Import Git Repository" y conectar tu repositorio (GitHub/GitLab/Bitbucket).
	3. Seleccionar el repositorio `Tarjetacumplea-os` y seguir el flujo. Vercel detectará automáticamente que es un sitio estático.
	4. Revisar los ajustes y desplegar.

- Usando la CLI de Vercel:
	1. Instalar: `npm i -g vercel`.
	2. Iniciar sesión: `vercel login`.
	3. Desde la raíz del proyecto ejecutar: `vercel --prod`.

Archivo de configuración incluido

- `vercel.json` ya está presente y configura el proyecto como sitio estático, sirviendo `index.html`.

Notas sobre rutas y recursos

- Si usas rutas dinámicas o quieres añadir una API, podremos añadir un `api/` con funciones serverless y actualizar `vercel.json`.
- Si tu repo tiene assets grandes (videos), considera alojarlos externamente o en un subdominio para reducir tamaño del repo.

Notas
- Si quieres añadir una canción, reemplaza `happy_birthday.mp3` por un archivo MP3 en la raíz.
- Este proyecto es intencionadamente pequeño y fácil de adaptar: modifica mensajes, colores y animaciones.

Personalizar la invitación

- El contenido principal está en `index.html`: el nombre "Faustina", la fecha `27/12`, horario `13:00 - 16:00` y la dirección `Rosario` están insertados en el bloque de la invitación.
- Para cambiar cualquiera de esos datos edita el HTML directamente o dime los nuevos datos y lo actualizo por ti.

Diseño single-page

- La página ahora usa un layout de una sola vista con dos columnas: la izquierda contiene los detalles de la invitación y controles; la derecha contiene la media (capibara/video/animación).
- Para personalizar textos (nombre, fecha, dirección) edita `index.html` en las secciones correspondientes.

Acciones útiles
- "Copiar detalles": copia al portapapeles la información esencial.
- "Imprimir": prepara la tarjeta para imprimir (la página hide los botones en modo impresión).

Usar imágenes/animaciones externas (Lottie / GIF / PNG)

- Puedes pegar una URL de Lottie JSON (p. ej. desde LottieFiles), o un GIF/PNG/JPG en el campo "Usar capibara externa" y pulsar "Cargar".
- Ejemplos:
	- LottieFiles: abre una animación en LottieFiles, copia la URL del JSON (termina en `.json`) y pégala.
	- GIPHY/Tenor: copia la URL directa al GIF y pégala.
	- capy.lol: si tienes una URL de imagen directa, pégala.


