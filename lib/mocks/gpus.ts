export type GpuType = {
  id: string;
  displayName: string;
  vram: number; // GB
  cudaCores?: number;
  memoryType?: string;
  pricePerHourUsd: number;
  priceSolPerHour: number; // SOL
  priceTokenPerHour: number; // SPL token, ~15% discount
  available: boolean;
  category: "consumer" | "pro" | "datacenter";
  description: string;
  runpodId?: string; // real RunPod gpuTypeId when live
};

// Base prices in USD from RunPod approximate, then converted to SOL at $150/SOL
// Token is 15% cheaper than SOL
export const gpuTypes: GpuType[] = [
  {
    id: "rtx4090",
    displayName: "RTX 4090",
    vram: 24,
    cudaCores: 16384,
    memoryType: "GDDR6X",
    pricePerHourUsd: 0.34,
    priceSolPerHour: 0.0023,
    priceTokenPerHour: 0.00195,
    available: true,
    category: "consumer",
    description: "Best for inference, 3D, gaming. 24GB VRAM.",
    runpodId: "NVIDIA GeForce RTX 4090",
  },
  {
    id: "rtx6000ada",
    displayName: "RTX 6000 Ada",
    vram: 48,
    cudaCores: 18176,
    memoryType: "GDDR6",
    pricePerHourUsd: 0.52,
    priceSolPerHour: 0.0035,
    priceTokenPerHour: 0.00297,
    available: true,
    category: "pro",
    description: "48GB VRAM for large models, rendering.",
    runpodId: "NVIDIA RTX 6000 Ada Generation",
  },
  {
    id: "l40s",
    displayName: "L40S",
    vram: 48,
    cudaCores: 18176,
    memoryType: "GDDR6",
    pricePerHourUsd: 0.62,
    priceSolPerHour: 0.0041,
    priceTokenPerHour: 0.00348,
    available: true,
    category: "datacenter",
    description: "Data-center efficiency, 48GB, for inference at scale.",
    runpodId: "NVIDIA L40S",
  },
  {
    id: "a100-40",
    displayName: "A100 40GB",
    vram: 40,
    cudaCores: 6912,
    memoryType: "HBM2",
    pricePerHourUsd: 0.84,
    priceSolPerHour: 0.0056,
    priceTokenPerHour: 0.00476,
    available: true,
    category: "datacenter",
    description: "Training and large-batch inference.",
    runpodId: "NVIDIA A100 40GB PCIe",
  },
  {
    id: "a100-80",
    displayName: "A100 80GB",
    vram: 80,
    cudaCores: 6912,
    memoryType: "HBM2e",
    pricePerHourUsd: 1.1,
    priceSolPerHour: 0.0073,
    priceTokenPerHour: 0.0062,
    available: true,
    category: "datacenter",
    description: "80GB for biggest models, long context.",
    runpodId: "NVIDIA A100 80GB PCIe",
  },
  {
    id: "h100",
    displayName: "H100 80GB",
    vram: 80,
    cudaCores: 16896,
    memoryType: "HBM3",
    pricePerHourUsd: 1.95,
    priceSolPerHour: 0.013,
    priceTokenPerHour: 0.01105,
    available: false,
    category: "datacenter",
    description: "Flagship Hopper, fastest for LLM training.",
    runpodId: "NVIDIA H100 80GB HBM3",
  },
];

export function getGpuById(id: string): GpuType | undefined {
  return gpuTypes.find((g) => g.id === id);
}
