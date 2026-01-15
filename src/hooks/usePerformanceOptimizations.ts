// src/hooks/usePerformanceOptimizations.ts
import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook para debouncing de funciones
 */
export const useDebounce = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

/**
 * Hook para throttling de funciones
 */
export const useThrottle = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      if (timeSinceLastRun >= delay) {
        callback(...args);
        lastRunRef.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRunRef.current = Date.now();
        }, delay - timeSinceLastRun);
      }
    },
    [callback, delay]
  );
};

/**
 * Hook para detectar si un elemento está visible en viewport
 */
export const useIntersectionObserver = (
  callback: (isIntersecting: boolean) => void,
  options?: IntersectionObserverInit
) => {
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        callback(entry.isIntersecting);
      });
    }, options);

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [callback, options]);

  return targetRef;
};

/**
 * Hook para precargar imágenes
 */
export const useImagePreloader = (imageSources: string[]) => {
  useEffect(() => {
    imageSources.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [imageSources]);
};

/**
 * Hook para medir performance de componente
 */
export const usePerformanceMonitor = (componentName: string, enabled = false) => {
  const renderCountRef = useRef(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    renderCountRef.current += 1;
    const renderTime = performance.now() - startTimeRef.current;

    if (renderCountRef.current > 1) {
      console.log(
        `[Performance] ${componentName} - Render #${renderCountRef.current} - ${renderTime.toFixed(2)}ms`
      );
    }
  });

  useEffect(() => {
    if (!enabled) return;
    startTimeRef.current = performance.now();
  });
};

/**
 * Hook para lazy loading de componentes con retry
 */
export const useLazyLoadWithRetry = (
  importFn: () => Promise<unknown>,
  maxRetries = 3
) => {
  const retryCount = useRef(0);

  const loadWithRetry = useCallback(async (): Promise<unknown> => {
    try {
      return await importFn();
    } catch (error) {
      if (retryCount.current < maxRetries) {
        retryCount.current += 1;
        console.warn(
          `Retry ${retryCount.current}/${maxRetries} for lazy component`
        );
        // Esperar antes de reintentar (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * retryCount.current)
        );
        return loadWithRetry();
      }
      throw error;
    }
  }, [importFn, maxRetries]);

  return loadWithRetry;
};

/**
 * Hook para memoizar valores costosos
 */
export const useDeepMemo = <T>(value: T, deps: React.DependencyList): T => {
  const ref = useRef<T>(value);
  const depsRef = useRef(deps);

  const hasChanged = deps.some((dep, index) => {
    const prevDep = depsRef.current[index];
    return !Object.is(dep, prevDep);
  });

  if (hasChanged) {
    ref.current = value;
    depsRef.current = deps;
  }

  return ref.current;
};

/**
 * Hook para optimizar re-renders con RAF
 */
export const useRAFCallback = <T extends (...args: unknown[]) => void>(
  callback: T
): ((...args: Parameters<T>) => void) => {
  const rafIdRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      callbackRef.current(...args);
    });
  }, []);
};
