# 🚀 Guía de Deployment

Esta guía detalla el proceso de despliegue de **Copilot Salud Andalucía** a producción en Vercel.

---

## 📋 Tabla de Contenidos

- [Pre-requisitos](#pre-requisitos)
- [Configuración Inicial](#configuración-inicial)
- [Variables de Entorno](#variables-de-entorno)
- [Deploy Manual](#deploy-manual)
- [Deploy Automático (CI/CD)](#deploy-automático-cicd)
- [Verificación Post-Deploy](#verificación-post-deploy)
- [Monitoreo](#monitoreo)
- [Rollback](#rollback)
- [Troubleshooting](#troubleshooting)

---

## ✅ Pre-requisitos

Antes de desplegar, asegúrate de tener:

### 1. Cuenta de Vercel

- ✅ Cuenta creada en [vercel.com](https://vercel.com)
- ✅ Vercel CLI instalado (opcional): `npm i -g vercel`

### 2. API Keys

- ✅ **Groq API Key**: Obtén una en [console.groq.com](https://console.groq.com)
  - Crea una cuenta
  - Genera una API key
  - Guárdala de forma segura

### 3. Repositorio Git

- ✅ Código en GitHub
- ✅ Branch `main` actualizado
- ✅ Tests pasando: `npm run test:run`
- ✅ Build exitoso: `npm run build`

---

## ⚙️ Configuración Inicial

### 1. Conectar Repositorio a Vercel

#### Opción A: Desde Vercel Dashboard (Recomendado)

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Selecciona "Import Git Repository"
3. Conecta tu cuenta de GitHub
4. Selecciona el repositorio `copilot-salud-react`
5. Configura el proyecto:
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
6. Click en "Deploy"

#### Opción B: Desde CLI

```bash
# Login a Vercel
vercel login

# Deploy (primera vez)
vercel

# Seguir las instrucciones interactivas
```

### 2. Configurar Proyecto

Una vez desplegado, obtén los IDs necesarios:

```bash
# Ver información del proyecto
vercel project ls

# O desde Vercel Dashboard > Settings > General
# Anota:
# - Project ID
# - Team/Org ID
```

---

## 🔐 Variables de Entorno

### Configurar en Vercel Dashboard

1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Agrega las siguientes variables:

#### Variables Requeridas

| Variable            | Valor                            | Environment         |
| ------------------- | -------------------------------- | ------------------- |
| `VITE_GROQ_API_KEY` | `tu_api_key_de_groq`             | Production, Preview |
| `VITE_APP_NAME`     | `Copilot Salud Andalucía`        | Production, Preview |
| `VITE_BASE_URL`     | `https://tu-proyecto.vercel.app` | Production          |

#### Variables Opcionales

| Variable                | Valor   | Descripción                    |
| ----------------------- | ------- | ------------------------------ |
| `VITE_ENABLE_DEV_TOOLS` | `false` | Deshabilitar dev tools en prod |
| `VITE_ENABLE_ANALYTICS` | `true`  | Habilitar analytics            |

### Variables para GitHub Actions (CI/CD)

Si vas a usar GitHub Actions, agrega también:

**GitHub Repository > Settings > Secrets and variables > Actions**

| Secret Name         | Descripción                  | Dónde Obtenerlo                                                           |
| ------------------- | ---------------------------- | ------------------------------------------------------------------------- |
| `VERCEL_TOKEN`      | Token de acceso a Vercel     | [Vercel Dashboard > Settings > Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID`     | ID de tu organización/equipo | Vercel Dashboard > Settings > General                                     |
| `VERCEL_PROJECT_ID` | ID del proyecto              | Vercel Dashboard > Settings > General                                     |
| `VITE_GROQ_API_KEY` | API key de Groq (para build) | [Groq Console](https://console.groq.com)                                  |

---

## 🚀 Deploy Manual

### Desde Vercel Dashboard

1. Ve a tu proyecto en Vercel
2. Pestaña "Deployments"
3. Click en "Redeploy" en el último deployment
4. O haz push a `main` para auto-deploy

### Desde CLI

```bash
# Deploy a producción
vercel --prod

# Deploy a preview/staging
vercel
```

### Desde Git

Simplemente haz push a `main`:

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

Vercel detectará el push y desplegará automáticamente.

---

## 🤖 Deploy Automático (CI/CD)

El proyecto incluye GitHub Actions configurado en `.github/workflows/ci.yml`.

### Qué hace el CI/CD Pipeline

```
┌─────────────────────────────────────────┐
│  Push/PR a main                         │
└─────────────┬───────────────────────────┘
              │
              ├─► Lint & Type Check
              │
              ├─► Unit Tests (150+ tests)
              │
              ├─► E2E Tests (17 tests)
              │
              ├─► Build Validation
              │
              ├─► Security Audit
              │
              └─► Deploy to Vercel (solo en main)
```

### Configurar GitHub Actions

1. **Agregar Secrets en GitHub**
   - Ve a tu repositorio en GitHub
   - Settings > Secrets and variables > Actions
   - Agrega los secrets mencionados arriba

2. **Verificar Workflow**
   - El archivo `.github/workflows/ci.yml` ya está configurado
   - Se ejecuta automáticamente en push/PR a `main`

3. **Ver Resultados**
   - Ve a GitHub > Actions
   - Verás cada workflow run con resultados detallados

### Deshabilitar Auto-Deploy (opcional)

Si prefieres deploy manual:

1. Edita `.github/workflows/ci.yml`
2. Comenta o elimina el job `deploy`
3. O configura Vercel para no auto-deploy en push

---

## ✅ Verificación Post-Deploy

Después de cada deploy, verifica:

### 1. Health Check Básico

```bash
# Check status
curl -I https://tu-proyecto.vercel.app

# Debe retornar: 200 OK
```

### 2. Funcionalidad Core

Verifica manualmente en la app:

- [ ] **Login**: Probar con credenciales de prueba
  - Admin: `admin / admin123`
  - Gestor: `gestor / gestor123`

- [ ] **Dashboard**: KPIs se cargan correctamente

- [ ] **Mapas**: Mapa interactivo funciona
  - Marcadores visibles
  - Tooltips funcionan

- [ ] **Chat AI**: Asistente responde
  - Verificar que GROQ_API_KEY está configurado
  - Hacer una pregunta de prueba

- [ ] **Dark Mode**: Toggle funciona en todas las páginas

- [ ] **Responsive**: Probar en móvil/tablet/desktop

### 3. Performance Check

- [ ] **Lighthouse Score**:
  - Performance > 90
  - Accessibility > 95
  - Best Practices > 90
  - SEO > 90

- [ ] **Load Time**: < 3 segundos (First Contentful Paint)

- [ ] **Bundle Size**: Verificar en build logs

### 4. Security Headers

```bash
# Verificar headers de seguridad
curl -I https://tu-proyecto.vercel.app | grep -E "(X-|Content-Security)"
```

Debe incluir:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy: ...`

---

## 📊 Monitoreo

### Vercel Analytics

1. Ve a Vercel Dashboard > Tu Proyecto > Analytics
2. Monitorea:
   - **Page Views**: Tráfico general
   - **Top Pages**: Páginas más visitadas
   - **Visitor Insights**: Datos demográficos
   - **Devices**: Distribución móvil/desktop

### Vercel Logs

1. Ve a Vercel Dashboard > Tu Proyecto > Logs
2. Filtra por:
   - **Deployment**: Logs de build
   - **Runtime**: Logs de runtime (si usas serverless)
   - **Errors**: Solo errores

### Performance Monitoring

Herramientas recomendadas:

- **Vercel Speed Insights**: Métricas de performance real
- **Google Analytics**: Tracking de usuarios (opcional)
- **Sentry**: Error tracking (opcional)

---

## 🔄 Rollback

Si necesitas revertir a un deployment anterior:

### Desde Vercel Dashboard

1. Ve a tu proyecto en Vercel
2. Pestaña "Deployments"
3. Encuentra el deployment estable anterior
4. Click en los tres puntos (...)
5. Selecciona "Promote to Production"
6. Confirma el rollback

### Desde CLI

```bash
# Listar deployments
vercel ls

# Promover un deployment específico
vercel promote <deployment-url>
```

### Desde Git

```bash
# Revertir el último commit
git revert HEAD
git push origin main

# O hacer reset (⚠️ destructivo)
git reset --hard <commit-hash>
git push -f origin main
```

---

## 🐛 Troubleshooting

### Problema: Build Falla

**Síntomas**: Deploy falla en la etapa de build

**Soluciones**:

1. Verificar que el build pasa localmente:
   ```bash
   npm run build
   ```
2. Verificar variables de entorno en Vercel
3. Revisar logs de build en Vercel Dashboard
4. Verificar que todas las dependencias estén en `package.json`

### Problema: Chat AI No Responde

**Síntomas**: Chat muestra error al enviar mensaje

**Soluciones**:

1. Verificar `VITE_GROQ_API_KEY` en Vercel
   - Settings > Environment Variables
   - Debe estar en "Production" y "Preview"
2. Verificar cuota de Groq API
   - Ve a [console.groq.com](https://console.groq.com)
   - Revisa rate limits y cuota disponible
3. Verificar CSP headers permiten `api.groq.com`

### Problema: 404 en Rutas

**Síntomas**: Navegación directa a `/dashboard` da 404

**Soluciones**:

1. Verificar `vercel.json` tiene:
   ```json
   "rewrites": [
     { "source": "/(.*)", "destination": "/index.html" }
   ]
   ```
2. Si no existe, crearlo o verificar configuración
3. Redeploy después de cambios

### Problema: Variables de Entorno No Actualizan

**Síntomas**: Cambios en variables no se reflejan

**Soluciones**:

1. Variables con `VITE_` prefix requieren **rebuild**
2. Cambiar variable en Vercel Dashboard
3. Hacer redeploy (no solo reload)
4. Limpiar caché del navegador

### Problema: Performance Lenta

**Síntomas**: App carga lenta

**Soluciones**:

1. Verificar bundle size:
   ```bash
   npm run build
   du -sh dist/
   ```
2. Optimizar assets grandes (imágenes, fonts)
3. Verificar que lazy loading funciona
4. Verificar caché headers en `vercel.json`

### Problema: Headers de Seguridad Faltan

**Síntomas**: Lighthouse reporta headers faltantes

**Soluciones**:

1. Verificar `vercel.json` tiene sección `headers`
2. Agregar headers faltantes
3. Verificar con:
   ```bash
   curl -I https://tu-proyecto.vercel.app
   ```
4. Redeploy si es necesario

---

## 📝 Checklist de Deploy

Usa este checklist antes de cada deploy importante:

### Pre-Deploy

- [ ] Todos los tests pasan (`npm run test:run`)
- [ ] Tests E2E pasan (`npm run test:e2e`)
- [ ] Build exitoso (`npm run build`)
- [ ] Type check sin errores (`npm run type-check`)
- [ ] Lint sin errores (`npm run lint`)
- [ ] Variables de entorno configuradas
- [ ] Credenciales de prueba documentadas
- [ ] ROADMAP actualizado

### Durante Deploy

- [ ] Monitoring activo (Vercel Dashboard)
- [ ] Build logs sin errores
- [ ] No hay vulnerabilidades críticas

### Post-Deploy

- [ ] Health check pasó
- [ ] Login funciona
- [ ] Todas las páginas cargan
- [ ] Chat AI responde
- [ ] Mapas funcionan
- [ ] Dark mode funciona
- [ ] Responsive en todos los dispositivos
- [ ] Performance aceptable (Lighthouse > 90)
- [ ] Headers de seguridad presentes

---

## 🔗 Enlaces Útiles

- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Groq Console**: [console.groq.com](https://console.groq.com)
- **GitHub Actions**: Tu repositorio > Actions tab
- **Vercel CLI Docs**: [vercel.com/docs/cli](https://vercel.com/docs/cli)

---

## 📞 Soporte

Si encuentras problemas durante el deployment:

- 📧 Email: antoniojesuspadilla.dev@proton.me
- 🐛 Issues: [GitHub Issues](https://github.com/AntonioJesusPadilla/copilot-salud-react/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/AntonioJesusPadilla/copilot-salud-react/discussions)

---

**Happy Deploying! 🚀**
