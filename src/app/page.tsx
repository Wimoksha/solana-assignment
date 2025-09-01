import Link from "next/link";

type TrendingItem = {
  mint: string;
  name?: string;
  symbol?: string;
  image?: string;
  priceUsd?: number | null;
  change24hPct?: number | null;
};

async function getTrending(): Promise<TrendingItem[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/trending`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load trending");
  const json = await res.json();
  return json.items as TrendingItem[];
}

export default async function HomePage() {
  let items: TrendingItem[] = [];
  try { items = await getTrending(); } catch (e) {}

  return (
    <main>
      <h1 style={{ margin: "8px 0 16px" }}>Trending tokens</h1>

      <form action={(formData) => {
        const addr = String(formData.get("address") || "").trim();
        if (addr) { (globalThis as any).location = `/wallet/${addr}`; }
      }} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input name="address" placeholder="Paste a wallet address…" style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #2d3748", background: "#11151a", color: "white" }} />
        <button type="submit" style={{ padding: "10px 14px", borderRadius: 8, border: 0, background: "#2563eb", color: "white" }}>Open wallet</button>
      </form>

      {!items.length ? (
        <p>Couldn’t load trending right now.</p>
      ) : (
        <div style={{ border: "1px solid #233044", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 120px 120px", gap: 12, padding: "10px 12px", background: "#0f1318", color: "#9fb3c8", fontSize: 14 }}>
            <div>#</div><div>Token</div><div style={{ textAlign: "right" }}>Price</div><div style={{ textAlign: "right" }}>24h</div>
          </div>
          {items.map((t, i) => {
            const pct = t.change24hPct ?? null;
            const pctStr = pct == null ? "—" : `${(pct >= 0 ? "+" : "")}${pct.toFixed(2)}%`;
            return (
              <div key={t.mint} style={{ display: "grid", gridTemplateColumns: "auto 1fr 120px 120px", gap: 12, padding: "12px", borderTop: "1px solid #1a2330", alignItems: "center" }}>
                <div style={{ opacity: 0.8 }}>{i + 1}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  {t.image ? <img src={t.image} width={24} height={24} style={{ borderRadius: 6 }} alt="" /> : <div style={{ width: 24 }} />}
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 600 }}>{t.name ?? t.symbol ?? t.mint.slice(0, 6) + "…"}</div>
                    <div style={{ fontSize: 12, color: "#9fb3c8" }}>{t.symbol ?? t.mint.slice(0, 8)} • <code style={{ color: "#9ecbff" }}>{t.mint.slice(0, 6)}…{t.mint.slice(-4)}</code></div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>{t.priceUsd == null ? "—" : `$${t.priceUsd.toLocaleString(undefined, { maximumFractionDigits: 6 })}`}</div>
                <div style={{ textAlign: "right", color: pct == null ? "#9fb3c8" : pct >= 0 ? "#22c55e" : "#ef4444" }}>{pctStr}</div>
              </div>
            );
          })}
        </div>
      )}

      <p style={{ marginTop: 16, fontSize: 12, color: "#9fb3c8" }}>
  Prices/changes are fetched via SolanaTracker trending and price endpoints.
</p>
    </main>
  );
}
