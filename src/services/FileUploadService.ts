/**
 * File Upload Service
 * 
 * Handles image uploads to Firebase Storage or local storage
 */

import { firebaseService } from '../config/firebase.production';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { logger } from '../utils/logger';
import { errorHandler, FileUploadError } from '../utils/errorHandler';

export class FileUploadService {
  private static instance: FileUploadService;
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  private constructor() {}

  public static getInstance(): FileUploadService {
    if (!FileUploadService.instance) {
      FileUploadService.instance = new FileUploadService();
    }
    return FileUploadService.instance;
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): void {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new FileUploadError('حجم الصورة يجب أن يكون أقل من 5MB');
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new FileUploadError('يجب أن تكون الصورة بصيغة JPG أو PNG أو WebP');
    }
  }

  /**
   * Generate unique filename
   */
  private generateFilename(file: File): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    return `${timestamp}_${randomString}.${extension}`;
  }

  /**
   * Upload file to Firebase Storage
   */
  async uploadFile(file: File, folder: string = 'issues'): Promise<string> {
    try {
      this.validateFile(file);

      if (!firebaseService.isConfigured()) {
        // Fallback to local storage (base64)
        return await this.uploadToLocal(file);
      }

      const storage = firebaseService.getStorage();
      const filename = this.generateFilename(file);
      const storageRef = ref(storage, `${folder}/${filename}`);

      logger.info(`Uploading file: ${filename}`, 'FileUpload');

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      logger.info(`File uploaded successfully: ${filename}`, 'FileUpload', {
        size: file.size,
        type: file.type,
        url: downloadURL,
      });

      return downloadURL;
    } catch (error) {
      if (error instanceof FileUploadError) {
        throw error;
      }
      
      errorHandler.handleError(error as Error, 'FileUpload');
      throw new FileUploadError('فشل رفع الصورة. يرجى المحاولة مرة أخرى.');
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(files: File[], folder: string = 'issues'): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Upload to local storage (base64) - Fallback
   */
  private async uploadToLocal(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const base64 = reader.result as string;
        logger.info('File uploaded to local storage', 'FileUpload', {
          size: file.size,
          type: file.type,
        });
        resolve(base64);
      };
      
      reader.onerror = () => {
        reject(new FileUploadError('فشل قراءة الصورة'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Delete file from storage
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      if (!firebaseService.isConfigured()) {
        logger.warn('Firebase not configured, cannot delete file', 'FileUpload');
        return;
      }

      if (fileUrl.startsWith('data:')) {
        // Local storage (base64) - nothing to delete
        return;
      }

      const storage = firebaseService.getStorage();
      const storageRef = ref(storage, fileUrl);
      
      await deleteObject(storageRef);
      
      logger.info('File deleted successfully', 'FileUpload', { url: fileUrl });
    } catch (error) {
      errorHandler.handleError(error as Error, 'FileUpload');
      throw new FileUploadError('فشل حذف الصورة');
    }
  }

  /**
   * Compress image before upload
   */
  async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new FileUploadError('فشل معالجة الصورة'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new FileUploadError('فشل ضغط الصورة'));
                return;
              }

              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              logger.info('Image compressed', 'FileUpload', {
                originalSize: file.size,
                compressedSize: compressedFile.size,
                compression: ((1 - compressedFile.size / file.size) * 100).toFixed(2) + '%',
              });

              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        };
        
        img.onerror = () => {
          reject(new FileUploadError('فشل تحميل الصورة'));
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => {
        reject(new FileUploadError('فشل قراءة الصورة'));
      };
      
      reader.readAsDataURL(file);
    });
  }
}

export const fileUploadService = FileUploadService.getInstance();
