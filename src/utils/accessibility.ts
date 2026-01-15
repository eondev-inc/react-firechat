// src/utils/accessibility.ts

/**
 * Genera un ID único para elementos accesibles
 */
export const generateAriaId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`;
};

/**
 * Anuncia un mensaje a lectores de pantalla
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remover después de que se haya leído
  setTimeout(() => {
    announcement.remove();
  }, 1000);
};

/**
 * Maneja navegación por teclado en listas
 */
export class KeyboardNavigationHandler {
  private currentIndex: number = 0;
  private items: HTMLElement[] = [];

  constructor(items: HTMLElement[]) {
    this.items = items;
  }

  handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveNext();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.movePrevious();
        break;
      case 'Home':
        event.preventDefault();
        this.moveFirst();
        break;
      case 'End':
        event.preventDefault();
        this.moveLast();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.activateCurrent();
        break;
    }
  }

  private moveNext(): void {
    if (this.currentIndex < this.items.length - 1) {
      this.currentIndex++;
      this.focusCurrent();
    }
  }

  private movePrevious(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.focusCurrent();
    }
  }

  private moveFirst(): void {
    this.currentIndex = 0;
    this.focusCurrent();
  }

  private moveLast(): void {
    this.currentIndex = this.items.length - 1;
    this.focusCurrent();
  }

  private focusCurrent(): void {
    const item = this.items[this.currentIndex];
    if (item) {
      item.focus();
      item.scrollIntoView({ block: 'nearest' });
    }
  }

  private activateCurrent(): void {
    const item = this.items[this.currentIndex];
    if (item) {
      item.click();
    }
  }

  updateItems(items: HTMLElement[]): void {
    this.items = items;
    this.currentIndex = Math.min(this.currentIndex, items.length - 1);
  }

  setCurrentIndex(index: number): void {
    this.currentIndex = Math.max(0, Math.min(index, this.items.length - 1));
  }
}

/**
 * Gestiona el foco de la aplicación para accesibilidad
 */
export class FocusManager {
  private previousFocus: HTMLElement | null = null;

  /**
   * Guarda el foco actual
   */
  saveFocus(): void {
    this.previousFocus = document.activeElement as HTMLElement;
  }

  /**
   * Restaura el foco guardado
   */
  restoreFocus(): void {
    if (this.previousFocus && this.previousFocus.focus) {
      this.previousFocus.focus();
    }
  }

  /**
   * Atrapa el foco dentro de un elemento
   */
  trapFocus(element: HTMLElement): () => void {
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);

    // Focus el primer elemento
    firstFocusable?.focus();

    // Retornar función de cleanup
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }
}

/**
 * Verifica contraste de colores para accesibilidad
 */
export const checkColorContrast = (foreground: string, background: string): {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
} => {
  // Convertir hex a RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Calcular luminancia relativa
  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) {
    return { ratio: 0, wcagAA: false, wcagAAA: false };
  }

  const l1 = getLuminance(fg.r, fg.g, fg.b);
  const l2 = getLuminance(bg.r, bg.g, bg.b);

  const ratio = l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);

  return {
    ratio,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7,
  };
};

/**
 * Hook de utilidad para manejo de escape key
 */
export const handleEscapeKey = (callback: () => void) => {
  return (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      callback();
    }
  };
};

/**
 * Formatea texto para lectores de pantalla
 */
export const formatForScreenReader = (text: string): string => {
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Agregar espacio entre camelCase
    .replace(/_/g, ' ') // Reemplazar underscores
    .replace(/\d+/g, (match) => ` ${match} `) // Agregar espacios alrededor de números
    .trim();
};
