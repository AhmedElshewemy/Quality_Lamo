/**
 * Validation Schemas using Zod
 * 
 * Provides runtime validation for all data types
 */

import { z } from 'zod';

// Issue Validation Schema
export const issueSchema = z.object({
  title: z.string()
    .min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل')
    .max(200, 'العنوان يجب أن يكون أقل من 200 حرف'),
  
  description: z.string()
    .min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل')
    .max(5000, 'الوصف يجب أن يكون أقل من 5000 حرف'),
  
  branchId: z.string()
    .min(1, 'يجب اختيار الفرع'),
  
  category: z.enum([
    'food_safety',
    'hygiene',
    'equipment',
    'storage',
    'staff',
    'documentation',
    'temperature',
    'pest_control',
    'water_quality',
    'waste_management',
  ] as const),
  
  priority: z.enum(['low', 'medium', 'high', 'critical'] as const),
  
  complianceStatus: z.enum(['compliant', 'partially_compliant', 'non_compliant'] as const),
  
  images: z.array(z.string().url('رابط الصورة غير صحيح'))
    .max(10, 'يمكن رفع 10 صور كحد أقصى')
    .optional()
    .default([]),
  
  reportedBy: z.string()
    .min(1, 'يجب تحديد من قام بالتقرير'),
  
  reportedAt: z.string()
    .datetime('تاريخ التقرير غير صحيح'),
  
  resolvedAt: z.string()
    .datetime('تاريخ الحل غير صحيح')
    .optional(),
  
  resolutionNotes: z.string()
    .max(2000, 'ملاحظات الحل يجب أن تكون أقل من 2000 حرف')
    .optional(),
  
  assignedTo: z.string().optional(),
  
  followUpDate: z.string()
    .datetime('تاريخ المتابعة غير صحيح')
    .optional(),
});

export type IssueFormData = z.infer<typeof issueSchema>;

// User Validation Schema
export const userSchema = z.object({
  name: z.string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم يجب أن يكون أقل من 100 حرف'),
  
  email: z.string()
    .email('البريد الإلكتروني غير صحيح')
    .min(5, 'البريد الإلكتروني قصير جداً')
    .max(255, 'البريد الإلكتروني طويل جداً'),
  
  password: z.string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .max(100, 'كلمة المرور طويلة جداً')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم'
    ),
  
  role: z.enum(['quality_engineer', 'quality_manager', 'admin'] as const),
  
  branch: z.string().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

// Login Validation Schema
export const loginSchema = z.object({
  email: z.string()
    .email('البريد الإلكتروني غير صحيح'),
  
  password: z.string()
    .min(1, 'يجب إدخال كلمة المرور'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Branch Validation Schema
export const branchSchema = z.object({
  name: z.string()
    .min(2, 'اسم الفرع يجب أن يكون حرفين على الأقل')
    .max(100, 'اسم الفرع يجب أن يكون أقل من 100 حرف'),
  
  location: z.string()
    .min(5, 'الموقع يجب أن يكون 5 أحرف على الأقل')
    .max(200, 'الموقع يجب أن يكون أقل من 200 حرف'),
  
  type: z.enum(['branch', 'headquarters', 'central_kitchen', 'main_warehouse'] as const),
});

export type BranchFormData = z.infer<typeof branchSchema>;

// Validation helper functions
export const validateIssue = (data: unknown) => {
  return issueSchema.safeParse(data);
};

export const validateUser = (data: unknown) => {
  return userSchema.safeParse(data);
};

export const validateLogin = (data: unknown) => {
  return loginSchema.safeParse(data);
};

export const validateBranch = (data: unknown) => {
  return branchSchema.safeParse(data);
};
