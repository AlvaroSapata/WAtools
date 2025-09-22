import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Wrench, Settings, Briefcase } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToolsStore } from '../../stores/useToolsStore';

export const ToolDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTool, isLoading, loadToolWithJobs, deleteTool } = useToolsStore();

  useEffect(() => {
    if (id) {
      loadToolWithJobs(id);
    }
  }, [id, loadToolWithJobs]);

  const handleDelete = async () => {
    if (id && window.confirm('¿Estás seguro de que quieres eliminar esta herramienta?')) {
      await deleteTool(id);
      navigate('/tools');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando herramienta...</p>
        </div>
      </div>
    );
  }

  if (!currentTool) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Herramienta no encontrada</h2>
          <Link
            to="/tools"
            className="inline-flex items-center px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Herramientas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center min-w-0 flex-1">
            <button
              onClick={() => navigate('/tools')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center min-w-0 flex-1">
              <div className={`p-3 rounded-lg mr-4 ${
                currentTool.isRobust ? 'bg-orange-100' : 'bg-accent-100'
              } flex-shrink-0`}>
                {currentTool.isRobust ? (
                  <Settings className="w-8 h-8 text-orange-600" />
                ) : (
                  <Wrench className="w-8 h-8 text-accent-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold text-gray-900 break-words leading-tight">
                  {currentTool.name}
                </h1>
                <p className="mt-2 text-gray-600">
                  {currentTool.isRobust ? 'Herramienta Compleja' : 'Herramienta Simple'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/tools/${currentTool.id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors font-medium"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Link>

            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tool Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información de la Herramienta
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <p className="mt-1 text-gray-900">{currentTool.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <p className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      currentTool.isRobust 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-accent-100 text-accent-800'
                    }`}>
                      {currentTool.isRobust ? 'Compleja' : 'Simple'}
                    </span>
                  </p>
                </div>

                {currentTool.isRobust && currentTool.complexDescription && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Especificaciones Técnicas</label>
                    <p className="mt-1 text-gray-900">{currentTool.complexDescription}</p>
                  </div>
                )}

                {currentTool.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notas</label>
                    <p className="mt-1 text-gray-900">{currentTool.notes}</p>
                  </div>
                )}

                {currentTool.variations && currentTool.variations.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Variaciones</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {currentTool.variations.map((variation, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-accent-100 text-accent-800"
                        >
                          {variation}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                  <p className="mt-1 text-gray-900">
                    {currentTool.createdAt.toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Usage History */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Historial de Uso
              </h2>
              
              {currentTool.usageHistory.length > 0 ? (
                <div className="space-y-4">
                  {currentTool.usageHistory.map(({ job, quantity, notes, usageDate }, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center flex-1">
                          <div className="bg-primary-100 p-2 rounded-lg mr-3">
                            <Briefcase className="w-5 h-5 text-primary-600" />
                          </div>
                          
                          <div className="flex-1">
                            <Link
                              to={`/jobs/${job.id}`}
                              className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                            >
                              {job.title}
                            </Link>
                            <p className="text-sm text-gray-500">{job.serialNumber}</p>
                            
                            {job.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {job.description}
                              </p>
                            )}
                            
                            {notes && (
                              <p className="text-sm text-blue-600 mt-1">
                                <strong>Notas de uso:</strong> {notes}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mb-1">
                            Cantidad: {quantity}
                          </span>
                          <p className="text-xs text-gray-500">
                            {usageDate.toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Esta herramienta no ha sido utilizada en ningún trabajo aún</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Trabajos utilizados</span>
                  <span className="font-semibold text-gray-900">{currentTool.usageHistory.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cantidad total usada</span>
                  <span className="font-semibold text-gray-900">
                    {currentTool.usageHistory.reduce((sum, { quantity }) => sum + quantity, 0)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tipo</span>
                  <span className={`font-semibold ${currentTool.isRobust ? 'text-orange-600' : 'text-accent-600'}`}>
                    {currentTool.isRobust ? 'Compleja' : 'Simple'}
                  </span>
                </div>
                
                {currentTool.usageHistory.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Último uso</span>
                    <span className="font-semibold text-gray-900">
                      {Math.max(...currentTool.usageHistory.map(h => h.usageDate.getTime())) 
                        ? new Date(Math.max(...currentTool.usageHistory.map(h => h.usageDate.getTime())))
                            .toLocaleDateString('es-ES')
                        : 'N/A'}
                    </span>
                  </div>
                )}
              </div>

              {currentTool.isRobust && currentTool.complexDescription && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Especificaciones</h4>
                  <p className="text-sm text-gray-600">{currentTool.complexDescription}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};