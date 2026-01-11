# Plan de Expansión - Secciones de Configuración

## 📋 Resumen Ejecutivo

Este documento detalla el plan de implementación para expandir la página de Settings agregando las funcionalidades completas de **Perfil de Usuario** y **Sistema de Notificaciones**.

---

## 🎯 Objetivos

1. Implementar sección de **Perfil de Usuario** con edición completa
2. Crear **Sistema de Notificaciones** con preferencias y gestión
3. Mantener arquitectura escalable y consistente con el diseño actual
4. Asegurar soporte completo de modo oscuro
5. Garantizar responsive design en todas las pantallas

---

## 📊 Análisis del Estado Actual

### Estructura Existente

**SettingsPage.tsx** actualmente tiene:
- ✅ Header con navegación y ThemeToggle
- ✅ Sidebar con avatar e info de usuario
- ✅ Navegación de secciones (3 opciones)
- ✅ Formulario de cambio de contraseña (funcional)
- ⏳ Perfil (placeholder)
- ⏳ Notificaciones (placeholder)

### Datos de Usuario Disponibles

Según `types/index.ts`, el modelo `User` incluye:
```typescript
{
  username: string;
  role: UserRole;
  name: string;
  email?: string;
  organization?: string;
  active?: boolean;
  canChangePassword?: boolean;
  lastPasswordChange?: string;
  created_date?: string;
  last_login?: string;
}
```

---

## 🏗️ Arquitectura Propuesta

### 1. Sistema de Navegación de Secciones

**Enfoque:** Sistema de tabs/secciones con estado compartido

```typescript
type SettingsSection = 'password' | 'profile' | 'notifications';

interface SettingsSectionConfig {
  id: SettingsSection;
  label: string;
  icon: string;
  component: React.ComponentType;
  enabled: boolean;
}
```

**Flujo:**
1. Usuario selecciona una sección del sidebar
2. Estado `activeSection` cambia
3. Componente correspondiente se renderiza en el área principal

---

## 👤 FUNCIONALIDAD 1: Perfil de Usuario

### Características

#### A. Información Personal
- **Nombre completo** (editable)
- **Email** (editable)
- **Organización** (editable)
- **Rol** (solo lectura)
- **Fecha de creación** (solo lectura)
- **Último login** (solo lectura)

#### B. Avatar/Foto de Perfil
- Subida de imagen de perfil
- Preview del avatar
- Opciones: eliminar, cambiar
- Almacenamiento: Base64 en localStorage o URL

#### C. Preferencias de Usuario
- **Idioma** (futuro: español/inglés)
- **Zona horaria**
- **Formato de fecha** (DD/MM/YYYY, MM/DD/YYYY)
- **Tema por defecto** (claro/oscuro/sistema)

### Nuevos Tipos Necesarios

```typescript
// types/user.ts
interface UserProfile {
  avatar?: string; // Base64 o URL
  phone?: string;
  department?: string;
  bio?: string;
}

interface UserPreferences {
  language: 'es' | 'en';
  timezone: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY';
  defaultTheme: 'light' | 'dark' | 'system';
}

interface ExtendedUser extends User {
  profile?: UserProfile;
  preferences?: UserPreferences;
}
```

### Componentes a Crear

```
src/components/settings/
├── ProfileSection.tsx          # Componente principal
├── ProfileForm.tsx             # Formulario de edición
├── AvatarUploader.tsx          # Subida de avatar
├── UserPreferences.tsx         # Preferencias
└── ProfileStats.tsx            # Estadísticas del usuario
```

### Servicios Necesarios

```typescript
// services/userProfileService.ts
class UserProfileService {
  // Actualizar información del perfil
  updateProfile(userId: string, data: Partial<UserProfile>): Promise<Result>

  // Subir avatar
  uploadAvatar(file: File): Promise<string>

  // Actualizar preferencias
  updatePreferences(userId: string, prefs: UserPreferences): Promise<Result>

  // Obtener perfil completo
  getFullProfile(userId: string): Promise<ExtendedUser>
}
```

### Store Zustand

```typescript
// store/userProfileStore.ts
interface UserProfileStore {
  profile: UserProfile | null;
  preferences: UserPreferences;
  isLoading: boolean;

  // Acciones
  loadProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
}
```

### UI/UX del Perfil

**Layout:**
```
┌─────────────────────────────────────────┐
│ 👤 Perfil de Usuario                    │
├─────────────────────────────────────────┤
│                                         │
│  [Avatar]     Nombre: [_____________]   │
│  [Cambiar]    Email:  [_____________]   │
│               Org:    [_____________]   │
│                                         │
│  ──────────────────────────────────────│
│                                         │
│  📊 Información de la Cuenta           │
│  • Rol: Administrador                  │
│  • Miembro desde: 01/01/2024          │
│  • Último acceso: Hoy a las 10:30     │
│                                         │
│  ──────────────────────────────────────│
│                                         │
│  ⚙️ Preferencias                       │
│  Idioma:     [Español ▼]              │
│  Zona:       [Europe/Madrid ▼]        │
│  Formato:    [DD/MM/YYYY ▼]           │
│                                         │
│  [Guardar Cambios]  [Cancelar]         │
└─────────────────────────────────────────┘
```

---

## 🔔 FUNCIONALIDAD 2: Sistema de Notificaciones

### Características

#### A. Preferencias de Notificaciones
- **Notificaciones en la app** (toggle)
- **Notificaciones por email** (toggle)
- **Notificaciones de escritorio** (browser notifications)

#### B. Tipos de Notificaciones
1. **Sistema**
   - Actualizaciones de la plataforma
   - Mantenimientos programados
   - Cambios de seguridad

2. **KPIs/Datos**
   - Alertas de KPIs críticos
   - Nuevos datos disponibles
   - Actualizaciones de reportes

3. **Administrativas** (solo admin/gestor)
   - Nuevos usuarios
   - Cambios de permisos
   - Actividad del sistema

#### C. Centro de Notificaciones
- Lista de notificaciones recientes
- Marcar como leído/no leído
- Eliminar notificaciones
- Filtros por tipo
- Notificaciones archivadas

### Nuevos Tipos Necesarios

```typescript
// types/notification.ts
type NotificationType = 'system' | 'kpi' | 'admin' | 'user';
type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  archived: boolean;
  createdAt: string;
  actionUrl?: string;
  icon?: string;
  metadata?: Record<string, any>;
}

interface NotificationPreferences {
  enabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  types: {
    system: boolean;
    kpi: boolean;
    admin: boolean;
    user: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
  };
}
```

### Componentes a Crear

```
src/components/settings/
├── NotificationsSection.tsx       # Componente principal
├── NotificationPreferences.tsx    # Configuración de preferencias
├── NotificationCenter.tsx         # Lista de notificaciones
├── NotificationItem.tsx           # Item individual
└── NotificationFilters.tsx        # Filtros

src/components/common/
└── NotificationBadge.tsx          # Badge de notificaciones (header)
```

### Servicios Necesarios

```typescript
// services/notificationService.ts
class NotificationService {
  // Obtener notificaciones del usuario
  getUserNotifications(userId: string, filters?: NotificationFilters): Promise<Notification[]>

  // Marcar como leída
  markAsRead(notificationId: string): Promise<void>

  // Marcar todas como leídas
  markAllAsRead(userId: string): Promise<void>

  // Eliminar notificación
  deleteNotification(notificationId: string): Promise<void>

  // Actualizar preferencias
  updatePreferences(userId: string, prefs: NotificationPreferences): Promise<void>

  // Crear notificación (admin)
  createNotification(notification: Omit<Notification, 'id'>): Promise<Notification>

  // Enviar notificación push del navegador
  sendBrowserNotification(notification: Notification): Promise<void>
}
```

### Store Zustand

```typescript
// store/notificationStore.ts
interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isLoading: boolean;

  // Acciones
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  addNotification: (notification: Notification) => void;
}
```

### UI/UX de Notificaciones

**Layout:**
```
┌─────────────────────────────────────────┐
│ 🔔 Notificaciones                       │
├─────────────────────────────────────────┤
│                                         │
│  ⚙️ Preferencias de Notificaciones     │
│  ○ Activar notificaciones              │
│  ○ Notificaciones por email            │
│  ○ Notificaciones del navegador        │
│                                         │
│  Tipos de notificaciones:              │
│  ☑ Sistema                             │
│  ☑ KPIs y Datos                        │
│  ☑ Administrativas                     │
│  ☐ Usuarios                            │
│                                         │
│  🌙 Horario de silencio                │
│  ○ Activar (22:00 - 08:00)            │
│                                         │
│  ──────────────────────────────────────│
│                                         │
│  📬 Centro de Notificaciones           │
│  [Todas] [No leídas] [Archivadas]     │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 🔴 KPI Crítico                    │ │
│  │ El indicador X ha bajado un 15%  │ │
│  │ Hace 2 horas          [Marcar ✓] │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ ℹ️ Actualización del Sistema      │ │
│  │ Nueva versión disponible          │ │
│  │ Ayer                  [Marcar ✓] │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [Marcar todas como leídas]           │
└─────────────────────────────────────────┘
```

---

## 🔧 Implementación Técnica

### Fase 1: Estructura Base (2-3 horas)

1. **Refactorizar SettingsPage.tsx**
   - Implementar sistema de navegación entre secciones
   - Extraer "Cambiar Contraseña" a componente separado
   - Crear arquitectura de tabs

2. **Crear tipos base**
   - `types/userProfile.ts`
   - `types/notification.ts`
   - Extender tipos existentes

### Fase 2: Perfil de Usuario (4-6 horas)

1. **Componentes UI**
   - ProfileSection.tsx
   - AvatarUploader.tsx
   - ProfileForm.tsx
   - UserPreferences.tsx

2. **Lógica de negocio**
   - userProfileService.ts
   - userProfileStore.ts

3. **Integración**
   - Conectar con authStore existente
   - Persistencia en localStorage
   - Validaciones de formularios

### Fase 3: Sistema de Notificaciones (5-7 horas)

1. **Componentes UI**
   - NotificationsSection.tsx
   - NotificationCenter.tsx
   - NotificationItem.tsx
   - NotificationPreferences.tsx

2. **Lógica de negocio**
   - notificationService.ts
   - notificationStore.ts

3. **Funcionalidades avanzadas**
   - Browser notifications API
   - Sistema de badges
   - Filtros y búsqueda

4. **Integración**
   - Badge en header (DashboardHeader)
   - Notificaciones en tiempo real (polling o WebSocket)

### Fase 4: Testing y Pulido (2-3 horas)

1. **Validaciones**
   - Formularios
   - Permisos por rol

2. **UX/UI**
   - Modo oscuro
   - Responsive design
   - Animaciones y transiciones

3. **Documentación**
   - Comentarios en código
   - README actualizado

---

## 📱 Consideraciones de Diseño

### Modo Oscuro
Todos los componentes deben incluir:
- `bg-white dark:bg-gray-800`
- `text-gray-900 dark:text-gray-100`
- `border-gray-200 dark:border-gray-700`

### Responsive
- Mobile: Secciones en acordeón
- Tablet: Sidebar colapsable
- Desktop: Sidebar fijo

### Accesibilidad
- Labels en todos los inputs
- ARIA labels en botones
- Navegación por teclado
- Contraste adecuado

---

## 🚀 Estimación de Tiempo Total

| Fase | Tiempo Estimado | Complejidad |
|------|----------------|-------------|
| Fase 1: Estructura | 2-3 horas | Media |
| Fase 2: Perfil | 4-6 horas | Media |
| Fase 3: Notificaciones | 5-7 horas | Alta |
| Fase 4: Testing | 2-3 horas | Baja |
| **TOTAL** | **13-19 horas** | - |

---

## 📦 Dependencias Necesarias

```json
{
  "react-dropzone": "^14.2.3",      // Upload de avatar
  "date-fns": "^3.0.0",             // Manejo de fechas
  "react-hot-toast": "^2.4.1"       // Toasts para notificaciones
}
```

---

## 🎨 Mockups de UI

### Perfil
```
┌──────────────────────────────────────────────────┐
│  SIDEBAR          │  CONTENIDO PRINCIPAL         │
│                   │                              │
│  [Avatar]         │  👤 Perfil de Usuario       │
│  John Doe         │  ───────────────────────    │
│  Admin            │                              │
│                   │  [Avatar]  [Info Personal]   │
│  🔐 Contraseña    │                              │
│  👤 Perfil ◄      │  [Preferencias]             │
│  🔔 Notificaciones│                              │
│                   │  [Guardar]                   │
└──────────────────────────────────────────────────┘
```

### Notificaciones
```
┌──────────────────────────────────────────────────┐
│  SIDEBAR          │  CONTENIDO PRINCIPAL         │
│                   │                              │
│  [Avatar]         │  🔔 Notificaciones          │
│  John Doe         │  ───────────────────────    │
│  Admin            │                              │
│                   │  ⚙️ Preferencias            │
│  🔐 Contraseña    │  [Toggles]                   │
│  👤 Perfil        │                              │
│  🔔 Notificaciones◄  📬 Centro (5 nuevas)       │
│                   │  [Lista de notificaciones]   │
└──────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Implementación

### Perfil de Usuario
- [ ] Crear tipos TypeScript
- [ ] Crear componente ProfileSection
- [ ] Implementar AvatarUploader
- [ ] Crear formulario de edición
- [ ] Implementar preferencias
- [ ] Crear servicio de perfil
- [ ] Crear store de perfil
- [ ] Integrar con authStore
- [ ] Agregar validaciones
- [ ] Testing de funcionalidad
- [ ] Modo oscuro completo
- [ ] Responsive design

### Notificaciones
- [ ] Crear tipos TypeScript
- [ ] Crear componente NotificationsSection
- [ ] Implementar centro de notificaciones
- [ ] Crear items de notificación
- [ ] Implementar preferencias
- [ ] Crear servicio de notificaciones
- [ ] Crear store de notificaciones
- [ ] Integrar browser notifications
- [ ] Agregar badge en header
- [ ] Sistema de filtros
- [ ] Testing de funcionalidad
- [ ] Modo oscuro completo
- [ ] Responsive design

---

## 🔄 Iteraciones Futuras

### v1.1 - Perfil
- Integración con backend real
- Historial de cambios
- 2FA / Autenticación de dos factores

### v1.2 - Notificaciones
- WebSocket para real-time
- Notificaciones por email (backend)
- Sistema de templates
- Analytics de notificaciones

---

## 📝 Notas Finales

Este plan proporciona una hoja de ruta completa para implementar ambas funcionalidades manteniendo:
- ✅ Consistencia con el diseño actual
- ✅ Arquitectura escalable
- ✅ Buenas prácticas de React/TypeScript
- ✅ UX/UI de alta calidad
- ✅ Modo oscuro completo
- ✅ Responsive design

La implementación puede hacerse de forma incremental, empezando por el Perfil (más simple) y luego las Notificaciones (más complejo).
