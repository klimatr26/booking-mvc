export function ProfileView() {
  const el = document.createElement("section");
  el.className = "container py-5";
  el.innerHTML = `<h2>Perfil</h2><p>Historial, cupones y facturas pronto.</p>`;
  return el;
}
