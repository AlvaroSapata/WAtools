import Dexie, { Table } from 'dexie';
import type { Job, Tool, JobToolUsage, OfflineAction } from '../types';

export class WAToolsDB extends Dexie {
  jobs!: Table<Job>;
  tools!: Table<Tool>;
  jobToolUsages!: Table<JobToolUsage>;
  offlineActions!: Table<OfflineAction>;

  constructor() {
    super('WAToolsDB');
    
    this.version(2).stores({
      jobs: 'id, title, serialNumber, createdAt',
      tools: 'id, name, createdAt',
      jobToolUsages: 'id, jobId, toolId, createdAt',
      offlineActions: 'id, type, collection, timestamp'
    });
  }
}

export const db = new WAToolsDB();

// Initialize with seed data if empty
export const initializeDatabase = async () => {
  try {
    const jobCount = await db.jobs.count();
    const toolCount = await db.tools.count();
    
    // Always seed if no data exists locally
    if (jobCount === 0 || toolCount === 0) {
      await seedDatabase();
      console.log('Database initialized with seed data');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    // Try to seed anyway
    try {
      await seedDatabase();
      console.log('Database seeded after error');
    } catch (seedError) {
      console.error('Failed to seed database:', seedError);
    }
  }
};

const seedDatabase = async () => {
  const seedTools: Omit<Tool, 'id'>[] = [
    {
      name: 'Llave dinamométrica',
      isRobust: true,
      complexDescription: 'Par 40–200 Nm',
      notes: 'Verificar calibración antes de uso',
      createdAt: new Date()
    },
    {
      name: 'Bomba hidráulica',
      isRobust: true,
      complexDescription: 'Capacidad 700 bar',
      notes: 'Revisión mensual obligatoria',
      createdAt: new Date()
    },
    {
      name: 'Eslinga 1t',
      isRobust: false,
      notes: 'Inspección visual antes de cada uso',
      createdAt: new Date()
    },
    {
      name: 'Llave inglesa',
      isRobust: false,
      variations: ['8mm', '10mm', '12mm', '14mm', '17mm', '19mm'],
      notes: 'Disponible en diferentes medidas',
      createdAt: new Date()
    }
  ];

  const seedJob: Omit<Job, 'id'> = {
    title: 'Cambio de pitch cylinder',
    serialNumber: 'JOB-2025-001',
    description: 'Modelo estándar para sustitución de cilindro de pitch.',
    createdAt: new Date()
  };

  // Add tools
  const toolIds: string[] = [];
  for (const tool of seedTools) {
    const id = `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.tools.add({ ...tool, id });
    toolIds.push(id);
  }

  // Add job
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.jobs.add({ ...seedJob, id: jobId });

  // Add tool usages
  for (let i = 0; i < toolIds.length; i++) {
    const usageId = `usage_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;
    await db.jobToolUsages.add({
      id: usageId,
      jobId,
      toolId: toolIds[i],
      quantity: 1,
      createdAt: new Date()
    });
  }

  console.log('Database seeded successfully');
};