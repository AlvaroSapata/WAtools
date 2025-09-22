import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wind, Home, Briefcase, Wrench } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 min-w-0">
            <div className="bg-primary-500 p-2 rounded-lg">
              <Wind className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-lg sm:text-xl font-bold text-gray-900">WAtools</span>
              <span className="block text-xs text-primary-600 font-medium hidden sm:block">Wind Advance</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-4 lg:space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="hidden lg:inline">Inicio</span>
            </Link>
            
            <Link
              to="/jobs"
              className={`flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors ${
                isActive('/jobs') || location.pathname.startsWith('/jobs')
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Briefcase className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="hidden lg:inline">Trabajos</span>
            </Link>
            
            <Link
              to="/tools"
              className={`flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors ${
                isActive('/tools') || location.pathname.startsWith('/tools')
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Wrench className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="hidden lg:inline">Herramientas</span>
            </Link>
          </nav>

          {/* Mobile menu button placeholder */}
          <div className="sm:hidden">
            {/* Could add mobile menu button here */}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-t border-gray-200">
        <div className="px-4 py-2 space-y-1">
          <Link
            to="/"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/') 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Inicio</span>
          </Link>
          
          <Link
            to="/jobs"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/jobs') || location.pathname.startsWith('/jobs')
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Trabajos</span>
          </Link>
          
          <Link
            to="/tools"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/tools') || location.pathname.startsWith('/tools')
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Herramientas</span>
          </Link>
        </div>
      </nav>
    </header>
  );
};