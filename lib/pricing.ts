import { gpuTypes, type GpuType } from "./mocks/gpus";

export const TOKEN_DISCOUNT_PERCENT = Number(process.env.NEXT_PUBLIC_TOKEN_DISCOUNT_PERCENT ?? process.env.TOKEN_DISCOUNT_PERCENT ?? 15);
export const TOKEN_DISCOUNT = TOKEN_DISCOUNT_PERCENT / 100;

export type PayWith = "SOL" | "TOKEN";

export function getGpu(id: string): GpuType | undefined {
  return gpuTypes.find((g) => g.id === id);
}

export function calcPrice(gpuId: string, hours: number, payWith: PayWith) {
  const gpu = getGpu(gpuId);
  if (!gpu) throw new Error(`GPU not found: ${gpuId}`);
  const h = Math.max(1, Math.floor(hours));
  const pricePerHour = payWith === "SOL" ? gpu.priceSolPerHour : gpu.priceTokenPerHour;
  const total = pricePerHour * h;
  return {
    gpu,
    hours: h,
    pricePerHour,
    total,
    totalLamports: solToLamports(total),
    totalAtomic: tokenToAtomic(total), // assume 6 decimals for mock token, same numeric
  };
}

export function calcSolAndToken(gpuId: string, hours: number) {
  const sol = calcPrice(gpuId, hours, "SOL");
  const token = calcPrice(gpuId, hours, "TOKEN");
  const discount = sol.total > 0 ? ((sol.total - token.total) / sol.total) * 100 : 0;
  return { sol, token, discountPercent: discount };
}

export function solToLamports(sol: number): bigint {
  return BigInt(Math.round(sol * 1e9));
}
export function lamportsToSol(lamports: bigint | number): number {
  return Number(lamports) / 1e9;
}
export function tokenToAtomic(amount: number, decimals = 6): bigint {
  return BigInt(Math.round(amount * Math.pow(10, decimals)));
}
export function atomicToToken(atomic: bigint | number, decimals = 6): number {
  return Number(atomic) / Math.pow(10, decimals);
}

export function formatSol(sol: number): string {
  if (sol >= 1) return sol.toFixed(4);
  if (sol >= 0.01) return sol.toFixed(5);
  return sol.toFixed(6);
}
export function formatUsd(usd: number): string {
  return `$${usd.toFixed(2)}`;
}

export function getDiscountLabel(): string {
  return `-${TOKEN_DISCOUNT_PERCENT}%`;
}
