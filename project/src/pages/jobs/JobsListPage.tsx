import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, Download, Eye } from 'lucide-react';
import { SearchBar } from '../../components/common/SearchBar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useJobsStore } from '../../stores/useJobsStore';
import { exportJobsToCSV } from '../../utils/csvExport';
import type { SearchFilters } from '../../types';

export const JobsListPage: React.FC = () => {
  const { 
    jobs, 
    isLoading, 
    loadJobs, 
    deleteJob 
  } = useJobsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [serialFilter, setSerialFilter] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleExportCSV = () => {
    // For now, export basic job data
    // In a real implementation, we'd fetch jobs with tools
    const jobsForExport = jobs.map(job => ({
      ...job,
      tools: [] // This would be populated with actual tool data
    }));
    exportJobsToCSV(jobsForExport);
  };

  const handleDeleteJob = async (id: string) => {
    await deleteJob(id);
    setShowDeleteConfirm(null);
  };

  // Real-time filtering
  const filteredJobs = jobs.filter(job => {
    const matchesQuery = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSerial = !serialFilter || 
      job.serialNumber.toLowerCase().includes(serialFilter.toLowerCase());
    
    return matchesQuery && matchesSerial;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Trabajos</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Gestiona los modelos de trabajo de mantenimiento eólico
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
              to="/jobs/new"
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-xs sm:text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Trabajo
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Search Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-8">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                Buscar Trabajos
              </h2>
              
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por título, descripción..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                
                <div>
                  <input
                    type="text"
                    value={serialFilter}
                    onChange={(e) => setSerialFilter(e.target.value)}
                    placeholder="Filtrar por número de serie..."
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
                  />
                </div>
                
                {(searchQuery || serialFilter) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSerialFilter('');
                    }}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-xs sm:text-sm"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-xs sm:text-sm text-gray-600">
                  <p><strong>{filteredJobs.length}</strong> de <strong>{jobs.length}</strong> trabajos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {isLoading ? (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Cargando trabajos...</p>
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="space-y-6">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-3">
                          <div className="bg-sky-100 p-2 rounded-lg mr-3">
                            <Briefcase className="w-5 h-5 text-sky-600" />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-xl font-semibold text-gray-900 break-words">
                              {job.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 break-all">
                              {job.serialNumber}
                            </p>
                          </div>
                        </div>

                        {job.description && (
                          <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">
                            {job.description}
                          </p>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0">
                          <span>
                            Creado: {job.createdAt.toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 ml-2 sm:ml-4">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Ver
                        </Link>
                        
                        <Link
                          to={`/jobs/${job.id}/edit`}
                          className="inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto"
                        >
                          Editar
                        </Link>

                        <button
                          onClick={() => setShowDeleteConfirm(job.id)}
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
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  No se encontraron trabajos
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  {searchQuery || serialFilter
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : jobs.length === 0 
                      ? 'Comienza creando tu primer trabajo'
                      : 'No hay trabajos que coincidan con los filtros'
                  }
                </p>
                <Link
                  to="/jobs/new"
                  className="inline-flex items-center px-3 sm:px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-xs sm:text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Trabajo
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
                ¿Estás seguro de que quieres eliminar este trabajo? Esta acción no se puede deshacer.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteJob(showDeleteConfirm)}
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