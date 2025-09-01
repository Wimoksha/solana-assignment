import { NextResponse } from "next/server";

const BASE = "https://data.solanatracker.io";

type TrendingItem = {
  mint: string;
  name?: string;
  symbol?: string;
  image?: string;
  priceUsd?: number | null;
  change24hPct?: number | null;
};

export const revalidate = 0; // no-cache

export async function GET() {
  const key = process.env.SOLANA_TRACKER_API_KEY;
  if (!key) return NextResponse.json({ error: "Missing API key" }, { status: 500 });

  // 1) Get trending tokens
  // The docs expose /tokens/trending (and /tokens/trending/{timeframe}) for listing trending tokens. :contentReference[oaicite:2]{index=2}
  const trendingRes = await fetch(`${BASE}/tokens/trending`, {
    headers: { "x-api-key": key },
    cache: "no-store",
  });

  if (!trendingRes.ok) {
    const t = await trendingRes.text();
    return NextResponse.json({ error: "Failed to load trending", detail: t }, { status: 502 });
  }

  const tData = await trendingRes.json();
  // Normalize: API may return {data: []} or flat array in docs playgrounds.
  const raw = Array.isArray(tData?.data) ? tData.data : Array.isArray(tData) ? tData : tData?.tokens || [];
  const top = (raw as any[]).slice(0, 25);

  const items: TrendingItem[] = top.map((x) => ({
    mint: x.mint ?? x.tokenAddress ?? x.address,
    name: x.name ?? x.token?.name,
    symbol: x.symbol ?? x.token?.symbol,
    image: x.image ?? x.token?.image,
    // Some docs show price on trending; if absent we’ll enrich with price/multi
    priceUsd: x.priceUsd ?? x.price?.usd ?? null,
    change24hPct: (x.events?.["24h"]?.priceChangePercentage as number) ?? null,
  })).filter(i => i.mint);

  const missingPrice = items.filter(i => i.priceUsd == null).map(i => i.mint);
  const missingChange = items.filter(i => i.change24hPct == null).map(i => i.mint);
  const needPriceOrChange = Array.from(new Set([...missingPrice, ...missingChange])).slice(0, 100);

  // 2) If needed, fetch prices & 24h change via /price/multi?priceChanges=true (up to 100 tokens). :contentReference[oaicite:3]{index=3}
  if (needPriceOrChange.length) {
    const url = new URL(`${BASE}/price/multi`);
    url.searchParams.set("tokens", needPriceOrChange.join(","));
    url.searchParams.set("priceChanges", "true");

    const pricesRes = await fetch(url, { headers: { "x-api-key": key }, cache: "no-store" });
    if (pricesRes.ok) {
      const pData = await pricesRes.json();
      // Try to normalize; expect either { data: { [mint]: {...} } } or an array
      const map: Record<string, any> = pData?.data ?? pData ?? {};
      items.forEach((it) => {
        const row = map[it.mint] ?? map[it.mint?.toString()];
        if (!row) return;
        if (it.priceUsd == null && (typeof row.price === "number" || typeof row.priceUsd === "number")) {
          it.priceUsd = row.price ?? row.priceUsd ?? null;
        }
        // Common pattern: price change percentage for 24h
        if (it.change24hPct == null) {
          it.change24hPct = row?.priceChangePercentage ?? row?.change24h ?? row?.changes?.["24h"] ?? null;
        }
      });
    }
  }

  return NextResponse.json({ items });
}
