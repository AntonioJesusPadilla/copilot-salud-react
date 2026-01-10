# 🔒 Documento de Seguridad - Copilot Salud Andalucía

**Última actualización**: 10/01/2026
**Versión**: 1.0

---

## 📋 Resumen Ejecutivo

Este documento describe las medidas de seguridad implementadas en la aplicación Copilot Salud Andalucía para proteger contra vulnerabilidades comunes y garantizar la seguridad de los datos de los usuarios.

---

## 🛡️ Medidas de Seguridad Implementadas

### 1. Validación de Inputs

**Servicio**: `inputValidationService.ts`

**Protecciones**:
- ✅ Validación de emails con regex estricto
- ✅ Validación de contraseñas (mínimo 6 caracteres, letra + número)
- ✅ Validación de usernames (alfanumérico, 3-20 caracteres)
- ✅ Detección de caracteres peligrosos (`<script>`, `javascript:`, event handlers)
- ✅ Validación de mensajes de chat (máximo 5000 caracteres)
- ✅ Validación de términos de búsqueda
- ✅ Validación de URLs (solo HTTP/HTTPS)
- ✅ Validación de nombres de archivo (prevención de path traversal)
- ✅ Escape de HTML para prevenir XSS

**Aplicado en**:
- Login (username y password)
- Chat AI (mensajes de usuario)
- Búsquedas globales
- Formularios de configuración

### 2. Sanitización de Contenido

**Servicio**: `sanitizationService.ts`

**Protecciones**:
- ✅ Sanitización de HTML (eliminación de `<script>`, `<iframe>`)
- ✅ Eliminación de event handlers inline (`onclick`, `onerror`, etc.)
- ✅ Sanitización de URLs (bloqueo de `javascript:` protocol)
- ✅ Sanitización de respuestas del Chat AI
- ✅ Protección contra Prototype Pollution
- ✅ Sanitización de nombres de archivo
- ✅ Sanitización de JSON
- ✅ Detección de código peligroso

**Aplicado en**:
- Respuestas del Chat AI (antes de renderizar)
- Markdown rendering
- Exportación de archivos
- Cualquier contenido dinámico

### 3. Rate Limiting

**Servicio**: `rateLimitService.ts`

**Límites configurados**:
| Acción | Límite | Ventana |
|--------|--------|---------|
| Chat AI | 20 mensajes | 1 minuto |
| Login | 5 intentos | 15 minutos |
| Exportación | 10 archivos | 5 minutos |
| Búsqueda | 30 búsquedas | 1 minuto |
| API general | 100 requests | 1 minuto |
| Cambio de contraseña | 3 intentos | 1 hora |

**Aplicado en**:
- Login (`authService.ts`)
- Chat AI (`chatService.ts`)
- Exportaciones (futuro)
- Búsquedas (futuro)

### 4. Autenticación y Autorización

**Implementación**:
- ✅ Hash de contraseñas con bcryptjs (salt rounds: 10)
- ✅ Persistencia segura de sesión en localStorage
- ✅ Verificación de roles en cada petición
- ✅ Rutas protegidas con `ProtectedRoute`
- ✅ Validación de permisos por rol

**Roles y permisos**:
```typescript
- Admin: Todos los permisos
- Gestor: Ver datos, exportar, chat AI, mapas
- Analista: Ver datos, exportar, chat AI
- Invitado: Solo mapas básicos
```

### 5. Manejo de Errores

**Implementación**:
- ✅ ErrorBoundary global para capturar errores de React
- ✅ Mensajes de error amigables (no exponen detalles técnicos en producción)
- ✅ Logging de errores en consola (solo desarrollo)
- ✅ UI de recuperación ante errores

### 6. Performance y Optimización

**Implementación**:
- ✅ Lazy loading de rutas con React.lazy + Suspense
- ✅ Code splitting automático por ruta
- ✅ Memoización de componentes clave con React.memo
- ✅ LoadingFallback para mejor UX durante cargas

---

## 🚨 Vulnerabilidades Conocidas y Mitigaciones

### 1. xlsx - Prototype Pollution (CVE-2023-XXXXX)

**Severidad**: Alta
**Estado**: No hay parche disponible
**Mitigación implementada**:
- ✅ Sanitización de objetos antes de exportar (`sanitizeObject`)
- ✅ Validación de nombres de archivo
- ✅ Solo usuarios autenticados con permisos pueden exportar
- ✅ Rate limiting en exportaciones (10 por 5 minutos)

**Recomendación**: Considerar alternativa como `exceljs` en futuras versiones.

### 2. react-router - CSRF y XSS (CVE-2024-XXXXX)

**Severidad**: Alta
**Estado**: ✅ Parcheado con `npm audit fix`
**Versión actual**: 7.x (última versión estable)

---

## 🔐 Mejores Prácticas Implementadas

### Desarrollo Seguro
- ✅ TypeScript estricto (sin `any`)
- ✅ ESLint configurado con reglas de seguridad
- ✅ Validación de inputs en el frontend
- ✅ Sanitización de outputs antes de renderizar
- ✅ Principio de menor privilegio en permisos

### Datos Sensibles
- ✅ API keys en variables de entorno (`.env`)
- ✅ No se exponen API keys en logs de producción
- ✅ Contraseñas hasheadas con bcrypt (nunca en texto plano)
- ✅ Sesión persistente en localStorage (consideraciones de seguridad aceptadas)

### Headers de Seguridad (Recomendado para producción)
```typescript
// Configurar en servidor (Vercel, Nginx, etc.)
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- Permissions-Policy
```

---

## 📝 Recomendaciones para Producción

### Inmediatas
1. ✅ Implementar HTTPS (Vercel lo hace automáticamente)
2. ✅ Configurar headers de seguridad en servidor
3. ⚠️ Implementar backend real (actualmente mock data)
4. ⚠️ Mover API keys a servidor (no en cliente)
5. ⚠️ Implementar refresh tokens para sesiones

### Futuras
- 🔄 Implementar 2FA (autenticación de dos factores)
- 🔄 Logging y monitoreo con Sentry o similar
- 🔄 Implementar CSP (Content Security Policy) estricta
- 🔄 Auditorías de seguridad periódicas
- 🔄 Penetration testing
- 🔄 Implementar WAF (Web Application Firewall)

---

## 🧪 Testing de Seguridad

### Tests Implementados
- ⏳ Tests unitarios de validación (pendiente)
- ⏳ Tests de sanitización (pendiente)
- ⏳ Tests de rate limiting (pendiente)

### Tests Recomendados
- ⏳ OWASP ZAP scanning
- ⏳ Dependency scanning (npm audit automático)
- ⏳ Code analysis con SonarQube
- ⏳ Penetration testing profesional

---

## 📞 Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, por favor:

1. **NO la publiques públicamente**
2. Envía un email a: [antoniojesuspadilla.dev@proton.me]
3. Incluye:
   - Descripción detallada
   - Pasos para reproducir
   - Impacto potencial
   - Sugerencias de fix (opcional)

Responderemos en máximo 48 horas.

---

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [React Security Best Practices](https://react.dev/learn/security)
- [TypeScript Security Guide](https://www.typescriptlang.org/docs/handbook/security.html)

---

**Mantenido por**: Equipo de Desarrollo Copilot Salud
**Última revisión**: 10/01/2026
