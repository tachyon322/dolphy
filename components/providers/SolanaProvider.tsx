"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useCallback, useMemo } from "react";
import { getRpcUrl } from "@/lib/solana";
import { toast } from "sonner";

// need wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => getRpcUrl(), []);
  // Phantom legacy adapter only — Standard auto-discovery may duplicate, keep single adapter
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  const onError = useCallback((err: Error) => {
    // Don't spam for user rejection
    if (err.message?.includes("User rejected")) return;
    // Suppress autoConnect noise when extension not installed / not approved
    if (err.name === "WalletConnectionError" || err.message?.includes("Unexpected error")) {
      if (process.env.NODE_ENV !== "production") console.warn("[wallet autoConnect suppressed]", err.message);
      return;
    }
    console.error("[wallet]", err);
    toast.error(err.message || String(err));
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect onError={onError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
