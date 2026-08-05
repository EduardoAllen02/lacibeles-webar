# La Cibeles Rubia WebAR

Experiencia WebAR móvil para la etiqueta de La Cibeles Rubia. Todo el motor se
sirve desde este repositorio y el despliegue está preparado para GitHub Pages.

## Desarrollo

Requiere Node.js 20.

```bash
npm ci
npm run serve
```

La cámara del móvil exige HTTPS. El servidor local sirve para revisar la carga,
la interfaz y la consola; la prueba de tracking debe hacerse desde GitHub Pages.

## Build

```bash
npm run build
```

El resultado estático queda en `dist/`. Todas las rutas son relativas para
funcionar bajo la URL de proyecto de GitHub Pages.

## Target final

- Nombre: `rubia-label`
- Imagen: `image-targets/rubia-front-target.jpg`
- Fuente: arte final `RUBIA_NUEVA.pdf` del cliente
- Zona reconocida: frente visible de la etiqueta, centrado en el rombo

El recorte excluye los paneles laterales porque la curvatura de la botella los
deforma y reduce la estabilidad del reconocimiento.

## Modelo, animación y narración

- Modelo: `src/assets/LaCibeles_walk_talk_WEBAR_v6.glb`
- Clip: `LaCibeles_skinning_0007:skeleton|Take 001|BaseLayer`
- Narración: `src/assets/LaCibeles_narracion.m4a`
- Reproducción: una vez por detección inicial, con pausa si se pierde el target

El GLB conserva la geometría, materiales, pesos y las nueve animaciones del
modelo corregido. La geometría usa compresión Draco para reducir la descarga de
5.55 MB a 2.31 MB sin una diferencia visual apreciable.
