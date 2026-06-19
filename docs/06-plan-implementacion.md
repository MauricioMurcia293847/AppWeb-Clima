# Plan de implementacion

## Fase 0 - Preparacion

- Definir documentos base del proyecto.
- Crear estructura inicial del repositorio.
- Configurar README.
- Crear tablero de tareas en GitHub.

## Fase 1 - Frontend MVP

- Crear app con Vite, React y TypeScript.
- Configurar estilos base.
- Construir layout principal.
- Implementar tarjeta de clima actual con datos mock.
- Implementar busqueda visual y estados de carga/error.

## Fase 2 - Backend MVP

- Crear API con Node.js y TypeScript. Completado con Express.
- Crear servicio para Open-Meteo. Completado.
- Crear servicio para proveedor secundario. Adaptado a comparacion de modelos Open-Meteo.
- Normalizar respuestas. Completado.
- Agregar validacion de parametros. Completado en `/api/weather/search`.
- Agregar cache en memoria. Completado con expiracion de 10 minutos.

## Fase 3 - Integracion clima real

- Conectar frontend con backend.
- Usar geolocalizacion del navegador.
- Implementar busqueda por ciudad.
- Mostrar clima actual real.
- Mostrar pronostico horario y diario.
- Agregar favoritos y busquedas recientes en `localStorage`. Completado.

## Fase 4 - Comparacion y precision

- Consultar dos fuentes climaticas.
- Calcular diferencias de temperatura, humedad y viento.
- Definir nivel de confianza: alto, medio o bajo.
- Mostrar comparacion de forma visual.

## Fase 5 - Mapa mundial

- Integrar Leaflet o MapLibre. Completado con Leaflet.
- Mostrar mapa con continentes. Reemplazado por mapa real con tiles de OpenStreetMap.
- Agregar marcadores de ubicaciones consultadas. Completado con coordenadas reales.
- Permitir seleccionar regiones o ciudades destacadas.

## Fase 6 - Calidad y despliegue

- Agregar tests unitarios. Completado con Vitest para almacenamiento local, fallback frontend y rutas backend.
- Agregar tests end-to-end basicos.
- Configurar GitHub Actions.
- Configurar despliegue en Vercel, Netlify o Render.
- Completar README con capturas, instrucciones y arquitectura.

## Primeros commits sugeridos

1. `docs: add initial product and technical planning`
2. `chore: scaffold frontend app`
3. `feat: add weather dashboard mockup`
4. `feat: add backend weather API`
5. `feat: connect real weather data`
6. `feat: add provider comparison`
7. `feat: add interactive weather map`
8. `ci: add tests and build workflow`
