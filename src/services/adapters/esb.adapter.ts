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
