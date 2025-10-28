export type ServiceKind = "hotel" | "car" | "flight" | "restaurant";

export interface Hotel { id: string; name: string; city: string; price: number; rating: number; photo: string; }
export interface Car   { id: string; brand: string; model: string; pricePerDay: number; photo: string; }
export interface Flight{ id: string; from: string; to: string; date: string; price: number; airline: string; }
export interface Restaurant { 
  id: string; 
  name: string; 
  city: string; 
  price: number; 
  rating: number; 
  photo: string;
  cuisine: string; // Tipo de cocina: ecuatoriana, italiana, etc.
  description?: string;
  policies?: string;
  rules?: string;
  tipo?: string; // Ubicación de la mesa: Terraza, Afuera, Interior, VIP
  capacidad?: number; // Capacidad de personas
}

export type SearchResult = { kind: ServiceKind; item: Hotel | Car | Flight | Restaurant };

export interface CartItem {
  kind: ServiceKind;
  id: string;
  title: string;
  subtitle?: string;
  qty: number;
  price: number; // unit
  photo?: string;
}

export type SortKey = "price-asc" | "price-desc" | "rating-desc";

export interface FilterState {
  kinds: ServiceKind[];          // ["hotel","car","flight","restaurant"]
  priceMin?: number;             // aplica a todos
  priceMax?: number;
  ratingMin?: number;            // solo hoteles y restaurantes
  city?: string;                 // solo hoteles y restaurantes (contiene)
  sort?: SortKey;
}
