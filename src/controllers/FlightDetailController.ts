import { getFlightById } from "../services/adapters/mock.adapter";
import { FlightDetailView } from "../views/FlightDetailView";
import type { CartItem } from "../models/types";
import { showToast } from "../core/toast";

function qp(name: string) {
  const q = location.hash.split("?")[1] || "";
  return new URLSearchParams(q).get(name) || "";
}

export function FlightDetailController() {
  const mount = document.getElementById("view")!;
  const id = qp("id");
  const f = getFlightById(id);

  if (!f) {
    mount.innerHTML = `<div class="container py-5 text-center text-muted">Vuelo no encontrado.</div>`;
    return;
  }

  const F = f!; // no-nulo para closures

  function addToCart() {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const found = cart.find(it => it.kind === "flight" && it.id === F.id);
    if (found) found.qty += 1;
    else cart.push({
      kind: "flight",
      id: F.id,
      title: `${F.from} → ${F.to}`,
      subtitle: F.airline,
      qty: 1,
      price: F.price
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("cart:updated"));
    showToast();
  }

  mount.innerHTML = "";
  mount.appendChild(FlightDetailView(F, addToCart));
}
