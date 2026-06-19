# Requisitos tecnicos

## Stack recomendado

### Frontend

- React con Vite.
- TypeScript.
- Tailwind CSS o CSS Modules.
- TanStack Query para cache y estados de peticiones.
- Leaflet o MapLibre GL para el mapa interactivo.
- Recharts para graficas de temperatura, humedad y viento.

### Backend

- Node.js con Express o Fastify.
- TypeScript.
- Capa de servicios para consultar APIs climaticas.
- Endpoints REST propios para normalizar respuestas.
- Cache temporal para reducir llamadas a APIs externas.

### Base de datos

- PostgreSQL para una version completa.
- SQLite como alternativa ligera para desarrollo local.
- Prisma ORM para modelado y migraciones.

## APIs climaticas candidatas

- Open-Meteo como fuente principal por su API de pronostico, clima actual, geocodificacion y calidad de cobertura global.
- OpenWeather como fuente secundaria para comparacion de clima actual.
- Una tercera fuente opcional para validacion posterior, como WeatherAPI o Visual Crossing, segun limites gratuitos y disponibilidad.

Fuentes revisadas:

- Open-Meteo Forecast API: https://open-meteo.com/en/docs
- OpenWeather Current Weather API: https://openweathermap.org/api/current
- GitHub REST API: https://docs.github.com/en/rest

## Integracion con GitHub

La integracion inicial recomendada no necesita una app OAuth compleja. Para el MVP basta con:

- Repositorio publico bien documentado.
- GitHub Actions para ejecutar lint, tests y build.
- README con badges de build y deploy.
- Issues o Projects para organizar tareas.

Una integracion avanzada podria incluir:

- Autenticacion con GitHub OAuth.
- Mostrar commits recientes del proyecto dentro de la app.
- Crear issues desde un formulario interno de feedback.

## Endpoints propios propuestos

- `GET /api/health`
- `GET /api/weather/search?city=`
- `GET /api/weather/current?lat=&lon=`
- `GET /api/weather/forecast?lat=&lon=`
- `GET /api/weather/compare?lat=&lon=`
- `GET /api/locations/recent`
- `POST /api/locations/favorite`

## Requisitos no funcionales

- Manejo claro de estados de carga, error y sin resultados.
- Variables de entorno para API keys.
- Validacion de parametros de entrada.
- Respuestas normalizadas para que el frontend no dependa directamente de cada proveedor externo.
- Cache con expiracion, por ejemplo 10 a 15 minutos para clima actual.
- Pruebas unitarias en servicios de normalizacion.
- Pruebas end-to-end para busqueda, ubicacion y vista principal.
