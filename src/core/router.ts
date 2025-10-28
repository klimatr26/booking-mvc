type Route = { path: string; action: () => void };

export class Router {
  private routes: Route[] = [];

  constructor() {
    console.log('[Router] Constructor called, attaching event listeners');
    window.addEventListener("hashchange", () => {
      console.log('[Router] hashchange event fired');
      this.resolve();
    });
    window.addEventListener("load", () => {
      console.log('[Router] load event fired');
      this.resolve();
    });
  }

  register(path: string, action: () => void) {
    this.routes.push({ path, action });
  }

  /**
   * Navega asegurando el prefijo "/"
   * Ej: navigate("login") -> "#/login"
   */
  navigate(path: string) {
    const clean = path.startsWith("/") ? path : "/" + path;
    location.hash = clean;
  }

  // Public method to manually trigger resolution
  resolve() {
    console.log('[Router] resolve() called, current hash:', location.hash, 'routes count:', this.routes.length);
    // Normaliza: "#/ruta?x=1" -> "/ruta"
    const raw = (location.hash || "#/").replace(/^#/, "");
    const path = raw.split("?")[0] || "/";
    console.log('[Router] Normalized path:', path);

    const hit =
      this.routes.find((r) => r.path === path) ??
      this.routes.find((r) => r.path === "*");

    console.log('[Router] Route match found:', hit ? hit.path : 'NONE');
    if (hit) {
      console.log('[Router] Executing route action for:', hit.path);
      hit.action();
    }
  }
}

// ✅ singleton para usar: import { router } from "../core/router";
export const router = new Router();
