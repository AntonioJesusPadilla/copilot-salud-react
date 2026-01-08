import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { KPI } from '../types/kpi';
import { HealthCenter } from '../types/map';
import { format } from 'date-fns';

/**
 * Servicio de Exportación de Datos
 * Subsistema 11: Sistema de Exportación
 *
 * Funcionalidades:
 * - Exportar dashboard completo a PDF
 * - Exportar KPIs a CSV/Excel
 * - Exportar centros de salud a CSV/Excel
 * - Exportar elementos DOM a PNG/PDF
 */

// ============================================================================
// 1. EXPORTACIÓN A PDF
// ============================================================================

/**
 * Exporta un elemento HTML a PDF
 * @param elementId - ID del elemento HTML a exportar
 * @param fileName - Nombre del archivo PDF (sin extensión)
 * @param options - Opciones de configuración
 */
export const exportElementToPDF = async (
  elementId: string,
  fileName: string = 'documento',
  options: {
    orientation?: 'portrait' | 'landscape';
    quality?: number;
    scale?: number;
  } = {}
): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Elemento con ID "${elementId}" no encontrado`);
    }

    // Configuración
    const {
      orientation = 'portrait',
      quality = 0.95,
      scale = 2
    } = options;

    // Capturar el elemento como canvas
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Obtener dimensiones
    const imgWidth = orientation === 'portrait' ? 210 : 297; // A4 en mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Crear PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/png', quality);

    // Si la imagen es muy alta, dividir en páginas
    const pageHeight = orientation === 'portrait' ? 297 : 210;
    let heightLeft = imgHeight;
    let position = 0;

    // Primera página
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Páginas adicionales si es necesario
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Guardar
    pdf.save(`${fileName}.pdf`);
    console.log(`✅ PDF exportado: ${fileName}.pdf`);
  } catch (error) {
    console.error('❌ Error al exportar PDF:', error);
    throw error;
  }
};

/**
 * Exporta el dashboard completo a PDF
 */
export const exportDashboardToPDF = async (userName: string): Promise<void> => {
  const timestamp = format(new Date(), 'dd-MM-yyyy_HH-mm');
  const fileName = `Dashboard_${userName}_${timestamp}`;

  await exportElementToPDF('dashboard-content', fileName, {
    orientation: 'portrait',
    quality: 0.95,
    scale: 2
  });
};

// ============================================================================
// 2. EXPORTACIÓN A PNG
// ============================================================================

/**
 * Exporta un elemento HTML a PNG
 * @param elementId - ID del elemento HTML a exportar
 * @param fileName - Nombre del archivo PNG (sin extensión)
 */
export const exportElementToPNG = async (
  elementId: string,
  fileName: string = 'imagen'
): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Elemento con ID "${elementId}" no encontrado`);
    }

    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Convertir a blob y descargar
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.png`;
        link.click();
        URL.revokeObjectURL(url);
        console.log(`✅ PNG exportado: ${fileName}.png`);
      }
    }, 'image/png', 1.0);
  } catch (error) {
    console.error('❌ Error al exportar PNG:', error);
    throw error;
  }
};

// ============================================================================
// 3. EXPORTACIÓN DE KPIs A CSV/EXCEL
// ============================================================================

/**
 * Exporta KPIs a formato CSV
 * @param kpis - Array de KPIs a exportar
 * @param fileName - Nombre del archivo (sin extensión)
 */
export const exportKPIsToCSV = (
  kpis: KPI[],
  fileName: string = 'KPIs_Salud_Andalucia'
): void => {
  try {
    // Preparar datos
    const data = kpis.map(kpi => ({
      'ID': kpi.id,
      'Nombre': kpi.name,
      'Descripción': kpi.description,
      'Valor': kpi.currentValue,
      'Unidad': kpi.unit,
      'Tendencia': kpi.trend === 'up' ? '↑ Subiendo' :
                   kpi.trend === 'down' ? '↓ Bajando' : '→ Estable',
      'Cambio (%)': kpi.changePercentage ? `${kpi.changePercentage > 0 ? '+' : ''}${kpi.changePercentage}%` : 'N/A',
      'Categoría': kpi.category || 'General',
      'Fecha': kpi.lastUpdated
    }));

    // Crear worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 10 },  // ID
      { wch: 40 },  // Nombre
      { wch: 60 },  // Descripción
      { wch: 12 },  // Valor
      { wch: 15 },  // Unidad
      { wch: 15 },  // Tendencia
      { wch: 12 },  // Cambio
      { wch: 20 },  // Categoría
      { wch: 12 }   // Fecha
    ];
    ws['!cols'] = colWidths;

    // Crear workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'KPIs');

    // Exportar
    const timestamp = format(new Date(), 'dd-MM-yyyy_HH-mm');
    XLSX.writeFile(wb, `${fileName}_${timestamp}.csv`);
    console.log(`✅ CSV exportado: ${fileName}_${timestamp}.csv`);
  } catch (error) {
    console.error('❌ Error al exportar CSV:', error);
    throw error;
  }
};

/**
 * Exporta KPIs a formato Excel (XLSX)
 * @param kpis - Array de KPIs a exportar
 * @param fileName - Nombre del archivo (sin extensión)
 */
export const exportKPIsToExcel = (
  kpis: KPI[],
  fileName: string = 'KPIs_Salud_Andalucia'
): void => {
  try {
    // Preparar datos con formato mejorado
    const data = kpis.map(kpi => ({
      'ID': kpi.id,
      'Nombre': kpi.name,
      'Descripción': kpi.description,
      'Valor': kpi.currentValue,
      'Unidad': kpi.unit,
      'Tendencia': kpi.trend === 'up' ? '↑ Subiendo' :
                   kpi.trend === 'down' ? '↓ Bajando' : '→ Estable',
      'Cambio (%)': kpi.changePercentage || 0,
      'Categoría': kpi.category || 'General',
      'Fecha': kpi.lastUpdated
    }));

    // Crear worksheet con estilos
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 10 },  // ID
      { wch: 45 },  // Nombre
      { wch: 65 },  // Descripción
      { wch: 12 },  // Valor
      { wch: 18 },  // Unidad
      { wch: 15 },  // Tendencia
      { wch: 12 },  // Cambio
      { wch: 25 },  // Categoría
      { wch: 18 }   // Fecha
    ];

    // Crear workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'KPIs de Salud');

    // Agregar metadata
    wb.Props = {
      Title: 'KPIs de Salud - Andalucía',
      Subject: 'Indicadores de Salud',
      Author: 'Copilot Salud Andalucía',
      CreatedDate: new Date()
    };

    // Exportar
    const timestamp = format(new Date(), 'dd-MM-yyyy_HH-mm');
    XLSX.writeFile(wb, `${fileName}_${timestamp}.xlsx`);
    console.log(`✅ Excel exportado: ${fileName}_${timestamp}.xlsx`);
  } catch (error) {
    console.error('❌ Error al exportar Excel:', error);
    throw error;
  }
};

// ============================================================================
// 4. EXPORTACIÓN DE CENTROS DE SALUD A CSV/EXCEL
// ============================================================================

/**
 * Exporta centros de salud a formato CSV
 * @param centros - Array de centros de salud a exportar
 * @param fileName - Nombre del archivo (sin extensión)
 */
export const exportCentrosToCSV = (
  centros: HealthCenter[],
  fileName: string = 'Centros_Salud_Andalucia'
): void => {
  try {
    // Preparar datos
    const data = centros.map(centro => ({
      'ID': centro.id,
      'Nombre': centro.name,
      'Tipo': centro.type === 'hospital' ? 'Hospital' :
              centro.type === 'centro_salud' ? 'Centro de Salud' :
              centro.type === 'consultorio' ? 'Consultorio' :
              centro.type === 'urgencias' ? 'Urgencias' :
              centro.type === 'farmacia' ? 'Farmacia' : 'Laboratorio',
      'Ciudad': centro.city,
      'Dirección': centro.address,
      'Código Postal': centro.postalCode,
      'Teléfono': centro.phone || 'No disponible',
      'Email': centro.email || 'No disponible',
      'Servicios': centro.services?.join(', ') || 'No especificado',
      'Latitud': centro.coordinates.lat,
      'Longitud': centro.coordinates.lng
    }));

    // Crear worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 8 },   // ID
      { wch: 45 },  // Nombre
      { wch: 18 },  // Tipo
      { wch: 15 },  // Ciudad
      { wch: 50 },  // Dirección
      { wch: 15 },  // Código Postal
      { wch: 18 },  // Teléfono
      { wch: 30 },  // Email
      { wch: 60 },  // Servicios
      { wch: 12 },  // Latitud
      { wch: 12 }   // Longitud
    ];

    // Crear workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Centros');

    // Exportar
    const timestamp = format(new Date(), 'dd-MM-yyyy_HH-mm');
    XLSX.writeFile(wb, `${fileName}_${timestamp}.csv`);
    console.log(`✅ CSV exportado: ${fileName}_${timestamp}.csv`);
  } catch (error) {
    console.error('❌ Error al exportar CSV:', error);
    throw error;
  }
};

/**
 * Exporta centros de salud a formato Excel (XLSX)
 * @param centros - Array de centros de salud a exportar
 * @param fileName - Nombre del archivo (sin extensión)
 */
export const exportCentrosToExcel = (
  centros: HealthCenter[],
  fileName: string = 'Centros_Salud_Andalucia'
): void => {
  try {
    // Preparar datos
    const data = centros.map(centro => ({
      'ID': centro.id,
      'Nombre': centro.name,
      'Tipo': centro.type === 'hospital' ? 'Hospital' :
              centro.type === 'centro_salud' ? 'Centro de Salud' :
              centro.type === 'consultorio' ? 'Consultorio' :
              centro.type === 'urgencias' ? 'Urgencias' :
              centro.type === 'farmacia' ? 'Farmacia' : 'Laboratorio',
      'Ciudad': centro.city,
      'Dirección': centro.address,
      'Código Postal': centro.postalCode,
      'Teléfono': centro.phone || 'No disponible',
      'Email': centro.email || 'No disponible',
      'Servicios': centro.services?.join(', ') || 'No especificado',
      'Latitud': centro.coordinates.lat,
      'Longitud': centro.coordinates.lng,
      'Coordenadas': `${centro.coordinates.lat}, ${centro.coordinates.lng}`
    }));

    // Crear worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 8 },   // ID
      { wch: 50 },  // Nombre
      { wch: 20 },  // Tipo
      { wch: 15 },  // Ciudad
      { wch: 55 },  // Dirección
      { wch: 15 },  // Código Postal
      { wch: 20 },  // Teléfono
      { wch: 35 },  // Email
      { wch: 70 },  // Servicios
      { wch: 12 },  // Latitud
      { wch: 12 },  // Longitud
      { wch: 25 }   // Coordenadas
    ];

    // Crear workbook con múltiples hojas
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Todos los Centros');

    // Hoja adicional: Centros por tipo
    const hospitales = centros.filter(c => c.type === 'hospital');
    const centrosSalud = centros.filter(c => c.type === 'centro_salud');
    const consultorios = centros.filter(c => c.type === 'consultorio');

    if (hospitales.length > 0) {
      const wsHospitales = XLSX.utils.json_to_sheet(
        hospitales.map(c => ({
          'Nombre': c.name,
          'Ciudad': c.city,
          'Dirección': c.address,
          'Servicios': c.services?.join(', ') || 'N/A'
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsHospitales, 'Hospitales');
    }

    if (centrosSalud.length > 0) {
      const wsCentros = XLSX.utils.json_to_sheet(
        centrosSalud.map(c => ({
          'Nombre': c.name,
          'Ciudad': c.city,
          'Dirección': c.address,
          'Servicios': c.services?.join(', ') || 'N/A'
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsCentros, 'Centros de Salud');
    }

    if (consultorios.length > 0) {
      const wsConsultorios = XLSX.utils.json_to_sheet(
        consultorios.map(c => ({
          'Nombre': c.name,
          'Ciudad': c.city,
          'Dirección': c.address,
          'Servicios': c.services?.join(', ') || 'N/A'
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsConsultorios, 'Consultorios');
    }

    // Agregar metadata
    wb.Props = {
      Title: 'Centros de Salud - Andalucía',
      Subject: 'Directorio de Centros de Salud',
      Author: 'Copilot Salud Andalucía',
      CreatedDate: new Date()
    };

    // Exportar
    const timestamp = format(new Date(), 'dd-MM-yyyy_HH-mm');
    XLSX.writeFile(wb, `${fileName}_${timestamp}.xlsx`);
    console.log(`✅ Excel exportado: ${fileName}_${timestamp}.xlsx`);
  } catch (error) {
    console.error('❌ Error al exportar Excel:', error);
    throw error;
  }
};

// ============================================================================
// 5. EXPORTACIÓN COMBINADA DE REPORTES
// ============================================================================

/**
 * Exporta un reporte completo con KPIs y centros en un único archivo Excel
 * @param kpis - Array de KPIs
 * @param centros - Array de centros de salud
 * @param userName - Nombre del usuario que exporta
 * @param fileName - Nombre del archivo (sin extensión)
 */
export const exportFullReport = (
  kpis: KPI[],
  centros: HealthCenter[],
  userName: string,
  fileName: string = 'Reporte_Completo_Salud_Andalucia'
): void => {
  try {
    const wb = XLSX.utils.book_new();

    // Hoja 1: Portada con información del reporte
    const portadaData = [
      ['REPORTE DE SALUD - ANDALUCÍA'],
      [''],
      ['Generado por:', userName],
      ['Fecha:', format(new Date(), 'dd/MM/yyyy HH:mm:ss')],
      [''],
      ['CONTENIDO:'],
      ['- Hoja 2: KPIs de Salud'],
      ['- Hoja 3: Centros de Salud'],
      [''],
      [`Total de KPIs: ${kpis.length}`],
      [`Total de Centros: ${centros.length}`]
    ];
    const wsPortada = XLSX.utils.aoa_to_sheet(portadaData);
    XLSX.utils.book_append_sheet(wb, wsPortada, 'Portada');

    // Hoja 2: KPIs
    const kpisData = kpis.map(kpi => ({
      'Nombre': kpi.name,
      'Valor': kpi.currentValue,
      'Unidad': kpi.unit,
      'Tendencia': kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→',
      'Cambio (%)': kpi.changePercentage || 0,
      'Categoría': kpi.category || 'General'
    }));
    const wsKPIs = XLSX.utils.json_to_sheet(kpisData);
    wsKPIs['!cols'] = [{ wch: 45 }, { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsKPIs, 'KPIs');

    // Hoja 3: Centros
    const centrosData = centros.map(centro => ({
      'Nombre': centro.name,
      'Tipo': centro.type === 'hospital' ? 'Hospital' :
              centro.type === 'centro_salud' ? 'Centro de Salud' :
              centro.type === 'consultorio' ? 'Consultorio' :
              centro.type === 'urgencias' ? 'Urgencias' :
              centro.type === 'farmacia' ? 'Farmacia' : 'Laboratorio',
      'Ciudad': centro.city,
      'Dirección': centro.address,
      'Servicios': centro.services?.join(', ') || 'N/A'
    }));
    const wsCentros = XLSX.utils.json_to_sheet(centrosData);
    wsCentros['!cols'] = [{ wch: 50 }, { wch: 20 }, { wch: 15 }, { wch: 55 }, { wch: 70 }];
    XLSX.utils.book_append_sheet(wb, wsCentros, 'Centros');

    // Metadata
    wb.Props = {
      Title: 'Reporte Completo - Copilot Salud Andalucía',
      Subject: 'Reporte de KPIs y Centros de Salud',
      Author: userName,
      CreatedDate: new Date()
    };

    // Exportar
    const timestamp = format(new Date(), 'dd-MM-yyyy_HH-mm');
    XLSX.writeFile(wb, `${fileName}_${timestamp}.xlsx`);
    console.log(`✅ Reporte completo exportado: ${fileName}_${timestamp}.xlsx`);
  } catch (error) {
    console.error('❌ Error al exportar reporte completo:', error);
    throw error;
  }
};

// ============================================================================
// 6. UTILIDADES
// ============================================================================

/**
 * Descarga un archivo de texto
 * @param content - Contenido del archivo
 * @param fileName - Nombre del archivo
 * @param mimeType - Tipo MIME del archivo
 */
export const downloadTextFile = (
  content: string,
  fileName: string,
  mimeType: string = 'text/plain'
): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Valida que el usuario tenga permisos de exportación
 * @param canExport - Permiso de exportación del usuario
 * @throws Error si no tiene permisos
 */
export const validateExportPermission = (canExport: boolean): void => {
  if (!canExport) {
    throw new Error('No tienes permisos para exportar datos. Contacta al administrador.');
  }
};
