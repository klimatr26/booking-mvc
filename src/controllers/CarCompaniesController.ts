/**
 * Controlador de Empresas de Arriendo de Autos
 * Gestiona la selección de empresas y redirección a búsqueda específica
 */

import { CarCompaniesView, type CarCompany } from "../views/CarCompaniesView";
import { router } from "../main";

// Catálogo de empresas de autos integradas en el ESB
const CAR_COMPANIES: CarCompany[] = [
  {
    id: "easycar",
    name: "Easy Car",
    description: "Servicio premium de alquiler con flota moderna. Incluye seguros y asistencia 24/7. ✅ 100% Funcional",
    status: "100%",
    functional: true,
    vehicles: 8
  },
  {
    id: "cuencacar",
    name: "Cuenca Car Rental",
    description: "Alquiler de vehículos en Cuenca. Opciones económicas y flexibles. (En integración)",
    status: "87.5%",
    functional: false,
    vehicles: 5
  },
  {
    id: "rentcar",
    name: "Autos RentCar",
    description: "Empresa de alquiler con amplia cobertura nacional. (En integración)",
    status: "75%",
    functional: false,
    vehicles: 12
  },
  {
    id: "rentaautosmadrid",
    name: "Renta Autos Madrid",
    description: "Servicio español de alquiler. Vehículos europeos de calidad. (En integración)",
    status: "75%",
    functional: false,
    vehicles: 10
  },
  {
    id: "alquileraugye",
    name: "Alquiler Augye",
    description: "Servicio de renta de autos con opciones personalizadas. (En integración)",
    status: "62.5%",
    functional: false,
    vehicles: 8
  }
];

export async function CarCompaniesController(app: HTMLElement) {
  console.log("[CarCompaniesController] Iniciando...");

  // Filtrar solo empresas que tengan vehículos o estén funcionales
  const availableCompanies = CAR_COMPANIES.filter(c => c.functional);

  const view = CarCompaniesView(availableCompanies, handleSelectCompany);
  app.innerHTML = "";
  app.appendChild(view);

  function handleSelectCompany(companyId: string) {
    console.log("[CarCompaniesController] Empresa seleccionada:", companyId);
    
    // Redirigir a la página de búsqueda específica de la empresa
    router.navigate(`/cars/${companyId}`);
  }
}
