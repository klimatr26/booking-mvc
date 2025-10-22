/**
 * ESB - Configuración de Endpoints y Namespaces
 */

export interface EndpointConfig {
  url: string;
  namespace: string;
  timeout?: number;
  enabled: boolean;
}

export interface ESBConfig {
  endpoints: {
    hotel: EndpointConfig;
    car: EndpointConfig;
    flight: EndpointConfig;
    restaurant: EndpointConfig;
    package: EndpointConfig;
  };
  database: {
    enabled: boolean;
    cacheTimeout: number; // ms
  };
  retry: {
    maxRetries: number;
    delayMs: number;
  };
  logging: {
    enabled: boolean;
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  };
}

/**
 * Configuración por defecto del ESB
 * NOTA: Ajusta estas URLs cuando tengas los endpoints reales de tus amigos
 */
export const defaultConfig: ESBConfig = {
  endpoints: {
    hotel: {
      url: 'http://localhost:8081/hotel-service',
      namespace: 'http://booking.esb/hotel',
      timeout: 30000,
      enabled: true
    },
    car: {
      url: 'http://localhost:8082/car-service',
      namespace: 'http://booking.esb/car',
      timeout: 30000,
      enabled: true
    },
    flight: {
      url: 'http://localhost:8083/flight-service',
      namespace: 'http://booking.esb/flight',
      timeout: 30000,
      enabled: true
    },
    restaurant: {
      url: 'http://localhost:8084/restaurant-service',
      namespace: 'http://booking.esb/restaurant',
      timeout: 30000,
      enabled: true
    },
    package: {
      url: 'http://localhost:8085/package-service',
      namespace: 'http://booking.esb/package',
      timeout: 30000,
      enabled: true
    }
  },
  database: {
    enabled: true,
    cacheTimeout: 300000 // 5 minutos
  },
  retry: {
    maxRetries: 3,
    delayMs: 1000
  },
  logging: {
    enabled: true,
    level: 'INFO'
  }
};

let currentConfig: ESBConfig = { ...defaultConfig };

export function getESBConfig(): ESBConfig {
  return currentConfig;
}

export function updateESBConfig(config: Partial<ESBConfig>): void {
  currentConfig = {
    ...currentConfig,
    ...config
  };
}

export function resetESBConfig(): void {
  currentConfig = { ...defaultConfig };
}
