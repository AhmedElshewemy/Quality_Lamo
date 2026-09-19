/**
 * Performance Utilities
 * 
 * Provides performance monitoring and optimization helpers
 */

import { logger } from './logger';

export class PerformanceUtils {
  /**
   * Measure function execution time
   */
  static async measure<T>(
    name: string,
    fn: () => Promise<T> | T
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      logger.debug(`Performance: ${name}`, 'Performance', {
        duration: `${duration.toFixed(2)}ms`,
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(`Performance: ${name} failed`, 'Performance', {
        duration: `${duration.toFixed(2)}ms`,
        error,
      });
      throw error;
    }
  }

  /**
   * Debounce function
   */
  static debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  /**
   * Throttle function
   */
  static throttle<T extends (...args: any[]) => any>(
    fn: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Lazy load images
   */
  static lazyLoadImages(): void {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  /**
   * Preload critical resources
   */
  static preloadResource(url: string, as: 'image' | 'script' | 'style' | 'font' = 'image'): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    document.head.appendChild(link);
  }

  /**
   * Monitor memory usage
   */
  static getMemoryUsage(): {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  /**
   * Monitor page load time
   */
  static getPageLoadMetrics(): {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint?: number;
    firstContentfulPaint?: number;
  } {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics: any = {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
      loadComplete: navigation.loadEventEnd - navigation.startTime,
    };

    // Get paint timings
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach(entry => {
      if (entry.name === 'first-paint') {
        metrics.firstPaint = entry.startTime;
      } else if (entry.name === 'first-contentful-paint') {
        metrics.firstContentfulPaint = entry.startTime;
      }
    });

    return metrics;
  }

  /**
   * Log performance metrics
   */
  static logPerformanceMetrics(): void {
    const memory = this.getMemoryUsage();
    const pageLoad = this.getPageLoadMetrics();

    logger.info('Performance Metrics', 'Performance', {
      memory: memory ? {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
      } : null,
      pageLoad: pageLoad ? {
        domContentLoaded: `${pageLoad.domContentLoaded.toFixed(2)}ms`,
        loadComplete: `${pageLoad.loadComplete.toFixed(2)}ms`,
        firstPaint: pageLoad.firstPaint ? `${pageLoad.firstPaint.toFixed(2)}ms` : undefined,
        firstContentfulPaint: pageLoad.firstContentfulPaint ? `${pageLoad.firstContentfulPaint.toFixed(2)}ms` : undefined,
      } : null,
    });
  }

  /**
   * Virtual scroll helper
   */
  static calculateVisibleRange(
    scrollTop: number,
    itemHeight: number,
    totalItems: number,
    viewportHeight: number,
    overscan: number = 5
  ): { start: number; end: number } {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(viewportHeight / itemHeight);
    const end = Math.min(start + visibleCount + overscan, totalItems);
    
    return {
      start: Math.max(0, start - overscan),
      end,
    };
  }

  /**
   * Cache API helper
   */
  static async cacheResource(key: string, data: any, ttl: number = 3600000): Promise<void> {
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
  }

  static async getCachedResource<T>(key: string): Promise<T | null> {
    const cached = localStorage.getItem(`cache_${key}`);
    if (!cached) return null;

    const { data, timestamp, ttl } = JSON.parse(cached);
    
    if (Date.now() - timestamp > ttl) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }

    return data as T;
  }

  /**
   * Clear expired cache
   */
  static clearExpiredCache(): void {
    const now = Date.now();
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache_')) {
        const cached = localStorage.getItem(key);
        if (cached) {
          const { timestamp, ttl } = JSON.parse(cached);
          if (now - timestamp > ttl) {
            localStorage.removeItem(key);
          }
        }
      }
    }
  }
}
