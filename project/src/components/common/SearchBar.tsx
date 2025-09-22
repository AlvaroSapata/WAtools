import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { SearchFilters } from '../../types';

interface SearchBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  placeholder = "Buscar trabajos por título..."
}) => {
  const [localQuery, setLocalQuery] = useState(filters.query);
  const [localSerial, setLocalSerial] = useState(filters.serialNumber || '');

  useEffect(() => {
    setLocalQuery(filters.query);
    setLocalSerial(filters.serialNumber || '');
  }, [filters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({
      query: localQuery,
      serialNumber: localSerial || undefined
    });
    onSearch();
  };

  const clearFilters = () => {
    setLocalQuery('');
    setLocalSerial('');
    onFiltersChange({ query: '' });
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-base"
        />
        {(localQuery || localSerial) && (
          <button
            type="button"
            onClick={clearFilters}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={localSerial}
          onChange={(e) => setLocalSerial(e.target.value)}
          placeholder="Filtrar por número de serie..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-sky-500 text-white py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors font-medium"
      >
        Buscar
      </button>
    </form>
  );
};

export { SearchBar }