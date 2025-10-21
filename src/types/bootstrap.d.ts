declare module "bootstrap" {
  export class Toast {
    constructor(element: any, options?: any);
    show(): void;
    hide(): void;
    dispose(): void;
  }
}
