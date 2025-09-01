import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";

const BASE = "https://data.solanatracker.io";

export const revalidate = 0;

export async function GET(_: NextRequest, { params }: { params: { address: string }}) {
  const key = process.env.SOLANA_TRACKER_API_KEY;
  if (!key) return NextResponse.json({ error: "Missing API key" }, { status: 500 });

  // Validate Solana address (Base58 + curve check)
  try { new PublicKey(params.address); } 
  catch { return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 }); }

  // Use full wallet endpoint to get SOL + token metadata (name/symbol). :contentReference[oaicite:4]{index=4}
  const res = await fetch(`${BASE}/wallet/${params.address}`, {
    headers: { "x-api-key": key },
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json({ error: "Failed to fetch wallet", detail }, { status: 502 });
  }

  const data = await res.json();
  // Per docs, response includes tokens[], total (USD), totalSol, timestamp. :contentReference[oaicite:5]{index=5}
  return NextResponse.json({
    totalUsd: data?.total ?? null,
    totalSol: data?.totalSol ?? null,
    timestamp: data?.timestamp ?? null,
    tokens: Array.isArray(data?.tokens)
      ? data.tokens.map((t: any) => ({
          mint: t?.token?.mint ?? t?.address,
          name: t?.token?.name,
          symbol: t?.token?.symbol,
          image: t?.token?.image,
          balance: t?.balance ?? null,
          valueUsd: t?.value ?? null,
          priceUsd: t?.price?.usd ?? t?.priceUsd ?? null,
        }))
      : [],
  });
}
