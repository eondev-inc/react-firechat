// src/utils/security.ts
import DOMPurify from 'dompurify';

/**
 * Sanitiza texto para prevenir XSS attacks
 */
export const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [], // No permitir ningún tag HTML
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true, // Mantener el contenido pero remover tags
  });
};

/**
 * Sanitiza HTML permitiendo solo tags seguros
 */
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
};

/**
 * Valida que un email tenga formato correcto
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida que un email sea de dominio @gmail.com
 */
export const validateGmailDomain = (email: string): boolean => {
  return email.toLowerCase().endsWith('@gmail.com');
};

/**
 * Rate limiting básico en el cliente
 */
class RateLimiter {
  private timestamps: number[] = [];
  private maxRequests: number;
  private timeWindow: number; // en milisegundos

  constructor(maxRequests: number, timeWindowSeconds: number) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowSeconds * 1000;
  }

  /**
   * Verifica si la acción está permitida
   */
  canPerformAction(): boolean {
    const now = Date.now();
    
    // Remover timestamps antiguos fuera de la ventana de tiempo
    this.timestamps = this.timestamps.filter(
      timestamp => now - timestamp < this.timeWindow
    );

    // Verificar si se excedió el límite
    if (this.timestamps.length >= this.maxRequests) {
      return false;
    }

    // Registrar el nuevo timestamp
    this.timestamps.push(now);
    return true;
  }

  /**
   * Obtiene el tiempo restante hasta poder realizar la siguiente acción
   */
  getTimeUntilNextAction(): number {
    if (this.timestamps.length < this.maxRequests) {
      return 0;
    }

    const oldestTimestamp = this.timestamps[0];
    const timeElapsed = Date.now() - oldestTimestamp;
    const timeRemaining = this.timeWindow - timeElapsed;

    return Math.max(0, Math.ceil(timeRemaining / 1000));
  }

  /**
   * Resetea el rate limiter
   */
  reset(): void {
    this.timestamps = [];
  }
}

// Instancias de rate limiters para diferentes acciones
export const messageRateLimiter = new RateLimiter(10, 10); // 10 mensajes por 10 segundos
export const contactAddRateLimiter = new RateLimiter(5, 60); // 5 contactos por minuto
export const typingRateLimiter = new RateLimiter(20, 10); // 20 eventos typing por 10 segundos

/**
 * Escapa caracteres especiales para prevenir inyección
 */
export const escapeSpecialChars = (str: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Valida longitud de mensaje
 */
export const validateMessageLength = (
  text: string,
  maxLength: number = 5000
): { valid: boolean; error?: string } => {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'El mensaje no puede estar vacío' };
  }

  if (text.length > maxLength) {
    return {
      valid: false,
      error: `El mensaje no puede exceder ${maxLength} caracteres`,
    };
  }

  return { valid: true };
};

/**
 * Previene spam detectando mensajes repetidos
 */
export class SpamDetector {
  private recentMessages: string[] = [];
  private maxDuplicates: number;

  constructor(maxDuplicates: number = 3) {
    this.maxDuplicates = maxDuplicates;
  }

  /**
   * Verifica si el mensaje es spam
   */
  isSpam(message: string): boolean {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Contar cuántas veces aparece este mensaje
    const count = this.recentMessages.filter(
      msg => msg === normalizedMessage
    ).length;

    if (count >= this.maxDuplicates) {
      return true;
    }

    // Agregar el mensaje al historial
    this.recentMessages.push(normalizedMessage);

    // Mantener solo los últimos 10 mensajes
    if (this.recentMessages.length > 10) {
      this.recentMessages.shift();
    }

    return false;
  }

  /**
   * Resetea el detector
   */
  reset(): void {
    this.recentMessages = [];
  }
}

export const spamDetector = new SpamDetector(3);
