# Plan de Implementación - Sistema de Reordenación de KPIs

## 📋 Resumen Ejecutivo

Este documento detalla el plan de implementación para agregar un **sistema de reordenación y personalización de KPIs** que permita a cada rol del sistema organizar las tarjetas KPI según sus preferencias y necesidades.

---

## 🎯 Objetivos

1. Implementar **drag and drop** para reordenar tarjetas KPI
2. Permitir **ordenamiento automático** por diferentes criterios
3. Crear sistema de **vistas personalizadas** (grid/lista)
4. Agregar **persistencia de configuración** por usuario
5. Implementar **filtrado avanzado** con ordenamiento
6. Mantener **responsive design** en todas las interacciones

---

## 📊 Análisis del Estado Actual

### Visualización Actual de KPIs

**DashboardPage.tsx** muestra KPIs en:
- Grid responsivo: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
- Orden fijo determinado por el array `filteredKPIs`
- Filtros disponibles: categoría, búsqueda
- Sin personalización de orden

### Componentes Existentes

- **KPICard.tsx**: Tarjeta individual de KPI
- **AdvancedFilters.tsx**: Filtros actuales (categoría, provincia, tendencia, rango)
- **kpiStore.ts**: Store Zustand con 26 KPIs

---

## 🏗️ Arquitectura Propuesta

### 1. Tipos TypeScript Necesarios

```typescript
// types/kpiOrdering.ts

/** Criterios de ordenamiento disponibles */
type KPISortCriteria =
  | 'custom'           // Orden personalizado por drag & drop
  | 'name-asc'         // Nombre alfabético A-Z
  | 'name-desc'        // Nombre alfabético Z-A
  | 'value-asc'        // Valor numérico ascendente
  | 'value-desc'       // Valor numérico descendente
  | 'category'         // Agrupado por categoría
  | 'trend'            // Por tipo de tendencia (positiva, negativa, estable)
  | 'priority';        // Por prioridad definida por el usuario

/** Tipos de vista disponibles */
type KPIViewMode = 'grid' | 'list' | 'compact';

/** Configuración de vista de KPIs */
interface KPIViewConfig {
  sortCriteria: KPISortCriteria;
  viewMode: KPIViewMode;
  customOrder: string[];        // Array de KPI IDs en orden personalizado
  pinnedKPIs: string[];         // KPIs fijados al inicio
  collapsedCategories: string[]; // Categorías colapsadas (modo agrupado)
}

/** Preferencias de ordenamiento por usuario */
interface UserKPIPreferences {
  userId: string;
  role: UserRole;
  viewConfig: KPIViewConfig;
  favorites: string[];          // KPIs marcados como favoritos
  hidden: string[];             // KPIs ocultos temporalmente
  lastModified: string;
}
```

---

## 🎨 Opciones de Implementación

### Opción A: Drag & Drop Nativo (HTML5 API)

**Ventajas:**
- ✅ Sin dependencias externas
- ✅ Ligero y performante
- ✅ Soporte completo en navegadores modernos
- ✅ Customizable con CSS

**Desventajas:**
- ❌ Implementación más compleja
- ❌ Touch support limitado (móviles)
- ❌ Requiere más código custom

**Implementación:**
```typescript
// Eventos necesarios
onDragStart(e: DragEvent, kpiId: string)
onDragOver(e: DragEvent)
onDrop(e: DragEvent, targetIndex: number)
onDragEnd(e: DragEvent)
```

---

### Opción B: React DnD (react-dnd + react-dnd-html5-backend)

**Ventajas:**
- ✅ Biblioteca madura y estable
- ✅ APIs declarativas de React
- ✅ Soporte para múltiples backends (HTML5, Touch)
- ✅ Documentación completa

**Desventajas:**
- ❌ Dependencia adicional (~50KB)
- ❌ Curva de aprendizaje
- ❌ Overhead de abstracción

**Dependencias:**
```json
{
  "react-dnd": "^16.0.1",
  "react-dnd-html5-backend": "^16.0.1",
  "react-dnd-touch-backend": "^16.0.1"
}
```

---

### Opción C: @dnd-kit (Recomendado) ⭐

**Ventajas:**
- ✅ Moderno y ligero (~15KB)
- ✅ Excelente soporte touch (móviles)
- ✅ Accesibilidad incorporada (teclado)
- ✅ Performance optimizado
- ✅ TypeScript first
- ✅ Animaciones smooth incorporadas
- ✅ Mejor para listas largas (virtualización)

**Desventajas:**
- ❌ Relativamente nuevo (pero estable)
- ❌ Menos ejemplos en la web

**Dependencias:**
```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

**Recomendación:** **Opción C (@dnd-kit)** es la mejor opción por:
- Balance perfecto entre facilidad de uso y features
- Soporte móvil excelente (crítico para responsive)
- Accesibilidad integrada
- Tamaño pequeño
- Mantenimiento activo

---

## 🔧 Implementación con @dnd-kit

### Fase 1: Instalación y Setup (30 min)

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Tipos TypeScript:**
```typescript
// types/kpiOrdering.ts
import { UniqueIdentifier } from '@dnd-kit/core';

export type KPISortCriteria =
  | 'custom' | 'name-asc' | 'name-desc'
  | 'value-asc' | 'value-desc' | 'category'
  | 'trend' | 'priority';

export type KPIViewMode = 'grid' | 'list' | 'compact';

export interface KPIViewConfig {
  sortCriteria: KPISortCriteria;
  viewMode: KPIViewMode;
  customOrder: string[];
  pinnedKPIs: string[];
  collapsedCategories: string[];
}

export interface UserKPIPreferences {
  userId: string;
  role: UserRole;
  viewConfig: KPIViewConfig;
  favorites: string[];
  hidden: string[];
  lastModified: string;
}
```

---

### Fase 2: Store Zustand (1 hora)

```typescript
// store/kpiOrderingStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KPIViewConfig, UserKPIPreferences, KPISortCriteria, KPIViewMode } from '../types/kpiOrdering';
import type { UserRole } from '../types';

interface KPIOrderingStore {
  // Estado
  preferences: Map<string, UserKPIPreferences>;
  currentConfig: KPIViewConfig | null;
  isDragging: boolean;

  // Getters
  getUserPreferences: (userId: string, role: UserRole) => UserKPIPreferences;
  getCurrentConfig: (userId: string, role: UserRole) => KPIViewConfig;

  // Acciones - Orden
  setCustomOrder: (userId: string, role: UserRole, order: string[]) => void;
  reorderKPI: (userId: string, role: UserRole, fromIndex: number, toIndex: number) => void;
  resetOrder: (userId: string, role: UserRole) => void;

  // Acciones - Ordenamiento
  setSortCriteria: (userId: string, role: UserRole, criteria: KPISortCriteria) => void;
  applyAutoSort: (kpis: KPI[], criteria: KPISortCriteria) => KPI[];

  // Acciones - Vista
  setViewMode: (userId: string, role: UserRole, mode: KPIViewMode) => void;

  // Acciones - Favoritos y Ocultos
  toggleFavorite: (userId: string, role: UserRole, kpiId: string) => void;
  toggleHidden: (userId: string, role: UserRole, kpiId: string) => void;

  // Acciones - Pines
  pinKPI: (userId: string, role: UserRole, kpiId: string) => void;
  unpinKPI: (userId: string, role: UserRole, kpiId: string) => void;

  // Acciones - Drag state
  setIsDragging: (dragging: boolean) => void;
}

export const useKPIOrderingStore = create<KPIOrderingStore>()(
  persist(
    (set, get) => ({
      preferences: new Map(),
      currentConfig: null,
      isDragging: false,

      getUserPreferences: (userId, role) => {
        const key = `${userId}-${role}`;
        const existing = get().preferences.get(key);

        if (existing) return existing;

        // Default preferences
        const defaultPrefs: UserKPIPreferences = {
          userId,
          role,
          viewConfig: {
            sortCriteria: 'custom',
            viewMode: 'grid',
            customOrder: [],
            pinnedKPIs: [],
            collapsedCategories: [],
          },
          favorites: [],
          hidden: [],
          lastModified: new Date().toISOString(),
        };

        return defaultPrefs;
      },

      getCurrentConfig: (userId, role) => {
        const prefs = get().getUserPreferences(userId, role);
        return prefs.viewConfig;
      },

      setCustomOrder: (userId, role, order) => {
        const prefs = { ...get().getUserPreferences(userId, role) };
        prefs.viewConfig.customOrder = order;
        prefs.viewConfig.sortCriteria = 'custom';
        prefs.lastModified = new Date().toISOString();

        const newPreferences = new Map(get().preferences);
        newPreferences.set(`${userId}-${role}`, prefs);

        set({ preferences: newPreferences });
      },

      reorderKPI: (userId, role, fromIndex, toIndex) => {
        const prefs = { ...get().getUserPreferences(userId, role) };
        const order = [...prefs.viewConfig.customOrder];
        const [removed] = order.splice(fromIndex, 1);
        order.splice(toIndex, 0, removed);

        prefs.viewConfig.customOrder = order;
        prefs.viewConfig.sortCriteria = 'custom';
        prefs.lastModified = new Date().toISOString();

        const newPreferences = new Map(get().preferences);
        newPreferences.set(`${userId}-${role}`, prefs);

        set({ preferences: newPreferences });
      },

      resetOrder: (userId, role) => {
        const prefs = { ...get().getUserPreferences(userId, role) };
        prefs.viewConfig.customOrder = [];
        prefs.viewConfig.sortCriteria = 'category';
        prefs.lastModified = new Date().toISOString();

        const newPreferences = new Map(get().preferences);
        newPreferences.set(`${userId}-${role}`, prefs);

        set({ preferences: newPreferences });
      },

      setSortCriteria: (userId, role, criteria) => {
        const prefs = { ...get().getUserPreferences(userId, role) };
        prefs.viewConfig.sortCriteria = criteria;
        prefs.lastModified = new Date().toISOString();

        const newPreferences = new Map(get().preferences);
        newPreferences.set(`${userId}-${role}`, prefs);

        set({ preferences: newPreferences });
      },

      applyAutoSort: (kpis, criteria) => {
        const sorted = [...kpis];

        switch (criteria) {
          case 'name-asc':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));

          case 'name-desc':
            return sorted.sort((a, b) => b.name.localeCompare(a.name));

          case 'value-asc':
            return sorted.sort((a, b) => a.value - b.value);

          case 'value-desc':
            return sorted.sort((a, b) => b.value - a.value);

          case 'category':
            return sorted.sort((a, b) => a.category.localeCompare(b.category));

          case 'trend':
            const trendOrder = { positive: 0, negative: 1, stable: 2 };
            return sorted.sort((a, b) =>
              trendOrder[a.trend] - trendOrder[b.trend]
            );

          case 'custom':
          case 'priority':
          default:
            return sorted;
        }
      },

      setViewMode: (userId, role, mode) => {
        const prefs = { ...get().getUserPreferences(userId, role) };
        prefs.viewConfig.viewMode = mode;
        prefs.lastModified = new Date().toISOString();

        const newPreferences = new Map(get().preferences);
        newPreferences.set(`${userId}-${role}`, prefs);

        set({ preferences: newPreferences });
      },

      toggleFavorite: (userId, role, kpiId) => {
        const prefs = { ...get().getUserPreferences(userId, role) };
        const index = prefs.favorites.indexOf(kpiId);

        if (index > -1) {
          prefs.favorites.splice(index, 1);
        } else {
          prefs.favorites.push(kpiId);
        }

        prefs.lastModified = new Date().toISOString();

        const newPreferences = new Map(get().preferences);
        newPreferences.set(`${userId}-${role}`, prefs);

        set({ preferences: newPreferences });
      },

      toggleHidden: (userId, role, kpiId) => {
        const prefs = { ...get().getUserPreferences(userId, role) };
        const index = prefs.hidden.indexOf(kpiId);

        if (index > -1) {
          prefs.hidden.splice(index, 1);
        } else {
          prefs.hidden.push(kpiId);
        }

        prefs.lastModified = new Date().toISOString();

        const newPreferences = new Map(get().preferences);
        newPreferences.set(`${userId}-${role}`, prefs);

        set({ preferences: newPreferences });
      },

      pinKPI: (userId, role, kpiId) => {
        const prefs = { ...get().getUserPreferences(userId, role) };

        if (!prefs.viewConfig.pinnedKPIs.includes(kpiId)) {
          prefs.viewConfig.pinnedKPIs.push(kpiId);
          prefs.lastModified = new Date().toISOString();

          const newPreferences = new Map(get().preferences);
          newPreferences.set(`${userId}-${role}`, prefs);

          set({ preferences: newPreferences });
        }
      },

      unpinKPI: (userId, role, kpiId) => {
        const prefs = { ...get().getUserPreferences(userId, role) };
        const index = prefs.viewConfig.pinnedKPIs.indexOf(kpiId);

        if (index > -1) {
          prefs.viewConfig.pinnedKPIs.splice(index, 1);
          prefs.lastModified = new Date().toISOString();

          const newPreferences = new Map(get().preferences);
          newPreferences.set(`${userId}-${role}`, prefs);

          set({ preferences: newPreferences });
        }
      },

      setIsDragging: (dragging) => set({ isDragging: dragging }),
    }),
    {
      name: 'kpi-ordering-storage',
      version: 1,
    }
  )
);
```

---

### Fase 3: Componentes UI (3-4 horas)

#### 3.1 KPIOrderingToolbar

```typescript
// components/kpi/KPIOrderingToolbar.tsx
import { FC } from 'react';
import type { KPISortCriteria, KPIViewMode } from '../../types/kpiOrdering';

interface KPIOrderingToolbarProps {
  sortCriteria: KPISortCriteria;
  viewMode: KPIViewMode;
  onSortChange: (criteria: KPISortCriteria) => void;
  onViewModeChange: (mode: KPIViewMode) => void;
  onResetOrder: () => void;
  totalKPIs: number;
  visibleKPIs: number;
}

const KPIOrderingToolbar: FC<KPIOrderingToolbarProps> = ({
  sortCriteria,
  viewMode,
  onSortChange,
  onViewModeChange,
  onResetOrder,
  totalKPIs,
  visibleKPIs,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Ordenar:
          </span>
          <select
            value={sortCriteria}
            onChange={(e) => onSortChange(e.target.value as KPISortCriteria)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="custom">Personalizado</option>
            <option value="name-asc">Nombre (A-Z)</option>
            <option value="name-desc">Nombre (Z-A)</option>
            <option value="value-asc">Valor (Menor a Mayor)</option>
            <option value="value-desc">Valor (Mayor a Menor)</option>
            <option value="category">Por Categoría</option>
            <option value="trend">Por Tendencia</option>
          </select>

          {sortCriteria === 'custom' && (
            <button
              onClick={onResetOrder}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Restaurar orden predeterminado"
            >
              ↺ Restaurar
            </button>
          )}
        </div>

        {/* Center: KPI Count */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {visibleKPIs} de {totalKPIs} KPIs
        </div>

        {/* Right: View Mode */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Vista:
          </span>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 text-primary shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              title="Vista de cuadrícula"
            >
              ▦ Grid
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-primary shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              title="Vista de lista"
            >
              ☰ Lista
            </button>
            <button
              onClick={() => onViewModeChange('compact')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'compact'
                  ? 'bg-white dark:bg-gray-600 text-primary shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
              title="Vista compacta"
            >
              ≡ Compacta
            </button>
          </div>
        </div>
      </div>

      {/* Hint for drag and drop */}
      {sortCriteria === 'custom' && (
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <span>💡</span>
          <span>Arrastra las tarjetas para reordenarlas según tu preferencia</span>
        </div>
      )}
    </div>
  );
};

export default KPIOrderingToolbar;
```

#### 3.2 SortableKPICard (Wrapper con DnD)

```typescript
// components/kpi/SortableKPICard.tsx
import { FC } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import KPICard from './KPICard';
import type { KPI } from '../../types';

interface SortableKPICardProps {
  kpi: KPI;
  onClick?: (kpi: KPI) => void;
  isPinned?: boolean;
  isFavorite?: boolean;
  onTogglePin?: (kpiId: string) => void;
  onToggleFavorite?: (kpiId: string) => void;
}

const SortableKPICard: FC<SortableKPICardProps> = ({
  kpi,
  onClick,
  isPinned,
  isFavorite,
  onTogglePin,
  onToggleFavorite,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: kpi.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative"
    >
      {/* Badges */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        {isPinned && (
          <span
            className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full shadow"
            title="KPI fijado"
          >
            📌
          </span>
        )}
        {isFavorite && (
          <span
            className="bg-red-400 text-white text-xs px-2 py-1 rounded-full shadow"
            title="Favorito"
          >
            ⭐
          </span>
        )}
      </div>

      {/* KPI Card */}
      <KPICard kpi={kpi} onClick={onClick} />

      {/* Action Buttons (shown on hover) */}
      <div className="absolute bottom-2 right-2 z-10 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
        {onTogglePin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(kpi.id);
            }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 p-1 rounded shadow hover:bg-gray-100 dark:hover:bg-gray-700"
            title={isPinned ? 'Desfijar' : 'Fijar al inicio'}
          >
            {isPinned ? '📌' : '📍'}
          </button>
        )}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(kpi.id);
            }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 p-1 rounded shadow hover:bg-gray-100 dark:hover:bg-gray-700"
            title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            {isFavorite ? '⭐' : '☆'}
          </button>
        )}
      </div>
    </div>
  );
};

export default SortableKPICard;
```

#### 3.3 SortableKPIGrid (Contenedor Principal)

```typescript
// components/kpi/SortableKPIGrid.tsx
import { FC, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import SortableKPICard from './SortableKPICard';
import type { KPI } from '../../types';
import type { KPIViewMode } from '../../types/kpiOrdering';

interface SortableKPIGridProps {
  kpis: KPI[];
  viewMode: KPIViewMode;
  pinnedKPIs: string[];
  favorites: string[];
  onReorder: (kpis: KPI[]) => void;
  onKPIClick?: (kpi: KPI) => void;
  onTogglePin?: (kpiId: string) => void;
  onToggleFavorite?: (kpiId: string) => void;
}

const SortableKPIGrid: FC<SortableKPIGridProps> = ({
  kpis,
  viewMode,
  pinnedKPIs,
  favorites,
  onReorder,
  onKPIClick,
  onTogglePin,
  onToggleFavorite,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Separar KPIs fijados y normales
  const { pinnedItems, regularItems } = useMemo(() => {
    const pinned = kpis.filter((kpi) => pinnedKPIs.includes(kpi.id));
    const regular = kpis.filter((kpi) => !pinnedKPIs.includes(kpi.id));
    return { pinnedItems: pinned, regularItems: regular };
  }, [kpis, pinnedKPIs]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = kpis.findIndex((kpi) => kpi.id === active.id);
      const newIndex = kpis.findIndex((kpi) => kpi.id === over.id);

      const reordered = arrayMove(kpis, oldIndex, newIndex);
      onReorder(reordered);
    }
  };

  const gridClass = {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
    list: 'flex flex-col gap-3',
    compact: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2',
  }[viewMode];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {/* Pinned KPIs Section */}
      {pinnedItems.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            📌 KPIs Fijados
          </h3>
          <SortableContext items={pinnedItems.map((k) => k.id)} strategy={rectSortingStrategy}>
            <div className={gridClass}>
              {pinnedItems.map((kpi) => (
                <SortableKPICard
                  key={kpi.id}
                  kpi={kpi}
                  onClick={onKPIClick}
                  isPinned={true}
                  isFavorite={favorites.includes(kpi.id)}
                  onTogglePin={onTogglePin}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}

      {/* Regular KPIs Section */}
      <SortableContext items={regularItems.map((k) => k.id)} strategy={rectSortingStrategy}>
        <div className={gridClass}>
          {regularItems.map((kpi) => (
            <SortableKPICard
              key={kpi.id}
              kpi={kpi}
              onClick={onKPIClick}
              isPinned={false}
              isFavorite={favorites.includes(kpi.id)}
              onTogglePin={onTogglePin}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SortableKPIGrid;
```

---

### Fase 4: Integración en DashboardPage (1-2 horas)

```typescript
// En DashboardPage.tsx
import { useMemo } from 'react';
import useAuthStore from '../store/authStore';
import useKPIStore from '../store/kpiStore';
import { useKPIOrderingStore } from '../store/kpiOrderingStore';
import KPIOrderingToolbar from '../components/kpi/KPIOrderingToolbar';
import SortableKPIGrid from '../components/kpi/SortableKPIGrid';

function DashboardPage() {
  const { user } = useAuthStore();
  const { kpis } = useKPIStore();
  const {
    getCurrentConfig,
    getUserPreferences,
    setCustomOrder,
    setSortCriteria,
    setViewMode,
    resetOrder,
    applyAutoSort,
    toggleFavorite,
    pinKPI,
    unpinKPI,
  } = useKPIOrderingStore();

  if (!user) return null;

  const config = getCurrentConfig(user.username, user.role);
  const prefs = getUserPreferences(user.username, user.role);

  // Ordenar KPIs según configuración
  const orderedKPIs = useMemo(() => {
    let filtered = kpis; // Aplicar filtros existentes aquí

    // Aplicar auto-sort si no es custom
    if (config.sortCriteria !== 'custom') {
      return applyAutoSort(filtered, config.sortCriteria);
    }

    // Aplicar orden personalizado
    if (config.customOrder.length > 0) {
      const orderMap = new Map(config.customOrder.map((id, idx) => [id, idx]));
      return [...filtered].sort((a, b) => {
        const aIndex = orderMap.get(a.id) ?? Infinity;
        const bIndex = orderMap.get(b.id) ?? Infinity;
        return aIndex - bIndex;
      });
    }

    return filtered;
  }, [kpis, config, applyAutoSort]);

  const handleReorder = (reordered: KPI[]) => {
    const newOrder = reordered.map((kpi) => kpi.id);
    setCustomOrder(user.username, user.role, newOrder);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ... header ... */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar de Ordenamiento */}
        <KPIOrderingToolbar
          sortCriteria={config.sortCriteria}
          viewMode={config.viewMode}
          onSortChange={(criteria) => setSortCriteria(user.username, user.role, criteria)}
          onViewModeChange={(mode) => setViewMode(user.username, user.role, mode)}
          onResetOrder={() => resetOrder(user.username, user.role)}
          totalKPIs={kpis.length}
          visibleKPIs={orderedKPIs.length}
        />

        {/* Grid de KPIs con Drag & Drop */}
        <SortableKPIGrid
          kpis={orderedKPIs}
          viewMode={config.viewMode}
          pinnedKPIs={config.pinnedKPIs}
          favorites={prefs.favorites}
          onReorder={handleReorder}
          onKPIClick={(kpi) => console.log('KPI clicked:', kpi)}
          onTogglePin={(kpiId) => {
            if (config.pinnedKPIs.includes(kpiId)) {
              unpinKPI(user.username, user.role, kpiId);
            } else {
              pinKPI(user.username, user.role, kpiId);
            }
          }}
          onToggleFavorite={(kpiId) => toggleFavorite(user.username, user.role, kpiId)}
        />
      </main>
    </div>
  );
}
```

---

## 📱 Consideraciones de Diseño

### Responsive Design

- **Mobile (< 640px)**:
  - 1 columna
  - Drag con touch gestures
  - Toolbar en modo vertical

- **Tablet (640px - 1024px)**:
  - 2 columnas
  - Toolbar horizontal compacto

- **Desktop (> 1024px)**:
  - 3-4 columnas según vista
  - Toolbar horizontal completo

### Modo Oscuro

Todos los componentes nuevos deben incluir:
```css
bg-white dark:bg-gray-800
text-gray-900 dark:text-gray-100
border-gray-200 dark:border-gray-700
```

### Accesibilidad

- ✅ Drag & drop con teclado (@dnd-kit lo incluye)
- ✅ ARIA labels en todos los botones
- ✅ Focus visible en elementos interactivos
- ✅ Anuncios de screen reader para cambios de orden

---

## 🚀 Estimación de Tiempo

| Fase | Tarea | Tiempo Estimado | Complejidad |
|------|-------|-----------------|-------------|
| 1 | Instalación y tipos | 30 min | Baja |
| 2 | Store Zustand | 1 hora | Media |
| 3 | Componentes UI | 3-4 horas | Alta |
| 4 | Integración Dashboard | 1-2 horas | Media |
| 5 | Testing y pulido | 1-2 horas | Media |
| **TOTAL** | | **6-9 horas** | **Media-Alta** |

---

## 📦 Dependencias Necesarias

```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

**Tamaño total**: ~15-20KB gzipped

---

## ✅ Checklist de Implementación

- [ ] Instalar dependencias (@dnd-kit)
- [ ] Crear tipos TypeScript (kpiOrdering.ts)
- [ ] Implementar kpiOrderingStore.ts
- [ ] Crear KPIOrderingToolbar component
- [ ] Crear SortableKPICard component
- [ ] Crear SortableKPIGrid component
- [ ] Integrar en DashboardPage
- [ ] Agregar modo oscuro a nuevos componentes
- [ ] Testing de drag & drop (desktop y móvil)
- [ ] Testing de persistencia
- [ ] Validar responsive design
- [ ] Validar accesibilidad (keyboard navigation)
- [ ] Documentar uso en README

---

## 🎯 Features Adicionales (Futuro)

### v1.1 - Filtros en Toolbar
- Filtro rápido por categoría desde toolbar
- Búsqueda rápida de KPIs
- Toggle "Mostrar solo favoritos"
- Toggle "Ocultar KPIs"

### v1.2 - Presets de Vista
- Guardar vistas personalizadas con nombre
- Cargar presets predefinidos
- Compartir configuraciones entre usuarios

### v1.3 - Comparación Avanzada
- Comparar KPIs lado a lado en vista lista
- Gráficas de comparación inline
- Exportar vista personalizada

---

## 📝 Notas Finales

Este plan proporciona una implementación completa del sistema de reordenación de KPIs con:

- ✅ **Drag & Drop** fluido en desktop y móvil
- ✅ **Múltiples opciones de ordenamiento** automático
- ✅ **Vistas personalizables** (grid/lista/compacta)
- ✅ **Persistencia** de preferencias por usuario y rol
- ✅ **Favoritos y pines** para destacar KPIs importantes
- ✅ **Accesibilidad** incorporada (keyboard + screen readers)
- ✅ **Responsive design** completo
- ✅ **Modo oscuro** integrado

La implementación con **@dnd-kit** garantiza una experiencia de usuario moderna y performante, con soporte completo para dispositivos táctiles y navegación por teclado.
