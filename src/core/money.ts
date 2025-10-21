// src/core/money.ts
export const fmtUSD = (n:number) =>
  new Intl.NumberFormat("es-EC",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
