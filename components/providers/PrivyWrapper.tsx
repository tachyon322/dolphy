"use client";

import { useMemo } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

export function PrivyWrapper({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // Solana external connectors (Phantom, Solflare, ...) — required for Privy
  // to detect installed extensions. Without this the wallet option in the
  // Privy modal falls back to "install extension" even when Phantom exists.
  // shouldAutoConnect: false — wallet-adapter below already autoConnects.
  const solanaConnectors = useMemo(() => toSolanaWalletConnectors({ shouldAutoConnect: false }), []);

  // If no appId in env (local dev without Privy), just render children
  // Keeps Phantom-only flow working without Privy
  if (!appId) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[privy] NEXT_PUBLIC_PRIVY_APP_ID not set — running without Privy, only Phantom wallet available");
    }
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["twitter", "google", "discord", "apple", "email", "wallet"],
        appearance: {
          theme: "light",
          accentColor: "#0d0d0d",
          walletChainType: "solana-only",
          // walletList controlled by dashboard + connectors
        },
        externalWallets: {
          solana: { connectors: solanaConnectors },
        },
        embeddedWallets: {
          solana: { createOnLogin: "users-without-wallets" },
          ethereum: { createOnLogin: "off" },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
