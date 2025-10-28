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
  const results = await mockSearch(query);
  return applyFilters(results, filters);
}

export async function searchEasyCar(filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  const esb = await getESBAdapter();
  return esb ? await esb.esbSearchEasyCar(filters) : [];
}

export async function searchBackendCuenca(filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  const esb = await getESBAdapter();
  return esb ? await esb.esbSearchBackendCuenca(filters) : [];
}

export async function searchCuencaCar(filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  const esb = await getESBAdapter();
  return esb ? await esb.esbSearchCarCompany("cuencaCar", filters) : [];
}

export async function searchRentCar(filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  const esb = await getESBAdapter();
  return esb ? await esb.esbSearchCarCompany("autosRentCar", filters) : [];
}

export async function searchRentaAutosMadrid(filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  const esb = await getESBAdapter();
  return esb ? await esb.esbSearchCarCompany("rentaAutosMadrid", filters) : [];
}

export async function searchAlquilerAugye(filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  const esb = await getESBAdapter();
  return esb ? await esb.esbSearchCarCompany("alquilerAugye", filters) : [];
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
  const fecha = filters?.fecha || new Date().toISOString().split('T')[0];
  const personas = filters?.personas || 2;
  const hora = filters?.hora;
  
  return await restAdapter.searchSanctumCortejoRest(fecha, personas, hora);
}

export async function searchSieteMares(filters?: any): Promise<SearchResult[]> {
  const fecha = filters?.fecha || new Date().toISOString().split('T')[0];
  const personas = filters?.personas || 2;
  const hora = filters?.hora;
  
  return await restAdapter.searchSieteMaresRest(fecha, personas, hora);
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
