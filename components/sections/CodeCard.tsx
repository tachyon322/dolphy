import Link from "next/link";

export function CodeCard() {
  return (
    <Link
      href="/marketplace"
      aria-label="See live GPU quotes in the marketplace"
      className="flex w-[480px] shrink-0 flex-col overflow-hidden rounded-[16px] border-[0.5px] bg-[#ffffffb8] backdrop-blur-[18px] transition-[border-color,box-shadow] hover:border-[#0d0d0d29] max-[810px]:w-full"
      style={{ borderColor: "rgba(13,13,13,0.08)" }}
    >
      <div className="flex items-center gap-[10px] border-b border-black/5 bg-[#0d0d0d08] px-4 py-3">
        <span
          className="font-mono text-[11px] font-semibold tracking-[0.08em] text-[var(--ink-text)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          QUOTE
        </span>
        <span
          className="min-w-0 flex-1 truncate font-mono text-[12px] text-[#0d0d0db3]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          /api/quote
        </span>
        <span
          className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[11px] text-[#0d0d0d80]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <i className="h-1.5 w-1.5 rounded-full bg-[#4ade80] shadow-[0_0_6px_#4ade80b3]" />
          200 OK
        </span>
      </div>
      <pre
        className="m-0 overflow-x-auto bg-[#f8f9fa] p-[18px_20px] text-left font-mono text-[12.5px] leading-[1.6] text-[#383a42] max-[810px]:p-[14px_16px] max-[810px]:text-[11px]"
        style={{
          fontFamily: "var(--font-mono)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        <code>
          {"{\n    "}
          <span className="tok-oqg">&quot;gpu&quot;</span>
          {": "}
          <span className="tok-oqg">&quot;H100 · 80GB&quot;</span>
          {",\n    "}
          <span className="tok-oqg">&quot;hours&quot;</span>
          {": "}
          <span className="tok-2m4">6</span>
          {",\n    "}
          <span className="tok-oqg">&quot;price_sol&quot;</span>
          {": "}
          <span className="tok-oqg">&quot;0.42&quot;</span>
          {",\n    "}
          <span className="tok-oqg">&quot;price_token&quot;</span>
          {": "}
          <span className="tok-oqg">&quot;3.57&quot;</span>
          {",\n    "}
          <span className="tok-oqg">&quot;discount&quot;</span>
          {": "}
          <span className="tok-oqg">&quot;15%&quot;</span>
          {",\n    "}
          <span className="tok-oqg">&quot;expires_in&quot;</span>
          {": "}
          <span className="tok-2m4">60</span>
          {"\n}"}
        </code>
      </pre>
    </Link>
  );
}
