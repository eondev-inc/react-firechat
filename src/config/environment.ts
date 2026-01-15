// src/config/environment.ts
export const ENV = {
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  isSecure: window.location.protocol === 'https:',
  mode: import.meta.env.MODE,
} as const;

export const getEnvironmentConfig = () => ({
  showSecureIndicator: ENV.isProduction && ENV.isSecure,
  enableDebugTools: ENV.isDevelopment,
  apiTimeout: ENV.isDevelopment ? 10000 : 5000,
  logErrors: ENV.isDevelopment,
});

export default ENV;
