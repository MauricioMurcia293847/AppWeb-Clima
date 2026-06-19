# AppWeb Clima

Plataforma web de clima en tiempo real enfocada en mostrar las condiciones de la ubicacion del usuario, comparar datos entre fuentes climaticas y visualizar informacion global mediante un mapa interactivo.

## Demo en vivo

[Abrir AppWeb Clima](https://app-web-clima-kappa.vercel.app/)

## Documentacion inicial

- [01 - PRD](docs/01-prd.md)
- [02 - Requisitos tecnicos](docs/02-requisitos-tecnicos.md)
- [03 - Flujo de la app](docs/03-flujo-app.md)
- [04 - Brief de diseno UI/UX](docs/04-brief-diseno.md)
- [05 - Backend, MER y BD](docs/05-backend-mer-bd.md)
- [06 - Plan de implementacion](docs/06-plan-implementacion.md)

## Objetivo del proyecto

Construir una aplicacion web moderna para el portafolio de desarrollo de software, con buenas practicas de documentacion, arquitectura, consumo de APIs, diseno responsivo, pruebas y despliegue.

## Funcionalidades actuales

- Busqueda de clima por ciudad.
- Clima por ubicacion actual del navegador.
- Backend propio con Express.
- Comparacion de modelos climaticos de Open-Meteo.
- Mapa interactivo con Leaflet y marcadores por coordenadas.
- Favoritos y busquedas recientes con `localStorage`.
- Respaldo visual con datos mock si la API local no esta disponible.

## Scripts principales

- `npm run dev`: inicia el frontend con Vite.
- `npm run dev:api`: inicia el backend local en `http://127.0.0.1:3001`.
- `npm run build`: valida TypeScript, compila frontend y revisa backend.
- `npm run test`: ejecuta pruebas automatizadas con Vitest.

## Integracion continua

El proyecto incluye GitHub Actions en `.github/workflows/ci.yml`. En cada `push` o `pull request` hacia `main` o `master`, el pipeline instala dependencias con `npm ci` y ejecuta:

- `npm run lint`
- `npm run test`
- `npm run build`

## Desarrollo local

Para trabajar con la aplicacion completa, ejecuta dos terminales:

```bash
npm run dev:api
```

```bash
npm run dev
```

El frontend consume la API local en `http://127.0.0.1:3001`. Si el backend no esta activo, la interfaz usa datos mock como respaldo visual.

## Despliegue en Vercel

El proyecto esta preparado para desplegarse en Vercel desde GitHub. En produccion, el frontend consume la API serverless del mismo dominio mediante `/api/weather/search` y `/api/weather/current`.

Configuracion recomendada en Vercel:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

## Endpoints locales

- `GET /api/health`
- `GET /api/weather/search?city=Monterrey`
- `GET /api/weather/current?lat=31.73&lon=-106.48`
