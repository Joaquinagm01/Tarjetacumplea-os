#!/usr/bin/env bash
# scripts/convert_gifs.sh
# Convierte GIFs en el directorio dado a MP4 y WebM optimizados, y genera posters (jpg/webp).
# Uso:
#   ./scripts/convert_gifs.sh path/to/gifs
# Ejemplo:
#   ./scripts/convert_gifs.sh assets/gifs

set -euo pipefail

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg no encontrado. Instálalo (brew install ffmpeg) y vuelve a intentarlo."
  exit 2
fi

SRC_DIR="${1:-.}"
OUT_DIR="${2:-$SRC_DIR/converted}"
mkdir -p "$OUT_DIR"

# Opciones de conversión: balance entre tamaño y calidad
MP4_CODEC_OPTS=( -c:v libx264 -preset slow -crf 23 -movflags +faststart -pix_fmt yuv420p )
WEBM_CODEC_OPTS=( -c:v libvpx-vp9 -b:v 0 -crf 33 -pix_fmt yuv420p )
POSTER_SCALE="640:-1" # ancho 640, altura proporcional
VARIANTS=(360 720 1080)

echo "Convirtiendo GIFs en $SRC_DIR -> $OUT_DIR"

shopt -s nullglob
for gif in "$SRC_DIR"/*.gif; do
  base=$(basename "$gif" .gif)
  mp4="$OUT_DIR/$base.mp4"
  webm="$OUT_DIR/$base.webm"
  poster_jpg="$OUT_DIR/$base-poster.jpg"
  poster_webp="$OUT_DIR/$base-poster.webp"

  echo "Procesando: $gif"

  # Generar poster (frame 1)
  ffmpeg -y -i "$gif" -vf "scale=$POSTER_SCALE,frames=1" -q:v 4 "$poster_jpg"
  cwebp -quiet "$poster_jpg" -o "$poster_webp" || echo "cwebp no disponible o fallo al generar webp poster"

  # MP4
  if [ ! -f "$mp4" ]; then
    ffmpeg -y -i "$gif" -movflags +faststart -pix_fmt yuv420p -vf "scale=iw:-2" ${MP4_CODEC_OPTS[*]} "$mp4"
  fi

  # WebM
  if [ ! -f "$webm" ]; then
    ffmpeg -y -i "$gif" ${WEBM_CODEC_OPTS[*]} -an "$webm"
  fi

  # Generate scaled variants for adaptive use
  for s in "${VARIANTS[@]}"; do
    mp4v="$OUT_DIR/${base}-$s.mp4"
    webmv="$OUT_DIR/${base}-$s.webm"
    if [ ! -f "$mp4v" ]; then
      ffmpeg -y -i "$gif" ${MP4_CODEC_OPTS[*]} -vf "scale=${s}:-2" -movflags +faststart "$mp4v"
    fi
    if [ ! -f "$webmv" ]; then
      ffmpeg -y -i "$gif" ${WEBM_CODEC_OPTS[*]} -vf "scale=${s}:-2" -an "$webmv"
    fi
  done

  echo "Generados: $mp4, $webm, posters"
done

echo "Conversión completada. Archivos en: $OUT_DIR"

# Sugerencia de uso: subir solo mp4/webm y posters a la carpeta pública del sitio (p.ej. /public/media)
exit 0
