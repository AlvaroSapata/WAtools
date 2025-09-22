import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, Wrench, Search } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useJobsStore } from '../stores/useJobsStore';
import { useToolsStore } from '../stores/useToolsStore';
import type { SearchFilters } from '../types';

export const HomePage: React.FC = () => {
  const { jobs, isLoading, loadJobs } = useJobsStore();
  const { tools, isLoading: toolsLoading, loadTools } = useToolsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [serialFilter, setSerialFilter] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Load both jobs and tools in parallel
        await Promise.all([
          loadJobs(),
          loadTools()
        ]);
      } catch (error) {
        console.error('Error loading data on homepage:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    initializeData();
  }, [loadJobs, loadTools]);

  // Show comprehensive loading screen during initial load
  if (isInitialLoading || isLoading || toolsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <LoadingSpinner size="lg" className="mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Cargando WAtools
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Trabajos</span>
                <span className={jobs.length > 0 ? 'text-green-600' : 'text-gray-400'}>
                  {jobs.length > 0 ? '✓' : '⏳'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Herramientas</span>
                <span className={tools.length > 0 ? 'text-green-600' : 'text-gray-400'}>
                  {tools.length > 0 ? '✓' : '⏳'}
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Preparando tu espacio de trabajo...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Real-time filtering for search results
  const filteredJobs = jobs.filter(job => {
    const matchesQuery = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSerial = !serialFilter || 
      job.serialNumber.toLowerCase().includes(serialFilter.toLowerCase());
    
    return matchesQuery && matchesSerial;
  });

  const recentJobs = jobs.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Bienvenido a WAtools
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Gestiona modelos de trabajo y herramientas para el mantenimiento de turbinas eólicas de forma eficiente y organizada.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
          <Link
            to="/jobs/new"
            className="bg-primary-600 text-white p-3 sm:p-6 rounded-xl hover:bg-primary-700 transition-colors shadow-lg group"
          >
            <Plus className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm sm:text-lg font-semibold">Nuevo Trabajo</h3>
            <p className="text-xs sm:text-sm opacity-90 mt-1 hidden sm:block">Crear modelo de trabajo</p>
          </Link>

          <Link
            to="/tools/new"
            className="bg-accent-500 text-white p-3 sm:p-6 rounded-xl hover:bg-accent-600 transition-colors shadow-lg group"
          >
            <Wrench className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm sm:text-lg font-semibold">Nueva Herramienta</h3>
            <p className="text-xs sm:text-sm opacity-90 mt-1 hidden sm:block">Registrar herramienta</p>
          </Link>

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="bg-secondary-500 text-white p-3 sm:p-6 rounded-xl hover:bg-secondary-600 transition-colors shadow-lg group text-left"
          >
            <Search className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm sm:text-lg font-semibold">Buscar</h3>
            <p className="text-xs sm:text-sm opacity-90 mt-1 hidden sm:block">Encontrar trabajos</p>
          </button>

          <Link
            to="/jobs"
            className="bg-primary-500 text-white p-3 sm:p-6 rounded-xl hover:bg-primary-600 transition-colors shadow-lg group"
          >
            <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm sm:text-lg font-semibold">Ver Todos</h3>
            <p className="text-xs sm:text-sm opacity-90 mt-1 hidden sm:block">Gestionar trabajos</p>
          </Link>
        </div>

        {/* Search Section */}
        {showSearch && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Búsqueda Avanzada</h2>
            <div className="w-full sm:max-w-md space-y-4">
              <div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por título, descripción..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                />
              </div>
              
              <div>
                <input
                  type="text"
                  value={serialFilter}
                  onChange={(e) => setSerialFilter(e.target.value)}
                  placeholder="Filtrar por número de serie..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
              
              {(searchQuery || serialFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSerialFilter('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Limpiar filtros
                </button>
              )}
              
              {(searchQuery || serialFilter) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Resultados de búsqueda:</h3>
                  {filteredJobs.length > 0 ? (
                    <div className="space-y-2">
                      {filteredJobs.slice(0, 3).map((job) => (
                        <Link
                          key={job.id}
                          to={`/jobs/${job.id}`}
                          className="block p-2 bg-white rounded border hover:shadow-sm transition-shadow"
                        >
                          <p className="font-medium text-sm">{job.title}</p>
                          <p className="text-xs text-gray-500">{job.serialNumber}</p>
                        </Link>
                      ))}
                      {filteredJobs.length > 3 && (
                        <Link
                          to="/jobs"
                          className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-2"
                        >
                          Ver todos los {filteredJobs.length} resultados →
                        </Link>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No se encontraron trabajos</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Jobs */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Trabajos Recientes</h2>
            <Link
              to="/jobs"
              className="text-primary-500 hover:text-primary-600 font-medium text-xs sm:text-sm"
            >
              Ver todos →
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : recentJobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md hover:border-primary-200 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="bg-primary-100 p-2 rounded-lg">
                      <Briefcase className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-xs text-gray-500 hidden sm:inline">
                      {job.createdAt.toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                    {job.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    {job.serialNumber}
                  </p>
                  
                  {job.description && (
                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                      {job.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay trabajos registrados aún</p>
              <Link
                to="/jobs/new"
                className="text-primary-500 hover:text-primary-600 font-medium mt-2 inline-block"
              >
                Crear tu primer trabajo →
              </Link>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-lg">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Trabajos</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{jobs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-secondary-100 p-3 rounded-lg">
                <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Herramientas</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{tools.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-lg">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Búsquedas Hoy</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};