import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db as firestore } from '../config/firebase';
import { db as indexedDB } from './database';
import type { Job, Tool, JobToolUsage } from '../types';

// Helper function to remove undefined values from objects
const removeUndefined = (obj: any): any => {
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
};

// Collections
const JOBS_COLLECTION = 'jobs';
const TOOLS_COLLECTION = 'tools';
const JOB_TOOL_USAGES_COLLECTION = 'job_tool_usages';

// Job Tool Usages Service
export const jobToolUsagesService = {
  async create(usage: Omit<JobToolUsage, 'id'>): Promise<string> {
    try {
      const usageData = {
        ...usage,
        createdAt: Timestamp.now()
      };
      const docRef = await addDoc(collection(firestore, JOB_TOOL_USAGES_COLLECTION), removeUndefined(usageData));
      
      const newUsage: JobToolUsage = {
        ...usage,
        id: docRef.id,
        createdAt: new Date()
      };
      await indexedDB.jobToolUsages.add(newUsage);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating job tool usage:', error);
      const id = `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newUsage: JobToolUsage = { ...usage, id, createdAt: new Date() };
      await indexedDB.jobToolUsages.add(newUsage);
      await queueOfflineAction('CREATE', 'job_tool_usages', newUsage);
      return id;
    }
  },

  async getByJobId(jobId: string): Promise<JobToolUsage[]> {
    try {
      // Try Firebase first, then fallback to IndexedDB
      const q = query(
        collection(firestore, JOB_TOOL_USAGES_COLLECTION), 
        where('jobId', '==', jobId)
      );
      const querySnapshot = await getDocs(q);
      
      const usages: JobToolUsage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usages.push({
          id: doc.id,
          jobId: data.jobId,
          toolId: data.toolId,
          variation: data.variation,
          quantity: data.quantity || 1,
          notes: data.notes,
          createdAt: convertTimestamp(data.createdAt)
        });
      });
      
      return usages;
    } catch (error) {
      console.error('Error fetching job tool usages:', error);
      return await indexedDB.jobToolUsages.where('jobId').equals(jobId).toArray();
    }
  },

  async deleteByJobId(jobId: string): Promise<void> {
    try {
      // Delete from Firebase
      const q = query(
        collection(firestore, JOB_TOOL_USAGES_COLLECTION), 
        where('jobId', '==', jobId)
      );
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
      
      // Delete from IndexedDB
      await indexedDB.jobToolUsages.where('jobId').equals(jobId).delete();
    } catch (error) {
      console.error('Error deleting job tool usages:', error);
      await indexedDB.jobToolUsages.where('jobId').equals(jobId).delete();
    }
  }
};
// Helper to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Jobs Service
export const jobsService = {
  async getAll(): Promise<Job[]> {
    try {
      // Try Firebase first, then fallback to IndexedDB
      const q = query(collection(firestore, JOBS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const jobs: Job[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        jobs.push({
          id: doc.id,
          title: data.title,
          serialNumber: data.serialNumber,
          description: data.description,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: data.updatedAt ? convertTimestamp(data.updatedAt) : undefined
        });
      });
      
      // Sync to IndexedDB for offline access
      await indexedDB.jobs.clear();
      await indexedDB.jobs.bulkPut(jobs);
      
      return jobs;
    } catch (error) {
      console.error('Error fetching jobs from Firebase:', error);
      // Fallback to IndexedDB
      return await indexedDB.jobs.orderBy('createdAt').reverse().toArray();
    }
  },

  async create(job: Omit<Job, 'id'>): Promise<string> {
    try {
      const jobData = {
        ...job,
        createdAt: Timestamp.now()
      };
      const docRef = await addDoc(collection(firestore, JOBS_COLLECTION), removeUndefined(jobData));
      
      const newJob: Job = {
        ...job,
        id: docRef.id,
        createdAt: new Date()
      };
      await indexedDB.jobs.add(newJob);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating job:', error);
      // Store in IndexedDB and queue for sync
      const id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newJob: Job = { ...job, id, createdAt: new Date() };
      await indexedDB.jobs.add(newJob);
      await queueOfflineAction('CREATE', 'jobs', newJob);
      return id;
    }
  },

  async update(id: string, updates: Partial<Job>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      await updateDoc(doc(firestore, JOBS_COLLECTION, id), removeUndefined(updateData));
      await indexedDB.jobs.update(id, { ...updates, updatedAt: new Date() });
    } catch (error) {
      console.error('Error updating job:', error);
      await indexedDB.jobs.update(id, { ...updates, updatedAt: new Date() });
      await queueOfflineAction('UPDATE', 'jobs', { id, ...updates });
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, JOBS_COLLECTION, id));
      await indexedDB.jobs.delete(id);
    } catch (error) {
      console.error('Error deleting job:', error);
      await indexedDB.jobs.delete(id);
      await queueOfflineAction('DELETE', 'jobs', { id });
    }
  },

  async search(filters: { query?: string; serialNumber?: string }): Promise<Job[]> {
    try {
      // Get all jobs first (this will try Firebase then fallback to IndexedDB)
      const allJobs = await this.getAll();
      return allJobs.filter(job => {
        const matchesQuery = !filters.query || 
          job.title.toLowerCase().includes(filters.query.toLowerCase()) ||
          job.serialNumber.toLowerCase().includes(filters.query.toLowerCase());
        const matchesSerial = !filters.serialNumber || 
          job.serialNumber.toLowerCase().includes(filters.serialNumber.toLowerCase());
        return matchesQuery && matchesSerial;
      });
    } catch (error) {
      console.error('Error searching jobs:', error);
      // Fallback to IndexedDB search
      const allJobs = await indexedDB.jobs.toArray();
      return allJobs.filter(job => {
        const matchesQuery = !filters.query || 
          job.title.toLowerCase().includes(filters.query.toLowerCase()) ||
          job.serialNumber.toLowerCase().includes(filters.query.toLowerCase());
        const matchesSerial = !filters.serialNumber || 
          job.serialNumber.toLowerCase().includes(filters.serialNumber.toLowerCase());
        return matchesQuery && matchesSerial;
      });
    }
  }
};

// Tools Service
export const toolsService = {
  async getAll(): Promise<Tool[]> {
    try {
      // Try Firebase first, then fallback to IndexedDB
      const q = query(collection(firestore, TOOLS_COLLECTION), orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      const tools: Tool[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tools.push({
          id: doc.id,
          name: data.name,
          isRobust: data.isRobust || false,
          complexDescription: data.complexDescription,
          variations: data.variations,
          notes: data.notes,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: data.updatedAt ? convertTimestamp(data.updatedAt) : undefined
        });
      });
      
      // Sync to IndexedDB for offline access
      await indexedDB.tools.clear();
      await indexedDB.tools.bulkPut(tools);
      
      return tools;
    } catch (error) {
      console.error('Error fetching tools from Firebase:', error);
      return await indexedDB.tools.orderBy('name').toArray();
    }
  },

  async create(tool: Omit<Tool, 'id'>): Promise<string> {
    try {
      const toolData = {
        ...tool,
        createdAt: Timestamp.now()
      };
      const docRef = await addDoc(collection(firestore, TOOLS_COLLECTION), removeUndefined(toolData));
      
      const newTool: Tool = {
        ...tool,
        id: docRef.id,
        createdAt: new Date()
      };
      await indexedDB.tools.add(newTool);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating tool:', error);
      const id = `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newTool: Tool = { ...tool, id, createdAt: new Date() };
      await indexedDB.tools.add(newTool);
      await queueOfflineAction('CREATE', 'tools', newTool);
      return id;
    }
  },

  async update(id: string, updates: Partial<Tool>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      await updateDoc(doc(firestore, TOOLS_COLLECTION, id), removeUndefined(updateData));
      await indexedDB.tools.update(id, { ...updates, updatedAt: new Date() });
    } catch (error) {
      console.error('Error updating tool:', error);
      await indexedDB.tools.update(id, { ...updates, updatedAt: new Date() });
      await queueOfflineAction('UPDATE', 'tools', { id, ...updates });
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, TOOLS_COLLECTION, id));
      await indexedDB.tools.delete(id);
    } catch (error) {
      console.error('Error deleting tool:', error);
      await indexedDB.tools.delete(id);
      await queueOfflineAction('DELETE', 'tools', { id });
    }
  }
}
// Offline sync functionality
interface OfflineAction {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  collection: string;
  data: any;
  timestamp: Date;
}

const queueOfflineAction = async (action: 'CREATE' | 'UPDATE' | 'DELETE', collection: string, data: any) => {
  const offlineAction: OfflineAction = {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    action,
    collection,
    data,
    timestamp: new Date()
  };
  
  await indexedDB.offlineActions.add(offlineAction);
};

// Sync offline actions when connection is restored
export const syncOfflineActions = async () => {
  try {
    const actions = await indexedDB.offlineActions.toArray();
    
    for (const action of actions) {
      try {
        switch (action.collection) {
          case 'jobs':
            if (action.action === 'CREATE') {
              await addDoc(collection(firestore, JOBS_COLLECTION), removeUndefined(action.data));
            } else if (action.action === 'UPDATE') {
              await updateDoc(doc(firestore, JOBS_COLLECTION, action.data.id), removeUndefined(action.data));
            } else if (action.action === 'DELETE') {
              await deleteDoc(doc(firestore, JOBS_COLLECTION, action.data.id));
            }
            break;
          case 'tools':
            if (action.action === 'CREATE') {
              await addDoc(collection(firestore, TOOLS_COLLECTION), removeUndefined(action.data));
            } else if (action.action === 'UPDATE') {
              await updateDoc(doc(firestore, TOOLS_COLLECTION, action.data.id), removeUndefined(action.data));
            } else if (action.action === 'DELETE') {
              await deleteDoc(doc(firestore, TOOLS_COLLECTION, action.data.id));
            }
            break;
          case 'job_tool_usages':
            if (action.action === 'CREATE') {
              await addDoc(collection(firestore, JOB_TOOL_USAGES_COLLECTION), removeUndefined(action.data));
            }
            break;
        }
        
        // Remove synced action
        await indexedDB.offlineActions.delete(action.id);
      } catch (syncError) {
        console.error('Error syncing action:', syncError);
      }
    }
  } catch (error) {
    console.error('Error syncing offline actions:', error);
  }
};
      