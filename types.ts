export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface Finding {
  id: string;
  targetId: string;
  title: string;
  tool: string;
  severity: Severity;
  cvssScore?: number;
  description: string;
  remediation?: string;
  timestamp: string;
  category?: string;
}

export interface Target {
  id: string;
  domain: string;
  status: 'IDLE' | 'SCANNING' | 'COMPLETED' | 'ERROR';
  lastScan: string | null;
  riskScore: number;
  tags: string[];
  findingsCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface ScanLog {
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  message: string;
  tool: string;
}

export interface ArchitectureDoc {
  section: string;
  title: string;
  content: string;
  codeBlock?: string;
}

export interface Report {
  id: string;
  title: string;
  targetId: string;
  type: 'EXECUTIVE' | 'TECHNICAL' | 'COMPLIANCE';
  generatedAt: string;
  status: 'READY' | 'GENERATING' | 'FAILED';
  content?: string;
}