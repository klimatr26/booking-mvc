import { ProfileView } from "../views/ProfileView";
export function ProfileController() {
  const mount = document.getElementById("view")!;
  mount.innerHTML = "";
  mount.appendChild(ProfileView());
}
