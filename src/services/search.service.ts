import type { FilterState, SearchResult, ServiceKind } from "../models/types";
import { mockSearch } from "./adapters/mock.adapter";
import { esbSearch, esbSearchEasyCar, esbSearchBackendCuenca, esbSearchCarCompany } from "./adapters/esb.adapter";

const USE_ESB = import.meta.env.VITE_USE_ESB === "true";

export async function searchAll(query: string, filters?: FilterState): Promise<SearchResult[]> {
  const results = USE_ESB ? await esbSearch(query, filters) : await mockSearch(query);
  return applyFilters(results, filters);
}

export async function searchEasyCar(filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  return await esbSearchEasyCar(filters);
}

export async function searchBackendCuenca(filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  return await esbSearchBackendCuenca(filters);
}

export async function searchCuencaCar(filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  return await esbSearchCarCompany("cuencaCar", filters);
}

export async function searchRentCar(filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  return await esbSearchCarCompany("autosRentCar", filters);
}

export async function searchRentaAutosMadrid(filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  return await esbSearchCarCompany("rentaAutosMadrid", filters);
}

export async function searchAlquilerAugye(filters?: any): Promise<SearchResult[]> {
  if (!USE_ESB) return [];
  return await esbSearchCarCompany("alquilerAugye", filters);
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
