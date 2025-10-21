export type ServiceKind = "hotel" | "car" | "flight";

export interface Hotel { id: string; name: string; city: string; price: number; rating: number; photo: string; }
export interface Car   { id: string; brand: string; model: string; pricePerDay: number; photo: string; }
export interface Flight{ id: string; from: string; to: string; date: string; price: number; airline: string; }

export type SearchResult = { kind: ServiceKind; item: Hotel | Car | Flight };

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
  kinds: ServiceKind[];          // ["hotel","car","flight"]
  priceMin?: number;             // aplica a todos
  priceMax?: number;
  ratingMin?: number;            // solo hoteles
  city?: string;                 // solo hoteles (contiene)
  sort?: SortKey;
}
