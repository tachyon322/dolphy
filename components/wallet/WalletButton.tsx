"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useActiveWallet } from "@/lib/useActiveWallet";
import { toast } from "sonner";

function shortAddr(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

const hasPrivy = !!process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export function WalletButton() {
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Privy — conditional (hasPrivy is build-time constant, hook order stable)
  let privyReady = false;
  let authenticated = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let login: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let logout: any = null;
  let user: unknown = null;
  if (hasPrivy) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const privy = usePrivy();
    privyReady = privy.ready;
    authenticated = privy.authenticated;
    login = privy.login;
    logout = privy.logout;
    user = privy.user;
  }
  const active = useActiveWallet();
  const { address, isConnected } = active;

  // Adapter fallback (kept for Phantom-only when Privy not configured or as secondary)
  const { publicKey, connected: adapterConnected, disconnect: adapterDisconnect, wallets, select, connect, wallet } = useWallet();
  const { setVisible } = useWalletModal();

  const handlePrivyConnect = async () => {
    if (!hasPrivy) {
      // fallback to adapter
      const phantom = wallets.find((w) => w.adapter.name === "Phantom");
      if (!phantom) {
        setVisible(true);
        return;
      }
      try {
        if (wallet?.adapter.name !== phantom.adapter.name) select(phantom.adapter.name);
        await connect().catch((e: unknown) => {
          if (String(e).includes("already")) return;
          throw e;
        });
      } catch (e) {
        console.error("[wallet connect]", e);
        toast.error(String(e instanceof Error ? e.message : e));
      }
      return;
    }
    if (!privyReady) {
      toast.error("Privy not ready yet");
      return;
    }
    try {
      await login!();
    } catch (e) {
      console.error("[privy login]", e);
      toast.error(String(e instanceof Error ? e.message : e));
    }
  };

  const handleDisconnect = async () => {
    try {
      if (hasPrivy && authenticated && logout) {
        await logout();
      }
      if (adapterConnected) {
        await adapterDisconnect();
      }
    } catch (e) {
      console.error("[wallet disconnect]", e);
    }
  };

  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex h-[34px] items-center justify-center rounded-full bg-white px-4 text-[13px] font-medium text-[#0d0d0d] transition hover:bg-white/90"
      >
        {t.nav.connectWallet}
      </button>
    );
  }

  // Unified display: Privy address takes precedence, else adapter
  const displayAddr = address ?? (adapterConnected && publicKey ? publicKey.toBase58() : null);
  const showConnected = Boolean(displayAddr && (isConnected || adapterConnected || authenticated));

  // Derive social hint for Privy user
  const socialLabel = (() => {
    if (!hasPrivy || !authenticated || !user) return null;
    const linked = (user as unknown as { linkedAccounts?: Array<{ type: string; username?: string | null; email?: string | null; name?: string | null }> })?.linkedAccounts;
    if (!linked) return null;
    const tw = linked.find((a) => a.type === "twitter_oauth");
    if (tw?.username) return `@${tw.username}`;
    const google = linked.find((a) => a.type === "google_oauth");
    if (google?.email) return google.email;
    const discord = linked.find((a) => a.type === "discord_oauth");
    if (discord?.username) return discord.username;
    return null;
  })();

  if (showConnected && displayAddr) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-mono text-[12px] font-medium text-[#0d0d0d] sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00d084] shadow-[0_0_6px_rgba(0,208,132,0.8)]" />
          {shortAddr(displayAddr)}
          {socialLabel && <span className="ml-1 hidden text-[10px] text-black/50 lg:inline">{socialLabel}</span>}
        </span>
        <button
          type="button"
          onClick={handleDisconnect}
          className="inline-flex h-[34px] items-center justify-center rounded-full border border-white/20 bg-transparent px-3 text-[13px] font-medium text-white/80 hover:bg-white/10 hover:text-white"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePrivyConnect}
      disabled={hasPrivy && !privyReady}
      className="inline-flex h-[34px] items-center justify-center rounded-full bg-white px-4 text-[13px] font-medium text-[#0d0d0d] transition hover:bg-white/90 disabled:opacity-50"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {hasPrivy ? t.nav.login : t.nav.connectWallet}
    </button>
  );
}

// compact for mobile menu
export function WalletButtonMobile({ onDone }: { onDone?: () => void }) {
  const { t } = useLocale();
  let privyReady = false;
  let authenticated = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let login: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let logout: any = null;
  if (hasPrivy) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const privy = usePrivy();
    privyReady = privy.ready;
    authenticated = privy.authenticated;
    login = privy.login;
    logout = privy.logout;
  }
  const active = useActiveWallet();
  const { address, isConnected } = active;
  const { publicKey, connected: adapterConnected, disconnect: adapterDisconnect, wallets, select, connect, wallet } = useWallet();
  const { setVisible } = useWalletModal();

  const handleConnect = async () => {
    if (!hasPrivy) {
      const phantom = wallets.find((w) => w.adapter.name === "Phantom");
      if (!phantom) {
        setVisible(true);
        onDone?.();
        return;
      }
      try {
        if (wallet?.adapter.name !== phantom.adapter.name) select(phantom.adapter.name);
        await connect().catch((e: unknown) => {
          if (String(e).includes("already")) return;
          throw e;
        });
        onDone?.();
      } catch (e) {
        console.error("[wallet connect mobile]", e);
        toast.error(String(e instanceof Error ? e.message : e));
      }
      return;
    }
    if (!privyReady) return;
    try {
      await login!();
      onDone?.();
    } catch (e) {
      console.error("[privy login mobile]", e);
      toast.error(String(e instanceof Error ? e.message : e));
    }
  };

  const displayAddr = address ?? (adapterConnected && publicKey ? publicKey.toBase58() : null);
  const showConnected = Boolean(displayAddr && (isConnected || adapterConnected || authenticated));

  if (showConnected && displayAddr) {
    return (
      <div className="flex flex-col gap-2">
        <div className="rounded-xl bg-black/5 px-4 py-3 font-mono text-sm text-[#0d0d0d]">{shortAddr(displayAddr)}</div>
        <button
          onClick={async () => {
            try {
              if (hasPrivy && authenticated && logout) await logout();
              if (adapterConnected) await adapterDisconnect();
            } finally {
              onDone?.();
            }
          }}
          className="rounded-xl bg-[#0d0d0d] px-4 py-3 text-sm font-medium text-white"
        >
          {hasPrivy && authenticated ? t.nav.logout : "Disconnect"}
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={handleConnect}
      disabled={hasPrivy && !privyReady}
      className="rounded-xl bg-[#0d0d0d] px-4 py-3 text-sm font-medium text-white w-full disabled:opacity-50"
    >
      {hasPrivy ? t.nav.loginWithSocial : t.nav.connectWallet}
    </button>
  );
}
