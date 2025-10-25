import type { SearchResult } from "../../models/types";

const hotels = [
  { id: "h1", name: "Hotel Sol Andino", city: "Quito", price: 85, rating: 4.4, photo: "/assets/hotel1.jpg", freeCancellation: true,  breakfastIncluded: true,  distanceCenterKm: 0.8 },
  { id: "h2", name: "Amazon Suites",   city: "Tena",  price: 72, rating: 4.2, photo: "/assets/hotel2.jpg", freeCancellation: false, breakfastIncluded: true,  distanceCenterKm: 1.2 },
];

const cars = [
  { id: "c1", brand: "Kia",       model: "Rio",  pricePerDay: 35, photo: "/assets/car1.jpg", unlimitedKm: true,  automatic: true },
  { id: "c2", brand: "Chevrolet", model: "Onix", pricePerDay: 42, photo: "/assets/car2.jpg", unlimitedKm: false, automatic: true },
];

const flights = [
  { id: "f1", from: "UIO", to: "MAD", date: "2025-11-12", price: 1172, airline: "Iberia",  nonstop: true  },
  { id: "f2", from: "UIO", to: "BOG", date: "2025-11-12", price: 320,  airline: "Avianca", nonstop: false },
];

const restaurants = [
  { id: "1", name: "Sanctum Cortejo Restaurant", city: "Ecuador", price: 35, rating: 4.8, photo: "/assets/restaurant-sanctum.jpg", cuisine: "Internacional", description: "Restaurante integrado con servicio SOAP real - Sanctum Cortejo ofrece experiencias gastronómicas únicas con reservas en línea" },
  { id: "2", name: "Cafetería París", city: "Quito", price: 15, rating: 4.9, photo: "/assets/cafeteria-paris.jpg", cuisine: "Café & Postres", description: "Cafetería integrada con servicio SOAP - Especialidad en cafés, postres y desayunos artesanales con reservas en línea" },
  { id: "3", name: "El Sabor Ecuatoriano", city: "Quito", price: 25, rating: 4.7, photo: "/assets/restaurant1.jpg", cuisine: "Ecuatoriana", description: "Auténtica comida ecuatoriana con recetas tradicionales" },
  { id: "4", name: "La Costa Marina", city: "Guayaquil", price: 35, rating: 4.6, photo: "/assets/restaurant2.jpg", cuisine: "Mariscos", description: "Los mejores mariscos del Pacífico ecuatoriano" },
  { id: "5", name: "Pizzería Da Vinci", city: "Cuenca", price: 20, rating: 4.7, photo: "/assets/restaurant3.jpg", cuisine: "Italiana", description: "Pizzas artesanales al horno de leña importado" },
  { id: "6", name: "Sushi Zen", city: "Quito", price: 40, rating: 4.9, photo: "/assets/restaurant4.jpg", cuisine: "Japonesa", description: "Sushi premium con pescado fresco diario" },
  { id: "7", name: "Parrilla Argentina", city: "Quito", price: 45, rating: 4.8, photo: "/assets/restaurant5.jpg", cuisine: "Carnes", description: "Las mejores carnes argentinas a la parrilla" },
  { id: "8", name: "Veggie Garden", city: "Cuenca", price: 22, rating: 4.5, photo: "/assets/restaurant6.jpg", cuisine: "Vegetariana", description: "Cocina vegetariana y vegana saludable" }
];

// export util para detalle
export const __mock = { hotels, cars, flights, restaurants };
export function getHotelById(id: string) {
  return hotels.find(h => h.id === id) || null;
}

export async function mockSearch(q: string): Promise<SearchResult[]> {
  const term = q.toLowerCase();
  const H = hotels
    .filter(h => `${h.name} ${h.city}`.toLowerCase().includes(term))
    .map(h => ({ kind: "hotel", item: h }) as SearchResult);
  const C = cars
    .filter(c => `${c.brand} ${c.model}`.toLowerCase().includes(term))
    .map(c => ({ kind: "car", item: c }) as SearchResult);
  const F = flights
    .filter(f => `${f.from} ${f.to} ${f.airline}`.toLowerCase().includes(term))
    .map(f => ({ kind: "flight", item: f }) as SearchResult);
  const R = restaurants
    .filter(r => `${r.name} ${r.city} ${r.cuisine}`.toLowerCase().includes(term))
    .map(r => ({ kind: "restaurant", item: r }) as SearchResult);

  await new Promise(r => setTimeout(r, 300)); // latencia simulada
  return [...H, ...C, ...F, ...R];
}

export function getCarById(id: string) {
  return __mock.cars.find(c => c.id === id) || null;
}
export function getFlightById(id: string) {
  return __mock.flights.find(f => f.id === id) || null;
}
export function getRestaurantById(id: string) {
  return __mock.restaurants.find(r => r.id === id) || null;
}
