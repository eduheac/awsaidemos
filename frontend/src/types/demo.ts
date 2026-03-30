export type DemoType = 'demo' | 'poc' | 'mlp' | 'reference';
export type DemoStatus = 'concept' | 'development' | 'validated' | 'production';
export type TechnicalLevel = 'executive' | 'technical' | 'developer';
export type Modality = 'deployable' | 'live' | 'clickthrough' | 'video';

export interface DemoOwner {
  userId: string;
  name: string;
  email: string;
}

export interface DemoFile {
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: number;
}

export interface DemoMetrics {
  roi?: number;
  csat?: number;
  implementationTime?: number;
  customMetrics?: Record<string, unknown>;
}

export interface Demo {
  demoId: string;
  name: string;
  type: DemoType;
  status: DemoStatus;
  owner: DemoOwner;
  collaborators: DemoOwner[];
  industry: string;
  useCases: string[];
  businessProblem: string;
  targetAudience: string;
  technicalLevel: TechnicalLevel;
  awsServices: string[];
  aiModels: string[];
  architectureDiagram?: string;
  codeRepo?: string;
  demoScript?: string;
  metrics: DemoMetrics;
  modality: Modality;
  demoUrl?: string;
  videoUrl?: string;
  coverImage?: string;
  files: DemoFile[];
  securityChecklist: string[];
  createdAt: number;
  updatedAt: number;
  tags: string[];
}
