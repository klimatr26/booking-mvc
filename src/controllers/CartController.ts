import { CartView } from "../views/CartView";
import { getCart, inc, dec, del } from "../services/cart.service";

export function CartController() {
  const mount = document.getElementById("view")!;

  function render() {
    const cart = getCart();
    mount.innerHTML = "";
    const view = CartView(cart);

    view.addEventListener("click", (e) => {
      const t = e.target as HTMLElement;
      const act = t.getAttribute("data-act");
      const i = +(t.getAttribute("data-i") || "-1");
      if (i >= 0) {
        if (act === "inc") inc(i);
        if (act === "dec") dec(i);
        if (act === "del") del(i);
        render(); // re-pintar con estado actualizado
      }
    });

    mount.appendChild(view);
  }

  render();
}
