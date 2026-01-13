# 🔄 Plan de Rollback - Producción

Este documento detalla los procedimientos para revertir deployments en caso de problemas críticos en producción.

---

## 📋 Tabla de Contenidos

- [Criterios para Rollback](#criterios-para-rollback)
- [Procedimientos de Rollback](#procedimientos-de-rollback)
- [Checklist de Rollback](#checklist-de-rollback)
- [Comunicación y Escalación](#comunicación-y-escalación)
- [Post-Rollback](#post-rollback)

---

## 🚨 Criterios para Rollback

### Ejecutar Rollback Inmediatamente Si

**Crítico** (Rollback dentro de 5 minutos):

- ❌ Sitio completamente caído (500 errors, no carga)
- ❌ Error rate > 50% (más de la mitad de requests fallan)
- ❌ Vulnerabilidad de seguridad crítica expuesta
- ❌ Pérdida de datos de usuarios
- ❌ Login completamente roto (nadie puede acceder)

**Alto** (Rollback dentro de 15 minutos):

- ⚠️ Error rate > 25% (1 de cada 4 requests falla)
- ⚠️ Funcionalidad core rota (Dashboard, Maps, Chat AI)
- ⚠️ Performance degradada > 300% (> 3x más lento)
- ⚠️ Memory leaks o crashes frecuentes del navegador
- ⚠️ Exportación de datos rota para todos los roles

**Medio** (Evaluar rollback dentro de 1 hora):

- 🔶 Error rate > 10%
- 🔶 Performance degradada > 100% (2x más lento)
- 🔶 Funcionalidad secundaria rota (Settings, algunos filtros)
- 🔶 Dark mode no funciona
- 🔶 Exportación falla ocasionalmente

**Bajo** (Evaluar fix forward):

- 🔷 Error rate < 10%
- 🔷 Bugs menores de UI/UX
- 🔷 Performance degradada < 50%
- 🔷 Funcionalidades opcionales rotas

---

## 🔄 Procedimientos de Rollback

### Método 1: Rollback desde Vercel Dashboard (Recomendado)

**Ventajas**: Rápido, seguro, reversible
**Tiempo estimado**: 2-5 minutos
**Requiere**: Acceso a Vercel Dashboard

#### Paso a Paso

1. **Acceder a Vercel Dashboard**

   ```
   URL: https://vercel.com/dashboard
   Login con cuenta autorizada
   ```

2. **Navegar al Proyecto**

   ```
   Dashboard > Proyectos > copilot-salud-react
   ```

3. **Abrir Deployments**

   ```
   Click en pestaña "Deployments"
   ```

4. **Identificar Deployment Estable Anterior**

   Buscar el último deployment estable antes del problemático:

   | Indicador    | Qué buscar                    |
   | ------------ | ----------------------------- |
   | **Status**   | Ready (verde)                 |
   | **Fecha**    | Deployment anterior al actual |
   | **Duración** | Build time < 2 min            |
   | **Checks**   | Todos los checks pasados      |

   **Ejemplo**:

   ```
   ✅ Ready   12 Jan 2026, 10:38   Build: 1m 34s   (Subsistema 21)
   ✅ Ready   12 Jan 2026, 08:22   Build: 1m 42s   (Subsistema 20)  ← Rollback a este
   ❌ Failed  13 Jan 2026, 14:15   Build: 45s      (Problemas)
   ```

5. **Promover Deployment Anterior a Producción**

   a. Click en los **tres puntos (...)** del deployment estable

   b. Seleccionar **"Promote to Production"**

   c. **Confirmar** el rollback en el modal

   d. **Esperar** confirmación (generalmente < 1 minuto)

6. **Verificar Rollback Exitoso**

   ```bash
   # Health check
   curl -I https://copilot-salud-react.vercel.app

   # Debe retornar 200 OK
   # Verificar que X-Vercel-Id cambió (nuevo deployment)
   ```

7. **Verificación Manual**
   - [ ] Abrir https://copilot-salud-react.vercel.app
   - [ ] Login funciona
   - [ ] Dashboard carga correctamente
   - [ ] No hay errores en consola del navegador

---

### Método 2: Rollback desde Vercel CLI

**Ventajas**: Scriptable, no requiere UI
**Tiempo estimado**: 3-7 minutos
**Requiere**: Vercel CLI instalada, token de acceso

#### Paso a Paso

1. **Listar Deployments**

   ```bash
   vercel ls
   ```

   Output esperado:

   ```
   copilot-salud-react
     Ready  copilot-salud-react-abc123.vercel.app  12 Jan 2026
     Ready  copilot-salud-react-def456.vercel.app  12 Jan 2026
     Ready  copilot-salud-react-ghi789.vercel.app  11 Jan 2026
   ```

2. **Identificar URL del Deployment Estable**

   Copiar la URL del deployment al que quieres volver (ej: `copilot-salud-react-def456.vercel.app`)

3. **Promover Deployment**

   ```bash
   vercel promote copilot-salud-react-def456.vercel.app
   ```

   Esperar confirmación:

   ```
   ✓ Promoted deployment copilot-salud-react-def456.vercel.app to production
   ```

4. **Verificar Rollback**
   ```bash
   curl -I https://copilot-salud-react.vercel.app
   ```

---

### Método 3: Rollback vía Git (Más Lento)

**Ventajas**: Control total, auditable
**Tiempo estimado**: 10-15 minutos
**Requiere**: Acceso a Git, trigger de CI/CD

⚠️ **Usar solo si los métodos 1 y 2 no están disponibles**

#### Opción A: Git Revert (Recomendado)

```bash
# 1. Identificar el commit problemático
git log --oneline -5

# Output:
# abc1234 deploy: Subsistema 22 - Cambios problemáticos
# def5678 deploy: Subsistema 21 - Deploy a producción completado
# ghi9012 build: Subsistema 20 - Configuración de producción completa

# 2. Revertir el commit problemático
git revert abc1234

# 3. Editar mensaje de commit
# "revert: Rollback Subsistema 22 debido a [razón]"

# 4. Push a main (triggerea auto-deploy)
git push origin main

# 5. Monitorear deploy en Vercel Dashboard
# Tiempo esperado: 2-3 minutos
```

#### Opción B: Git Reset (⚠️ Destructivo)

⚠️ **Usar solo en emergencias extremas** (requiere force push)

```bash
# 1. Identificar el commit estable
git log --oneline -5

# 2. Reset a commit estable
git reset --hard def5678

# 3. Force push (PELIGROSO)
git push -f origin main

# 4. Monitorear deploy
```

---

## ✅ Checklist de Rollback

### Pre-Rollback

- [ ] **Identificar el problema**: ¿Qué está fallando exactamente?
- [ ] **Verificar severidad**: ¿Cumple criterios de rollback?
- [ ] **Documentar error**: Captura de pantalla, error logs, hora exacta
- [ ] **Identificar deployment estable**: ¿A cuál versión volver?
- [ ] **Notificar al equipo**: Avisar que se ejecutará rollback
- [ ] **Anotar Deployment ID actual**: Para investigación posterior

### Durante Rollback

- [ ] **Ejecutar rollback**: Método elegido (Dashboard/CLI/Git)
- [ ] **Monitorear progreso**: Vercel Dashboard > Deployments
- [ ] **Verificar build exitoso**: Status debe ser "Ready"
- [ ] **Esperar propagación**: ~1-2 minutos para CDN

### Post-Rollback

- [ ] **Health check automático**: `curl -I https://...`
- [ ] **Verificación manual**: Login, dashboard, funcionalidad crítica
- [ ] **Monitorear error rate**: Debe bajar a < 1%
- [ ] **Verificar performance**: Debe volver a normal
- [ ] **Confirmar al equipo**: Rollback exitoso
- [ ] **Documentar incidente**: Ver sección Post-Rollback

---

## 📢 Comunicación y Escalación

### Template de Notificación de Rollback

**Slack/Email/Discord**:

```
🚨 ROLLBACK EN PROGRESO

Deployment: copilot-salud-react
Fecha/Hora: [DD/MM/YYYY HH:MM]
Razón: [Breve descripción del problema]
Severidad: [Crítico/Alto/Medio]
Rollback a: [Deployment ID o fecha]
ETA: [5 min / 15 min / 1 hora]

Ejecutado por: [Nombre]
```

**Después del rollback**:

```
✅ ROLLBACK COMPLETADO

Deployment: copilot-salud-react
Status: Producción estable
Versión actual: [Deployment ID]
Verificado: [✅ Health check, ✅ Login, ✅ Dashboard]

Próximos pasos:
- Investigación de causa raíz
- Fix programado para: [fecha]
```

### Escalación

| Tiempo sin solución | Acción                                       |
| ------------------- | -------------------------------------------- |
| 0-15 min            | Ejecutar rollback (team lead)                |
| 15-30 min           | Escalar a DevOps/SRE                         |
| 30-60 min           | Notificar a stakeholders                     |
| > 1 hora            | Status page público, comunicación a usuarios |

---

## 🔍 Post-Rollback

### Análisis de Causa Raíz (RCA)

Después de un rollback exitoso, documenta:

1. **¿Qué pasó?**
   - Descripción detallada del problema
   - Timestamp exacto del inicio
   - Cómo se detectó

2. **¿Por qué pasó?**
   - Causa raíz técnica
   - Qué cambio introdujo el problema
   - Por qué no se detectó en testing

3. **¿Cómo se solucionó?**
   - Método de rollback usado
   - Tiempo total de downtime
   - Deployment al que se revirtió

4. **¿Cómo prevenir?**
   - Mejoras en testing
   - Mejoras en CI/CD
   - Mejoras en monitoreo

### Template de Incident Report

```markdown
# Incident Report - [Fecha]

## Resumen

- **Fecha**: DD/MM/YYYY
- **Duración**: X minutos
- **Severidad**: Crítico/Alto/Medio
- **Impacto**: X% de usuarios afectados

## Timeline

- 00:00 - Deploy de Subsistema X
- 00:05 - Primeros errores detectados
- 00:10 - Decisión de rollback
- 00:15 - Rollback ejecutado
- 00:17 - Producción estable

## Causa Raíz

[Descripción técnica detallada]

## Resolución

[Pasos tomados]

## Acciones Preventivas

1. [ ] Mejorar test coverage en [área]
2. [ ] Agregar monitoring de [métrica]
3. [ ] Actualizar runbook de deployment
```

---

## 📊 Deployments de Referencia

### Deployments Estables Conocidos

Mantener una lista de deployments verificados como estables:

| Fecha      | Subsistema    | Deployment ID | Notas                                  |
| ---------- | ------------- | ------------- | -------------------------------------- |
| 12/01/2026 | Subsistema 21 | `139f697`     | ✅ Stable - Production deploy completo |
| 12/01/2026 | Subsistema 20 | `b1d39e5`     | ✅ Stable - CI/CD configurado          |
| 10/01/2026 | Subsistema 17 | `c070592`     | ✅ Stable - Testing completo           |

**Regla de oro**: Siempre tener al menos 2 deployments estables conocidos

---

## 🛡️ Prevención de Rollbacks

### Estrategias para Reducir Rollbacks

1. **Testing Exhaustivo**
   - [ ] Unit tests > 85% coverage
   - [ ] E2E tests para flujos críticos
   - [ ] Manual testing de funcionalidades nuevas

2. **Staging Environment** (Opcional - futuro)
   - Deployment a staging antes de production
   - Smoke testing en staging
   - Preview deployments de Vercel

3. **Feature Flags** (Opcional - futuro)
   - Habilitar features gradualmente
   - Rollback de features sin rollback de código

4. **Monitoring Proactivo**
   - Alertas de error rate > 5%
   - Alertas de performance degradation > 50%
   - Core Web Vitals monitoring

5. **Gradual Rollouts** (Opcional - futuro)
   - Canary deployments (10% → 50% → 100%)
   - Blue-green deployments
   - Monitoreo durante rollout

---

## 📞 Contactos de Emergencia

| Rol                | Contacto                            | Disponibilidad |
| ------------------ | ----------------------------------- | -------------- |
| **DevOps Lead**    | [antoniojesuspadilla.dev@proton.me] | 24/7           |
| **Backend Lead**   | [antoniojesuspadilla.dev@proton.me] | Business hours |
| **Frontend Lead**  | [antoniojesuspadilla.dev@proton.me] | Business hours |
| **Vercel Support** | support@vercel.com                  | 24/7 (Premium) |

---

## 🔗 Enlaces Útiles

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/AntonioJesusPadilla/copilot-salud-react
- **Production URL**: https://copilot-salud-react.vercel.app
- **Vercel Docs - Rollback**: https://vercel.com/docs/deployments/rollback
- **POST_DEPLOY_CHECKLIST.md**: Verificación post-rollback
- **MONITORING.md**: Métricas a monitorear

---

## 📝 Historial de Rollbacks

### Registro de Rollbacks Ejecutados

| Fecha | Desde | Hacia | Razón | Duración | Ejecutado por |
| ----- | ----- | ----- | ----- | -------- | ------------- |
| -     | -     | -     | -     | -        | -             |

_Mantener este registro actualizado para análisis de tendencias_

---

**Última actualización**: 13/01/2026
**Próxima revisión**: Después de cada rollback o cada 3 meses
