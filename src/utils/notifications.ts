/**
 * Toast Notification System
 * 
 * Provides user feedback for actions
 */

import toast, { Toaster } from 'react-hot-toast';

export const toastNotifications = {
  // Success notifications
  success: {
    issueCreated: () => toast.success('تم تسجيل المشكلة بنجاح'),
    issueUpdated: () => toast.success('تم تحديث المشكلة بنجاح'),
    issueResolved: () => toast.success('تم تسجيل حل المشكلة بنجاح'),
    issueDeleted: () => toast.success('تم حذف المشكلة بنجاح'),
    userCreated: () => toast.success('تم إنشاء المستخدم بنجاح'),
    userUpdated: () => toast.success('تم تحديث المستخدم بنجاح'),
    branchCreated: () => toast.success('تم إنشاء الفرع بنجاح'),
    branchUpdated: () => toast.success('تم تحديث الفرع بنجاح'),
    reportGenerated: () => toast.success('تم إنشاء التقرير بنجاح'),
    loginSuccess: () => toast.success('تم تسجيل الدخول بنجاح'),
    logoutSuccess: () => toast.success('تم تسجيل الخروج بنجاح'),
    fileUploaded: () => toast.success('تم رفع الملف بنجاح'),
    settingsSaved: () => toast.success('تم حفظ الإعدادات بنجاح'),
    custom: (message: string) => toast.success(message),
  },

  // Error notifications
  error: {
    issueCreateFailed: () => toast.error('فشل تسجيل المشكلة'),
    issueUpdateFailed: () => toast.error('فشل تحديث المشكلة'),
    issueDeleteFailed: () => toast.error('فشل حذف المشكلة'),
    userCreateFailed: () => toast.error('فشل إنشاء المستخدم'),
    userUpdateFailed: () => toast.error('فشل تحديث المستخدم'),
    loginFailed: () => toast.error('فشل تسجيل الدخول'),
    fileUploadFailed: () => toast.error('فشل رفع الملف'),
    networkError: () => toast.error('خطأ في الاتصال بالشبكة'),
    validationError: (message: string) => toast.error(message),
    unauthorized: () => toast.error('غير مصرح لك بهذا الإجراء'),
    notFound: () => toast.error('المورد غير موجود'),
    custom: (message: string) => toast.error(message),
  },

  // Warning notifications
  warning: {
    unsavedChanges: () => toast('لديك تغييرات غير محفوظة', {
      icon: '⚠️',
    }),
    confirmDelete: () => toast('هل أنت متأكد من الحذف؟', {
      icon: '🗑️',
      duration: 3000,
    }),
    sessionExpiring: () => toast('ستنتهي جلستك قريباً', {
      icon: '⏰',
      duration: 5000,
    }),
    custom: (message: string) => toast(message, {
      icon: '⚠️',
    }),
  },

  // Info notifications
  info: {
    loading: (message: string = 'جاري التحميل...') => toast.loading(message),
    processing: (message: string = 'جاري المعالجة...') => toast.loading(message),
    custom: (message: string) => toast(message, {
      icon: 'ℹ️',
    }),
  },

  // Promise handling
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ): Promise<T> => {
    return toast.promise(promise, messages);
  },

  // Dismiss all toasts
  dismissAll: () => toast.dismiss(),
};

// Toast Component to be added to App
export const ToastProvider = Toaster;

// Toast options
export const toastOptions = {
  position: 'top-center' as const,
  reverseOrder: false,
  style: {
    direction: 'rtl' as const,
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: '#10b981',
      secondary: '#ffffff',
    },
  },
  error: {
    duration: 4000,
    iconTheme: {
      primary: '#ef4444',
      secondary: '#ffffff',
    },
  },
};
