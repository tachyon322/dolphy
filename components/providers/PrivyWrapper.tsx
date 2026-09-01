"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export function PrivyWrapper({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

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
