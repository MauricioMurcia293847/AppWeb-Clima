# Sistema de diseno UI/UX

> Especificacion resumida del producto. La fuente de verdad ampliada de Fase 3
> vive en `segundo-cerebro/proyectos/web/appweb-clima/03-diseno.md`.

## Objetivo de experiencia

AppWeb Clima convierte datos meteorologicos en una lectura visual inmediata. La
persona debe poder reconocer la ciudad, temperatura, condicion y riesgo de lluvia
en pocos segundos; despues puede explorar otra ubicacion desde el globo 3D o el
buscador accesible.

## Usuarios y tareas prioritarias

- Consultar rapidamente el clima actual de una ciudad.
- Usar la ubicacion del dispositivo con permiso explicito.
- Comparar el pronostico de las proximas horas y dias.
- Entender si los datos vienen de la API o del respaldo local.
- Guardar y recuperar ciudades frecuentes.

## Principios

1. El dato meteorologico tiene prioridad sobre la decoracion.
2. Los estados tecnicos deben ser honestos y usar lenguaje comprensible.
3. Toda interaccion visual debe tener una alternativa accesible.
4. La interfaz comienza en movil y aumenta densidad en pantallas mayores.
5. El movimiento complementa la orientacion, nunca es necesario para comprender.

## Direccion visual

Toda la aplicacion usa una atmosfera nocturna inmersiva con un globo 3D como
objeto central. La temperatura y la ubicacion se superponen con alto contraste.
El tablero mantiene la misma continuidad oscura mediante superficies de vidrio
profundo, bordes cian discretos y separacion espacial entre niveles de informacion.

La interfaz evita ilustraciones genericas, tarjetas anidadas y decoracion sin
funcion. El globo, los iconos climaticos y los propios datos construyen la identidad.

## Tokens principales

| Rol | Valor | Uso |
| --- | --- | --- |
| Noche | `#071521` | Escena 3D y cabecera |
| Tinta | `#F2F7F8` | Texto principal |
| Papel nocturno | `#07141C` | Fondo del tablero |
| Superficie | `rgba(12, 33, 44, 0.84)` | Paneles de vidrio oscuro |
| Cian | `#39C4D6` | Seleccion, iconos y foco |
| Cian fuerte | `#5AD3E1` | Texto de acento sobre fondo oscuro |
| Coral | `#FF735F` | Accion principal de busqueda |
| Verde | `#68E4A4` | Conexion y confianza alta |
| Ambar | `#F4C66B` | Respaldo o advertencia |
| Rojo | `#FF9385` | Error que requiere atencion |

Los radios de paneles y controles son de `8px`. Los chips de estado pueden usar
radio completo porque representan etiquetas compactas, no contenedores de contenido.

## Tipografia y jerarquia

- Familia: `Inter`, seguida de fuentes nativas del sistema.
- Temperatura: peso ligero y escala dominante.
- Ciudad: encabezado principal, sin competir con la temperatura.
- Titulos de seccion: compactos y consistentes.
- Texto operativo movil: minimo recomendado de `13px`; controles desde `16px`.
- No se reduce contraste para comunicar menor prioridad; se usan tamano y espacio.

## Arquitectura de pantalla

1. Cabecera: marca, procedencia del estado y acceso a geolocalizacion.
2. Hero: clima actual, globo 3D y buscador.
3. Indicadores: humedad, viento y precipitacion.
4. Pronostico horario: carrusel tactil y enfocable con teclado.
5. Pronostico semanal: lista escaneable de condiciones y rangos.
6. Comparacion: confianza honesta entre modelos o estado no disponible.
7. Guia inteligente: robot, resumen y recomendacion no bloqueante.
8. Persistencia: favoritos y ubicaciones recientes.
9. Footer: creditos, privacidad y preferencia de movimiento.

## Estados

- `Vista inicial`: datos de ejemplo antes de la primera consulta.
- `Datos en vivo`: respuesta correcta del backend.
- `Respaldo local`: informacion de muestra cuando la API no responde.
- `Error`: la accion no puede completarse y necesita intervencion.
- `Cargando`: controles deshabilitados, contenido atenuado y texto de progreso.

El color nunca es el unico indicador; cada estado incluye una etiqueta textual.

## Accesibilidad

- Objetivo WCAG 2.2 AA.
- Contraste minimo de `4.5:1` para texto normal.
- Foco visible en botones, enlaces, campos y regiones desplazables.
- Objetivos tactiles de al menos `44x44px` para acciones principales.
- El buscador ofrece una alternativa al globo para teclado y lector de pantalla.
- El pronostico horizontal puede recibir foco y desplazarse con teclado.
- `prefers-reduced-motion` desactiva entradas y animaciones no esenciales.
- Los estados asincronos se anuncian con regiones `aria-live`.

## Responsive

- `390px`: sugerencias desplazables y texto compacto.
- `700px`: hero vertical, globo de `350px`, busqueda compacta y metricas `2 + 1`.
- `900px`: transicion a composicion de dos columnas y pronostico apilado.
- `1280px`: hero aprovecha la altura disponible con ancho maximo de `1200px`.

## Handoff antes de QA

- P11: actualizar README y capturas con el diseno vigente.
- P12: agregar borrado confirmado de favoritos, recientes y preferencia de movimiento.
- P13: incorporar un aviso visible de uso meteorologico orientativo y consulta de autoridades para condiciones severas.

No se abre otro rediseno general para estos puntos; deben reutilizar tokens y
componentes existentes.

## Validacion

Antes de publicar se ejecutan lint, pruebas, build, auditoria automatizada WCAG y
capturas en movil, tablet y escritorio. El canvas 3D debe renderizar contenido
no vacio y la pagina no debe producir desplazamiento horizontal involuntario.
