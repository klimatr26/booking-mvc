import type { CartItem } from "../models/types";

export function CartView(items: CartItem[]) {
  let total = items.reduce((s,i)=> s + i.qty * i.price, 0);
  const el = document.createElement("section");
  el.className = "container py-4";
  el.innerHTML = `
    <h2 class="mb-3">Carrito</h2>
    <div class="row">
      <div class="col-lg-8">
        <ul class="list-group mb-3" id="list"></ul>
      </div>
      <div class="col-lg-4">
        <div class="card p-3">
          <h5>Total</h5>
          <div class="display-6 mb-3">$<span id="total">${total.toFixed(2)}</span></div>
          <button class="btn btn-primary w-100">Continuar al pago</button>
        </div>
      </div>
    </div>`;
  const list = el.querySelector("#list")!;
  items.forEach((it, idx) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex align-items-center";
    li.innerHTML = `
      <img src="${it.photo || '/assets/placeholder.jpg'}" class="me-3 rounded" style="width:72px;height:72px;object-fit:cover" />
      <div class="flex-grow-1">
        <div class="fw-semibold">${it.title}</div>
        <small class="text-muted">${it.subtitle || it.kind.toUpperCase()}</small>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary" data-act="dec" data-i="${idx}">-</button>
        <span>${it.qty}</span>
        <button class="btn btn-sm btn-outline-secondary" data-act="inc" data-i="${idx}">+</button>
        <span class="ms-3 fw-bold">$${(it.price*it.qty).toFixed(2)}</span>
        <button class="btn btn-sm btn-outline-danger ms-2" data-act="del" data-i="${idx}">×</button>
      </div>`;
    list.appendChild(li);
  });
  return el;
}
