# Requisitos técnicos

## Stack

- React 19, TypeScript y Vite 7.
- CSS propio e Inter local.
- React Globe GL y Three.js para el globo 3D.
- Anime.js diferido para el asistente.
- Express 5 en local y Vercel Functions en producción.
- Open-Meteo para geocoding, forecast y modelos Best Match/GFS.
- Gemini GenerateContent API como resumen opcional.
- Workbox mediante Vite PWA.
- Vitest, Supertest, Playwright, axe-core y ESLint.

## Requisitos no funcionales

- Entradas y respuestas externas validadas en runtime.
- Claves exclusivas del backend y fuera de Git.
- `GET` como único método de endpoints públicos actuales.
- Rate limit, headers de seguridad y caché controlada.
- Logs JSON sin ciudad, coordenadas, IP, prompts ni secretos.
- Globo y Anime.js cargados de forma diferida.
- Alternativa accesible al canvas mediante ciudad y coordenadas.
- Movimiento reducido por sistema y preferencia manual.
- PWA sin cachear respuestas meteorológicas como clima vigente.
- CI obligatoria para lint, tests, build, rendimiento, PWA y E2E.

## Despliegue

Vercel publica `dist` y ejecuta `api/**/*.ts`. El frontend usa el mismo origen
en producción y `http://127.0.0.1:3001` en desarrollo.
