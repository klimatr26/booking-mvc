import type { FilterState, SearchResult, Hotel, Car, Flight, Restaurant } from "../../models/types";
import { mockSearch } from "./mock.adapter";
import ESB from "../../../esb";
import type { FiltrosBusqueda, Servicio } from "../../../esb";
import { getRestaurants } from "./restaurant.adapter";

/**
 * Adaptador del ESB para el frontend booking-mvc
 * Usa el Enterprise Service Bus para buscar servicios en APIs SOAP externas
 */

export async function esbSearch(query: string, filters?: FilterState): Promise<SearchResult[]> {
  try {
    // Convertir filtros del frontend al formato del ESB
    const filtrosESB: FiltrosBusqueda = {
      serviceType: filters?.kinds || ['hotel', 'car', 'flight', 'restaurant'],
      ciudad: filters?.city,
      precioMin: filters?.priceMin,
      precioMax: filters?.priceMax,
      clasificacion: filters?.ratingMin
    };

    // Llamar al ESB para hoteles, vuelos y autos
    const servicios = await ESB.buscarServicios(filtrosESB);

    // Convertir resultados del ESB al formato del frontend
    const resultados = convertirServiciosAResultados(servicios);

    // Si se incluyen restaurantes en el filtro, buscarlos también
    if (!filters?.kinds || filters.kinds.includes('restaurant')) {
      const restaurantes = await getRestaurants(query);
      restaurantes.forEach(r => {
        resultados.push({ kind: 'restaurant', item: r });
      });
    }

    // Aplicar filtrado adicional por query de texto
    if (query) {
      return resultados.filter(r => {
        const searchText = query.toLowerCase();
        if (r.kind === 'hotel') {
          const hotel = r.item as Hotel;
          return hotel.name.toLowerCase().includes(searchText) ||
                 hotel.city.toLowerCase().includes(searchText);
        } else if (r.kind === 'flight') {
          const flight = r.item as Flight;
          return flight.from.toLowerCase().includes(searchText) ||
                 flight.to.toLowerCase().includes(searchText) ||
                 flight.airline.toLowerCase().includes(searchText);
        } else if (r.kind === 'car') {
          const car = r.item as Car;
          return car.brand.toLowerCase().includes(searchText) ||
                 car.model.toLowerCase().includes(searchText);
        } else if (r.kind === 'restaurant') {
          const restaurant = r.item as Restaurant;
          return restaurant.name.toLowerCase().includes(searchText) ||
                 restaurant.city.toLowerCase().includes(searchText) ||
                 restaurant.cuisine.toLowerCase().includes(searchText);
        }
        return false;
      });
    }

    // Aplicar ordenamiento si se especificó
    if (filters?.sort) {
      return aplicarOrdenamiento(resultados, filters.sort);
    }

    return resultados;
  } catch (error) {
    console.error('Error al buscar en ESB, usando mock:', error);
    // Fallback: usar datos mock si el ESB falla
    return mockSearch(query);
  }
}

/**
 * Convierte servicios del ESB al formato SearchResult del frontend
 */
function convertirServiciosAResultados(servicios: Servicio[]): SearchResult[] {
  const resultados: SearchResult[] = [];
  
  for (const s of servicios) {
    if (s.serviceType === 'hotel') {
      const hotel: Hotel = {
        id: s.idServicio || '',
        name: s.nombre,
        city: s.ciudad || '',
        price: s.precio,
        rating: s.rating || 0,
        photo: s.fotos?.[0] || '/hotel-placeholder.jpg'
      };
      resultados.push({ kind: 'hotel', item: hotel });
    } else if (s.serviceType === 'flight') {
      const flightData = s.datosEspecificos as any;
      const flight: Flight = {
        id: s.idServicio || '',
        from: flightData?.origin || '',
        to: flightData?.destination || '',
        date: flightData?.departureTime ? new Date(flightData.departureTime).toISOString() : '',
        price: s.precio,
        airline: flightData?.airline || ''
      };
      resultados.push({ kind: 'flight', item: flight });
    } else if (s.serviceType === 'car') {
      const carData = s.datosEspecificos as any;
      const car: Car = {
        id: s.idServicio || '',
        brand: carData?.marca || '',
        model: carData?.modelo || '',
        pricePerDay: s.precio,
        photo: s.fotos?.[0] || '/car-placeholder.jpg'
      };
      resultados.push({ kind: 'car', item: car });
    }
  }
  
  return resultados;
}

/**
 * Aplica ordenamiento a los resultados
 */
function aplicarOrdenamiento(resultados: SearchResult[], sort: string): SearchResult[] {
  const sorted = [...resultados];
  
  if (sort === 'price-asc') {
    sorted.sort((a, b) => {
      const priceA = a.kind === 'hotel' ? (a.item as Hotel).price : 
                     a.kind === 'flight' ? (a.item as Flight).price : (a.item as Car).pricePerDay;
      const priceB = b.kind === 'hotel' ? (b.item as Hotel).price : 
                     b.kind === 'flight' ? (b.item as Flight).price : (b.item as Car).pricePerDay;
      return priceA - priceB;
    });
  } else if (sort === 'price-desc') {
    sorted.sort((a, b) => {
      const priceA = a.kind === 'hotel' ? (a.item as Hotel).price : 
                     a.kind === 'flight' ? (a.item as Flight).price : (a.item as Car).pricePerDay;
      const priceB = b.kind === 'hotel' ? (b.item as Hotel).price : 
                     b.kind === 'flight' ? (b.item as Flight).price : (b.item as Car).pricePerDay;
      return priceB - priceA;
    });
  } else if (sort === 'rating-desc') {
    sorted.sort((a, b) => {
      const ratingA = a.kind === 'hotel' ? (a.item as Hotel).rating : 0;
      const ratingB = b.kind === 'hotel' ? (b.item as Hotel).rating : 0;
      return ratingB - ratingA;
    });
  }
  
  return sorted;
}

/**
 * Buscar específicamente en Easy Car (servicio 100% funcional)
 */
export async function esbSearchEasyCar(filters?: {
  categoria?: string;
  transmision?: string;
  minPrecio?: number;
  maxPrecio?: number;
}): Promise<SearchResult[]> {
  try {
    console.log("[ESB Adapter] ====== INICIANDO BÚSQUEDA EASY CAR ======");
    console.log("[ESB Adapter] Filtros recibidos:", JSON.stringify(filters));
    
    // Verificar que USE_ESB está habilitado
    const useESB = import.meta.env.VITE_USE_ESB === "true";
    console.log("[ESB Adapter] USE_ESB:", useESB);
    
    if (!useESB) {
      console.warn("[ESB Adapter] ⚠️ ESB no está habilitado en .env");
      return [];
    }
    
    // Importar módulos necesarios
    console.log("[ESB Adapter] Importando EasyCarSoapAdapter...");
    const easyCarModule = await import('../../../esb/gateway/easy-car.adapter');
    const configModule = await import('../../../esb/utils/config');
    
    console.log("[ESB Adapter] ✅ Módulos importados exitosamente");
    
    const config = configModule.getESBConfig();
    const easyCarConfig = config.endpoints.easyCar;
    
    console.log("[ESB Adapter] Configuración Easy Car:", {
      url: easyCarConfig.url,
      enabled: easyCarConfig.enabled
    });
    
    if (!easyCarConfig.enabled) {
      console.warn("[ESB Adapter] ⚠️ Easy Car está deshabilitado en config");
      return [];
    }
    
    // Crear adapter
    console.log("[ESB Adapter] Creando adapter...");
    const adapter = new easyCarModule.EasyCarSoapAdapter(easyCarConfig);
    console.log("[ESB Adapter] ✅ Adapter creado");
    
    // Llamar al servicio
    console.log("[ESB Adapter] Llamando a buscarServicios con:", {
      categoria: filters?.categoria || 'sin filtro',
      transmision: filters?.transmision || 'sin filtro'
    });
    
    const vehiculos = await adapter.buscarServicios(
      filters?.categoria,
      filters?.transmision
    );
    
    console.log(`[ESB Adapter] ✅ Respuesta recibida: ${vehiculos.length} vehículos`);
    console.log("[ESB Adapter] Vehículos raw:", vehiculos);
    
    // Convertir a formato SearchResult
    console.log("[ESB Adapter] Convirtiendo a formato SearchResult...");
    let resultados: SearchResult[] = vehiculos.map((v, index) => {
      console.log(`[ESB Adapter] Vehículo ${index + 1}:`, {
        IdVehiculo: v.IdVehiculo,
        Marca: v.Marca,
        Modelo: v.Modelo,
        PrecioBaseDia: v.PrecioBaseDia
      });
      
      return {
        kind: 'car',
        item: {
          id: v.IdVehiculo?.toString() || '',
          brand: v.Marca || 'Sin marca',
          model: v.Modelo || 'Sin modelo',
          pricePerDay: v.PrecioBaseDia || 0,
          photo: '/car-placeholder.jpg'
        } as Car
      };
    });
    
    console.log(`[ESB Adapter] ✅ ${resultados.length} vehículos convertidos`);
    
    // Aplicar filtros de precio
    const initialCount = resultados.length;
    
    if (filters?.minPrecio !== undefined) {
      console.log(`[ESB Adapter] Aplicando filtro precio mínimo: $${filters.minPrecio}`);
      resultados = resultados.filter(r => (r.item as Car).pricePerDay >= filters.minPrecio!);
      console.log(`[ESB Adapter] ${resultados.length}/${initialCount} pasan filtro mínimo`);
    }
    
    if (filters?.maxPrecio !== undefined) {
      console.log(`[ESB Adapter] Aplicando filtro precio máximo: $${filters.maxPrecio}`);
      const beforeMax = resultados.length;
      resultados = resultados.filter(r => (r.item as Car).pricePerDay <= filters.maxPrecio!);
      console.log(`[ESB Adapter] ${resultados.length}/${beforeMax} pasan filtro máximo`);
    }
    
    console.log("[ESB Adapter] ====== BÚSQUEDA COMPLETADA ======");
    console.log(`[ESB Adapter] Total resultados finales: ${resultados.length}`);
    
    return resultados;
    
  } catch (error: any) {
    console.error("[ESB Adapter] ❌ ERROR EN BÚSQUEDA:");
    console.error("[ESB Adapter] Mensaje:", error?.message);
    console.error("[ESB Adapter] Stack:", error?.stack);
    console.error("[ESB Adapter] Error completo:", error);
    
    // Re-lanzar el error para que el controlador lo maneje
    throw new Error(`Error buscando en Easy Car: ${error?.message || 'Error desconocido'}`);
  }
}

/**
 * Buscar específicamente en Backend Cuenca (servicio 100% funcional)
 */
export async function esbSearchBackendCuenca(filters?: {
  minPrecio?: number;
  maxPrecio?: number;
}): Promise<SearchResult[]> {
  try {
    console.log("[ESB Adapter] Buscando en Backend Cuenca con filtros:", filters);
    
    // Llamar directamente al adapter de Backend Cuenca
    const paquetes = await ESB.backendCuenca.buscarServicios(
      filters?.minPrecio,
      filters?.maxPrecio
    );
    
    console.log(`[ESB Adapter] Backend Cuenca encontró ${paquetes.length} paquetes`);
    
    // Convertir a formato SearchResult (usando tipo Car temporalmente)
    const resultados: SearchResult[] = paquetes.map((p: any) => ({
      kind: 'car', // Usamos 'car' temporalmente ya que no hay tipo 'package'
      item: {
        id: p.id || p.codigo || '',
        brand: 'Tour', // Marca genérica para paquetes
        model: p.nombre || p.name || 'Paquete Turístico',
        pricePerDay: p.adultPrice || p.precioAdulto || 0,
        photo: '/package-placeholder.jpg'
      } as Car
    }));
    
    return resultados;
  } catch (error) {
    console.error("[ESB Adapter] Error buscando en Backend Cuenca:", error);
    return [];
  }
}

/**
 * Buscar en cualquier empresa de autos del ESB (genérico)
 */
export async function esbSearchCarCompany(
  companyKey: 'cuencaCar' | 'autosRentCar' | 'rentaAutosMadrid' | 'alquilerAugye',
  filters?: any
): Promise<SearchResult[]> {
  try {
    console.log(`[ESB Adapter] Buscando en ${companyKey} con filtros:`, filters);
    
    let vehiculos: any[] = [];
    
    // Llamar al método específico según la empresa
    switch (companyKey) {
      case 'cuencaCar':
        vehiculos = await ESB.cuencaCar.buscarServicios(
          filters?.ciudad,
          filters?.categoria
        );
        break;
      
      // TODO: Implementar estos servicios cuando estén disponibles en el ESB
      // case 'autosRentCar':
      //   vehiculos = await ESB.rentCar.buscarServicios(...);
      //   break;
      // case 'rentaAutosMadrid':
      //   vehiculos = await ESB.rentaAutosMadrid.buscarServicios(...);
      //   break;
      // case 'alquilerAugye':
      //   vehiculos = await ESB.alquilerAugye.buscarAutos(...);
      //   break;
      
      default:
        console.warn(`[ESB Adapter] Empresa ${companyKey} aún no implementada`);
        return [];
    }
    
    console.log(`[ESB Adapter] ${companyKey} encontró ${vehiculos.length} vehículos`);
    
    // Convertir a formato SearchResult genérico
    const resultados: SearchResult[] = vehiculos.map((v: any) => {
      // Adaptarse a diferentes formatos de DTO
      const brand = v.Marca || v.marca || v.brand || 'Auto';
      const model = v.Modelo || v.modelo || v.model || '';
      const id = v.IdVehiculo?.toString() || v.IdAuto?.toString() || v.id?.toString() || v.Id?.toString() || '';
      const price = v.PrecioBaseDia || v.PrecioPorDia || v.precioDia || v.precioBase || 0;
      
      return {
        kind: 'car',
        item: {
          id,
          brand,
          model,
          pricePerDay: price,
          photo: '/car-placeholder.jpg'
        } as Car
      };
    });
    
    // Aplicar filtros de precio si existen
    let filtered = resultados;
    if (filters?.minPrecio !== undefined) {
      filtered = filtered.filter(r => (r.item as Car).pricePerDay >= filters.minPrecio!);
    }
    if (filters?.maxPrecio !== undefined) {
      filtered = filtered.filter(r => (r.item as Car).pricePerDay <= filters.maxPrecio!);
    }
    
    return filtered;
  } catch (error) {
    console.error(`[ESB Adapter] Error buscando en ${companyKey}:`, error);
    return [];
  }
}
