export interface Issue {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Warning';
  description: string;
  evidence?: string;
}

export interface Optimization {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  difficulty: 'High' | 'Medium' | 'Low';
  benefit: string;
  actionType: 'Configuration' | 'SQL' | 'Architecture';
  currentValue?: string;
  suggestedValue?: string;
  codeSnippet?: string;
  description: string;
  autoFixAvailable: boolean;
}

export interface DiagnosticReport {
  id: string;
  type: 'Spark' | 'HDFS' | 'System' | 'General';
  title: string;
  timestamp: string;
  summary: string;
  status: 'Healthy' | 'Warning' | 'Critical';
  issues: Issue[];
  optimizations: Optimization[];
  metrics?: {
    label: string;
    value: string;
    trend?: 'up' | 'down' | 'stable';
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  reportId?: string;
}
