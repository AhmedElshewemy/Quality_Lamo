export type UserRole = 'quality_engineer' | 'quality_manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch?: string;
}

export type BranchType = 'branch' | 'central_kitchen_warehouse';

export type Branch = {
  id: string;
  name: string;
  location: string;
  type: BranchType;
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

export type PageId =
  | 'dashboard'
  | 'report-issue'
  | 'my-issues'
  | 'all-issues'
  | 'reports'
  | 'branches'
  | 'staff';
