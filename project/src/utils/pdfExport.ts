import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { JobWithTools } from '../types';

// Set fonts
pdfMake.vfs = pdfFonts;

export const generateJobSummaryPdf = (job: JobWithTools): void => {
  const docDefinition: any = {
    content: [
      // Header
      {
        text: 'WAtools - Resumen de Herramienta',
        style: 'header',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      
      // Job Info
      {
        text: 'Información del Trabajo',
        style: 'subheader',
        margin: [0, 0, 0, 10]
      },
      
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'Título:', style: 'label' },
              { text: job.title, margin: [0, 0, 0, 10] },
              { text: 'Número de Serie:', style: 'label' },
              { text: job.serialNumber, margin: [0, 0, 0, 10] }
            ]
          },
          {
            width: '50%',
            stack: [
              { text: 'Fecha de Creación:', style: 'label' },
              { text: job.createdAt.toLocaleDateString('es-ES'), margin: [0, 0, 0, 10] }
            ]
          }
        ]
      },

      // Description
      job.description ? [
        { text: 'Descripción:', style: 'label', margin: [0, 15, 0, 5] },
        { text: job.description, margin: [0, 0, 0, 15] }
      ] : [],

      // Procedure PDF
      job.procedurePdfUrl ? [
        { text: 'Procedimiento:', style: 'label', margin: [0, 0, 0, 5] },
        { 
          text: 'PDF disponible en: ' + job.procedurePdfUrl, 
          link: job.procedurePdfUrl,
          color: 'blue',
          margin: [0, 0, 0, 15]
        }
      ] : [],

      // Tools Table
      { text: 'Herramientas Requeridas', style: 'subheader', margin: [0, 15, 0, 10] },
      
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', '*'],
          body: [
            [
              { text: 'Herramienta', style: 'tableHeader' },
              { text: 'Cantidad', style: 'tableHeader' },
              { text: 'Especificaciones', style: 'tableHeader' }
            ],
            ...job.tools.map(({ tool, quantity, notes, variation }) => [
              `${tool.name}${variation ? ` - ${variation}` : ''}`,
              variation ? '1/cada' : quantity.toString(),
              tool.isRobust && tool.complexDescription 
                ? tool.complexDescription 
                : (notes || '-')
            ])
          ]
        },
        layout: {
          fillColor: (rowIndex: number) => rowIndex === 0 ? '#0EA5E9' : (rowIndex % 2 === 0 ? '#f8fafc' : null),
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#e2e8f0',
          vLineColor: () => '#e2e8f0'
        }
      },

      // Footer info
      {
        text: `Generado el ${new Date().toLocaleDateString('es-ES')} por WAtools`,
        style: 'footer',
        alignment: 'center',
        margin: [0, 30, 0, 0]
      }
    ],

    styles: {
      header: {
        fontSize: 18,
        bold: true,
        color: '#0EA5E9'
      },
      subheader: {
        fontSize: 14,
        bold: true,
        color: '#374151',
        margin: [0, 10, 0, 5]
      },
      label: {
        fontSize: 10,
        bold: true,
        color: '#6B7280'
      },
      tableHeader: {
        bold: true,
        color: 'white',
        fillColor: '#0EA5E9'
      },
      footer: {
        fontSize: 8,
        color: '#9CA3AF'
      }
    },

    defaultStyle: {
      fontSize: 11,
      lineHeight: 1.3
    }
  };

  pdfMake.createPdf(docDefinition).download(`${job.serialNumber}_Tools.pdf`);
};