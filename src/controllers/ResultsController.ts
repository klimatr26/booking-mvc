import { searchAll } from "../services/search.service";
import { ResultsView } from "../views/ResultsView";
import { FiltersSidebar } from "../components/FiltersSidebar";
import { showToast } from "../core/toast";
import { addFromResult } from "../services/cart.service";
import type { FilterState, SearchResult } from "../models/types";

function skeletonGrid(n = 6) {
  return Array.from({ length: n })
    .map(
      () => `
    <div class="col-12 col-md-6 col-xl-4 mb-3">
      <div class="card shadow-sm">
        <div style="height:180px" class="placeholder-wave bg-light"></div>
        <div class="card-body">
          <h5 class="placeholder-glow"><span class="placeholder col-8"></span></h5>
          <p class="placeholder-glow"><span class="placeholder col-4"></span></p>
          <div class="d-flex justify-content-between">
            <span class="placeholder col-2"></span>
            <span class="btn btn-primary disabled placeholder col-3">&nbsp;</span>
          </div>
        </div>
      </div>
    </div>`
    )
    .join("");
}

export function ResultsController() {
  const q = sessionStorage.getItem("q") || "";
  const mount = document.getElementById("view")!;

  // Loader con skeletons
  mount.innerHTML = `<div class="container py-4"><div class="row">${skeletonGrid(6)}</div></div>`;

  const initial: FilterState = {
    kinds: ["hotel", "car", "flight", "restaurant"],
    priceMin: undefined,
    priceMax: undefined,
    ratingMin: 0,
    city: "",
    sort: undefined,
  };

  searchAll(q, initial).then((results) => {
    mount.innerHTML = "";

    // View: recibe resultados y callback para "Agregar"
    const view: any = ResultsView(results, (r: SearchResult) => {
      addFromResult(r);         // regla de negocio en services/
      showToast();              // feedback UI
    });
    mount.appendChild(view);

    // Sidebar de filtros
    const sidebar: any = FiltersSidebar(initial, async (f) => {
      const filtered = await searchAll(q, f);
      view.paint(filtered);
    });
    view.filtersMount.appendChild(sidebar);

    // Toggle filtros en móvil
    view.toggleBtn?.addEventListener("click", () => {
      view.filtersMount.classList.toggle("d-none");
    });

    // Estado vacío → limpiar filtros desde botón
    view.addEventListener?.("clear-filters", () => {
      sidebar.clear?.();
    });
  });
}
