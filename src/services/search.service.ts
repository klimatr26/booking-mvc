import type { FilterState, SearchResult, ServiceKind } from "../models/types";
import { mockSearch } from "./adapters/mock.adapter";
import * as restAdapter from "./adapters/rest.adapter";

const USE_ESB = import.meta.env.VITE_USE_ESB === "true";
const USE_REST = !USE_ESB; // Use REST API when ESB is disabled

// Import ESB adapter dynamically only when needed
const getESBAdapter = async () => {
  if (!USE_ESB) return null;
  return await import("./adapters/esb.adapter");
};

export async function searchAll(query: string, filters?: FilterState): Promise<SearchResult[]> {
  if (USE_ESB) {
    const esb = await getESBAdapter();
    if (esb) {
      const results = await esb.esbSearch(query, filters);
      return applyFilters(results, filters);
    }
  }
  
  // Modo REST: llamar a servicios individuales en paralelo
  console.log('[Search Service] 🔍 Búsqueda REST con filtros:', filters);
  const kinds = filters?.kinds || ['hotel', 'car', 'flight', 'restaurant'];
  const promises: Promise<SearchResult[]>[] = [];
  
  // Autos
  if (kinds.includes('car')) {
    promises.push(searchEasyCar(filters).catch(err => {
      console.error('[Search] Error Easy Car:', err);
      return [];
    }));
    promises.push(searchCuencaCar(filters).catch(err => {
      console.error('[Search] Error Cuenca Car:', err);
      return [];
    }));
    promises.push(searchAlquilerAugye(filters).catch(err => {
      console.error('[Search] Error Alquiler Augye:', err);
      return [];
    }));
  }
  
  // Restaurantes
  if (kinds.includes('restaurant')) {
    promises.push(searchSaborAndino(filters).catch(err => {
      console.error('[Search] Error Sabor Andino:', err);
      return [];
    }));
    promises.push(searchSanctumCortejo(filters).catch(err => {
      console.error('[Search] Error Sanctum Cortejo:', err);
      return [];
    }));
    promises.push(searchSieteMares(filters).catch(err => {
      console.error('[Search] Error Siete Mares:', err);
      return [];
    }));
    promises.push(searchElCangrejoFeliz(filters).catch(err => {
      console.error('[Search] Error El Cangrejo Feliz:', err);
      return [];
    }));
  }
  
  // Esperar todas las búsquedas
  const allResults = await Promise.all(promises);
  const combined = allResults.flat();
  
  console.log('[Search Service] ✅ Total resultados combinados:', combined.length);
  
  // Aplicar filtrado por query de texto
  if (query) {
    return combined.filter(r => {
      const searchText = query.toLowerCase();
      if (r.kind === 'car') {
        const car = r.item as any;
        return car.brand?.toLowerCase().includes(searchText) ||
               car.model?.toLowerCase().includes(searchText) ||
               car.category?.toLowerCase().includes(searchText);
      } else if (r.kind === 'restaurant') {
        const restaurant = r.item as any;
        return restaurant.name?.toLowerCase().includes(searchText) ||
               restaurant.city?.toLowerCase().includes(searchText) ||
               restaurant.cuisine?.toLowerCase().includes(searchText);
      }
      return false;
    });
  }
  
  return combined;
}

export async function searchEasyCar(filters?: any): Promise<SearchResult[]> {
  console.log('[Search Service] 🚗 searchEasyCar con filtros:', filters);
  
  const categoria = filters?.categoria;
  const transmision = filters?.transmision;
  const fechaInicio = filters?.fechaInicio || filters?.fecha;
  const fechaFin = filters?.fechaFin;
  const edadConductor = filters?.edadConductor;
  
  let results = await restAdapter.searchEasyCarRest(categoria, transmision, fechaInicio, fechaFin, edadConductor);
  
  console.log('[Search Service] Vehículos antes de filtrar:', results.length);
  
  // Aplicar filtros adicionales
  
  // Filtro por categoría (si se especifica)
  if (filters?.categoria && filters.categoria !== '') {
    console.log('[Search Service] Filtrando por categoría:', filters.categoria);
    results = results.filter(r => {
      const categoria = (r.item as any).category || '';
      const matches = categoria.toLowerCase().includes(filters.categoria.toLowerCase());
      if (!matches) {
        console.log(`[Search Service] ❌ Descartado por categoría: ${(r.item as any).brand} ${(r.item as any).model}`);
      }
      return matches;
    });
    console.log('[Search Service] Vehículos después de filtro categoría:', results.length);
  }
  
  // Filtro por transmisión (si se especifica)
  if (filters?.transmision && filters.transmision !== '') {
    console.log('[Search Service] Filtrando por transmisión:', filters.transmision);
    results = results.filter(r => {
      const transmision = (r.item as any).transmission || '';
      const matches = transmision.toLowerCase().includes(filters.transmision.toLowerCase());
      if (!matches) {
        console.log(`[Search Service] ❌ Descartado por transmisión: ${(r.item as any).brand} ${(r.item as any).model}`);
      }
      return matches;
    });
    console.log('[Search Service] Vehículos después de filtro transmisión:', results.length);
  }
  
  // Filtro por precio mínimo (si se especifica)
  if (filters?.minPrecio && filters.minPrecio > 0) {
    console.log('[Search Service] Filtrando por precio mínimo:', filters.minPrecio);
    results = results.filter(r => {
      const price = (r.item as any).pricePerDay || 0;  // ✅ Cambiado de price a pricePerDay
      return price >= filters.minPrecio;
    });
    console.log('[Search Service] Vehículos después de filtro precio min:', results.length);
  }
  
  // Filtro por precio máximo (si se especifica)
  if (filters?.maxPrecio && filters.maxPrecio > 0) {
    console.log('[Search Service] Filtrando por precio máximo:', filters.maxPrecio);
    results = results.filter(r => {
      const price = (r.item as any).pricePerDay || 0;  // ✅ Cambiado de price a pricePerDay
      return price <= filters.maxPrecio;
    });
    console.log('[Search Service] Vehículos después de filtro precio max:', results.length);
  }
  
  console.log('[Search Service] ✅ Total vehículos después de todos los filtros:', results.length);
  return results;
}

export async function searchBackendCuenca(filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  const esb = await getESBAdapter();
  return esb ? await esb.esbSearchBackendCuenca(filters) : [];
}

export async function searchCuencaCar(filters?: any): Promise<SearchResult[]> {
  console.log('[Search Service] 🚙 searchCuencaCar con filtros:', filters);
  
  const ciudad = filters?.city;
  const categoria = filters?.categoria;
  
  // Get all results from backend
  const allResults = await restAdapter.searchCuencaCarRest(ciudad, categoria);
  console.log('[Search Service] 📦 Total vehículos Cuenca Car:', allResults.length);
  
  // Apply client-side filters
  return allResults.filter(result => {
    if (result.kind !== 'car') return false;
    const car = result.item as any;
    
    // Filter by category
    if (filters?.categoria && car.category !== filters.categoria) {
      return false;
    }
    
    // Filter by transmission
    if (filters?.transmission && car.transmission !== filters.transmission) {
      return false;
    }
    
    // Filter by price range
    if (filters?.minPrice !== undefined && car.pricePerDay < filters.minPrice) {
      return false;
    }
    if (filters?.maxPrice !== undefined && car.pricePerDay > filters.maxPrice) {
      return false;
    }
    
    // Filter by availability
    if (filters?.availableOnly && !car.available) {
      return false;
    }
    
    return true;
  });
}

export async function searchRentCar(filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  const esb = await getESBAdapter();
  return esb ? await esb.esbSearchCarCompany("autosRentCar", filters) : [];
}

export async function searchRentaAutosMadrid(filters?: any): Promise<SearchResult[]> {
  console.log('[Search Service] 🇪🇸 searchRentaAutosMadrid con filtros:', filters);
  
  const ciudad = filters?.ciudad || filters?.city;
  const categoria = filters?.categoria || filters?.category;
  const gearbox = filters?.gearbox || filters?.transmission;
  const precioMin = filters?.minPrice;
  const precioMax = filters?.maxPrice;
  
  // Get all results from backend
  const allResults = await restAdapter.searchRentaAutosMadridRest(ciudad, categoria, gearbox, precioMin, precioMax);
  console.log('[Search Service] 📦 Total vehículos Renta Autos Madrid:', allResults.length);
  
  // Apply client-side filters
  return allResults.filter(result => {
    if (result.kind !== 'car') return false;
    const car = result.item as any;
    
    // Filter by price range
    if (filters?.minPrice !== undefined && car.price < filters.minPrice) {
      return false;
    }
    if (filters?.maxPrice !== undefined && car.price > filters.maxPrice) {
      return false;
    }
    
    // Filter by city
    if (filters?.ciudad && car.city && car.city.toLowerCase() !== filters.ciudad.toLowerCase()) {
      return false;
    }
    
    // Filter by category
    if (filters?.categoria && car.category && car.category.toLowerCase() !== filters.categoria.toLowerCase()) {
      return false;
    }
    
    // Filter by transmission/gearbox
    if (filters?.gearbox && car.transmission && car.transmission.toLowerCase() !== filters.gearbox.toLowerCase()) {
      return false;
    }
    
    // Filter by availability
    if (filters?.availableOnly && !car.available) {
      return false;
    }
    
    return true;
  });
}

export async function searchAlquilerAugye(filters?: any): Promise<SearchResult[]> {
  console.log('[Search Service] 🚗 searchAlquilerAugye con filtros:', filters);
  
  const categoria = filters?.categoria;
  const gearbox = filters?.gearbox || filters?.transmision;
  const ciudad = filters?.ciudad;
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 50;
  
  let results = await restAdapter.searchAlquilerAugyeRest(categoria, gearbox, ciudad, page, pageSize);
  
  console.log('[Search Service] Vehículos antes de filtrar:', results.length);
  
  // Aplicar filtros adicionales
  
  // Filtro por categoría (si se especifica)
  if (filters?.categoria && filters.categoria !== '') {
    console.log('[Search Service] Filtrando por categoría:', filters.categoria);
    results = results.filter(r => {
      const categoria = (r.item as any).category || '';
      return categoria.toLowerCase().includes(filters.categoria.toLowerCase());
    });
    console.log('[Search Service] Vehículos después de filtro categoría:', results.length);
  }
  
  // Filtro por transmisión (si se especifica)
  if (filters?.transmision && filters.transmision !== '') {
    console.log('[Search Service] Filtrando por transmisión:', filters.transmision);
    results = results.filter(r => {
      const transmision = (r.item as any).transmission || '';
      return transmision.toLowerCase().includes(filters.transmision.toLowerCase());
    });
    console.log('[Search Service] Vehículos después de filtro transmisión:', results.length);
  }
  
  // Filtro por precio mínimo (si se especifica)
  if (filters?.minPrecio && filters.minPrecio > 0) {
    console.log('[Search Service] Filtrando por precio mínimo:', filters.minPrecio);
    results = results.filter(r => {
      const price = (r.item as any).pricePerDay || 0;
      return price >= filters.minPrecio;
    });
    console.log('[Search Service] Vehículos después de filtro precio min:', results.length);
  }
  
  // Filtro por precio máximo (si se especifica)
  if (filters?.maxPrecio && filters.maxPrecio > 0) {
    console.log('[Search Service] Filtrando por precio máximo:', filters.maxPrecio);
    results = results.filter(r => {
      const price = (r.item as any).pricePerDay || 0;
      return price <= filters.maxPrecio;
    });
    console.log('[Search Service] Vehículos después de filtro precio max:', results.length);
  }
  
  console.log('[Search Service] ✅ Total vehículos después de todos los filtros:', results.length);
  return results;
}

// ==================== HOTELES ====================

export async function searchHotelCR(_filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  // TODO: Implementar cuando esté disponible en ESB
  console.warn('[Search Service] Hotel CR aún no implementado');
  return [];
}

export async function searchCuencaHotels(_filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  // TODO: Implementar cuando esté disponible en ESB
  console.warn('[Search Service] Cuenca Hotels aún no implementado');
  return [];
}

export async function searchMadrid25(_filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  // TODO: Implementar cuando esté disponible en ESB
  console.warn('[Search Service] Madrid 25 aún no implementado');
  return [];
}

export async function searchKM25Madrid(filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  const esb = await getESBAdapter();
  return esb ? await esb.esbSearchKM25Madrid(filters) : [];
}

export async function searchPetFriendly(_filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  // TODO: Implementar cuando esté disponible en ESB
  console.warn('[Search Service] Pet Friendly Hotels aún no implementado');
  return [];
}

export async function searchWeWorkHub(filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  const esb = await getESBAdapter();
  return esb ? await esb.esbSearchWeWorkHub(filters) : [];
}

export async function searchHotelPerros(filters?: any): Promise<SearchResult[]> {
  console.log('[Search Service] 🐕 searchHotelPerros con filtros:', filters);
  
  const inicio = filters?.inicio || filters?.fechaEntrada || new Date().toISOString().split('T')[0];
  const fin = filters?.fin || filters?.fechaSalida || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const unidades = filters?.unidades || filters?.mascotas || 1;
  const tamano = filters?.tamano; // PEQUEÑO, MEDIANO, GRANDE
  const ciudad = filters?.ciudad;
  
  // Get all results from backend
  const allResults = await restAdapter.searchHotelPerrosRest(inicio, fin, unidades, tamano, ciudad);
  console.log('[Search Service] 📦 Total servicios Hotel Perros:', allResults.length);
  
  // Apply client-side filters
  return allResults.filter(result => {
    if (result.kind !== 'hotel') return false;
    const hotel = result.item as any;
    
    // Filter by price range
    if (filters?.minPrice !== undefined && hotel.price < filters.minPrice) {
      return false;
    }
    if (filters?.maxPrice !== undefined && hotel.price > filters.maxPrice) {
      return false;
    }
    
    // Filter by availability
    if (filters?.availableOnly && !hotel.available) {
      return false;
    }
    
    return true;
  });
}

/**
 * Buscar hoteles en Hotel UIO (Ecuador)
 */
export async function searchHotelUIO(filters?: any): Promise<SearchResult[]> {
  console.log('[Search Service] 🏔️ searchHotelUIO con filtros:', filters);
  
  const ciudad = filters?.ciudad || filters?.destino;
  const precioMax = filters?.maxPrice || filters?.precioMax;
  const fecha = filters?.fecha || filters?.fechaEntrada || new Date().toISOString().split('T')[0];
  
  // Get all results from backend
  const allResults = await restAdapter.searchHotelUIOrest(ciudad, precioMax, fecha);
  console.log('[Search Service] 📦 Total hoteles Hotel UIO:', allResults.length);
  
  // Apply client-side filters
  return allResults.filter(result => {
    if (result.kind !== 'hotel') return false;
    const hotel = result.item as any;
    
    // Filter by price range
    if (filters?.minPrice !== undefined && hotel.price < filters.minPrice) {
      return false;
    }
    if (filters?.maxPrice !== undefined && hotel.price > filters.maxPrice) {
      return false;
    }
    
    // Filter by city
    if (filters?.ciudad && hotel.city && hotel.city.toLowerCase() !== filters.ciudad.toLowerCase()) {
      return false;
    }
    
    // Filter by rating
    if (filters?.minRating !== undefined && hotel.rating < filters.minRating) {
      return false;
    }
    
    // Filter by availability
    if (filters?.availableOnly && !hotel.available) {
      return false;
    }
    
    return true;
  });
}

/**
 * Buscar habitaciones en Hotel Boutique Paris
 */
export async function searchHotelBoutique(filters?: any): Promise<SearchResult[]> {
  console.log('[Search Service] 🗼 searchHotelBoutique con filtros:', filters);
  
  const ciudad = filters?.ciudad || filters?.destino;
  const precioMin = filters?.minPrice;
  const precioMax = filters?.maxPrice;
  const amenities = filters?.amenities;
  const fechaInicio = filters?.fechaInicio || filters?.fechaEntrada;
  const fechaFin = filters?.fechaFin || filters?.fechaSalida;
  
  // Get all results from backend
  const allResults = await restAdapter.searchHotelBoutiqueRest(ciudad, precioMin, precioMax, amenities, fechaInicio, fechaFin);
  console.log('[Search Service] 📦 Total habitaciones Hotel Boutique:', allResults.length);
  
  // Apply client-side filters
  return allResults.filter(result => {
    if (result.kind !== 'hotel') return false;
    const hotel = result.item as any;
    
    // Filter by price range
    if (filters?.minPrice !== undefined && hotel.price < filters.minPrice) {
      return false;
    }
    if (filters?.maxPrice !== undefined && hotel.price > filters.maxPrice) {
      return false;
    }
    
    // Filter by city
    if (filters?.ciudad && hotel.city && hotel.city.toLowerCase() !== filters.ciudad.toLowerCase()) {
      return false;
    }
    
    // Filter by availability
    if (filters?.availableOnly && !hotel.available) {
      return false;
    }
    
    return true;
  });
}

// ==================== RESTAURANTES ====================

export async function searchSaborAndino(filters?: any): Promise<SearchResult[]> {
  // Always use REST API
  const fecha = filters?.fecha || new Date().toISOString().split('T')[0];
  const personas = filters?.capacidad || filters?.personas || 2;
  const hora = filters?.hora;
  
  // Obtener todas las mesas
  let results = await restAdapter.searchSaborAndinoRest(fecha, personas, hora);
  
  console.log('[Search Service] Mesas antes de filtrar:', results.length);
  console.log('[Search Service] Filtros recibidos:', filters);
  
  // Aplicar filtros locales (solo si tienen valor)
  if (filters?.ubicacion && filters.ubicacion !== '') {
    console.log('[Search Service] Filtrando por ubicación:', filters.ubicacion);
    const antes = results.length;
    results = results.filter(r => {
      const tipo = (r.item as any).tipo || '';
      const match = tipo.toLowerCase().includes(filters.ubicacion.toLowerCase());
      if (!match) {
        console.log(`  - Mesa ${(r.item as any).name} tipo "${tipo}" NO coincide`);
      }
      return match;
    });
    console.log(`[Search Service] Después de filtrar ubicación: ${results.length} (antes: ${antes})`);
  }
  
  if (filters?.capacidad && filters.capacidad > 0) {
    console.log('[Search Service] Filtrando por capacidad:', filters.capacidad);
    const antes = results.length;
    results = results.filter(r => {
      const capacidad = (r.item as any).capacidad || 2;
      const match = capacidad >= filters.capacidad;
      console.log(`  - Mesa ${(r.item as any).name} capacidad ${capacidad} ${match ? '✓ SI' : '✗ NO'} coincide con mínimo ${filters.capacidad}`);
      return match;
    });
    console.log(`[Search Service] Después de filtrar capacidad: ${results.length} (antes: ${antes})`);
  }
  
  if (filters?.minPrecio && filters.minPrecio > 0) {
    console.log('[Search Service] Filtrando por precio mínimo:', filters.minPrecio);
    const antes = results.length;
    results = results.filter(r => {
      const precio = (r.item as any).price || 0;
      return precio >= filters.minPrecio;
    });
    console.log(`[Search Service] Después de filtrar precio mín: ${results.length} (antes: ${antes})`);
  }
  
  if (filters?.maxPrecio && filters.maxPrecio > 0) {
    console.log('[Search Service] Filtrando por precio máximo:', filters.maxPrecio);
    const antes = results.length;
    results = results.filter(r => {
      const precio = (r.item as any).price || 0;
      return precio <= filters.maxPrecio;
    });
    console.log(`[Search Service] Después de filtrar precio máx: ${results.length} (antes: ${antes})`);
  }
  
  console.log('[Search Service] Mesas después de filtrar:', results.length);
  return results;
}

export async function searchRestaurantGH(_filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  // TODO: Implementar cuando esté disponible en ESB
  console.warn('[Search Service] Restaurant GH aún no implementado');
  return [];
}

export async function searchMadrFood(_filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  // TODO: Implementar cuando esté disponible en ESB
  console.warn('[Search Service] MadrFood aún no implementado');
  return [];
}

export async function searchFoodKM25(_filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  // TODO: Implementar cuando esté disponible en ESB
  console.warn('[Search Service] Food KM25 aún no implementado');
  return [];
}

export async function searchCuencaFood(_filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  // TODO: Implementar cuando esté disponible en ESB
  console.warn('[Search Service] Cuenca Food aún no implementado');
  return [];
}

export async function searchElCangrejoFeliz(filters?: any): Promise<SearchResult[]> {
  const fecha = filters?.fecha || new Date().toISOString().split('T')[0];
  const personas = filters?.personas || 2;
  const hora = filters?.hora;
  
  return await restAdapter.searchElCangrejoFelizRest(fecha, personas, hora);
}

export async function searchSanctumCortejo(filters?: any): Promise<SearchResult[]> {
  console.log('[Search Service] 🍷 searchSanctumCortejo con filtros:', filters);
  
  const fecha = filters?.fecha || new Date().toISOString().split('T')[0];
  const personas = filters?.capacidad || filters?.personas || 2;
  const hora = filters?.hora;
  
  let results = await restAdapter.searchSanctumCortejoRest(fecha, personas, hora);
  
  console.log('[Search Service] Mesas antes de filtrar:', results.length);
  
  // Aplicar filtros adicionales
  
  // Filtro por ubicación (si se especifica)
  if (filters?.ubicacion && filters.ubicacion !== '') {
    console.log('[Search Service] Filtrando por ubicación:', filters.ubicacion);
    results = results.filter(r => {
      const tipo = (r.item as any).tipo || '';
      const matches = tipo.toLowerCase().includes(filters.ubicacion.toLowerCase());
      if (!matches) {
        console.log(`[Search Service] ❌ Descartado por ubicación: ${r.item.name} (tipo: ${tipo})`);
      }
      return matches;
    });
    console.log('[Search Service] Mesas después de filtro ubicación:', results.length);
  }
  
  // Filtro por capacidad mínima (si se especifica)
  if (filters?.capacidad && filters.capacidad > 0) {
    console.log('[Search Service] Filtrando por capacidad mínima:', filters.capacidad);
    results = results.filter(r => {
      const capacidad = (r.item as any).capacidad || 2;
      const matches = capacidad >= filters.capacidad;
      if (!matches) {
        console.log(`[Search Service] ❌ Descartado por capacidad: ${r.item.name} (capacidad: ${capacidad})`);
      }
      return matches;
    });
    console.log('[Search Service] Mesas después de filtro capacidad:', results.length);
  }
  
  // Filtro por precio mínimo (si se especifica)
  if (filters?.minPrecio && filters.minPrecio > 0) {
    console.log('[Search Service] Filtrando por precio mínimo:', filters.minPrecio);
    results = results.filter(r => {
      const price = (r.item as any).price || 0;
      const matches = price >= filters.minPrecio;
      if (!matches) {
        console.log(`[Search Service] ❌ Descartado por precio min: ${r.item.name} (precio: ${price})`);
      }
      return matches;
    });
    console.log('[Search Service] Mesas después de filtro precio min:', results.length);
  }
  
  // Filtro por precio máximo (si se especifica)
  if (filters?.maxPrecio && filters.maxPrecio > 0) {
    console.log('[Search Service] Filtrando por precio máximo:', filters.maxPrecio);
    results = results.filter(r => {
      const price = (r.item as any).price || 0;
      const matches = price <= filters.maxPrecio;
      if (!matches) {
        console.log(`[Search Service] ❌ Descartado por precio max: ${r.item.name} (precio: ${price})`);
      }
      return matches;
    });
    console.log('[Search Service] Mesas después de filtro precio max:', results.length);
  }
  
  console.log('[Search Service] ✅ Total mesas después de todos los filtros:', results.length);
  return results;
}

export async function searchSieteMares(filters?: any): Promise<SearchResult[]> {
  const fecha = filters?.fecha || new Date().toISOString().split('T')[0];
  const personas = filters?.personas || 2;
  const hora = filters?.hora;
  
  // Get all results from backend
  const allResults = await restAdapter.searchSieteMaresRest(fecha, personas, hora);
  
  // Apply client-side filters
  return allResults.filter(result => {
    if (result.kind !== 'restaurant') return false;
    const restaurant = result.item as any;
    
    // Filter by location (tipo)
    if (filters?.tipo && restaurant.tipo && restaurant.tipo !== filters.tipo) {
      return false;
    }
    
    // Filter by capacity
    if (filters?.capacidad && restaurant.capacidad) {
      if (restaurant.capacidad < filters.capacidad) {
        return false;
      }
    }
    
    // Filter by price range
    if (filters?.minPrice !== undefined && restaurant.price < filters.minPrice) {
      return false;
    }
    if (filters?.maxPrice !== undefined && restaurant.price > filters.maxPrice) {
      return false;
    }
    
    return true;
  });
}

// ==================== VUELOS/AEROLÍNEAS ====================

export async function searchMadridAir25(_filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  // TODO: Implementar cuando esté disponible en ESB
  console.warn('[Search Service] Madrid Air 25 aún no implementado');
  return [];
}

export async function searchFlyUIO(_filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  // TODO: Implementar cuando esté disponible en ESB
  console.warn('[Search Service] Fly UIO aún no implementado');
  return [];
}

export async function searchSkyConnect(_filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  // TODO: Implementar cuando esté disponible en ESB
  console.warn('[Search Service] Sky Connect aún no implementado');
  return [];
}

export async function searchAmericanFly(_filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  // TODO: Implementar cuando esté disponible en ESB
  console.warn('[Search Service] American Fly aún no implementado');
  return [];
}

function priceOf(r: SearchResult): number {
  if (r.kind === "hotel")  return (r.item as any).price;
  if (r.kind === "car")    return (r.item as any).pricePerDay;
  if (r.kind === "restaurant") return (r.item as any).price;
  return (r.item as any).price; // flight
}

// ==================== VUELOS ====================

export async function searchSkyAndes(filters?: any): Promise<SearchResult[]> {
  console.log('[Search Service] ✈️  searchSkyAndes con filtros:', filters);
  
  const originId = filters?.originId || 1; // Default: Quito
  const destinationId = filters?.destinationId || 2; // Default: Guayaquil
  const fecha = filters?.fecha || new Date().toISOString().split('T')[0];
  const cabinClass = filters?.cabinClass || 'Economy';
  
  const results = await restAdapter.searchSkyAndesRest(originId, destinationId, fecha, cabinClass);
  
  console.log(`[Search Service] SkyAndes: ${results.length} vuelos encontrados`);
  
  return results;
}

function applyFilters(results: SearchResult[], f?: FilterState): SearchResult[] {
  if (!f) return results.slice();

  let out = results.slice();

  // tipo
  if (f.kinds?.length) out = out.filter(r => f.kinds.includes(r.kind as ServiceKind));

  // ciudad (hoteles y restaurantes)
  if (f.city) out = out.filter(r => 
    (r.kind !== "hotel" && r.kind !== "restaurant") || 
    (r.item as any).city?.toLowerCase().includes(f.city!.toLowerCase())
  );

  // rating mínimo (hoteles y restaurantes)
  if (typeof f.ratingMin === "number")
    out = out.filter(r => 
      (r.kind !== "hotel" && r.kind !== "restaurant") || 
      ((r.item as any).rating ?? 0) >= (f.ratingMin ?? 0)
    );

  // precio
  if (typeof f.priceMin === "number") out = out.filter(r => priceOf(r) >= (f.priceMin as number));
  if (typeof f.priceMax === "number") out = out.filter(r => priceOf(r) <= (f.priceMax as number));

  // ordenar
  if (f.sort === "price-asc")  out.sort((a,b)=> priceOf(a)-priceOf(b));
  if (f.sort === "price-desc") out.sort((a,b)=> priceOf(b)-priceOf(a));
  if (f.sort === "rating-desc")
    out.sort((a,b)=> {
      const ratingA = (a.kind==="hotel" || a.kind==="restaurant")? (a.item as any).rating : 0;
      const ratingB = (b.kind==="hotel" || b.kind==="restaurant")? (b.item as any).rating : 0;
      return ratingB - ratingA;
    });

  return out;
}
