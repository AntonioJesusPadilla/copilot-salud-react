# 📊 Guía de Monitoreo y Observabilidad

Esta guía detalla cómo monitorear y mantener **Copilot Salud Andalucía** en producción.

---

## 📋 Tabla de Contenidos

- [Métricas Clave](#métricas-clave)
- [Vercel Analytics](#vercel-analytics)
- [Vercel Speed Insights](#vercel-speed-insights)
- [Logs y Debugging](#logs-y-debugging)
- [Alertas y Notificaciones](#alertas-y-notificaciones)
- [Performance Monitoring](#performance-monitoring)
- [Error Tracking](#error-tracking)
- [Dashboards Recomendados](#dashboards-recomendados)

---

## 🎯 Métricas Clave

### Core Web Vitals

Monitorea estas métricas críticas para experiencia de usuario:

| Métrica                            | Objetivo | Descripción                               |
| ---------------------------------- | -------- | ----------------------------------------- |
| **LCP** (Largest Contentful Paint) | < 2.5s   | Tiempo de carga del contenido principal   |
| **FID** (First Input Delay)        | < 100ms  | Tiempo de respuesta a primera interacción |
| **CLS** (Cumulative Layout Shift)  | < 0.1    | Estabilidad visual de la página           |
| **FCP** (First Contentful Paint)   | < 1.8s   | Tiempo hasta primer contenido visible     |
| **TTFB** (Time to First Byte)      | < 600ms  | Tiempo de respuesta del servidor          |

### Métricas de Aplicación

| Métrica                      | Objetivo          | Dónde Monitorear        |
| ---------------------------- | ----------------- | ----------------------- |
| **Page Views**               | Tracking continuo | Vercel Analytics        |
| **Unique Visitors**          | Tracking continuo | Vercel Analytics        |
| **Bounce Rate**              | < 40%             | Vercel Analytics        |
| **Session Duration**         | > 2 min           | Vercel Analytics        |
| **API Response Time** (Groq) | < 2s              | Application logs        |
| **Build Time**               | < 2 min           | Vercel Deployments      |
| **Build Success Rate**       | > 98%             | GitHub Actions / Vercel |

---

## 📈 Vercel Analytics

Vercel proporciona analytics integrado sin configuración adicional.

### Acceder a Analytics

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Click en la pestaña **Analytics**

### Métricas Disponibles

#### 1. Visitantes

- **Total Page Views**: Número total de vistas
- **Unique Visitors**: Visitantes únicos
- **Top Pages**: Páginas más visitadas
- **Top Referrers**: De dónde vienen los usuarios

#### 2. Rendimiento

- **Core Web Vitals**: LCP, FID, CLS
- **Performance Score**: Score general (0-100)
- **Real User Monitoring**: Datos de usuarios reales

#### 3. Dispositivos

- **Desktop vs Mobile**: Distribución de dispositivos
- **Browser Distribution**: Navegadores más usados
- **Geographic Distribution**: Ubicación de usuarios

### Exportar Datos

```bash
# Usar Vercel CLI para exportar analytics
vercel analytics export --project=copilot-salud-react
```

---

## ⚡ Vercel Speed Insights

Speed Insights proporciona métricas detalladas de performance.

### Habilitar Speed Insights

**Opción 1: Desde Dashboard (Recomendado)**

1. Ve a Vercel Dashboard > Tu Proyecto
2. Settings > Speed Insights
3. Click en "Enable Speed Insights"

**Opción 2: Con Package (Más detallado)**

```bash
# Instalar el package
npm install @vercel/speed-insights

# Agregar al código (src/main.tsx)
import { SpeedInsights } from '@vercel/speed-insights/react';

// En el render
<SpeedInsights />
```

### Métricas de Speed Insights

- **Real User Monitoring (RUM)**: Datos de usuarios reales
- **Field Data**: Métricas de campo (75th percentile)
- **Lab Data**: Métricas de laboratorio (sintéticas)
- **Performance Score**: Score de 0-100
- **Recommendations**: Sugerencias de optimización

---

## 📝 Logs y Debugging

### Vercel Logs

**Acceder a Logs:**

1. Vercel Dashboard > Tu Proyecto
2. Pestaña **Logs**
3. Filtrar por tipo:
   - **All**: Todos los logs
   - **Errors**: Solo errores
   - **Static**: Requests a assets estáticos
   - **Functions**: Logs de funciones serverless (si usas)

**Logs en Tiempo Real:**

```bash
# Ver logs en tiempo real con Vercel CLI
vercel logs --follow
```

### Console Logs en Producción

**⚠️ IMPORTANTE**: Evita console.log en producción.

**Solución**: Usar un logger condicional:

```typescript
// src/utils/logger.ts
const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => isDev && console.log(...args),
  error: (...args: any[]) => console.error(...args), // Siempre loggear errores
  warn: (...args: any[]) => isDev && console.warn(...args),
  info: (...args: any[]) => isDev && console.info(...args),
};

// Uso
import { logger } from './utils/logger';
logger.log('Debug info'); // Solo en dev
logger.error('Error crítico'); // Siempre se loggea
```

### Debugging en Producción

**Herramientas Recomendadas:**

1. **Vercel Toolbar** (Preview deployments)
   - Acceso a logs en tiempo real
   - Network inspector
   - Console logs

2. **Browser DevTools**
   - Network tab: Verificar requests
   - Console: Ver errores del cliente
   - Application tab: Verificar localStorage, cookies

3. **Source Maps**
   - Vite genera source maps automáticamente
   - Debugging con código original (no minificado)

---

## 🚨 Alertas y Notificaciones

### GitHub Actions Notifications

Las notificaciones de CI/CD ya están configuradas:

- ✅ **Build Failures**: Notificación automática en GitHub
- ✅ **Test Failures**: Email a contributors
- ✅ **Deploy Status**: Comentario en commit

### Vercel Notifications

**Configurar Alertas:**

1. Vercel Dashboard > Settings > Notifications
2. Habilitar notificaciones para:
   - **Deployment Failed**: Deploy falla
   - **Deployment Ready**: Deploy exitoso
   - **Build Errors**: Errores de build
   - **Performance Degradation**: Performance baja

**Canales de Notificación:**

- Email
- Slack (integración opcional)
- Discord (integración opcional)
- Webhook personalizado

### Alertas Personalizadas (Opcional)

**Opción 1: Webhook de Vercel**

```javascript
// Webhook endpoint para alertas personalizadas
// POST https://tu-dominio.com/api/vercel-webhook

{
  "type": "deployment.created",
  "payload": {
    "deployment": {
      "url": "...",
      "state": "READY"
    }
  }
}
```

**Opción 2: Integración con Servicios Externos**

- **Sentry**: Error tracking avanzado
- **LogRocket**: Session replay
- **Datadog**: Monitoring completo

---

## 🔍 Performance Monitoring

### Lighthouse CI (Opcional)

Ejecuta Lighthouse automáticamente en cada deploy:

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://copilot-salud-react.vercel.app
            https://copilot-salud-react.vercel.app/dashboard
          uploadArtifacts: true
```

### Web Vitals Tracking

**Opción: Agregar Web Vitals Monitoring**

```bash
npm install web-vitals
```

```typescript
// src/utils/vitals.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Enviar a analytics (GA, Vercel, custom)
  const body = JSON.stringify(metric);

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', body);
  } else {
    fetch('/api/analytics', { body, method: 'POST', keepalive: true });
  }
}

// Monitorear todas las métricas
onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

### Bundle Size Monitoring

**Verificar Bundle Size en Cada Build:**

```bash
# En local
npm run build

# Ver tamaño del bundle
du -sh dist/
du -h dist/assets/*.js | sort -rh

# Análisis detallado con rollup-plugin-visualizer
npm install -D rollup-plugin-visualizer
```

**Target de Bundle Size:**

- Initial bundle: < 200KB (gzipped)
- Total app: < 1MB (gzipped)

---

## 🐛 Error Tracking

### Error Boundary

Ya implementado en la aplicación (`src/components/common/ErrorBoundary.tsx`).

**Mejora Opcional**: Enviar errores a servicio externo:

```typescript
// src/components/common/ErrorBoundary.tsx
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  console.error('Error caught by boundary:', error, errorInfo);

  // Enviar a servicio de tracking (opcional)
  if (import.meta.env.PROD) {
    // Sentry.captureException(error);
    // O custom endpoint
    fetch('/api/error-tracking', {
      method: 'POST',
      body: JSON.stringify({ error: error.message, stack: error.stack })
    });
  }

  this.setState({ hasError: true, error });
}
```

### Sentry Integration (Opcional)

**Setup:**

```bash
npm install @sentry/react @sentry/vite-plugin
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
    tracesSampleRate: 0.1, // 10% de traces
    replaysSessionSampleRate: 0.1, // 10% de sessions
  });
}
```

---

## 📊 Dashboards Recomendados

### 1. Dashboard de Producción (Diario)

**Métricas a Monitorear:**

- ✅ Deployment status (last 24h)
- ✅ Core Web Vitals (LCP, FID, CLS)
- ✅ Error rate (< 1%)
- ✅ Page views y unique visitors
- ✅ API response times (Groq)

**Dónde Ver:**

- Vercel Dashboard > Analytics
- Vercel Dashboard > Logs (filtrar errors)

### 2. Dashboard de Performance (Semanal)

**Métricas a Revisar:**

- ✅ Performance score trend
- ✅ Bundle size trend
- ✅ Build time trend
- ✅ Coverage trend (tests)
- ✅ Top slowest pages

**Dónde Ver:**

- Vercel Speed Insights
- GitHub Actions (build logs)
- Vercel Analytics (performance)

### 3. Dashboard de Usuarios (Mensual)

**Métricas a Analizar:**

- ✅ User growth (MoM)
- ✅ Top features usage
- ✅ Browser/device distribution
- ✅ Geographic distribution
- ✅ Session duration trends

**Dónde Ver:**

- Vercel Analytics
- Custom analytics (si implementado)

---

## 🎯 Objetivos de Performance

### Target Metrics (Production)

| Categoría          | Métrica          | Objetivo Actual | Objetivo Ideal |
| ------------------ | ---------------- | --------------- | -------------- |
| **Performance**    | Lighthouse Score | > 90            | 95-100         |
| **Accessibility**  | Lighthouse Score | > 95            | 98-100         |
| **Best Practices** | Lighthouse Score | > 90            | 95-100         |
| **SEO**            | Lighthouse Score | > 90            | 95-100         |
| **LCP**            | Core Web Vital   | < 2.5s          | < 2.0s         |
| **FID**            | Core Web Vital   | < 100ms         | < 50ms         |
| **CLS**            | Core Web Vital   | < 0.1           | < 0.05         |
| **Build Time**     | CI/CD            | < 2 min         | < 1.5 min      |
| **Bundle Size**    | Initial          | < 200KB         | < 150KB        |
| **Error Rate**     | Production       | < 1%            | < 0.5%         |
| **Uptime**         | Availability     | > 99.5%         | > 99.9%        |

---

## 📞 Soporte y Contacto

Si detectas problemas o necesitas ayuda con el monitoreo:

- 📧 Email: antoniojesuspadilla.dev@proton.me
- 🐛 Issues: [GitHub Issues](https://github.com/AntonioJesusPadilla/copilot-salud-react/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/AntonioJesusPadilla/copilot-salud-react/discussions)

---

**Happy Monitoring! 📊**
