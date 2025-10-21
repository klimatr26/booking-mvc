export function SearchBar(onSubmit: (q: string) => void) {
  const el = document.createElement("form");
  el.className = "row g-2";
  el.innerHTML = `
    <div class="col-12 col-md-6">
      <input class="form-control form-control-lg" name="q" placeholder="Ciudad, hotel, vuelo..." />
    </div>
    <div class="col-6 col-md-3">
      <input type="date" class="form-control form-control-lg" />
    </div>
    <div class="col-6 col-md-2">
      <select class="form-select form-select-lg">
        <option selected>Todos</option>
        <option>Hoteles</option>
        <option>Autos</option>
        <option>Vuelos</option>
      </select>
    </div>
    <div class="col-12 col-md-1 d-grid">
      <button class="btn btn-lg btn-secondary">Buscar</button>
    </div>
  `;
  el.addEventListener("submit", e => {
    e.preventDefault();
    const q = new FormData(el).get("q")?.toString() || "";
    onSubmit(q.trim());
  });
  return el;
}
