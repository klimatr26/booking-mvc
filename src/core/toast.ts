// src/core/toast.ts
import { Toast } from "bootstrap";

export function showToast(id = "toast", delay = 1500) {
  const el = document.getElementById(id);
  if (!el) return;
  const t = new Toast(el, { delay });
  t.show();
}
