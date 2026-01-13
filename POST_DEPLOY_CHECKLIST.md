# ✅ Post-Deploy Checklist

Esta checklist asegura que cada deployment a producción cumple con los estándares de calidad.

---

## 📋 Verificación Inmediata (< 5 min)

Ejecutar inmediatamente después de cada deploy:

### 1. Health Check Básico

- [ ] **Sitio accesible**: https://copilot-salud-react.vercel.app responde con 200 OK
- [ ] **HTTPS activo**: SSL/TLS configurado correctamente
- [ ] **Sin errores en consola**: Browser DevTools no muestra errores críticos
- [ ] **Build exitoso**: Vercel Dashboard muestra "Ready" (verde)

**Comando:**

```bash
curl -I https://copilot-salud-react.vercel.app
# Debe retornar: HTTP/2 200
```

---

## 🔐 Autenticación y Acceso (5-10 min)

### 2. Login y Roles

- [ ] **Login Admin funciona**
  - Usuario: `admin` / Password: `admin123`
  - Redirecciona a dashboard correctamente

- [ ] **Login Gestor funciona**
  - Usuario: `gestor` / Password: `gestor123`
  - Dashboard muestra KPIs operativos

- [ ] **Login Analista funciona**
  - Usuario: `analista` / Password: `analista123`
  - Dashboard muestra comparativas y análisis

- [ ] **Login Invitado funciona**
  - Usuario: `invitado` / Password: `invitado123`
  - Dashboard limitado y sin exportación

- [ ] **Logout funciona**
  - Limpia sesión correctamente
  - Redirecciona a login

- [ ] **Rutas protegidas funcionan**
  - Sin login, `/dashboard` redirecciona a `/login`
  - Con login, `/login` redirecciona a `/dashboard`

---

## 📊 Funcionalidad Core (10-15 min)

### 3. Dashboard y KPIs

- [ ] **KPIs cargan correctamente**
  - 26 KPIs visibles (según rol)
  - Gráficos de Recharts se renderizan
  - Datos numéricos correctos

- [ ] **Filtros funcionan**
  - Filtro por categoría (Asistencia, Urgencias, etc.)
  - Filtro por nivel de acceso
  - Resultados se actualizan correctamente

- [ ] **Comparador de KPIs funciona** (Analista)
  - Selección múltiple de KPIs
  - Gráfico comparativo se genera
  - Datos sincronizados

### 4. Mapas Interactivos

- [ ] **Mapa carga correctamente**
  - 103 centros de salud visibles
  - Tiles de OpenStreetMap cargan
  - No hay errores en consola

- [ ] **Marcadores interactivos**
  - Click en marcador muestra popup
  - Información del centro correcta
  - Tooltip muestra nombre al hover

- [ ] **Filtros de mapa funcionan**
  - Filtro por tipo de centro
  - Filtro por servicios disponibles
  - Búsqueda por nombre/ciudad

### 5. Chat AI

- [ ] **Chat interface carga**
  - ChatInterface visible
  - Input de texto funciona
  - Botón enviar habilitado

- [ ] **Groq API conectado**
  - Mensaje de prueba: "Hola, ¿qué KPIs puedes analizar?"
  - Respuesta dentro de 3-5 segundos
  - Sin errores de API key

- [ ] **Contexto enriquecido funciona**
  - Chat conoce los 15 KPIs principales
  - Chat conoce los 10 centros de salud
  - Respuestas contextualizadas al sistema

- [ ] **Markdown rendering**
  - Formato de texto (negrita, cursiva)
  - Listas con bullets
  - Code blocks si aplica

### 6. Configuración

- [ ] **Cambio de contraseña funciona**
  - Formulario valida contraseñas
  - Contraseña se actualiza correctamente
  - Toast de confirmación aparece

- [ ] **Dark mode funciona**
  - Toggle en todas las páginas
  - Tema persiste en localStorage
  - Transiciones suaves

---

## 🔄 Funcionalidades Avanzadas (10-15 min)

### 7. Exportación de Datos

- [ ] **Exportar a PDF funciona** (Admin/Gestor/Analista)
  - Dashboard completo se exporta
  - Gráficos incluidos en PDF
  - Nombre de archivo correcto

- [ ] **Exportar a CSV funciona**
  - Datos de KPIs se descargan
  - Formato CSV correcto
  - Abre correctamente en Excel

- [ ] **Exportar a Excel funciona**
  - Archivo .xlsx se genera
  - Múltiples hojas si aplica
  - Formato correcto

### 8. Gestión de Usuarios (Solo Admin)

- [ ] **Ver lista de usuarios**
  - UserTable muestra usuarios
  - Paginación funciona (10/página)
  - Ordenamiento por columnas

- [ ] **Crear usuario**
  - Formulario valida campos
  - Usuario se crea correctamente
  - Aparece en la lista

- [ ] **Editar usuario**
  - Modal se abre con datos
  - Cambios se guardan
  - Lista se actualiza

- [ ] **Activar/Desactivar usuario**
  - Toggle cambia estado
  - No permite desactivar último admin
  - Badge actualiza color

- [ ] **Eliminar usuario**
  - Confirmación antes de eliminar
  - No permite eliminar último admin
  - Usuario se elimina de la lista

- [ ] **Búsqueda de usuarios**
  - Busca por username, name, email
  - Resultados filtran en tiempo real
  - Clear button funciona

---

## 🎨 UI/UX y Responsive (5-10 min)

### 9. Experiencia de Usuario

- [ ] **Responsive design funciona**
  - **Desktop** (1920x1080): Layout correcto
  - **Tablet** (768x1024): Adaptación correcta
  - **Mobile** (375x667): UI usable

- [ ] **Dark mode en todas las páginas**
  - LoginPage
  - Dashboard (todas las vistas por rol)
  - ChatPage
  - MapsPage
  - SettingsPage
  - UserManagementPage (Admin)

- [ ] **Transiciones suaves**
  - transition-colors en componentes
  - Sin flickers al cambiar tema
  - Animaciones fluidas

- [ ] **Loading states**
  - LoadingSpinner cuando carga datos
  - Skeleton loaders (si implementado)
  - No pantallas en blanco

- [ ] **Error states**
  - Mensajes de error claros
  - ErrorBoundary captura errores
  - Fallback UI adecuado

---

## 🔒 Seguridad y Headers (5 min)

### 10. Security Headers

Verificar headers de seguridad:

```bash
curl -I https://copilot-salud-react.vercel.app
```

- [ ] **X-Content-Type-Options**: nosniff
- [ ] **X-Frame-Options**: DENY
- [ ] **X-XSS-Protection**: 1; mode=block
- [ ] **Referrer-Policy**: strict-origin-when-cross-origin
- [ ] **Permissions-Policy**: camera=(), microphone=(), geolocation=()
- [ ] **Content-Security-Policy**: Configurado correctamente

### 11. HTTPS y Certificados

- [ ] **SSL activo**: https:// funciona
- [ ] **HTTP redirect**: http:// → https://
- [ ] **Certificado válido**: No warnings en browser
- [ ] **Sin mixed content**: Todos los recursos via HTTPS

---

## ⚡ Performance (10 min)

### 12. Lighthouse Audit

Ejecutar Lighthouse en modo incógnito:

**Desktop:**

- [ ] **Performance**: Score > 90
- [ ] **Accessibility**: Score > 95
- [ ] **Best Practices**: Score > 90
- [ ] **SEO**: Score > 90

**Mobile:**

- [ ] **Performance**: Score > 80
- [ ] **Accessibility**: Score > 95
- [ ] **Best Practices**: Score > 90
- [ ] **SEO**: Score > 90

### 13. Core Web Vitals

Verificar en Vercel Speed Insights:

- [ ] **LCP** (Largest Contentful Paint): < 2.5s
- [ ] **FID** (First Input Delay): < 100ms
- [ ] **CLS** (Cumulative Layout Shift): < 0.1

### 14. Bundle Size

Verificar en build logs:

- [ ] **Initial bundle**: < 200KB (gzipped)
- [ ] **Total app**: < 1MB (gzipped)
- [ ] **Code splitting**: Chunks separados visibles
- [ ] **Lazy loading**: Rutas cargan bajo demanda

---

## 🧪 Testing (Opcional - 15 min)

### 15. Smoke Tests en Producción

- [ ] **Unit tests pasaron**: CI/CD verde
  - 150+ tests ejecutados
  - 85%+ coverage mantenido

- [ ] **E2E tests pasaron**: CI/CD verde
  - 17 tests E2E ejecutados
  - Todos los flujos críticos OK

- [ ] **Regression testing** (manual):
  - Features existentes funcionan
  - No bugs introducidos
  - Experiencia consistente

---

## 📊 Monitoreo (5 min)

### 16. Vercel Dashboard

- [ ] **Deployment status**: "Ready" (verde)
- [ ] **Build time**: < 2 minutos
- [ ] **No errors en logs**: Últimos 1000 requests OK
- [ ] **Analytics habilitado**: Tracking funcionando

### 17. GitHub Actions

- [ ] **CI/CD pipeline verde**: Todos los jobs pasaron
- [ ] **No failing checks**: Branch protections OK
- [ ] **Deploy comentario**: URL de production en commit

---

## 🔄 Post-Deploy Actions (5 min)

### 18. Documentación y Comunicación

- [ ] **ROADMAP actualizado**: Subsistema marcado como completado
- [ ] **CHANGELOG actualizado** (si existe): Nueva versión documentada
- [ ] **Team notificado** (si aplica): Deploy comunicado

### 19. Backup y Rollback Plan

- [ ] **Deployment ID anotado**: Para rollback si es necesario
- [ ] **Estado anterior documentado**: Último deployment estable conocido
- [ ] **Plan de rollback claro**: Pasos documentados en DEPLOYMENT.md

---

## ⚠️ Problemas Comunes

### Si algo falla, verificar:

1. **Build falla**
   - Revisar logs en Vercel
   - Verificar dependencies en package.json
   - Verificar variables de entorno

2. **Chat AI no responde**
   - Verificar VITE_GROQ_API_KEY en Vercel
   - Verificar cuota de Groq API
   - Revisar CSP headers

3. **Mapas no cargan**
   - Verificar CDN de Leaflet
   - Verificar CSP permite tile.openstreetmap.org
   - Revisar console errors

4. **Performance lenta**
   - Verificar bundle size
   - Verificar lazy loading
   - Revisar caché headers

---

## 📝 Sign-off

**Deploy Date**: ******\_\_\_******

**Deployed By**: ******\_\_\_******

**Deployment URL**: ******\_\_\_******

**All Checks Passed**: ☐ Yes ☐ No

**Notes**:

---

---

---

---

**¡Deployment Verificado! 🚀**
