import { fmtUSD } from "../core/money";

export function CarDetailView(c: any, onAdd: () => void) {
  const el = document.createElement("section");
  el.className = "container py-4";

  el.innerHTML = `
    <div class="row g-4">
      <div class="col-lg-7">
        <div class="card shadow-sm">
          <img src="${c.photo || '/assets/car1.jpg'}" class="card-img-top" style="height:360px;object-fit:cover" alt="${c.brand} ${c.model}">
        </div>
        <div class="mt-3 d-flex gap-2 flex-wrap">
          ${c.unlimitedKm ? `<span class="badge bg-light text-dark border">KM ilimitados</span>` : ""}
          ${c.automatic ? `<span class="badge bg-light text-dark border">Automático</span>` : ""}
        </div>
      </div>
      <div class="col-lg-5">
        <h2 class="mb-1">${c.brand} ${c.model}</h2>
        <div class="text-muted">Categoría: Económico</div>
        <hr/>
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <div class="text-muted small">Precio por día</div>
            <div class="h3 m-0">${fmtUSD(c.pricePerDay)}</div>
          </div>
          <button id="add" class="btn btn-primary btn-lg">Agregar</button>
        </div>
        <hr/>
        <ul class="small text-muted mb-0">
          <li>Edad mínima 25 años (puede variar)</li>
          <li>Incluye cobertura básica</li>
          <li>Depósito en tarjeta de crédito</li>
        </ul>
      </div>
    </div>`;
  el.querySelector<HTMLButtonElement>("#add")!.addEventListener("click", onAdd);
  return el;
}
