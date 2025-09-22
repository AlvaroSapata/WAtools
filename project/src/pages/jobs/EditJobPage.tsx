import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useJobsStore } from '../../stores/useJobsStore';
import { useToolsStore } from '../../stores/useToolsStore';
import { jobToolUsagesService } from '../../services/firebase';
import type { Job, Tool } from '../../types';

export const EditJobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentJob, updateJob, loadJobWithTools, isLoading } = useJobsStore();
  const { tools, loadTools } = useToolsStore();
  
  const [formData, setFormData] = useState({
    title: '',
    serialNumber: '',
    description: ''
  });
  
  const [selectedTools, setSelectedTools] = useState<Array<{
    toolId: string;
    variation: string;
    quantity: number;
    notes: string;
  }>>([]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      loadJobWithTools(id);
    }
    loadTools();
  }, [id, loadJobWithTools, loadTools]);

  useEffect(() => {
    if (currentJob) {
      setFormData({
        title: currentJob.title,
        serialNumber: currentJob.serialNumber,
        description: currentJob.description || ''
      });
      
      setSelectedTools(
        currentJob.tools.map(({ tool, quantity, notes, variation }) => ({
          toolId: tool?.id || '',
          variation: variation || '',
          quantity,
          notes: notes || ''
        })).filter(toolUsage => toolUsage.toolId) // Filter out entries with missing tool IDs
      );
      
    }
  }, [currentJob]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }
    
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = 'El número de serie es obligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !id) return;
    
    try {
      // Update job
      const jobData: Partial<Job> = {
        ...formData,
        updatedAt: new Date()
      };
      
      await updateJob(id, jobData);
      
      // Delete existing tool usages
      await jobToolUsagesService.deleteByJobId(id);
      
      // Add new tool usages
      for (const toolUsage of selectedTools) {
        if (toolUsage.toolId) {
          await jobToolUsagesService.create({
            jobId: id,
            toolId: toolUsage.toolId,
            variation: toolUsage.variation.trim() || undefined,
            quantity: toolUsage.quantity,
            notes: toolUsage.notes.trim() || undefined,
            createdAt: new Date()
          });
        }
      }
      
      navigate(`/jobs/${id}`);
    } catch (error) {
      console.error('Error updating job:', error);
      setErrors({ submit: 'Error al actualizar el trabajo' });
    }
  };

  const addTool = () => {
    setSelectedTools([{ toolId: '', variation: '', quantity: 1, notes: '' }, ...selectedTools]);
  };

  const removeTool = (index: number) => {
    setSelectedTools(selectedTools.filter((_, i) => i !== index));
  };

  const updateTool = (index: number, field: string, value: any) => {
    const updated = [...selectedTools];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedTools(updated);
  };

  if (isLoading && !currentJob) {
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
          <button
            onClick={() => navigate('/jobs')}
            className="inline-flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Trabajos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(`/jobs/${id}`)}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Trabajo</h1>
            <p className="mt-2 text-gray-600">
              Modificar el modelo de trabajo de mantenimiento
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Información Básica
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Cambio de pitch cylinder"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Serie *
                </label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.serialNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: JOB-2025-001"
                />
                {errors.serialNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.serialNumber}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Descripción detallada del trabajo..."
              />
            </div>
          </div>

          {/* Tools Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Herramientas Requeridas
              </h2>
              <button
                type="button"
                onClick={addTool}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Agregar Herramienta
              </button>
            </div>

            {selectedTools.length > 0 ? (
              <div className="space-y-4">
                {selectedTools
                  .map((toolUsage, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Herramienta
                        </label>
                        <select
                          value={toolUsage.toolId}
                          onChange={(e) => updateTool(index, 'toolId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Seleccionar herramienta...</option>
                          {tools
                            .slice()
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((tool) => (
                            <option key={tool.id} value={tool.id}>
                              {tool.isRobust && tool.complexDescription 
                                ? `${tool.name} - ${tool.complexDescription}`
                                : tool.name
                              }
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Variation Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Variaciones
                        </label>
                        {(() => {
                          const selectedTool = tools.find(t => t.id === toolUsage.toolId);
                          const hasVariations = selectedTool?.variations && selectedTool.variations.length > 0;
                          const selectedVariations = toolUsage.variation ? toolUsage.variation.split(' / ') : [];
                          
                          return hasVariations ? (
                            <div className="space-y-2">
                              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                                {selectedTool.variations.map((variation) => (
                                  <label key={variation} className="flex items-center space-x-2 py-1">
                                    <input
                                      type="checkbox"
                                      checked={selectedVariations.includes(variation)}
                                      onChange={(e) => {
                                        let newVariations;
                                        if (e.target.checked) {
                                          newVariations = [...selectedVariations, variation];
                                        } else {
                                          newVariations = selectedVariations.filter(v => v !== variation);
                                        }
                                        updateTool(index, 'variation', newVariations.join(' / '));
                                      }}
                                      className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                                    />
                                    <span className="text-sm">{variation}</span>
                                  </label>
                                ))}
                              </div>
                              {selectedVariations.length > 0 && (
                                <div className="text-sm text-gray-600">
                                  Seleccionadas: {selectedVariations.join(' / ')}
                                </div>
                              )}
                            </div>
                          ) : (
                            <input
                              type="text"
                              disabled
                              placeholder="No disponible"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                            />
                          );
                        })()}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cantidad
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={toolUsage.quantity}
                         onChange={(e) => updateTool(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeTool(index)}
                          className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas
                      </label>
                      <input
                        type="text"
                        value={toolUsage.notes}
                       onChange={(e) => updateTool(index, 'notes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Notas adicionales..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No se han agregado herramientas aún
              </p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate(`/jobs/${id}`)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Trabajo'
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