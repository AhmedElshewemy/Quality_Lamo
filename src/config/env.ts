/**
 * Environment Configuration
 * 
 * Reads and validates environment variables
 */

export interface UserCredentials {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'quality_manager' | 'quality_engineer';
  branch?: string;
}

export const envConfig = {
  // Application
  appName: import.meta.env.VITE_APP_NAME || 'نظام إدارة الجودة',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',

  // Security
  sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '86400000'),
  maxLoginAttempts: parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || '5'),
  passwordMinLength: parseInt(import.meta.env.VITE_PASSWORD_MIN_LENGTH || '8'),

  // Upload
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880'),
  allowedImageTypes: (import.meta.env.VITE_ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(','),

  // API
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
};

/**
 * Get default users from environment variables
 */
export const getDefaultUsers = (): UserCredentials[] => {
  const users: UserCredentials[] = [];

  // Admin
  if (import.meta.env.VITE_ADMIN_EMAIL) {
    users.push({
      email: import.meta.env.VITE_ADMIN_EMAIL,
      password: import.meta.env.VITE_ADMIN_PASSWORD || '',
      name: import.meta.env.VITE_ADMIN_NAME || 'مدير النظام',
      role: 'admin',
    });
  }

  // Manager
  if (import.meta.env.VITE_MANAGER_EMAIL) {
    users.push({
      email: import.meta.env.VITE_MANAGER_EMAIL,
      password: import.meta.env.VITE_MANAGER_PASSWORD || '',
      name: import.meta.env.VITE_MANAGER_NAME || 'مدير الجودة',
      role: 'quality_manager',
    });
  }

  // Engineers
  for (let i = 1; i <= 10; i++) {
    const email = import.meta.env[`VITE_ENGINEER${i}_EMAIL`];
    if (email) {
      users.push({
        email,
        password: import.meta.env[`VITE_ENGINEER${i}_PASSWORD`] || '',
        name: import.meta.env[`VITE_ENGINEER${i}_NAME`] || `مهندس جودة ${i}`,
        role: 'quality_engineer',
        branch: import.meta.env[`VITE_ENGINEER${i}_BRANCH`],
      });
    }
  }

  return users;
};

/**
 * Validate environment variables
 */
export const validateEnv = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required admin credentials
  if (!import.meta.env.VITE_ADMIN_EMAIL) {
    errors.push('VITE_ADMIN_EMAIL is required');
  }
  if (!import.meta.env.VITE_ADMIN_PASSWORD) {
    errors.push('VITE_ADMIN_PASSWORD is required');
  }

  // Validate password strength
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
  if (adminPassword && adminPassword.length < envConfig.passwordMinLength) {
    errors.push(`Admin password must be at least ${envConfig.passwordMinLength} characters`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
