import { create } from 'zustand';
import type { Tool, ToolWithJobs } from '../types';
import { toolsService } from '../services/firebase';
import { db } from '../services/database';

interface ToolsState {
  tools: Tool[];
  currentTool: ToolWithJobs | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadTools: () => Promise<void>;
  createTool: (tool: Omit<Tool, 'id'>) => Promise<string>;
  updateTool: (id: string, updates: Partial<Tool>) => Promise<void>;
  deleteTool: (id: string) => Promise<void>;
  loadToolWithJobs: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useToolsStore = create<ToolsState>((set, get) => ({
  tools: [],
  currentTool: null,
  isLoading: false,
  error: null,

  loadTools: async () => {
    set({ isLoading: true, error: null });
    try {
      const tools = await toolsService.getAll();
      const sortedTools = tools.sort((a, b) => a.name.localeCompare(b.name));
      set({ tools: sortedTools, isLoading: false });
    } catch (error) {
      set({ error: 'Error al cargar las herramientas', isLoading: false });
    }
  },

  createTool: async (tool: Omit<Tool, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const id = await toolsService.create(tool);
      await get().loadTools();
      set({ isLoading: false });
      return id;
    } catch (error) {
      set({ error: 'Error al crear la herramienta', isLoading: false });
      throw error;
    }
  },

  updateTool: async (id: string, updates: Partial<Tool>) => {
    set({ isLoading: true, error: null });
    try {
      await toolsService.update(id, updates);
      await get().loadTools();
      if (get().currentTool?.id === id) {
        await get().loadToolWithJobs(id);
      }
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Error al actualizar la herramienta', isLoading: false });
      throw error;
    }
  },

  deleteTool: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await toolsService.delete(id);
      const tools = get().tools.filter(tool => tool.id !== id);
      set({ tools, currentTool: null, isLoading: false });
    } catch (error) {
      set({ error: 'Error al eliminar la herramienta', isLoading: false });
      throw error;
    }
  },

  loadToolWithJobs: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const tool = await db.tools.get(id);
      if (!tool) throw new Error('Herramienta no encontrada');

      const usages = await db.jobToolUsages.where('toolId').equals(id).toArray();
      const usageHistory = await Promise.all(
        usages.map(async (usage) => {
          const job = await db.jobs.get(usage.jobId);
          return {
            job: job!,
            quantity: usage.quantity,
            notes: usage.notes,
            usageDate: usage.createdAt
          };
        })
      );

      const toolWithJobs: ToolWithJobs = { ...tool, usageHistory };
      set({ currentTool: toolWithJobs, isLoading: false });
    } catch (error) {
      set({ error: 'Error al cargar la herramienta con trabajos', isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));