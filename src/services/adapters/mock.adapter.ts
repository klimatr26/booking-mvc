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

// export util para detalle
export const __mock = { hotels, cars, flights };
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

  await new Promise(r => setTimeout(r, 300)); // latencia simulada
  return [...H, ...C, ...F];
}

export function getCarById(id: string) {
  return __mock.cars.find(c => c.id === id) || null;
}
export function getFlightById(id: string) {
  return __mock.flights.find(f => f.id === id) || null;
}
