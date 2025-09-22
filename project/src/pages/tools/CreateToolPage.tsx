import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wrench, Settings } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToolsStore } from '../../stores/useToolsStore';
import type { Tool } from '../../types';

export const CreateToolPage: React.FC = () => {
  const navigate = useNavigate();
  const { createTool, isLoading } = useToolsStore();
  
  const [formData, setFormData] = useState({
    name: '',
    isRobust: false,
    complexDescription: '',
    variations: [] as string[],
    notes: ''
  });
  
  const [variationInput, setVariationInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (formData.isRobust && !formData.complexDescription.trim()) {
      newErrors.complexDescription = 'La descripción es obligatoria para herramientas complejas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const toolData: Omit<Tool, 'id'> = {
        name: formData.name.trim(),
        isRobust: formData.isRobust,
        complexDescription: formData.isRobust ? formData.complexDescription.trim() : undefined,
        variations: formData.variations.length > 0 ? formData.variations : undefined,
        notes: formData.notes.trim() || undefined,
        createdAt: new Date()
      };
      
      await createTool(toolData);
      navigate('/tools');
    } catch (error) {
      console.error('Error creating tool:', error);
      setErrors({ submit: 'Error al crear la herramienta' });
    }
  };

  const addVariation = () => {
    if (variationInput.trim() && !formData.variations.includes(variationInput.trim())) {
      setFormData({
        ...formData,
        variations: [...formData.variations, variationInput.trim()]
      });
      setVariationInput('');
    }
  };

  const removeVariation = (index: number) => {
    setFormData({
      ...formData,
      variations: formData.variations.filter((_, i) => i !== index)
    });
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/tools')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nueva Herramienta</h1>
            <p className="mt-2 text-gray-600">
              Registrar una nueva herramienta en el inventario
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Información de la Herramienta
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Herramienta *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Llave dinamométrica"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Tool Type Toggle */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {formData.isRobust ? (
                      <Settings className="w-6 h-6 text-orange-600 mr-3" />
                    ) : (
                      <Wrench className="w-6 h-6 text-accent-600 mr-3" />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        ¿Es una herramienta compleja?
                      </h3>
                      <p className="text-sm text-gray-600">
                        Las herramientas complejas requieren especificaciones técnicas
                      </p>
                    </div>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isRobust}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        isRobust: e.target.checked,
                        complexDescription: e.target.checked ? formData.complexDescription : ''
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                  </label>
                </div>
              </div>

              {/* Complex Description (only if robust) */}
              {formData.isRobust && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-orange-800 mb-2">
                    Especificaciones Técnicas *
                  </label>
                  <input
                    type="text"
                    value={formData.complexDescription}
                    onChange={(e) => setFormData({ ...formData, complexDescription: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white ${
                      errors.complexDescription ? 'border-red-300' : 'border-orange-300'
                    }`}
                    placeholder="Ej: Par 40–200 Nm, Capacidad 700 bar, Carga máxima 1t"
                  />
                  {errors.complexDescription && (
                    <p className="mt-1 text-sm text-red-600">{errors.complexDescription}</p>
                  )}
                  <p className="mt-2 text-sm text-orange-700">
                    Incluye detalles técnicos como capacidad, rango de operación, etc.
                  </p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variaciones
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={variationInput}
                      onChange={(e) => setVariationInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariation())}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                      placeholder="Ej: 8mm, 10mm, 12mm..."
                    />
                    <button
                      type="button"
                      onClick={addVariation}
                      className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                  
                  {formData.variations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.variations.map((variation, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-accent-100 text-accent-800"
                        >
                          {variation}
                          <button
                            type="button"
                            onClick={() => removeVariation(index)}
                            className="ml-2 text-accent-600 hover:text-accent-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500">
                    Agrega variaciones como medidas, tamaños, etc. (Ej: 8mm, 10mm, 12mm)
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  placeholder="Notas sobre mantenimiento, precauciones, ubicación, etc."
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Vista Previa
            </h2>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-lg mr-3 ${
                  formData.isRobust ? 'bg-orange-100' : 'bg-accent-100'
                }`}>
                  {formData.isRobust ? (
                    <Settings className="w-5 h-5 text-orange-600" />
                  ) : (
                    <Wrench className="w-5 h-5 text-accent-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {formData.name || 'Nombre de la herramienta'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formData.isRobust ? 'Herramienta Compleja' : 'Herramienta Simple'}
                  </p>
                </div>
              </div>

              {formData.isRobust && formData.complexDescription && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">Especificaciones:</p>
                  <p className="text-gray-600">{formData.complexDescription}</p>
                </div>
              )}

              {formData.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Notas:</p>
                  <p className="text-gray-600">{formData.notes}</p>
                </div>
              )}

              {formData.variations.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Variaciones:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.variations.map((variation, index) => (
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
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate('/tools')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creando...
                </>
              ) : (
                'Crear Herramienta'
              )}
            </button>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};