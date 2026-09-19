/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_ENV: string;
  
  // Admin
  readonly VITE_ADMIN_EMAIL: string;
  readonly VITE_ADMIN_PASSWORD: string;
  readonly VITE_ADMIN_NAME: string;
  
  // Manager
  readonly VITE_MANAGER_EMAIL: string;
  readonly VITE_MANAGER_PASSWORD: string;
  readonly VITE_MANAGER_NAME: string;
  
  // Engineers
  readonly VITE_ENGINEER1_EMAIL: string;
  readonly VITE_ENGINEER1_PASSWORD: string;
  readonly VITE_ENGINEER1_NAME: string;
  readonly VITE_ENGINEER1_BRANCH: string;
  
  readonly VITE_ENGINEER2_EMAIL: string;
  readonly VITE_ENGINEER2_PASSWORD: string;
  readonly VITE_ENGINEER2_NAME: string;
  readonly VITE_ENGINEER2_BRANCH: string;
  
  readonly VITE_ENGINEER3_EMAIL: string;
  readonly VITE_ENGINEER3_PASSWORD: string;
  readonly VITE_ENGINEER3_NAME: string;
  readonly VITE_ENGINEER3_BRANCH: string;
  
  // Firebase
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  
  // API
  readonly VITE_API_URL: string;
  
  // Security
  readonly VITE_SESSION_TIMEOUT: string;
  readonly VITE_MAX_LOGIN_ATTEMPTS: string;
  readonly VITE_PASSWORD_MIN_LENGTH: string;
  
  // Upload
  readonly VITE_MAX_FILE_SIZE: string;
  readonly VITE_ALLOWED_IMAGE_TYPES: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
