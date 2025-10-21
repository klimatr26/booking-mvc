import { getCarById } from "../services/adapters/mock.adapter";
import { CarDetailView } from "../views/CarDetailView";
import type { CartItem } from "../models/types";
import { showToast } from "../core/toast";

function qp(name: string) {
  const q = location.hash.split("?")[1] || "";
  return new URLSearchParams(q).get(name) || "";
}

export function CarDetailController() {
  const mount = document.getElementById("view")!;
  const id = qp("id");
  const c = getCarById(id);

  if (!c) {
    mount.innerHTML = `<div class="container py-5 text-center text-muted">Auto no encontrado.</div>`;
    return;
  }

  const C = c!; // no-nulo para closures

  function addToCart() {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const found = cart.find(it => it.kind === "car" && it.id === C.id);
    if (found) found.qty += 1;
    else cart.push({
      kind: "car",
      id: C.id,
      title: `${C.brand} ${C.model}`,
      qty: 1,
      price: C.pricePerDay,
      photo: C.photo
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("cart:updated"));
    showToast();
  }

  mount.innerHTML = "";
  mount.appendChild(CarDetailView(C, addToCart));
}
