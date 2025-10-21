import { getHotelById } from "../services/adapters/mock.adapter";
import { HotelDetailView } from "../views/HotelDetailView";
import type { CartItem } from "../models/types";
import { showToast } from "../core/toast";

function getQueryParam(name: string) {
  const q = location.hash.split("?")[1] || "";
  const params = new URLSearchParams(q);
  return params.get(name) || "";
}

export function HotelDetailController() {
  const mount = document.getElementById("view")!;
  const id = getQueryParam("id");
  const h = getHotelById(id);

  if (!h) {
    mount.innerHTML = `<div class="container py-5 text-center text-muted">Hotel no encontrado.</div>`;
    return;
  }

  // Aseguramos no-nulo para uso dentro de closures
  const H = h!;

  function addToCart() {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const found = cart.find(it => it.kind === "hotel" && it.id === H.id);
    if (found) found.qty += 1;
    else cart.push({
      kind: "hotel",
      id: H.id,
      title: H.name,
      subtitle: H.city,
      qty: 1,
      price: H.price,
      photo: H.photo
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("cart:updated"));
    showToast();
  }

  mount.innerHTML = "";
  mount.appendChild(HotelDetailView(H, addToCart));
}
