import Papa from 'papaparse';
import type { Job, Tool, JobWithTools } from '../types';

export const exportJobsToCSV = (jobs: JobWithTools[]): void => {
  const csvData = jobs.flatMap(job => 
    job.tools.map(({ tool, quantity, notes }) => ({
      'Título del Trabajo': job.title,
      'Número de Serie': job.serialNumber,
      'Descripción del Trabajo': job.description || '',
      'Fecha de Creación': job.createdAt.toLocaleDateString('es-ES'),
      'Herramienta': tool.name,
      'Cantidad': quantity,
      'Tipo de Herramienta': tool.isRobust ? 'Compleja' : 'Simple',
      'Especificaciones': tool.isRobust ? (tool.complexDescription || '') : '',
      'Notas de Herramienta': tool.notes || '',
      'Notas de Uso': notes || '',
      'URL del Procedimiento': job.procedurePdfUrl || ''
    }))
  );

  const csv = Papa.unparse(csvData, {
    delimiter: ';',
    header: true
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `WAtools_trabajos_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToolsToCSV = (tools: Tool[]): void => {
  const csvData = tools.map(tool => ({
    'Nombre': tool.name,
    'Tipo': tool.isRobust ? 'Compleja' : 'Simple',
    'Especificaciones': tool.complexDescription || '',
    'Notas': tool.notes || '',
    'Fecha de Creación': tool.createdAt.toLocaleDateString('es-ES')
  }));

  const csv = Papa.unparse(csvData, {
    delimiter: ';',
    header: true
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `WAtools_herramientas_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};