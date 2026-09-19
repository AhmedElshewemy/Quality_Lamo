/**
 * Error Handler
 * 
 * Centralized error handling for the application
 */

import { logger } from './logger';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: string) {
    super(message, 400, true, context);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'المصادقة فشلت', context?: string) {
    super(message, 401, true, context);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'غير مصرح لك بهذا الإجراء', context?: string) {
    super(message, 403, true, context);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'المورد غير موجود', context?: string) {
    super(message, 404, true, context);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, context?: string) {
    super(message, 500, false, context);
    this.name = 'DatabaseError';
  }
}

export class FileUploadError extends AppError {
  constructor(message: string, context?: string) {
    super(message, 400, true, context);
    this.name = 'FileUploadError';
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle error and log it
   */
  public handleError(error: Error | AppError, context?: string): void {
    if (error instanceof AppError) {
      if (error.isOperational) {
        logger.warn(error.message, error.context || context, {
          statusCode: error.statusCode,
          stack: error.stack,
        });
      } else {
        logger.error(error.message, error.context || context, {
          statusCode: error.statusCode,
          stack: error.stack,
        });
      }
    } else {
      logger.error(error.message, context, {
        stack: error.stack,
      });
    }
  }

  /**
   * Handle async errors
   */
  public handleAsyncError = (
    fn: (...args: any[]) => Promise<any>
  ): ((...args: any[]) => Promise<any>) => {
    return async (...args: any[]) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError(error as Error);
        throw error;
      }
    };
  };

  /**
   * Get user-friendly error message
   */
  public getUserMessage(error: Error | AppError): string {
    if (error instanceof AppError) {
      switch (error.statusCode) {
        case 400:
          return 'بيانات غير صحيحة. يرجى التحقق من المدخلات.';
        case 401:
          return 'يجب تسجيل الدخول أولاً.';
        case 403:
          return 'غير مصرح لك بهذا الإجراء.';
        case 404:
          return 'المورد المطلوب غير موجود.';
        case 500:
          return 'حدث خطأ في النظام. يرجى المحاولة لاحقاً.';
        default:
          return error.message;
      }
    }

    return 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.';
  }

  /**
   * Handle global errors
   */
  public setupGlobalHandlers(): void {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      logger.fatal('Unhandled Promise Rejection', 'GlobalHandler', {
        reason: event.reason,
        promise: event.promise,
      });
      event.preventDefault();
    });

    // Uncaught errors
    window.addEventListener('error', (event) => {
      logger.fatal('Uncaught Error', 'GlobalHandler', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    });
  }
}

export const errorHandler = ErrorHandler.getInstance();
