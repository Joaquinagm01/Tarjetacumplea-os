# TODO: Mejoras y cambios recomendados

Lista de mejoras prácticas y propuestas para la tarjeta de cumpleaños (priorizadas).

- [ ] Performance: convertir GIFs pesados a MP4/WebP/AVIF y usar posters estáticos.
  - Beneficio: reduce CPU y memoria en móviles, mejoras de carga.
  - Acción: crear versiones MP4 optimizadas y actualizar `loadExternal` para preferir MP4.

Nota: se ha reemplazado el GIF del placeholder de fecha por el recurso solicitado `https://media.giphy.com/media/LWSk9E1XyaPncDqlRr/giphy.gif` para mostrarse encima de la cuenta regresiva.

Instrucciones de conversión local:

- Ejecutar el script de conversión para generar MP4/WebM y posters:

```bash
./scripts/convert_gifs.sh path/to/gifs
```

- Subir los archivos generados (`*.mp4`, `*.webm`, `*-poster.jpg`, `*-poster.webp`) a la carpeta pública del sitio (p.ej. `public/media` o la raíz del build). El loader en `script.js` probará `*.mp4` y `*.webm` y usará posters si existen.

- [ ] Lazy-loading híbrido: IntersectionObserver para placeholders no visibles + carga inmediata para el viewport inicial.
  - Beneficio: reduce requests iniciales y mantiene experiencia responsiva.
  - Acción: reactivar IO en `loadCapyGifs()` con margen y carga directa para primeros N placeholders.

- [ ] Confetti y animaciones: mantener confetti OFF por defecto, añadir toggle global "Animaciones" y respetar `prefers-reduced-motion`.
  - Beneficio: evita picos CPU en dispositivos débiles.

- [ ] Reducir partículas y throttling: ajustar conteo y pausa en `visibilitychange` (ya implementado; validar valores más bajos para móviles).

- [ ] Media pipeline y assets:
  - Añadir `poster` y `preload` selectivo para MP4.
  - Generar versiones 360/720/1080 para adaptative streaming si hace falta.

- [ ] Accesibilidad (a11y):
  - Ejecutar pa11y y Lighthouse CI.
  - Revisar roles/aria: asegurar `aria-expanded` en nav toggle, `aria-pressed` en botones, y texto alternativo en todas las imágenes.
  - Confirmar contraste y foco visible (ya se añadió `show-focus`).

- [ ] Mapas: añadir texto alternativo y fallback accesible (ya existe iframe en `noscript`).

- [ ] CI/Deploy:
  - Documentar y explicar la protección de despliegues en Vercel; añadir instrucciones para usar token si se desea proteger.
  - Habilitar cache-control y CDNs para assets pesados.

- [ ] Tests y monitoreo:
  - Añadir `tests/smoke_test.py` (ya presente) y complementar con Lighthouse CI y pa11y en GH Actions.

- [ ] UX/Copy:
  - Revisar textos finales (hero, footer), añadir CTA real si necesitás confirmaciones por Google Forms o similar.

- [ ] Limpieza de código:
  - Consolidar duplicados en `script.js`, extraer utilidades y encapsular confetti/start-stop en un módulo.

Prioridad inmediata (1–2 días): convertir GIFs pesados a MP4, reactivar lazy-load híbrido, añadir toggle general de animaciones.

Si querés, empiezo por cualquiera de estas tareas ahora. Indica prioridad.
