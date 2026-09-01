"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RentalRecord = {
  id: string;
  quoteId: string;
  gpuId: string;
  gpuName: string;
  hours: number;
  payWith: "SOL" | "TOKEN";
  amount: number;
  txSignature: string;
  status: "paid" | "active" | "terminated" | "failed";
  podId?: string;
  endpoint?: string;
  sshCommand?: string;
  createdAt: string;
  expiresAt: string;
};

type State = {
  rentals: RentalRecord[];
  addRental: (r: RentalRecord) => void;
  clearRentals: () => void;
  removeRental: (id: string) => void;
};

export const useRentalsStore = create<State>()(
  persist(
    (set) => ({
      rentals: [],
      addRental: (r) => set((s) => ({ rentals: [r, ...s.rentals] })),
      clearRentals: () => set({ rentals: [] }),
      removeRental: (id) => set((s) => ({ rentals: s.rentals.filter((x) => x.id !== id) })),
    }),
    { name: "dolphy_rentals" }
  )
);
