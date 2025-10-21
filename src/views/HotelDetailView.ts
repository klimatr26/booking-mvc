import { fmtUSD } from "../core/money";

export function HotelDetailView(h: any, onAdd: () => void) {
  const el = document.createElement("section");
  el.className = "container py-4";

  el.innerHTML = `
    <div class="row g-4">
      <div class="col-lg-7">
        <div class="card shadow-sm">
          <img src="${h.photo || '/assets/hotel1.jpg'}" class="card-img-top" style="height:360px;object-fit:cover" alt="${h.name}">
        </div>
        <div class="mt-3 d-flex gap-2 flex-wrap">
          ${h.freeCancellation ? `<span class="badge bg-light text-dark border">Cancelación gratis</span>` : ""}
          ${h.breakfastIncluded ? `<span class="badge bg-light text-dark border">Desayuno incluido</span>` : ""}
          ${typeof h.distanceCenterKm === "number" ? `<span class="badge bg-light text-dark border">${h.distanceCenterKm} km del centro</span>` : ""}
        </div>
      </div>
      <div class="col-lg-5">
        <div class="d-flex align-items-start justify-content-between">
          <div>
            <h2 class="mb-1">${h.name}</h2>
            <div class="text-muted">${h.city}</div>
            ${h.rating ? `<div class="mt-2"><span class="badge text-bg-primary">${h.rating.toFixed(1)}</span> <small class="text-muted">/ 5</small></div>` : ""}
          </div>
        </div>
        <hr/>
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <div class="text-muted small">Precio por noche</div>
            <div class="h3 m-0">${fmtUSD(h.price)}</div>
          </div>
          <button id="add" class="btn btn-primary btn-lg">Agregar</button>
        </div>
        <hr/>
        <p class="mb-1"><strong>Políticas (ejemplo):</strong></p>
        <ul class="small text-muted mb-0">
          <li>Check-in 14:00 • Check-out 12:00</li>
          <li>Cancelación flexible según tarifa</li>
          <li>Wi-Fi gratuito en todo el alojamiento</li>
        </ul>
      </div>
    </div>`;

  el.querySelector<HTMLButtonElement>("#add")!.addEventListener("click", onAdd);
  return el;
}
