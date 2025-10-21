type Route = { path: string; action: () => void };

export class Router {
  private routes: Route[] = [];
  constructor() {
    window.addEventListener("hashchange", () => this.resolve());
    window.addEventListener("load", () => this.resolve());
  }
  register(path: string, action: () => void) { this.routes.push({ path, action }); }
  navigate(path: string) { location.hash = path; }
  private resolve() {
  const raw = location.hash.replace("#", "") || "/";
  const path = raw.split("?")[0]; // ignorar querystring para el match
  const hit = this.routes.find(r => r.path === path) ?? this.routes.find(r => r.path === "*");
  hit?.action();
  }
}
