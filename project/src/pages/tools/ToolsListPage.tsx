import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Wrench, Download, Eye, Settings, Edit, Trash2 } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToolsStore } from '../../stores/useToolsStore';
import { exportToolsToCSV } from '../../utils/csvExport';

export const ToolsListPage: React.FC = () => {
  const { 
    tools, 
    isLoading, 
    loadTools, 
    deleteTool 
  } = useToolsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadTools();
  }, [loadTools]);

  const handleExportCSV = () => {
    exportToolsToCSV(tools);
  };

  const handleDeleteTool = async (id: string) => {
    await deleteTool(id);
    setShowDeleteConfirm(null);
  };

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Herramientas</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Gestiona el inventario de herramientas para mantenimiento
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </button>
            
            <Link
              to="/tools/new"
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors text-xs sm:text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Herramienta
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Search Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-8">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                Buscar Herramientas
              </h2>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent text-sm sm:text-base"
              />
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-xs sm:text-sm text-gray-600">
                  <p><strong>{filteredTools.length}</strong> herramientas encontradas</p>
                  <p className="mt-1 sm:mt-2">
                    <strong>{tools.filter(t => t.isRobust).length}</strong> complejas
                  </p>
                  <p>
                    <strong>{tools.filter(t => !t.isRobust).length}</strong> simples
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tools List */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {isLoading ? (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Cargando herramientas...</p>
              </div>
            ) : filteredTools.length > 0 ? (
              <div className="space-y-6">
                {filteredTools.map((tool) => (
                  <div key={tool.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-3">
                          <div className={`p-2 rounded-lg mr-3 ${
                            tool.isRobust ? 'bg-orange-100' : 'bg-accent-100'
                          }`}>
                            {tool.isRobust ? (
                              <Settings className="w-5 h-5 text-orange-600" />
                            ) : (
                              <Wrench className="w-5 h-5 text-accent-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-base sm:text-xl font-semibold text-gray-900 break-words">
                              {tool.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {tool.isRobust ? 'Herramienta Compleja' : 'Herramienta Simple'}
                            </p>
                          </div>
                        </div>

                        {tool.isRobust && tool.complexDescription && (
                          <div className="mb-3">
                            <p className="text-xs sm:text-sm font-medium text-gray-700">Especificaciones:</p>
                            <p className="text-sm sm:text-base text-gray-600">{tool.complexDescription}</p>
                          </div>
                        )}

                        {tool.notes && (
                          <div className="mb-4">
                            <p className="text-xs sm:text-sm font-medium text-gray-700">Notas:</p>
                            <p className="text-sm sm:text-base text-gray-600">{tool.notes}</p>
                          </div>
                        )}

                        {tool.variations && tool.variations.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs sm:text-sm font-medium text-gray-700">Variaciones:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {tool.variations.map((variation, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-accent-100 text-accent-800"
                                >
                                  {variation}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="text-xs sm:text-sm text-gray-500">
                          <span>
                            Creado: {tool.createdAt.toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 ml-2 sm:ml-4">
                        <Link
                          to={`/tools/${tool.id}`}
                          className="inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Ver
                        </Link>
                        
                        <Link
                          to={`/tools/${tool.id}/edit`}
                          className="inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto"
                        >
                          Editar
                        </Link>

                        <button
                          onClick={() => setShowDeleteConfirm(tool.id)}
                          className="inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 text-center">
                <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  No se encontraron herramientas
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  {searchQuery
                    ? 'Intenta ajustar el término de búsqueda'
                    : 'Comienza registrando tu primera herramienta'
                  }
                </p>
                <Link
                  to="/tools/new"
                  className="inline-flex items-center px-3 sm:px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors text-xs sm:text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Herramienta
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirmar Eliminación
              </h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que quieres eliminar esta herramienta? Esta acción no se puede deshacer.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteTool(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};