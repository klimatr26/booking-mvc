export function mountFooter() {
  const footer = document.createElement("footer");
  footer.className = "bg-light border-top mt-auto";
  footer.innerHTML = `
    <div class="container py-3 text-muted small d-flex justify-content-between flex-wrap">
      <div>© ${new Date().getFullYear()} UniBooking</div>
      <a href="#" class="text-muted text-decoration-none">Términos y privacidad</a>
    </div>`;
  document.getElementById("app")!.appendChild(footer);
}
