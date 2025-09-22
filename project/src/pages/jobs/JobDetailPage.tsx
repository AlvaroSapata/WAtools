import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Download, Wrench, Settings } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useJobsStore } from '../../stores/useJobsStore';
import { generateJobSummaryPdf } from '../../utils/pdfExport';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentJob, isLoading, loadJobWithTools, deleteJob } = useJobsStore();

  useEffect(() => {
    if (id) {
      loadJobWithTools(id);
    }
  }, [id, loadJobWithTools]);

  const handleDelete = async () => {
    if (id && window.confirm('¿Estás seguro de que quieres eliminar este trabajo?')) {
      await deleteJob(id);
      navigate('/jobs');
    }
  };

  const handleExportPDF = () => {
    if (currentJob) {
      generateJobSummaryPdf(currentJob);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando trabajo...</p>
        </div>
      </div>
    );
  }

  if (!currentJob) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Trabajo no encontrado</h2>
          <Link
            to="/jobs"
            className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Trabajos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8 gap-4">
          <div className="flex items-center min-w-0 flex-1">
            <button
              onClick={() => navigate('/jobs')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words leading-tight">
                {currentJob.title}
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 font-mono break-all">
                {currentJob.serialNumber}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </button>
            
            <Link
              to={`/jobs/${currentJob.id}/edit`}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-xs sm:text-sm font-medium"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Link>

            <button
              onClick={handleDelete}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm font-medium"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-8">
            {/* Job Information */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Información del Trabajo
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Título</label>
                  <p className="mt-1 text-sm sm:text-base text-gray-900 break-words">{currentJob.title}</p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Número de Serie</label>
                  <p className="mt-1 text-sm sm:text-base text-gray-900 font-mono break-all">{currentJob.serialNumber}</p>
                </div>

                {currentJob.description && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Descripción</label>
                    <p className="mt-1 text-sm sm:text-base text-gray-900">{currentJob.description}</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Fecha de Creación</label>
                  <p className="mt-1 text-sm sm:text-base text-gray-900">
                    {currentJob.createdAt.toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Tools Required */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Herramientas Requeridas
              </h2>
              
              {currentJob.tools.length > 0 ? (
                <div className="space-y-4">
                  {currentJob.tools
                    .sort((a, b) => a.tool.name.localeCompare(b.tool.name))
                    .map(({ tool, quantity, notes, variation }, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center flex-1">
                          <div className={`p-2 rounded-lg mr-3 ${
                            tool.isRobust ? 'bg-orange-100' : 'bg-secondary-100'
                          }`}>
                            {tool.isRobust ? (
                              <Settings className="w-5 h-5 text-orange-600" />
                            ) : (
                              <Wrench className="w-5 h-5 text-secondary-600" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 break-words">
                              {tool.name}
                              {variation && (
                                <span className="text-emerald-600 ml-1 sm:ml-2 text-xs sm:text-sm">
                                  - {variation}
                                </span>
                              )}
                            </h3>
                            
                            {tool.isRobust && tool.complexDescription && (
                              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                <strong>Especificaciones:</strong> {tool.complexDescription}
                              </p>
                            )}
                            
                            {tool.notes && (
                              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                <strong>Notas:</strong> {tool.notes}
                              </p>
                            )}
                            
                            {notes && (
                              <p className="text-xs sm:text-sm text-blue-600 mt-1">
                                <strong>Notas de uso:</strong> {notes}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-2 sm:ml-4 text-right">
                          <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            Cantidad: {quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-gray-500">No se han asignado herramientas a este trabajo</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Herramientas totales</span>
                  <span className="text-sm sm:text-base font-semibold text-gray-900">{currentJob.tools.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Herramientas complejas</span>
                  <span className="text-sm sm:text-base font-semibold text-gray-900">
                    {currentJob.tools.filter(({ tool }) => tool.isRobust).length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Cantidad total</span>
                  <span className="text-sm sm:text-base font-semibold text-gray-900">
                    {currentJob.tools.reduce((sum, { quantity }) => sum + quantity, 0)}
                  </span>
                </div>
                
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleExportPDF}
                  className="w-full px-3 sm:px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-xs sm:text-sm font-medium"
                >
                  Exportar Resumen PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};