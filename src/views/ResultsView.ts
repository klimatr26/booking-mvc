import type { SearchResult } from "../models/types";
import { ResultCard } from "../components/ResultCard";

export function ResultsView(results: SearchResult[], onAdd: (r: SearchResult)=>void) {
  const section = document.createElement("section");
  section.className = "py-4";
  section.innerHTML = `
    <div class="container">
      <div class="row">
        <div class="col-lg-3 mb-3 d-none d-lg-block" id="filters"></div>
        <div class="col-lg-9">
          <div class="d-lg-none d-flex justify-content-end mb-2">
            <button id="toggleFilters" class="btn btn-outline-secondary btn-sm">Filtros</button>
          </div>
          <h2 class="mb-3">Resultados</h2>
          <div class="row" id="grid"></div>
        </div>
      </div>
    </div>`;
  const grid = section.querySelector("#grid")!;

  function paint(list: SearchResult[]) {
    if (!list.length) {
      grid.innerHTML = `
        <div class="col-12">
          <div class="text-center text-muted py-5">
            <img src="/assets/empty.svg" alt="Sin resultados" style="height:120px" onerror="this.style.display='none'"/>
            <p class="mt-3 mb-3">No encontramos opciones con esos filtros.</p>
            <button class="btn btn-outline-secondary" id="clearF">Limpiar filtros</button>
          </div>
        </div>`;
      grid.querySelector("#clearF")?.addEventListener("click", () => {
        section.dispatchEvent(new CustomEvent("clear-filters", { bubbles: true }));
      });
      return;
    }

    grid.innerHTML = "";
    list.forEach(r => {
      const col = document.createElement("div");
      col.className = "col-12 col-md-6 col-xl-4 mb-3";
      col.appendChild(ResultCard(r, () => onAdd(r)));
      grid.appendChild(col);
    });
  }

  // primera pinta
  paint(results);

  // exponer helpers para el controller
  (section as any).paint = paint;
  (section as any).filtersMount = section.querySelector("#filters");
  (section as any).toggleBtn = section.querySelector("#toggleFilters");

  return section as any;
}
