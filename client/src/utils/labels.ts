import { ElementType } from 'react';
import {
  Shield,
  Droplets,
  Wrench,
  Package,
  Users,
  FileWarning,
  Thermometer,
  Bug,
  Trash2,
  Building2,
  Utensils,
} from 'lucide-react';
import {
  IssueStatus,
  IssuePriority,
  IssueCategory,
  ComplianceStatus,
  UserRole,
  BranchType,
} from '../types';

// ---- Status ----

export const STATUS_LABELS: Record<IssueStatus, string> = {
  open: 'مفتوحة',
  in_progress: 'قيد المعالجة',
  resolved: 'تم الحل',
  closed: 'مغلقة',
};

export const STATUS_COLORS: Record<IssueStatus, string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
};

export const STATUS_OPTIONS = (Object.keys(STATUS_LABELS) as IssueStatus[]).map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

// ---- Priority ----

export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  critical: 'حرجة',
};

export const PRIORITY_COLORS: Record<IssuePriority, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

// Border/ring variant used for the selectable "pill" buttons in ReportIssue
export const PRIORITY_PICKER_COLORS: Record<IssuePriority, string> = {
  low: 'border-blue-300 bg-blue-50 text-blue-700',
  medium: 'border-yellow-300 bg-yellow-50 text-yellow-700',
  high: 'border-orange-300 bg-orange-50 text-orange-700',
  critical: 'border-red-300 bg-red-50 text-red-700',
};

export const PRIORITY_OPTIONS = (Object.keys(PRIORITY_LABELS) as IssuePriority[]).map((value) => ({
  value,
  label: PRIORITY_LABELS[value],
  pickerColor: PRIORITY_PICKER_COLORS[value],
}));

// ---- Category ----

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  food_safety: 'سلامة الغذاء',
  hygiene: 'النظافة والتعقيم',
  equipment: 'المعدات والصيانة',
  storage: 'التخزين',
  staff: 'الموظفين والتدريب',
  documentation: 'المستندات والسجلات',
  temperature: 'درجة الحرارة',
  pest_control: 'مكافحة الآفات',
  water_quality: 'جودة المياه',
  waste_management: 'إدارة النفايات',
};

export const CATEGORY_ICONS: Record<IssueCategory, ElementType> = {
  food_safety: Shield,
  hygiene: Droplets,
  equipment: Wrench,
  storage: Package,
  staff: Users,
  documentation: FileWarning,
  temperature: Thermometer,
  pest_control: Bug,
  water_quality: Droplets,
  waste_management: Trash2,
};

export const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABELS) as IssueCategory[]).map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
}));

// ---- Compliance ----

export const COMPLIANCE_LABELS: Record<ComplianceStatus, string> = {
  compliant: 'مطابق',
  partially_compliant: 'مطابق جزئياً',
  non_compliant: 'غير مطابق',
};

export const COMPLIANCE_COLORS: Record<ComplianceStatus, string> = {
  compliant: 'bg-green-100 text-green-700',
  partially_compliant: 'bg-yellow-100 text-yellow-700',
  non_compliant: 'bg-red-100 text-red-700',
};

export const COMPLIANCE_PICKER_COLORS: Record<ComplianceStatus, string> = {
  compliant: 'border-green-300 bg-green-50 text-green-700',
  partially_compliant: 'border-yellow-300 bg-yellow-50 text-yellow-700',
  non_compliant: 'border-red-300 bg-red-50 text-red-700',
};

export const COMPLIANCE_OPTIONS = (Object.keys(COMPLIANCE_LABELS) as ComplianceStatus[]).map((value) => ({
  value,
  label: COMPLIANCE_LABELS[value],
  pickerColor: COMPLIANCE_PICKER_COLORS[value],
}));

// ---- Branch type ----

export const BRANCH_TYPE_LABELS: Record<BranchType, string> = {
  branch: 'فرع',
  central_kitchen_warehouse: 'مطبخ مركزي ومخزن',
};

export const BRANCH_TYPE_ICONS: Record<BranchType, ElementType> = {
  branch: Building2,
  central_kitchen_warehouse: Utensils,
};

// Gradient classes for the colored header strip / icon badge on branch cards
export const BRANCH_TYPE_GRADIENTS: Record<BranchType, string> = {
  branch: 'from-blue-500 to-blue-600',
  central_kitchen_warehouse: 'from-orange-500 to-orange-600',
};

// ---- User role ----

export const ROLE_LABELS: Record<UserRole, string> = {
  quality_engineer: 'مهندس جودة',
  quality_manager: 'مدير الجودة',
  admin: 'مدير النظام',
};

export const ROLE_BADGE_COLORS: Record<UserRole, string> = {
  quality_engineer: 'bg-blue-100 text-blue-700',
  quality_manager: 'bg-purple-100 text-purple-700',
  admin: 'bg-gray-100 text-gray-700',
};

export const ROLE_AVATAR_GRADIENTS: Record<UserRole, string> = {
  quality_engineer: 'from-blue-500 to-cyan-500',
  quality_manager: 'from-purple-500 to-purple-600',
  admin: 'from-gray-600 to-gray-700',
};
