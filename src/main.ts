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
router.register("*", () => { document.getElementById("view")!.innerHTML = `<div class="container py-5">404</div>`; });
