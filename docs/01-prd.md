# PRD - AppWeb Clima

## Proposito

Crear una plataforma web del clima que permita consultar condiciones meteorologicas actuales, pronostico y comparacion de datos entre distintas fuentes para mejorar la confianza de la informacion presentada.

## Usuarios objetivo

- Personas que quieren consultar rapidamente el clima de su ubicacion.
- Usuarios que desean comparar el clima entre ciudades, paises o continentes.
- Reclutadores o evaluadores tecnicos que revisen el proyecto como parte de un portafolio de GitHub.

## Problema a resolver

Muchas apps del clima muestran datos de una sola fuente sin explicar su nivel de precision. Esta app busca presentar clima actual, pronostico y comparacion entre proveedores de datos para que el usuario tenga una vision mas confiable.

## Alcance MVP

- Detectar ubicacion del usuario con permiso del navegador.
- Buscar clima por ciudad.
- Mostrar temperatura actual, sensacion termica, humedad, viento, precipitacion y estado general.
- Mostrar pronostico por horas y por dias.
- Mostrar mapa interactivo con continentes y puntos climaticos destacados.
- Comparar informacion entre al menos dos fuentes climaticas.
- Mostrar diferencia entre fuentes, por ejemplo temperatura, viento o humedad.
- Guardar busquedas recientes en el navegador.

## Alcance posterior

- Cuentas de usuario.
- Ciudades favoritas sincronizadas.
- Alertas climaticas.
- Historial de consultas.
- Panel comparativo avanzado por continente.
- Integracion con GitHub Actions para pruebas y despliegue automatico.

## Historias de usuario

- Como usuario, quiero ver el clima de mi ubicacion para saber las condiciones actuales sin escribir mi ciudad.
- Como usuario, quiero buscar otra ciudad para comparar su clima con el mio.
- Como usuario, quiero ver un mapa mundial para explorar informacion climatica por region.
- Como usuario, quiero saber si dos fuentes climaticas coinciden para confiar mas en la informacion.
- Como visitante tecnico, quiero revisar una arquitectura clara para entender como se construyo la app.

## Metricas de exito

- La app carga la informacion principal en menos de 3 segundos en una conexion normal.
- La interfaz funciona correctamente en desktop y movil.
- El usuario puede consultar clima por ubicacion actual y por busqueda manual.
- El proyecto incluye README, documentacion tecnica, pruebas basicas y despliegue.

