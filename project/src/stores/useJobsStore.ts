import { create } from 'zustand';
import type { Job, JobWithTools, SearchFilters } from '../types';
import { jobsService, jobToolUsagesService, toolsService } from '../services/firebase';
import { db } from '../services/database';

interface JobsState {
  jobs: Job[];
  currentJob: JobWithTools | null;
  searchFilters: SearchFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadJobs: () => Promise<void>;
  searchJobs: (filters: SearchFilters) => Promise<void>;
  createJob: (job: Omit<Job, 'id'>) => Promise<string>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  loadJobWithTools: (id: string) => Promise<void>;
  setSearchFilters: (filters: SearchFilters) => void;
  clearError: () => void;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  currentJob: null,
  searchFilters: { query: '' },
  isLoading: false,
  error: null,

  loadJobs: async () => {
    set({ isLoading: true, error: null });
    try {
      const jobs = await jobsService.getAll();
      set({ jobs, isLoading: false });
    } catch (error) {
      set({ error: 'Error al cargar los trabajos', isLoading: false });
    }
  },

  searchJobs: async (filters: SearchFilters) => {
    set({ isLoading: true, error: null, searchFilters: filters });
    try {
      const jobs = await jobsService.search(filters);
      set({ jobs, isLoading: false });
    } catch (error) {
      set({ error: 'Error al buscar trabajos', isLoading: false });
    }
  },

  createJob: async (job: Omit<Job, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const id = await jobsService.create(job);
      await get().loadJobs();
      set({ isLoading: false });
      return id;
    } catch (error) {
      set({ error: 'Error al crear el trabajo', isLoading: false });
      throw error;
    }
  },

  updateJob: async (id: string, updates: Partial<Job>) => {
    set({ isLoading: true, error: null });
    try {
      await jobsService.update(id, updates);
      await get().loadJobs();
      if (get().currentJob?.id === id) {
        await get().loadJobWithTools(id);
      }
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Error al actualizar el trabajo', isLoading: false });
      throw error;
    }
  },

  deleteJob: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Delete associated tool usages first
      await jobToolUsagesService.deleteByJobId(id);
      
      // Then delete the job
      await jobsService.delete(id);
      const jobs = get().jobs.filter(job => job.id !== id);
      set({ jobs, currentJob: null, isLoading: false });
    } catch (error) {
      set({ error: 'Error al eliminar el trabajo', isLoading: false });
      throw error;
    }
  },

  loadJobWithTools: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Try to get job from Firebase first, fallback to IndexedDB
      let job: Job | undefined;
      try {
        const jobs = await jobsService.getAll();
        job = jobs.find(j => j.id === id);
      } catch (error) {
        job = await db.jobs.get(id);
      }
      
      if (!job) throw new Error('Trabajo no encontrado');

      // Get tool usages for this job
      const usages = await jobToolUsagesService.getByJobId(id);
      
      // Get tool details for each usage
      const tools = await Promise.all(
        usages.map(async (usage) => {
          // Try to get tool from Firebase first, fallback to IndexedDB
          let tool: any;
          try {
            const allTools = await toolsService.getAll();
            tool = allTools.find(t => t.id === usage.toolId);
          } catch (error) {
            tool = await db.tools.get(usage.toolId);
          }
          
          // Only return if tool exists
          if (tool) {
            return {
              tool: tool,
              quantity: usage.quantity,
              notes: usage.notes,
              variation: usage.variation
            };
          }
          return null;
        })
      );

      // Filter out null entries (tools that couldn't be found)
      const validTools = tools.filter(toolEntry => toolEntry !== null);
      const jobWithTools: JobWithTools = { ...job, tools: validTools };
      set({ currentJob: jobWithTools, isLoading: false });
    } catch (error) {
      set({ error: 'Error al cargar el trabajo con herramientas', isLoading: false });
    }
  },

  setSearchFilters: (filters: SearchFilters) => {
    set({ searchFilters: filters });
  },

  clearError: () => {
    set({ error: null });
  }
}));