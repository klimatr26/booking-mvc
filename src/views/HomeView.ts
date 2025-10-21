import { SearchBar } from "../components/SearchBar";

export function HomeView(onSearch: (q: string) => void) {
  const wrap = document.createElement("section");
  wrap.innerHTML = `
    <section class="hero">
      <div class="container">
        <h1 class="display-5 fw-bold">Reserva hoteles, autos y vuelos en un solo pago</h1>
        <p class="lead">Mejores precios, una experiencia unificada.</p>
      </div>
    </section>
    <section class="py-4">
      <div class="container"></div>
    </section>`;
  wrap.querySelector(".container:last-child")!.appendChild(SearchBar(onSearch));
  return wrap;
}
