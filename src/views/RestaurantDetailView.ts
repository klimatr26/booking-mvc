import { fmtUSD } from "../core/money";
import type { Restaurant } from "../models/types";

export function RestaurantDetailView(restaurant: Restaurant, onAdd: () => void) {
  const el = document.createElement("section");
  el.className = "container py-4";

  el.innerHTML = `
    <div class="row g-4">
      <div class="col-lg-7">
        <div class="card shadow-sm">
          <img src="${restaurant.photo || '/assets/restaurant-default.jpg'}" 
               class="card-img-top" 
               style="height:360px;object-fit:cover" 
               alt="${restaurant.name}">
        </div>
        <div class="mt-3 d-flex gap-2 flex-wrap">
          <span class="badge text-bg-warning">
            <i class="bi bi-star-fill"></i> ${restaurant.cuisine}
          </span>
          ${restaurant.rating >= 4.5 ? `<span class="badge bg-success">Excelente valoración</span>` : ""}
          <span class="badge bg-light text-dark border">
            <i class="bi bi-geo-alt-fill"></i> ${restaurant.city}
          </span>
        </div>
        
        ${restaurant.description ? `
          <div class="card mt-3 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">
                <i class="bi bi-info-circle text-primary"></i> Descripción
              </h5>
              <p class="card-text text-muted">${restaurant.description}</p>
            </div>
          </div>
        ` : ""}
      </div>
      
      <div class="col-lg-5">
        <div class="d-flex align-items-start justify-content-between">
          <div>
            <h2 class="mb-1">
              <i class="bi bi-shop text-warning"></i> ${restaurant.name}
            </h2>
            <div class="text-muted">
              <i class="bi bi-geo-alt"></i> ${restaurant.city}
            </div>
            ${restaurant.rating ? `
              <div class="mt-2">
                <span class="badge text-bg-warning fs-6">
                  <i class="bi bi-star-fill"></i> ${restaurant.rating.toFixed(1)}
                </span> 
                <small class="text-muted">/ 5.0</small>
              </div>
            ` : ""}
          </div>
        </div>
        
        <hr/>
        
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <div class="text-muted small">Precio promedio por persona</div>
            <div class="h3 m-0 text-warning">${fmtUSD(restaurant.price)}</div>
          </div>
          <button id="add" class="btn btn-warning btn-lg text-white">
            <i class="bi bi-cart-plus"></i> Agregar
          </button>
        </div>
        
        <hr/>
        
        ${restaurant.policies ? `
          <div class="mb-3">
            <p class="mb-1"><strong><i class="bi bi-clipboard-check text-success"></i> Políticas:</strong></p>
            <ul class="small text-muted mb-0">
              ${restaurant.policies.split('.').filter(p => p.trim()).map(policy => 
                `<li>${policy.trim()}</li>`
              ).join('')}
            </ul>
          </div>
        ` : `
          <div class="mb-3">
            <p class="mb-1"><strong><i class="bi bi-clipboard-check text-success"></i> Políticas:</strong></p>
            <ul class="small text-muted mb-0">
              <li>Reserva con 24 horas de anticipación</li>
              <li>Cancelación flexible según disponibilidad</li>
              <li>Menú especial disponible para grupos</li>
            </ul>
          </div>
        `}
        
        ${restaurant.rules ? `
          <div>
            <p class="mb-1"><strong><i class="bi bi-info-circle text-info"></i> Información adicional:</strong></p>
            <ul class="small text-muted mb-0">
              ${restaurant.rules.split('.').filter(r => r.trim()).map(rule => 
                `<li>${rule.trim()}</li>`
              ).join('')}
            </ul>
          </div>
        ` : `
          <div>
            <p class="mb-1"><strong><i class="bi bi-info-circle text-info"></i> Información adicional:</strong></p>
            <ul class="small text-muted mb-0">
              <li>Wi-Fi gratuito disponible</li>
              <li>Estacionamiento disponible</li>
              <li>Ambiente familiar y acogedor</li>
            </ul>
          </div>
        `}
      </div>
    </div>`;

  el.querySelector<HTMLButtonElement>("#add")!.addEventListener("click", onAdd);
  
  // Manejo de error de imagen
  const imgEl = el.querySelector("img") as HTMLImageElement;
  imgEl.onerror = () => {
    imgEl.src = "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='360'>
           <rect width='100%' height='100%' fill='#ffc107'/>
           <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
                 font-family='Arial' font-size='24' fill='white'>
             <tspan x='50%' dy='-10'>🍽️</tspan>
             <tspan x='50%' dy='35'>${restaurant.name}</tspan>
           </text>
         </svg>`
      );
  };
  
  return el;
}
