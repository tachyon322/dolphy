// RunPod abstraction — mock by default, live when RUNPOD_API_KEY present (server only)
import { gpuTypes, type GpuType } from "./mocks/gpus";

export type RunpodGpu = {
  id: string;
  displayName: string;
  memoryInGb: number;
  securePrice: number;
};

export type Pod = {
  id: string;
  gpuTypeId: string;
  status: "CREATED" | "RUNNING" | "FAILED" | "TERMINATED";
  endpoint?: string;
  sshCommand?: string;
  createdAt: string;
};

export type PodCreateInput = {
  gpuTypeId: string; // our internal id like "rtx4090"
  hours: number;
  rentalId: string;
  wallet: string;
};

export interface RunpodClient {
  listGpus(): Promise<GpuType[]>;
  createPod(input: PodCreateInput): Promise<Pod>;
  getPod(podId: string): Promise<Pod | null>;
  terminatePod(podId: string): Promise<void>;
}

class MockClient implements RunpodClient {
  private pods = new Map<string, Pod>();

  async listGpus(): Promise<GpuType[]> {
    // slight delay to mimic network
    await new Promise((r) => setTimeout(r, 120));
    return gpuTypes;
  }

  async createPod(input: PodCreateInput): Promise<Pod> {
    await new Promise((r) => setTimeout(r, 400));
    const gpu = gpuTypes.find((g) => g.id === input.gpuTypeId);
    if (!gpu) throw new Error("GPU not found");
    if (!gpu.available) {
      throw new Error("INSUFFICIENT_CAPACITY: GPU not available");
    }
    const id = `mock-pod-${input.rentalId.slice(0, 8)}-${Date.now().toString(36)}`;
    const pod: Pod = {
      id,
      gpuTypeId: input.gpuTypeId,
      status: "RUNNING",
      endpoint: `https://${id}.proxy.runpod.net`,
      sshCommand: `ssh root@${id}.proxy.runpod.net -p 22 -i ~/.ssh/id_ed25519`,
      createdAt: new Date().toISOString(),
    };
    this.pods.set(id, pod);
    return pod;
  }

  async getPod(podId: string): Promise<Pod | null> {
    return this.pods.get(podId) ?? null;
  }

  async terminatePod(podId: string): Promise<void> {
    const p = this.pods.get(podId);
    if (p) {
      p.status = "TERMINATED";
      this.pods.set(podId, p);
    }
  }
}

// Live client — uses RunPod GraphQL (server only). For now minimal, falls back to mock shape.
class LiveClient implements RunpodClient {
  private apiKey: string;
  private templateId?: string;

  constructor(apiKey: string, templateId?: string) {
    this.apiKey = apiKey;
    this.templateId = templateId;
  }

  private async gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const res = await fetch("https://api.runpod.io/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`RunPod GraphQL ${res.status}: ${await res.text()}`);
    const json = await res.json();
    if (json.errors) throw new Error(`RunPod errors: ${JSON.stringify(json.errors)}`);
    return json.data as T;
  }

  async listGpus(): Promise<GpuType[]> {
    try {
      const data = await this.gql<{ gpuTypes: Array<{ id: string; displayName: string; memoryInGb: number }> }>(`
        query { gpuTypes { id displayName memoryInGb } }
      `);
      // Map to our types where possible, keep pricing from mocks
      const byDisplay = new Map(gpuTypes.map((g) => [g.runpodId, g]));
      const mapped: GpuType[] = data.gpuTypes
        .map((gt) => byDisplay.get(gt.displayName))
        .filter(Boolean) as GpuType[];
      return mapped.length ? mapped : gpuTypes;
    } catch {
      return gpuTypes;
    }
  }

  async createPod(input: PodCreateInput): Promise<Pod> {
    // Use podFindAndDeployOnDemand or pods deploy — try generic
    // This is a best-effort; if template missing we fallback to mock-like response
    try {
      const gpu = gpuTypes.find((g) => g.id === input.gpuTypeId);
      if (!gpu) throw new Error("GPU not found");
      const mutation = `
        mutation Deploy($input: PodFindAndDeployOnDemandInput!) {
          podFindAndDeployOnDemand(input: $input) { id desiredStatus imageName }
        }
      `;
      const variables = {
        input: {
          cloudType: "SECURE",
          gpuTypeId: gpu.runpodId,
          name: `dolphy-${input.rentalId.slice(0, 8)}`,
          imageName: "runpod/pytorch:2.4-cuda12.4",
          templateId: this.templateId,
          ports: "22/tcp,8888/http",
          volumeInGb: 20,
          containerDiskInGb: 10,
        },
      };
      const data = await this.gql<{ podFindAndDeployOnDemand: { id: string } }>(mutation, variables);
      const id = data.podFindAndDeployOnDemand.id;
      return {
        id,
        gpuTypeId: input.gpuTypeId,
        status: "RUNNING",
        endpoint: `https://${id}.proxy.runpod.net`,
        sshCommand: `ssh root@${id}.proxy.runpod.net -p 22`,
        createdAt: new Date().toISOString(),
      };
    } catch (e) {
      throw e;
    }
  }

  async getPod(podId: string): Promise<Pod | null> {
    try {
      const data = await this.gql<{ pod: { id: string; desiredStatus: string; runtime: { ports: unknown } } }>(
        `query Pod($id: String!) { pod(input: { podId: $id }) { id desiredStatus } }`,
        { id: podId }
      );
      if (!data.pod) return null;
      return {
        id: data.pod.id,
        gpuTypeId: "",
        status: data.pod.desiredStatus === "RUNNING" ? "RUNNING" : "CREATED",
        createdAt: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  async terminatePod(podId: string): Promise<void> {
    await this.gql(`mutation Term($id: String!) { podTerminate(input: { podId: $id }) }`, { id: podId });
  }
}

// Singleton — server only. On client we always use mock shape (no key exposed).
let _serverClient: RunpodClient | null = null;

export function getRunpodClient(): RunpodClient {
  // Client side -> mock (no secret)
  if (typeof window !== "undefined") return new MockClient();
  // Server side -> choose
  if (_serverClient) return _serverClient;
  const key = process.env.RUNPOD_API_KEY;
  const template = process.env.RUNPOD_TEMPLATE_ID;
  if (key) {
    _serverClient = new LiveClient(key, template);
  } else {
    _serverClient = new MockClient();
  }
  return _serverClient;
}

export function isMockMode(): boolean {
  if (typeof window !== "undefined") return true;
  return !process.env.RUNPOD_API_KEY;
}
