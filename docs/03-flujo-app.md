# Flujo de la app

## Flujo principal

1. El usuario abre la app.
2. La app solicita permiso de ubicacion.
3. Si el usuario acepta, se obtiene latitud y longitud.
4. El backend consulta fuentes climaticas externas.
5. La app muestra clima actual, pronostico y comparacion de precision.
6. El usuario puede explorar el mapa o buscar otra ciudad.

## Flujo sin permiso de ubicacion

1. El usuario abre la app.
2. La app solicita permiso de ubicacion.
3. El usuario rechaza o el navegador no permite acceder.
4. La app muestra busqueda manual por ciudad.
5. El usuario busca una ubicacion.
6. La app muestra el clima de la ubicacion seleccionada.

## Pantallas MVP

### Dashboard principal

- Clima actual.
- Indicadores principales.
- Comparacion entre fuentes.
- Pronostico por horas.
- Pronostico semanal.

### Busqueda

- Campo de ciudad.
- Resultados sugeridos.
- Busquedas recientes.

### Mapa mundial

- Mapa interactivo.
- Selector por continente.
- Marcadores climaticos.
- Resumen por region.

### Detalle de ubicacion

- Datos actuales.
- Graficas.
- Diferencias entre proveedores.
- Fecha y hora de actualizacion.

## Estados de interfaz

- Cargando ubicacion.
- Cargando clima.
- Permiso denegado.
- Ciudad no encontrada.
- Error de proveedor externo.
- Datos parcialmente disponibles.

