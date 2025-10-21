import { HomeView } from "../views/HomeView";
import { router } from "../main";

export function HomeController() {
  const mount = document.getElementById("view")!;
  mount.innerHTML = "";
  mount.appendChild(HomeView((q) => {
    sessionStorage.setItem("q", q);
    router.navigate("/results");
  }));
}
