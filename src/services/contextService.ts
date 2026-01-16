/**
 * Context Service - Inyecta datos reales del sistema en el chat
 */

import useAuthStore from '../store/authStore';
import useKPIStore from '../store/kpiStore';
import useMapStore from '../store/mapStore';
import useCapacityStore from '../store/capacityStore';
import { ChatContext } from '../types/chat';

/**
 * Obtiene el contexto actual del sistema para inyectar en el chat
 */
export const getChatContext = (): ChatContext => {
  // Obtener datos de los stores
  const authState = useAuthStore.getState();
  const kpiState = useKPIStore.getState();
  const mapState = useMapStore.getState();
  const capacityState = useCapacityStore.getState();

  // Seleccionar los KPIs más relevantes (primeros 15)
  const topKPIs = (kpiState.kpis || []).slice(0, 15).map((kpi) => ({
    name: kpi.name,
    value: kpi.currentValue,
    unit: kpi.unit,
    category: kpi.category,
  }));

  // Seleccionar centros más relevantes (primeros 10)
  const topCenters = (mapState.centers || []).slice(0, 10).map((center) => ({
    name: center.name,
    city: center.city,
    type: center.type,
    hasEmergency: center.emergencyService || false,
  }));

  // Calcular métricas de capacidad hospitalaria
  const bedCapacity = capacityState.bedCapacity || [];
  const alerts = capacityState.alerts || [];

  const totalBeds = bedCapacity.reduce((sum, r) => sum + r.camasTotales, 0);
  const occupiedBeds = bedCapacity.reduce((sum, r) => sum + r.camasOcupadas, 0);
  const availableBeds = bedCapacity.reduce((sum, r) => sum + r.camasDisponibles, 0);
  const averageOccupancy = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;
  const activeAlerts = alerts.filter((a) => !a.resuelta).length;
  const criticalAlerts = alerts.filter((a) => a.nivel === 'rojo' && !a.resuelta).length;

  // Agrupar por hospital y seleccionar los más críticos
  const hospitalMap = new Map<
    string,
    { occupancy: number; alertLevel: string; availableBeds: number; plant: string }
  >();
  bedCapacity.forEach((record) => {
    const existing = hospitalMap.get(record.hospital);
    if (!existing || record.porcentajeOcupacion > existing.occupancy) {
      hospitalMap.set(record.hospital, {
        occupancy: record.porcentajeOcupacion,
        alertLevel: record.alertaCapacidad,
        availableBeds: record.camasDisponibles,
        plant: record.planta,
      });
    }
  });

  const topHospitals = Array.from(hospitalMap.entries())
    .sort((a, b) => b[1].occupancy - a[1].occupancy)
    .slice(0, 8)
    .map(([name, data]) => ({
      name,
      plant: data.plant,
      occupancy: data.occupancy,
      alertLevel: data.alertLevel,
      availableBeds: data.availableBeds,
    }));

  const context: ChatContext = {
    user: {
      name: authState.user?.name || 'Usuario',
      role: authState.user?.role || 'invitado',
    },
    kpis: {
      total: kpiState.stats?.total || 0,
      categories: kpiState.stats?.byCategory ? Object.keys(kpiState.stats.byCategory) : [],
      topKPIs,
    },
    centers: {
      total: mapState.stats?.total || 0,
      withEmergency: mapState.stats?.withEmergency || 0,
      cities: mapState.stats?.zones || [],
      byType: mapState.stats?.byType || {},
      topCenters,
    },
    capacity:
      totalBeds > 0
        ? {
            totalBeds,
            occupiedBeds,
            availableBeds,
            averageOccupancy,
            activeAlerts,
            criticalAlerts,
            hospitals: topHospitals,
          }
        : undefined,
  };

  return context;
};

/**
 * Genera el system prompt con contexto del sistema sanitario andaluz
 */
export const generateSystemPrompt = (context: ChatContext): string => {
  // Formatear KPIs para el prompt
  const kpisText =
    context.kpis.topKPIs.length > 0
      ? context.kpis.topKPIs
          .map((kpi) => `  - ${kpi.name}: ${kpi.value} ${kpi.unit} (${kpi.category})`)
          .join('\n')
      : '  (No hay KPIs cargados en el sistema)';

  // Formatear centros para el prompt
  const centersText =
    context.centers.topCenters.length > 0
      ? context.centers.topCenters
          .map(
            (center) =>
              `  - ${center.name} en ${center.city} (${center.type})${center.hasEmergency ? ' ⚡ Con urgencias' : ''}`
          )
          .join('\n')
      : '  (No hay centros cargados en el sistema)';

  // Formatear tipos de centros
  const centersByType =
    Object.entries(context.centers.byType)
      .map(([type, count]) => `${count} ${type}`)
      .join(', ') || 'No disponible';

  // Formatear datos de capacidad hospitalaria
  const capacitySection = context.capacity
    ? `
═══════════════════════════════════════════════════════════════
🛏️ CAPACIDAD HOSPITALARIA EN TIEMPO REAL
═══════════════════════════════════════════════════════════════

MÉTRICAS GLOBALES:
  - Total de camas: ${context.capacity.totalBeds}
  - Camas ocupadas: ${context.capacity.occupiedBeds}
  - Camas disponibles: ${context.capacity.availableBeds}
  - Ocupación promedio: ${context.capacity.averageOccupancy.toFixed(1)}%

ALERTAS DE CAPACIDAD:
  - Alertas activas: ${context.capacity.activeAlerts}
  - Alertas críticas (nivel rojo): ${context.capacity.criticalAlerts}

ESTADO POR HOSPITAL (ordenados por ocupación):
${
  context.capacity.hospitals.length > 0
    ? context.capacity.hospitals
        .map(
          (h) =>
            `  - ${h.name} (${h.plant}): ${h.occupancy.toFixed(1)}% ocupación ${h.alertLevel === 'rojo' ? '🔴 CRÍTICO' : h.alertLevel === 'amarillo' ? '🟡 ALERTA' : '🟢 OK'} - ${h.availableBeds} camas libres`
        )
        .join('\n')
    : '  (No hay datos de hospitales disponibles)'
}
`
    : '';

  return `Eres el Copilot Salud Andalucía, asistente oficial del sistema sanitario de Andalucía, España.

INFORMACIÓN DEL USUARIO:
- Nombre: ${context.user.name}
- Rol: ${context.user.role}

═══════════════════════════════════════════════════════════════
📊 KPIS DE SALUD DISPONIBLES (${context.kpis.total} totales)
═══════════════════════════════════════════════════════════════

Categorías: ${context.kpis.categories.join(', ') || 'No disponible'}

KPIS PRINCIPALES QUE PUEDES CONSULTAR:
${kpisText}

═══════════════════════════════════════════════════════════════
🏥 CENTROS DE SALUD DISPONIBLES (${context.centers.total} totales)
═══════════════════════════════════════════════════════════════

Distribución: ${centersByType}
Centros con urgencias: ${context.centers.withEmergency}
Zonas cubiertas: ${context.centers.cities.slice(0, 8).join(', ')}${context.centers.cities.length > 8 ? '...' : ''}

CENTROS PRINCIPALES:
${centersText}
${capacitySection}
═══════════════════════════════════════════════════════════════
✅ CAPACIDADES QUE TIENES
═══════════════════════════════════════════════════════════════
1. Consultar KPIs específicos con sus valores exactos
2. Informar sobre centros de salud, hospitales y clínicas
3. Proporcionar datos de urgencias y servicios disponibles
4. Analizar tendencias sanitarias de la provincia
5. Responder preguntas sobre ubicaciones y zonas cubiertas
6. Orientar a usuarios según su rol en el sistema
7. ${context.capacity ? 'Informar sobre capacidad hospitalaria, ocupación de camas y alertas' : 'Capacidad hospitalaria: datos no disponibles para tu rol'}

═══════════════════════════════════════════════════════════════
📋 INSTRUCCIONES CRÍTICAS
═══════════════════════════════════════════════════════════════
1. USA SIEMPRE los datos reales listados arriba - NO inventes números
2. Si un usuario pregunta por un KPI que está en la lista, proporciona su valor exacto
3. Si preguntan por centros que están en la lista, menciónalos específicamente
4. Cuando hables de cantidades, usa los totales: ${context.centers.total} centros, ${context.kpis.total} KPIs${context.capacity ? `, ${context.capacity.totalBeds} camas` : ''}
5. Si preguntan por datos que NO están en la lista, di claramente que no tienes esa información específica
6. Sé conciso pero preciso (máximo 3-4 párrafos)
7. Usa emojis ocasionalmente: 📊 (datos), 🏥 (centros), 📍 (ubicación), ⚡ (urgencias), 🛏️ (camas)
8. Responde SIEMPRE en español
9. ${context.capacity ? 'Para consultas de capacidad, menciona siempre el nivel de alerta (🟢 verde, 🟡 amarillo, 🔴 rojo)' : ''}

EJEMPLOS DE RESPUESTAS CORRECTAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❓ Pregunta: "¿Cuántos centros hay con urgencias?"
✅ Respuesta: "En la provincia de Málaga hay **${context.centers.withEmergency} centros de salud con servicio de urgencias** de un total de ${context.centers.total} centros registrados en el sistema."

❓ Pregunta: "¿Cuál es la población total?"
✅ Respuesta: "Según los KPIs disponibles, ${context.kpis.topKPIs.find((k) => k.name.toLowerCase().includes('población'))?.value || '[buscar en la lista]'} ${context.kpis.topKPIs.find((k) => k.name.toLowerCase().includes('población'))?.unit || 'habitantes'}."

❓ Pregunta: "¿Qué centros hay en Málaga capital?"
✅ Respuesta: "En Málaga capital encontramos: ${context.centers.topCenters
    .filter((c) => c.city.toLowerCase().includes('málaga'))
    .slice(0, 3)
    .map((c) => c.name)
    .join(', ')}. Puedes consultar el mapa interactivo para ver todos los centros disponibles."
${
  context.capacity
    ? `
❓ Pregunta: "¿Cómo está la ocupación hospitalaria?"
✅ Respuesta: "La ocupación promedio actual es del **${context.capacity.averageOccupancy.toFixed(1)}%**. Hay ${context.capacity.availableBeds} camas disponibles de ${context.capacity.totalBeds} totales. ${context.capacity.criticalAlerts > 0 ? `⚠️ Hay ${context.capacity.criticalAlerts} alertas críticas activas.` : '✅ No hay alertas críticas.'}"

❓ Pregunta: "¿Qué hospitales tienen más presión?"
✅ Respuesta: "Los hospitales con mayor ocupación son: ${context.capacity.hospitals
        .slice(0, 3)
        .map((h) => `${h.name} (${h.occupancy.toFixed(0)}%)`)
        .join(', ')}."
`
    : ''
}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ IMPORTANTE: Eres un asistente de información sanitaria, NO un médico. No des diagnósticos ni consejos médicos personalizados. Para emergencias, recomienda llamar al 112 o acudir al centro con urgencias más cercano.`;
};

/**
 * Logs de debug para el contexto (solo en desarrollo)
 */
export const logChatContext = (context: ChatContext): void => {
  if (import.meta.env.DEV) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 [ContextService] Chat Context Generated');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  👤 User:', context.user.name, `(${context.user.role})`);
    console.log(
      '  📊 KPIs Total:',
      context.kpis.total,
      context.kpis.total === 0 ? '⚠️ (No hay datos cargados)' : '✅'
    );
    console.log('  📊 KPIs en contexto:', context.kpis.topKPIs.length);
    console.log(
      '  🏥 Centers Total:',
      context.centers.total,
      context.centers.total === 0 ? '⚠️ (No hay datos cargados)' : '✅'
    );
    console.log('  🏥 Centers en contexto:', context.centers.topCenters.length);
    console.log('  🚑 Emergency Centers:', context.centers.withEmergency);

    // Mostrar datos de capacidad hospitalaria
    if (context.capacity) {
      console.log('\n  🛏️ Capacidad Hospitalaria:');
      console.log(`     - Total camas: ${context.capacity.totalBeds}`);
      console.log(`     - Ocupación: ${context.capacity.averageOccupancy.toFixed(1)}%`);
      console.log(`     - Camas disponibles: ${context.capacity.availableBeds}`);
      console.log(`     - Alertas activas: ${context.capacity.activeAlerts}`);
      console.log(`     - Alertas críticas: ${context.capacity.criticalAlerts}`);
      console.log(`     - Hospitales en contexto: ${context.capacity.hospitals.length}`);
    } else {
      console.log('  🛏️ Capacidad: No disponible (rol sin permisos o datos no cargados)');
    }

    // Mostrar algunos KPIs de ejemplo
    if (context.kpis.topKPIs.length > 0) {
      console.log('\n  📋 Ejemplos de KPIs disponibles:');
      context.kpis.topKPIs.slice(0, 3).forEach((kpi) => {
        console.log(`     - ${kpi.name}: ${kpi.value} ${kpi.unit}`);
      });
    }

    // Mostrar algunos centros de ejemplo
    if (context.centers.topCenters.length > 0) {
      console.log('\n  🏥 Ejemplos de centros disponibles:');
      context.centers.topCenters.slice(0, 3).forEach((center) => {
        console.log(`     - ${center.name} (${center.city})`);
      });
    }

    // Mostrar hospitales con mayor ocupación
    if (context.capacity?.hospitals && context.capacity.hospitals.length > 0) {
      console.log('\n  🏨 Hospitales con mayor ocupación:');
      context.capacity.hospitals.slice(0, 3).forEach((hospital) => {
        const alertIcon =
          hospital.alertLevel === 'rojo' ? '🔴' : hospital.alertLevel === 'amarillo' ? '🟡' : '🟢';
        console.log(`     ${alertIcon} ${hospital.name}: ${hospital.occupancy.toFixed(1)}%`);
      });
    }

    // Advertencia si no hay datos
    if (context.kpis.total === 0 || context.centers.total === 0) {
      console.warn('\n⚠️ [ContextService] ADVERTENCIA: Algunos datos del contexto están en 0.');
      console.warn('   Esto puede significar que los stores no han cargado datos aún.');
      console.warn('   Asegúrate de llamar loadKPIs() y loadCenters() antes de usar el chat.');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
};
