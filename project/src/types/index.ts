export interface Job {
  id: string;
  title: string;
  serialNumber: string;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Tool {
  id: string;
  name: string;
  isRobust: boolean;
  complexDescription?: string;
  variations?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface JobToolUsage {
  id: string;
  jobId: string;
  toolId: string;
  variation?: string;
  quantity: number;
  notes?: string;
  createdAt: Date;
}

export interface JobWithTools extends Job {
  tools: Array<{
    tool: Tool;
    quantity: number;
    notes?: string;
    variation?: string;
  }>;
}

export interface ToolWithJobs extends Tool {
  usageHistory: Array<{
    job: Job;
    quantity: number;
    notes?: string;
    usageDate: Date;
  }>;
}

export interface SearchFilters {
  query: string;
  serialNumber?: string;
}

export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  collection: 'jobs' | 'tools' | 'job_tool_usages';
  data: any;
  timestamp: Date;
}