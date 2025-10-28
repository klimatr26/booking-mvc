/**
 * REST API Adapter
 * En desarrollo: Llama al servidor backend (api.js) en localhost:3001
 * En producción (Netlify): Usa Netlify Functions como backend
 */

import type { SearchResult } from "../../models/types";

// Detectar entorno
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

const API_URL = isDevelopment 
  ? (import.meta.env.VITE_PROXY_URL || 'http://localhost:3001')
  : '/.netlify/functions'; // En producción usar Netlify Functions

/**
 * Buscar mesas en restaurante Sabor Andino
 */
export async function searchSaborAndinoRest(fecha: string, personas: number, hora?: string): Promise<SearchResult[]> {
  try {
    const url = isDevelopment 
      ? `${API_URL}/api/restaurants/saborandino/search`
      : `${API_URL}/restaurant-search?company=saborandino`;
    
    console.log('[REST Adapter] Llamando a:', url);
    console.log('[REST Adapter] Datos:', { fecha, personas, hora });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fecha, personas, hora })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const mesas = await response.json();
    console.log('[REST Adapter] Mesas recibidas:', mesas.length, mesas);
    
    const results: SearchResult[] = mesas.map((mesa: any) => {
      // Extraer ubicación del nombre (ej: "Mesa Terraza (5 personas)" -> "Terraza")
      const nombreMatch = mesa.nombre?.match(/Mesa\s+(\w+)/);
      const ubicacion = nombreMatch ? nombreMatch[1] : '';
      
      // Extraer capacidad del nombre (ej: "Mesa Terraza (5 personas)" -> 5)
      const capacidadMatch = mesa.nombre?.match(/\((\d+)\s+personas?\)/);
      const capacidad = capacidadMatch ? parseInt(capacidadMatch[1]) : 2;
      
      return {
        kind: 'restaurant' as const,
        item: {
          id: `saborandino-${mesa.id}`,
          name: mesa.nombre || `Mesa #${mesa.numero || mesa.id}`,
          city: mesa.ciudad || 'Cuenca',
          price: mesa.precio || 0,
          rating: parseInt(mesa.clasificacion) || 5,
          photo: mesa.foto || '/assets/restaurant-placeholder.jpg',
          cuisine: 'Ecuatoriana',
          description: mesa.descripcion || `Capacidad: ${capacidad} personas`,
          // Campos extras para filtrado
          tipo: ubicacion, // Ubicación extraída del nombre: Terraza, Afuera, Interior, VIP
          capacidad: capacidad // Capacidad extraída del nombre
        }
      };
    });
    
    console.log('[REST Adapter] Results mapeados:', results.length);
    return results;
  } catch (error: any) {
    console.error('[REST Adapter] Error Sabor Andino:', error.message);
    return [];
  }
}

/**
 * Buscar mesas en El Cangrejo Feliz
 */
export async function searchElCangrejoFelizRest(fecha: string, personas: number, hora?: string): Promise<SearchResult[]> {
  try {
    // En producción, usar ESB directamente
    if (!isDevelopment) {
      const { esbSearchElCangrejoFeliz } = await import('./esb.adapter');
      return await esbSearchElCangrejoFeliz({ fecha, personas, hora });
    }

    const response = await fetch(`${API_URL}/api/restaurants/elcangrejofeliz/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fecha, personas, hora })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const mesas = await response.json();
    
    return mesas.map((mesa: any) => ({
      kind: 'restaurant' as const,
      item: {
        id: `cangrejofeliz-${mesa.id}`,
        name: mesa.nombre || `Mesa #${mesa.numero || mesa.id}`,
        city: 'Guayaquil',
        price: mesa.precio || 0,
        rating: 5,
        photo: mesa.foto || '/assets/restaurant-placeholder.jpg',
        cuisine: 'Mariscos',
        description: mesa.descripcion || `Capacidad: ${mesa.capacidad} personas`
      }
    }));
  } catch (error: any) {
    console.error('[REST Adapter] Error Cangrejo Feliz:', error.message);
    return [];
  }
}

/**
 * Buscar mesas en Sanctum Cortejo
 */
export async function searchSanctumCortejoRest(fecha: string, personas: number, hora?: string): Promise<SearchResult[]> {
  try {
    // En producción, usar ESB directamente
    if (!isDevelopment) {
      const { esbSearchSanctumCortejo } = await import('./esb.adapter');
      return await esbSearchSanctumCortejo({ fecha, personas, hora });
    }

    const response = await fetch(`${API_URL}/api/restaurants/sanctumcortejo/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fecha, personas, hora })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const mesas = await response.json();
    
    return mesas.map((mesa: any) => ({
      kind: 'restaurant' as const,
      item: {
        id: `sanctum-${mesa.id}`,
        name: mesa.nombre || `Mesa #${mesa.numero || mesa.id}`,
        city: 'Quito',
        price: mesa.precio || 0,
        rating: 5,
        photo: mesa.foto || '/assets/restaurant-placeholder.jpg',
        cuisine: 'Gourmet',
        description: mesa.descripcion || `Capacidad: ${mesa.capacidad} personas`
      }
    }));
  } catch (error: any) {
    console.error('[REST Adapter] Error Sanctum Cortejo:', error.message);
    return [];
  }
}

/**
 * Buscar mesas en Siete Mares
 */
export async function searchSieteMaresRest(fecha: string, personas: number, hora?: string): Promise<SearchResult[]> {
  try {
    // En producción, usar ESB directamente
    if (!isDevelopment) {
      const { esbSearchSieteMares } = await import('./esb.adapter');
      return await esbSearchSieteMares({ fecha, personas, hora });
    }

    const response = await fetch(`${API_URL}/api/restaurants/sietemares/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fecha, personas, hora })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const mesas = await response.json();
    
    return mesas.map((mesa: any) => ({
      kind: 'restaurant' as const,
      item: {
        id: `sietemares-${mesa.id}`,
        name: mesa.nombre || `Mesa #${mesa.numero || mesa.id}`,
        city: 'Manta',
        price: mesa.precio || 0,
        rating: 5,
        photo: mesa.foto || '/assets/restaurant-placeholder.jpg',
        cuisine: 'Mariscos',
        description: mesa.descripcion || `Capacidad: ${mesa.capacidad} personas`
      }
    }));
  } catch (error: any) {
    console.error('[REST Adapter] Error Siete Mares:', error.message);
    return [];
  }
}

/**
 * Buscar habitaciones en KM25 Madrid Hotel
 */
export async function searchKM25MadridRest(fechaEntrada: string, fechaSalida: string, personas: number): Promise<SearchResult[]> {
  try {
    const response = await fetch(`${API_URL}/api/hotels/km25madrid/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fechaEntrada, fechaSalida, personas })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const habitaciones = await response.json();
    
    return habitaciones.map((hab: any) => ({
      id: `km25madrid-${hab.id}`,
      title: hab.tipo || `Habitación #${hab.id}`,
      kind: 'hotel' as const,
      company: 'km25madrid',
      price: hab.precio || 0,
      currency: 'USD',
      rating: 4.5,
      description: `Capacidad: ${hab.capacidad} personas`,
      thumbnail: '/assets/hotel-placeholder.jpg',
      metadata: hab
    }));
  } catch (error: any) {
    console.error('[REST Adapter] Error KM25 Madrid:', error.message);
    return [];
  }
}

/**
 * Buscar habitaciones en WeWorkHub
 */
export async function searchWeWorkHubRest(fechaEntrada: string, fechaSalida: string, personas: number): Promise<SearchResult[]> {
  try {
    const response = await fetch(`${API_URL}/api/hotels/weworkhub/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fechaEntrada, fechaSalida, personas })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const habitaciones = await response.json();
    
    return habitaciones.map((hab: any) => ({
      id: `weworkhub-${hab.id}`,
      title: hab.tipo || `Espacio #${hab.id}`,
      kind: 'hotel' as const,
      company: 'weworkhub',
      price: hab.precio || 0,
      currency: 'USD',
      rating: 4.7,
      description: `Capacidad: ${hab.capacidad} personas`,
      thumbnail: '/assets/hotel-placeholder.jpg',
      metadata: hab
    }));
  } catch (error: any) {
    console.error('[REST Adapter] Error WeWorkHub:', error.message);
    return [];
  }
}

/**
 * Buscar vehículos en Easy Car
 */
export async function searchEasyCarRest(fechaInicio: string, fechaFin: string, ciudad?: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(`${API_URL}/api/cars/easycar/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fechaInicio, fechaFin, ciudad })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const vehiculos = await response.json();
    
    return vehiculos.map((vehiculo: any) => ({
      id: `easycar-${vehiculo.id}`,
      title: `${vehiculo.marca} ${vehiculo.modelo}`,
      kind: 'car' as const,
      company: 'easycar',
      price: vehiculo.precio || 0,
      currency: 'USD',
      rating: 4.3,
      description: `${vehiculo.tipo} - ${vehiculo.capacidad} pasajeros`,
      thumbnail: '/assets/car-placeholder.jpg',
      metadata: vehiculo
    }));
  } catch (error: any) {
    console.error('[REST Adapter] Error Easy Car:', error.message);
    return [];
  }
}

/**
 * Buscar vehículos en Cuenca Car
 */
export async function searchCuencaCarRest(fechaInicio: string, fechaFin: string, ciudad?: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(`${API_URL}/api/cars/cuencacar/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fechaInicio, fechaFin, ciudad })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const vehiculos = await response.json();
    
    return vehiculos.map((vehiculo: any) => ({
      id: `cuencacar-${vehiculo.id}`,
      title: `${vehiculo.marca} ${vehiculo.modelo}`,
      kind: 'car' as const,
      company: 'cuencacar',
      price: vehiculo.precio || 0,
      currency: 'USD',
      rating: 4.4,
      description: `${vehiculo.tipo} - ${vehiculo.capacidad} pasajeros`,
      thumbnail: '/assets/car-placeholder.jpg',
      metadata: vehiculo
    }));
  } catch (error: any) {
    console.error('[REST Adapter] Error Cuenca Car:', error.message);
    return [];
  }
}

/**
 * Buscar vehículos en Autos Rent Car
 */
export async function searchRentCarRest(fechaInicio: string, fechaFin: string, ciudad?: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(`${API_URL}/api/cars/rentcar/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fechaInicio, fechaFin, ciudad })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const vehiculos = await response.json();
    
    return vehiculos.map((vehiculo: any) => ({
      id: `rentcar-${vehiculo.id}`,
      title: `${vehiculo.marca} ${vehiculo.modelo}`,
      kind: 'car' as const,
      company: 'rentcar',
      price: vehiculo.precio || 0,
      currency: 'USD',
      rating: 4.5,
      description: `${vehiculo.tipo} - ${vehiculo.capacidad} pasajeros`,
      thumbnail: '/assets/car-placeholder.jpg',
      metadata: vehiculo
    }));
  } catch (error: any) {
    console.error('[REST Adapter] Error Rent Car:', error.message);
    return [];
  }
}

/**
 * Buscar vehículos en Backend Cuenca
 */
export async function searchBackendCuencaRest(fechaInicio: string, fechaFin: string, ciudad?: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(`${API_URL}/api/cars/backendcuenca/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fechaInicio, fechaFin, ciudad })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const vehiculos = await response.json();
    
    return vehiculos.map((vehiculo: any) => ({
      id: `backendcuenca-${vehiculo.id}`,
      title: `${vehiculo.marca} ${vehiculo.modelo}`,
      kind: 'car' as const,
      company: 'backendcuenca',
      price: vehiculo.precio || 0,
      currency: 'USD',
      rating: 4.6,
      description: `${vehiculo.tipo} - ${vehiculo.capacidad} pasajeros`,
      thumbnail: '/assets/car-placeholder.jpg',
      metadata: vehiculo
    }));
  } catch (error: any) {
    console.error('[REST Adapter] Error Backend Cuenca:', error.message);
    return [];
  }
}
