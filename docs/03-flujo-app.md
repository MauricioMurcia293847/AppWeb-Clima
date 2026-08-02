# Flujo de la app

## Consulta principal

1. La aplicación abre con datos de ejemplo claramente identificados.
2. El usuario busca una ciudad, ingresa coordenadas, permite geolocalización o
   selecciona un punto en el globo.
3. La API propia valida la entrada y consulta Open-Meteo.
4. El dashboard actualiza clima, métricas, pronósticos, comparación y globo.
5. El resumen IA se solicita en paralelo y nunca bloquea el clima.
6. La ubicación puede guardarse como favorita y queda en recientes.

## Degradación

- Una ciudad puede usar respaldo local ante red o error `5xx`.
- Coordenadas arbitrarias no usan mock porque sería engañoso.
- `400` y `429` conservan el dato anterior y muestran un mensaje específico.
- Sin Gemini, el robot ofrece una recomendación local identificada.
- Sin WebGL, el globo se sustituye por una vista estática.

## Privacidad

La geolocalización requiere una acción explícita. Desde el diálogo de Privacidad
se pueden borrar favoritos, recientes y movimiento sin eliminar claves ajenas.

## Uso responsable

La información es orientativa. Para alertas o condiciones severas se remite a
autoridades meteorológicas y de protección civil.
