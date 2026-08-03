# Fase 6 - Entrega

## Objetivo

Cerrar AppWeb Clima como una entrega reproducible: codigo versionado, documentacion
vigente, despliegue verificable, operacion basica y una ruta de recuperacion.

Fecha de cierre: 2 de agosto de 2026.

Version de entrega: `v1.0.0`.

## Artefactos entregados

- Repositorio: <https://github.com/MauricioMurcia293847/AppWeb-Clima>
- Produccion: <https://app-web-clima-kappa.vercel.app/>
- Integracion continua: `.github/workflows/ci.yml`
- Documentacion principal: `README.md`
- Plan de QA y evidencia: `docs/05-qa.md`
- Licencia: `LICENSE` (MIT)
- Historial de cambios: `CHANGELOG.md`
- Configuracion reproducible: `.env.example`, `package-lock.json` y `vercel.json`

## Definition of Done

- [x] El README contiene descripcion, capturas, flujo, stack y estructura.
- [x] El README documenta setup, variables, persistencia, roadmap y comandos.
- [x] Las capturas se regeneran mediante `npm run docs:screenshots`.
- [x] Existe una licencia MIT con autoria.
- [x] `.env` y el vinculo local de Vercel estan excluidos de Git.
- [x] El frontend y la API compilan desde una instalacion reproducible.
- [x] CI valida lint, pruebas, build, rendimiento, PWA y navegadores.
- [x] Vercel despliega automaticamente desde el branch `master`.
- [x] Existen health check, logs estructurados y degradacion controlada.
- [x] La aplicacion conserva funcionalidad sin Gemini y sin WebGL.

## Evidencia de validacion

| Comprobacion | Resultado |
| --- | --- |
| Instalacion limpia | `npm ci` completado |
| Dependencias | `npm audit`: 0 vulnerabilidades |
| ESLint | Aprobado |
| Vitest | 60 de 60 pruebas aprobadas |
| Playwright | 30 de 30 recorridos aprobados |
| Build cliente y servidor | Aprobado sin advertencias de bundle |
| PWA | Manifiesto, service worker e iconos aprobados |
| README | 11 apartados y 4 capturas verificados |
| Secretos | `.env` y `.vercel` ignorados; ningun secreto detectado |
| Produccion | Health `200`, CSP activa, service worker, busqueda y globo verificados |

## Revision pre-release

Conclusion: `NO_BLOCKER_FOUND`.

No existia un tag anterior util, por lo que la revision tomo los ultimos cinco
commits y los cambios de esta entrega. No se encontraron hallazgos P0-P2 en
configuracion, secretos, persistencia, contratos, dependencias ni despliegue.

Nota de mantenimiento: `vite-plugin-pwa` incluye transitivamente `glob@11.1.0`,
que imprime un aviso de deprecacion durante `npm ci`; `npm audit` no reporta una
vulnerabilidad activa. Debe actualizarse cuando Workbox publique una cadena
compatible, sin forzar manualmente una version interna.

Durante el cierre, Gemini confirmo que la clave y `gemini-3.5-flash` son validos,
pero alcanzo temporalmente la cuota gratuita (`429 RESOURCE_EXHAUSTED`). La API
respondio con el contrato degradado esperado y la interfaz identifico el consejo
local. Como la IA es opcional, esta condicion no bloquea clima, busqueda ni
pronosticos; vuelve a intentar automaticamente en consultas posteriores.

## Operacion

### Verificacion rapida

1. Abrir la URL de produccion.
2. Consultar `/api/health` y confirmar `ok: true`.
3. Buscar una ciudad y comprobar que cambia el encabezado meteorologico.
4. Confirmar el movimiento del globo o la etiqueta `Modo compatible animado`.
5. Revisar el asistente: Gemini cuando esta disponible o consejo local identificado.
6. Consultar GitHub Actions y confirmar el ultimo workflow en verde.

### Variables de produccion

| Variable | Uso | Secreta |
| --- | --- | --- |
| `GEMINI_API_KEY` | Activa recomendaciones generadas por Gemini | Si |
| `GEMINI_MODEL` | Permite seleccionar el modelo habilitado | No |

No existe una base de datos ni migraciones. Favoritos, recientes y preferencia de
movimiento permanecen exclusivamente en el navegador del usuario.

## Observabilidad

- `/api/health` publica salud y capacidades sin revelar secretos.
- El backend emite logs JSON con ruta normalizada, estado, duracion y `requestId`.
- Las respuestas externas tienen timeout, validacion y degradacion controlada.
- GitHub Actions conserva el reporte de Playwright cuando una ejecucion falla.
- Vercel conserva el historial de deployments para inspeccion y recuperacion.

## Rollback

### Condiciones

- El health check deja de responder correctamente.
- La busqueda principal falla de forma generalizada.
- Aparece una regresion critica de privacidad, seguridad o accesibilidad.
- El nuevo deployment genera errores que no estaban en la version anterior.

### Procedimiento

1. Abrir **Vercel > Project > Deployments**.
2. Seleccionar el ultimo deployment estable.
3. Usar **Promote to Production** para recuperar esa version sin reescribir Git.
4. Verificar `/api/health`, una busqueda y el asistente.
5. Crear un issue con causa, impacto y evidencia antes de preparar la correccion.

Como alternativa versionada, crear un commit con `git revert <commit>` y enviarlo
a `master`; nunca usar `git reset --hard` ni `push --force` para un rollback normal.

## Limitaciones conocidas

- Three.js requiere WebGL; sin el se usa un modo mundial 2D animado.
- Gemini es opcional y depende de cuota, modelo y disponibilidad del proveedor.
- El rate limit y las caches viven por instancia serverless, no son distribuidos.
- Los datos meteorologicos son orientativos y no sustituyen alertas oficiales.

## Cierre

La version se considera entregable cuando los checks locales, GitHub Actions,
Vercel y el recorrido critico de produccion aportan evidencia satisfactoria. Los
cambios futuros deben abrir una nueva iteracion de producto, desarrollo y QA en
lugar de modificar silenciosamente este cierre.
