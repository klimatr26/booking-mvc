import type { CartItem, SearchResult } from "../models/types";

const KEY = "cart";

export function getCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}
export function saveCart(cart: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("cart:updated"));
}

export function toCartItem(r: SearchResult): CartItem {
  if (r.kind === "hotel") {
    const h: any = r.item;
    return { kind: "hotel", id: h.id, title: h.name, subtitle: h.city, qty: 1, price: h.price, photo: h.photo };
  }
  if (r.kind === "car") {
    const c: any = r.item;
    return { kind: "car", id: c.id, title: `${c.brand} ${c.model}`, qty: 1, price: c.pricePerDay, photo: c.photo };
  }
  if (r.kind === "restaurant") {
    const rest: any = r.item;
    return { kind: "restaurant", id: rest.id, title: rest.name, subtitle: `${rest.cuisine} • ${rest.city}`, qty: 1, price: rest.price, photo: rest.photo };
  }
  const f: any = r.item;
  return { kind: "flight", id: f.id, title: `${f.from} → ${f.to}`, subtitle: f.airline, qty: 1, price: f.price };
}

export function addFromResult(r: SearchResult) {
  const cart = getCart();
  const id = (r.item as any).id;
  const found = cart.find(it => it.kind === r.kind && it.id === id);
  if (found) found.qty += 1; else cart.push(toCartItem(r));
  saveCart(cart);
}

export function add(item: CartItem) {
  const cart = getCart();
  const found = cart.find(it => it.kind === item.kind && it.id === item.id);
  if (found) found.qty += item.qty; else cart.push(item);
  saveCart(cart);
}

export function inc(i: number) { const c = getCart(); if (c[i]) c[i].qty++; saveCart(c); }
export function dec(i: number) { const c = getCart(); if (c[i]) c[i].qty = Math.max(1, c[i].qty - 1); saveCart(c); }
export function del(i: number) { const c = getCart(); c.splice(i,1); saveCart(c); }
