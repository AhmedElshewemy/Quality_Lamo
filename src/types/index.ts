// أنواع البيانات الأساسية للنظام

export type UserRole = 'quality_engineer' | 'quality_manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch?: string;
  avatar?: string;
}

export type Branch = {
  id: string;
  name: string;
  location: string;
  type: 'branch' | 'headquarters' | 'central_kitchen' | 'main_warehouse';
};

export type ComplianceStatus = 'compliant' | 'partially_compliant' | 'non_compliant';

export type IssueCategory = 
  | 'food_safety'
  | 'hygiene'
  | 'equipment'
  | 'storage'
  | 'staff'
  | 'documentation'
  | 'temperature'
  | 'pest_control'
  | 'water_quality'
  | 'waste_management';

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Issue {
  id: string;
  title: string;
  description: string;
  branchId: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  complianceStatus: ComplianceStatus;
  images: string[];
  reportedBy: string;
  reportedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  assignedTo?: string;
  followUpDate?: string;
}

export interface InspectionRecord {
  id: string;
  branchId: string;
  inspectorId: string;
  date: string;
  category: IssueCategory;
  complianceStatus: ComplianceStatus;
  score: number; // 0-100
  notes: string;
  images: string[];
}

export interface QualityReport {
  id: string;
  title: string;
  period: 'weekly' | 'monthly' | 'quarterly';
  startDate: string;
  endDate: string;
  generatedAt: string;
  generatedBy: string;
  summary: {
    totalIssues: number;
    resolvedIssues: number;
    openIssues: number;
    complianceRate: number;
    avgScore: number;
  };
  branchBreakdown: {
    branchId: string;
    issues: number;
    complianceRate: number;
    avgScore: number;
  }[];
  categoryBreakdown: {
    category: IssueCategory;
    count: number;
    resolved: number;
  }[];
}
