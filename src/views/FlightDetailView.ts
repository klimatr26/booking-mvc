import { fmtUSD } from "../core/money";

export function FlightDetailView(f: any, onAdd: () => void) {
  const el = document.createElement("section");
  el.className = "container py-4";

  el.innerHTML = `
    <div class="row g-4">
      <div class="col-lg-7">
        <div class="card shadow-sm">
          <img src="/assets/flight.jpg" class="card-img-top" style="height:360px;object-fit:cover" alt="${f.from} → ${f.to}">
        </div>
        <div class="mt-3 d-flex gap-2 flex-wrap">
          <span class="badge bg-light text-dark border">${f.airline}</span>
          <span class="badge bg-light text-dark border">${f.nonstop ? "Directo" : "Con escalas"}</span>
          <span class="badge bg-light text-dark border">${f.date}</span>
        </div>
      </div>
      <div class="col-lg-5">
        <h2 class="mb-1">${f.from} → ${f.to}</h2>
        <div class="text-muted">Clase: Turista</div>
        <hr/>
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <div class="text-muted small">Precio</div>
            <div class="h3 m-0">${fmtUSD(f.price)}</div>
          </div>
          <button id="add" class="btn btn-primary btn-lg">Agregar</button>
        </div>
        <hr/>
        <ul class="small text-muted mb-0">
          <li>Incluye equipaje de mano</li>
          <li>Políticas de cambio según tarifa</li>
          <li>Operado por ${f.airline}</li>
        </ul>
      </div>
    </div>`;
  el.querySelector<HTMLButtonElement>("#add")!.addEventListener("click", onAdd);
  return el;
}
