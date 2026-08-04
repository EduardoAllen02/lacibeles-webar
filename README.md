# La Cibeles WebAR

Experiencia WebAR móvil exportada desde 8th Wall Expanse Studio. Todo el motor
necesario se sirve desde este repositorio; no usa una API key ni requiere los
servicios cloud de 8th Wall en tiempo de ejecución.

## Desarrollo

Requiere Node.js 20.

```bash
npm ci
npm run serve
```

La cámara del móvil exige HTTPS. Para una prueba remota, usa el despliegue de
GitHub Pages; el servidor local solo sirve para comprobar carga y consola.

## Build

```bash
npm run build
```

El resultado estático queda en `dist/`. Las rutas son relativas para funcionar
en una URL de proyecto de GitHub Pages.

## Image target de prueba

El target activo es `IMG_7635`, contenido en `image-targets/`. Es un logo de
prueba “Futuristic Retro”, no la etiqueta definitiva de la botella. Para cambiar
el target hay que reemplazar sus datos compilados y actualizar tanto
`src/app.ts` como el componente `imageTarget` de `src/.expanse.json`.

## Modelo y animación

- Modelo: `src/assets/LaCibeles_walk_talk_FINAL.glb`
- Clip: `LaCibeles_skinning_0007:skeleton|Take 001|BaseLayer`
- Reproducción: loop activado

El tamaño y la posición actuales son un punto de partida y deberán calibrarse
en una prueba física con la etiqueta definitiva.
