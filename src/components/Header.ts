
function getCartCount(): number {
  try {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    return cart.reduce((s: number, it: any) => s + (it.qty || 0), 0);
  } catch { return 0; }
}

function updateCartBadge() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  const n = getCartCount();
  el.textContent = String(n);
  el.classList.toggle("d-none", n === 0);
}

export function mountHeader() {
  const header = document.createElement("header");
  header.innerHTML = `
  <nav class="navbar navbar-expand-lg bg-primary navbar-dark">
    <div class="container">
      <a class="navbar-brand fw-bold" href="#/">UniBooking</a>
      <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#nav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="nav">
        <ul class="navbar-nav ms-auto align-items-lg-center">
          <li class="nav-item"><a class="nav-link" href="#/results">Buscar</a></li>
          <li class="nav-item"><a class="nav-link" href="#/cars"><i class="bi bi-car-front-fill"></i> Arriendo de Autos</a></li>
          <li class="nav-item">
            <a class="nav-link position-relative" href="#/cart">
              Carrito
              <span id="cart-count" class="badge text-bg-warning ms-1 d-none">0</span>
            </a>
          </li>
          <li class="nav-item"><a class="nav-link" href="#/profile">Perfil</a></li>
        </ul>
      </div>
    </div>
  </nav>`;
  document.getElementById("app")!.prepend(header);

  updateCartBadge();
  window.addEventListener("cart:updated", updateCartBadge);
  window.addEventListener("storage", (e) => { if (e.key === "cart") updateCartBadge(); });
}
