/**
 * Security Utilities
 * 
 * Provides security-related functions
 */

import { logger } from './logger';

export class SecurityUtils {
  /**
   * Sanitize input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate secure random token
   */
  static generateToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash password (simple implementation - use bcrypt in production backend)
   */
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate password strength
   */
  static isPasswordStrong(password: string): {
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong';
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('يجب أن تكون 8 أحرف على الأقل');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('يجب أن تحتوي على حرف صغير');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('يجب أن تحتوي على حرف كبير');

    if (/\d/.test(password)) score++;
    else feedback.push('يجب أن تحتوي على رقم');

    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push('يفضل إضافة رموز خاصة');

    const strength = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';
    const isValid = score >= 3;

    return { isValid, strength, feedback };
  }

  /**
   * Set secure cookie
   */
  static setSecureCookie(name: string, value: string, days: number = 7): void {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    const secure = window.location.protocol === 'https:' ? 'Secure;' : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; ${secure} SameSite=Strict`;
    
    logger.info('Secure cookie set', 'Security', { name, days });
  }

  /**
   * Get cookie value
   */
  static getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop()?.split(';').shift() || '');
    }
    return null;
  }

  /**
   * Delete cookie
   */
  static deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    logger.info('Cookie deleted', 'Security', { name });
  }

  /**
   * Check if session is valid
   */
  static isSessionValid(): boolean {
    const sessionExpiry = sessionStorage.getItem('sessionExpiry');
    if (!sessionExpiry) return false;
    
    const expiry = parseInt(sessionExpiry, 10);
    return Date.now() < expiry;
  }

  /**
   * Set session expiry
   */
  static setSessionExpiry(hours: number = 24): void {
    const expiry = Date.now() + hours * 60 * 60 * 1000;
    sessionStorage.setItem('sessionExpiry', expiry.toString());
    logger.info('Session expiry set', 'Security', { hours, expiry });
  }

  /**
   * Clear session
   */
  static clearSession(): void {
    sessionStorage.clear();
    this.deleteCookie('auth_token');
    logger.info('Session cleared', 'Security');
  }

  /**
   * Validate file type
   */
  static isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  /**
   * Validate file size
   */
  static isValidFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Rate limiting (client-side)
   */
  private static rateLimitStore: Map<string, number[]> = new Map();

  static checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const requests = this.rateLimitStore.get(key) || [];
    
    // Remove old requests
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      logger.warn('Rate limit exceeded', 'Security', { key, maxRequests, windowMs });
      return false;
    }
    
    recentRequests.push(now);
    this.rateLimitStore.set(key, recentRequests);
    return true;
  }

  /**
   * Content Security Policy helper
   */
  static getCSPHeaders(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://sql.js.org",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com",
    ].join('; ');
  }
}
