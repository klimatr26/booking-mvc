import { fmtUSD } from "../core/money";

function getCart() {
  try { return JSON.parse(localStorage.getItem("cart") || "[]"); }
  catch { return []; }
}
function cartTotals() {
  const cart = getCart();
  const count = cart.reduce((s:number, it:any)=> s + (it.qty || 0), 0);
  const total = cart.reduce((s:number, it:any)=> s + (it.qty || 0) * (it.price || 0), 0);
  return { count, total };
}
function onCartClick() { location.hash = "/cart"; }

export function mountFloatingCart() {
  const el = document.createElement("div");
  el.id = "floating-cart";
  el.className = "floating-cart shadow-lg";
  el.innerHTML = `
    <button class="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 w-100">
      <span class="badge text-bg-warning" id="fc-count">0</span>
      <span class="fw-semibold">Ver carrito</span>
      <span class="ms-auto" id="fc-total">$0</span>
    </button>`;
  el.querySelector("button")!.addEventListener("click", onCartClick);
  document.body.appendChild(el);

  function render() {
    const { count, total } = cartTotals();
    const onCartPage = location.hash.replace("#","") === "/cart";
    const visible = count > 0 && !onCartPage;
    el.classList.toggle("show", visible);
    (document.getElementById("fc-count") as HTMLElement).textContent = String(count);
    (document.getElementById("fc-total") as HTMLElement).textContent = fmtUSD(total);
  }

  render();
  window.addEventListener("cart:updated", render);
  window.addEventListener("hashchange", render);
  window.addEventListener("storage", (e) => { if (e.key === "cart") render(); });
}
