# Plan de implementación

## Estado de v1.0.0

- [x] Dashboard oscuro responsive.
- [x] API propia compartida entre Express y Vercel.
- [x] Open-Meteo Best Match y GFS.
- [x] Globo 3D y modo compatible animado sin WebGL.
- [x] IA opcional con degradación local.
- [x] Favoritos, recientes y borrado selectivo.
- [x] Privacidad, créditos y uso responsable.
- [x] PWA, rendimiento, accesibilidad y E2E.
- [x] Observabilidad mínima y seguridad HTTP.
- [x] README, capturas reproducibles y licencia.
- [x] Release `v1.0.0`, bitácora de entrega y rollback.

## Gates

1. `npm run lint`
2. `npm run test`
3. `npm run build`
4. `npm run test:performance`
5. `npm run test:pwa`
6. `npm run test:e2e`
7. `npm audit --audit-level=high`
8. Revisión de secretos y archivos generados antes del commit.

## Despliegue

1. Configurar variables backend en Vercel.
2. Desplegar desde el branch conectado.
3. Verificar `/api/health` y `capabilities.aiSummary`.
4. Probar ciudad, coordenadas, degradación y resumen real.
5. Conservar rollback al despliegue anterior desde Vercel.

## Cierre

Todos los gates fueron aprobados en GitHub Actions y la versión estable está
publicada en Vercel. La evidencia y el procedimiento operativo viven en
`05-qa.md` y `06-entrega.md`.
