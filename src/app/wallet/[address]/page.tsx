type WalletData = {
  totalUsd: number | null;
  totalSol: number | null;
  timestamp: string | null;
  tokens: { mint: string; name?: string; symbol?: string; image?: string; balance?: number | null; valueUsd?: number | null; priceUsd?: number | null }[];
};

async function getWallet(address: string): Promise<WalletData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/wallet/${address}`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default async function WalletPage({ params }: { params: { address: string }}) {
  let data: WalletData | null = null;
  let error: string | null = null;
  try { data = await getWallet(params.address); } catch (e: any) { error = e?.message ?? "Failed"; }

  return (
    <main>
      <h1 style={{ margin: "8px 0 4px" }}>Wallet</h1>
      <p style={{ margin: 0, color: "#9fb3c8" }}><code>{params.address}</code></p>

      {error && <p style={{ marginTop: 16, color: "#ef4444" }}>{error}</p>}

      {!error && data && (
        <>
          <section style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ padding: 12, borderRadius: 10, border: "1px solid #233044", minWidth: 220 }}>
              <div style={{ color: "#9fb3c8", fontSize: 12 }}>Total (USD)</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{data.totalUsd == null ? "—" : `$${data.totalUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}</div>
            </div>
            <div style={{ padding: 12, borderRadius: 10, border: "1px solid #233044", minWidth: 220 }}>
              <div style={{ color: "#9fb3c8", fontSize: 12 }}>Total SOL</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{data.totalSol == null ? "—" : data.totalSol.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
            </div>
            <div style={{ padding: 12, borderRadius: 10, border: "1px solid #233044", minWidth: 220 }}>
              <div style={{ color: "#9fb3c8", fontSize: 12 }}>Updated</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{data.timestamp ?? "—"}</div>
            </div>
          </section>

          <h2 style={{ marginTop: 24 }}>Token holdings</h2>
          <div style={{ border: "1px solid #233044", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", gap: 12, padding: "10px 12px", background: "#0f1318", color: "#9fb3c8", fontSize: 14 }}>
              <div>Token</div><div style={{ textAlign: "right" }}>Balance</div><div style={{ textAlign: "right" }}>USD Value</div>
            </div>
            {data.tokens.map((t) => (
              <div key={t.mint} style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", gap: 12, padding: "12px", borderTop: "1px solid #1a2330", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {t.image ? <img src={t.image} width={24} height={24} style={{ borderRadius: 6 }} alt="" /> : <div style={{ width: 24 }} />}
                  <div>
                    <div style={{ fontWeight: 600 }}>{t.name ?? t.symbol ?? t.mint.slice(0, 6) + "…"}</div>
                    <div style={{ fontSize: 12, color: "#9fb3c8" }}>{t.symbol ?? "—"} • <code style={{ color: "#9ecbff" }}>{t.mint.slice(0, 6)}…{t.mint.slice(-4)}</code></div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>{t.balance == null ? "—" : t.balance.toLocaleString(undefined, { maximumFractionDigits: 9 })}</div>
                <div style={{ textAlign: "right" }}>{t.valueUsd == null ? "—" : `$${t.valueUsd.toLocaleString(undefined, { maximumFractionDigits: 6 })}`}</div>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 16, fontSize: 12, color: "#9fb3c8" }}>
            Data from SolanaTracker wallet endpoints (includes SOL balance via totals and SOL token entry). :contentReference[oaicite:7]{index=7}
          </p>
        </>
      )}
    </main>
  );
}
