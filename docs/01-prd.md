# PRD resumido

## Problema

Las aplicaciones meteorológicas suelen mostrar cifras sin explicar su fuente,
su degradación o la diferencia entre modelos. AppWeb Clima busca convertir esos
datos en una lectura visual inmediata y transparente.

## Propuesta

Dashboard de portafolio para consultar clima por ciudad, coordenadas, ubicación
o globo 3D; compara Open-Meteo Best Match con GFS y añade una recomendación
opcional sin convertir la IA en dependencia crítica.

## Usuarios

- Personas que necesitan una consulta rápida antes de salir.
- Visitantes que prefieren explorar ubicaciones visualmente.
- Evaluadores técnicos del portafolio de Mauricio Murcia.

## Alcance v2

- Clima actual, seis horas y cuatro días.
- Búsqueda, coordenadas, geolocalización y globo.
- Comparación de modelos con estado no disponible honesto.
- Asistente IA opcional y guía local.
- Favoritos, recientes, borrado local y PWA.
- Accesibilidad WCAG 2.2 AA como objetivo.
- Privacidad y aviso de uso responsable.

## Fuera de alcance

- Alertas oficiales, cuentas y sincronización.
- Base de datos y autenticación.
- Chat abierto con IA.
- Monetización o publicidad.
- Comparación simultánea entre dos ciudades.

## Éxito técnico

- El flujo principal funciona en desktop y móvil.
- Los fallos externos degradan sin mentir sobre la fuente.
- No hay secretos en el cliente o repositorio.
- CI valida calidad, accesibilidad, rendimiento y PWA.
