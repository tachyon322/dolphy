"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";

const hasPrivy = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;

/**
 * Unified wallet hook: prefers Privy (OAuth X/social + embedded Solana) over wallet-adapter Phantom.
 * Returns same shape as before: address, publicKey, isConnected, sendTransaction, connection
 */
export function useActiveWallet() {
  // Privy hooks — only call when configured (hasPrivy is build-time constant, hook order stable)
  let authenticated = false;
  let user: unknown = null;
  let privyReady = false;
  let privyWallets: unknown[] = [];
  let walletsReady = false;
  if (hasPrivy) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const privy = usePrivy();
    authenticated = privy.authenticated;
    user = privy.user;
    privyReady = privy.ready;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const w = useWallets();
    privyWallets = w.wallets as unknown[];
    walletsReady = w.ready;
  }
  const { publicKey: adapterKey, sendTransaction: adapterSend, connected: adapterConnected } = useWallet();
  const { connection } = useConnection();

  // Find Solana privy wallet — prefer embedded ("privy") then any linked
  const privySolanaWallet = useMemo(() => {
    if (!privyWallets?.length) return null;
    // wallets contain both ethereum and solana — filter by chainType or walletClientType
    const solanaWallets = privyWallets.filter((w: unknown) => {
      const wallet = w as { type?: string; chainType?: string; walletClientType?: string; address: string };
      // newer SDK uses wallet.chainType === "solana" or wallet.type === "solana"
      return wallet.chainType === "solana" || wallet.type === "solana" || wallet.walletClientType === "phantom" || wallet.address?.length >= 32;
    });
    // Prefer embedded privy wallet first
    const embedded = solanaWallets.find((w: unknown) => (w as { walletClientType?: string }).walletClientType === "privy");
    if (embedded) return embedded as { address: string };
    // Else first solana wallet, or fallback to user.wallet (Privy primary)
    if (solanaWallets.length) return solanaWallets[0] as { address: string };
    return null;
  }, [privyWallets]);

  const privyAddress = useMemo(() => {
    if (privySolanaWallet?.address) return privySolanaWallet.address;
    // Fallback: user.wallet.address (Privy user primary wallet) — may be Solana embedded
    // Linked accounts may hold solana embedded address too
    const wa = (user as unknown as { wallet?: { address?: string; chainType?: string } } | null)?.wallet?.address;
    if (wa) return wa;
    // Also check linkedAccounts for privy solana wallet
    const linked = (user as unknown as { linkedAccounts?: Array<{ type: string; walletClientType?: string; address?: string; chainType?: string }> } | null)?.linkedAccounts;
    if (linked) {
      const privySol = linked.find((a) => a.type === "wallet" && a.walletClientType === "privy" && a.chainType === "solana");
      if (privySol?.address) return privySol.address;
      const anySol = linked.find((a) => a.type === "wallet" && a.chainType === "solana");
      if (anySol?.address) return anySol.address;
    }
    return null;
  }, [privySolanaWallet, user]);

  // Also consider adapter key as fallback
  const address = privyAddress ?? adapterKey?.toBase58() ?? null;

  const publicKey = useMemo(() => {
    if (!address) return null;
    try {
      return new PublicKey(address);
    } catch {
      return null;
    }
  }, [address]);

  const isConnected = Boolean(authenticated && privyAddress) || adapterConnected || Boolean(address && privyReady && authenticated);

  // For now, Privy embedded wallets sign via Privy modal when using sendTransaction via wallet-adapter fallback?
  // We delegate to adapterSend if available, otherwise try to use Privy wallet if it exposes signAndSend.
  // Real Privy Solana send will be done via @solana/kit + Privy wallet provider, but for mock mode we keep adapter.
  const sendTransaction = useMemo(() => {
    // If we have privy embedded address but no adapter, we still need to send via Privy.
    // Privy wallets expose their own provider — for simplicity, use adapterSend which will prompt Phantom
    // If user is social-only (no Phantom), adapterSend will fail but Privy will handle via embedded wallet UI.
    // TODO: integrate Privy's useSendTransaction if needed for embedded signing without Phantom.
    return adapterSend;
  }, [adapterSend]);

  return {
    address,
    publicKey,
    isConnected,
    connected: isConnected,
    sendTransaction,
    connection,
    // debug/exposed
    privyReady: privyReady && walletsReady,
    authenticated,
    user,
    privyWallets,
    adapterKey,
    adapterConnected,
    // The raw privy address for dashboard filtering
    privyAddress,
  };
}
