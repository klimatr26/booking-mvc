import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/custom.scss";
import { Router } from "./core/router";
import { HomeController } from "./controllers/HomeController";
import { ResultsController } from "./controllers/ResultsController";
import { CartController } from "./controllers/CartController";
import { ProfileController } from "./controllers/ProfileController";
import { mountHeader } from "./components/Header";
import { mountFooter } from "./components/Footer";
import { mountFloatingCart } from "./components/FloatingCart";
import { HotelDetailController } from "./controllers/HotelDetailController";
import { CarDetailController } from "./controllers/CarDetailController";
import { FlightDetailController } from "./controllers/FlightDetailController";
import { RestaurantDetailController } from "./controllers/RestaurantDetailController";
import { CarCompaniesController } from "./controllers/CarCompaniesController";
import { CompanyCarSearchController } from "./controllers/CompanyCarSearchController";
import { HotelCompaniesController } from "./controllers/HotelCompaniesController";
import { CompanyHotelSearchController } from "./controllers/CompanyHotelSearchController";
import { RestaurantCompaniesController } from "./controllers/RestaurantCompaniesController";
import { AirlineCompaniesController } from "./controllers/AirlineCompaniesController";

export const router = new Router();

function mountShell() {
  mountHeader();
  mountFooter();
}


mountShell();
mountFloatingCart(); 
router.register("/", HomeController);
router.register("/results", ResultsController);
router.register("/cart", CartController);
router.register("/profile", ProfileController as any);
router.register("/hotel", HotelDetailController); 
router.register("/car", CarDetailController);
router.register("/flight", FlightDetailController);
router.register("/restaurant", RestaurantDetailController);

// ==================== AUTOS ====================
router.register("/cars", () => {
  const view = document.getElementById("view")!;
  CarCompaniesController(view);
});
router.register("/cars/easycar", () => {
  const view = document.getElementById("view")!;
  CompanyCarSearchController(view, "easycar");
});
router.register("/cars/cuencacar", () => {
  const view = document.getElementById("view")!;
  CompanyCarSearchController(view, "cuencacar");
});
router.register("/cars/rentcar", () => {
  const view = document.getElementById("view")!;
  CompanyCarSearchController(view, "rentcar");
});
router.register("/cars/rentaautosmadrid", () => {
  const view = document.getElementById("view")!;
  CompanyCarSearchController(view, "rentaautosmadrid");
});
router.register("/cars/alquileraugye", () => {
  const view = document.getElementById("view")!;
  CompanyCarSearchController(view, "alquileraugye");
});

// ==================== HOTELES ====================
router.register("/hotels", () => {
  const ctrl = new HotelCompaniesController();
  ctrl.mount(document.getElementById("view")!);
});
router.register("/hotels/hotelcr", () => {
  const ctrl = new CompanyHotelSearchController("hotelcr");
  ctrl.mount(document.getElementById("view")!);
});
router.register("/hotels/cuencahotels", () => {
  const ctrl = new CompanyHotelSearchController("cuencahotels");
  ctrl.mount(document.getElementById("view")!);
});
router.register("/hotels/madrid25", () => {
  const ctrl = new CompanyHotelSearchController("madrid25");
  ctrl.mount(document.getElementById("view")!);
});
router.register("/hotels/km25madrid", () => {
  const ctrl = new CompanyHotelSearchController("km25madrid");
  ctrl.mount(document.getElementById("view")!);
});
router.register("/hotels/petfriendly", () => {
  const ctrl = new CompanyHotelSearchController("petfriendly");
  ctrl.mount(document.getElementById("view")!);
});

// ==================== RESTAURANTES ====================
router.register("/restaurants", () => {
  const ctrl = new RestaurantCompaniesController();
  ctrl.mount(document.getElementById("view")!);
});
router.register("/restaurants/restaurantgh", () => {
  const view = document.getElementById("view")!;
  view.innerHTML = '<div class="container py-5"><h2>🍽️ Restaurant GH</h2><p>Próximamente...</p></div>';
});
router.register("/restaurants/madrfood", () => {
  const view = document.getElementById("view")!;
  view.innerHTML = '<div class="container py-5"><h2>🍽️ MadrFood</h2><p>Próximamente...</p></div>';
});
router.register("/restaurants/foodkm25", () => {
  const view = document.getElementById("view")!;
  view.innerHTML = '<div class="container py-5"><h2>🍽️ Food KM25</h2><p>Próximamente...</p></div>';
});
router.register("/restaurants/cuencafood", () => {
  const view = document.getElementById("view")!;
  view.innerHTML = '<div class="container py-5"><h2>🍽️ Cuenca Food</h2><p>Próximamente...</p></div>';
});

// ==================== VUELOS ====================
router.register("/flights", () => {
  const ctrl = new AirlineCompaniesController();
  ctrl.mount(document.getElementById("view")!);
});
router.register("/flights/madridair25", () => {
  const view = document.getElementById("view")!;
  view.innerHTML = '<div class="container py-5"><h2>✈️ Madrid Air 25</h2><p>Próximamente...</p></div>';
});
router.register("/flights/flyuio", () => {
  const view = document.getElementById("view")!;
  view.innerHTML = '<div class="container py-5"><h2>✈️ Fly UIO</h2><p>Próximamente...</p></div>';
});
router.register("/flights/skyconnect", () => {
  const view = document.getElementById("view")!;
  view.innerHTML = '<div class="container py-5"><h2>✈️ Sky Connect</h2><p>Próximamente...</p></div>';
});
router.register("/flights/americanfly", () => {
  const view = document.getElementById("view")!;
  view.innerHTML = '<div class="container py-5"><h2>✈️ American Fly</h2><p>Próximamente...</p></div>';
});

router.register("*", () => { document.getElementById("view")!.innerHTML = `<div class="container py-5">404</div>`; });
