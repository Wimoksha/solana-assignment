export const metadata = { title: "Solana Assignment" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "ui-sans-serif, system-ui", margin: 0, background: "#0b0d10", color: "#e6edf3" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px" }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <a href="/" style={{ fontWeight: 700, fontSize: 18, textDecoration: "none", color: "#e6edf3" }}>solana-assignment</a>
            <nav style={{ display: "flex", gap: 16 }}>
              <a href="/" style={{ color: "#9ecbff" }}>Trending</a>
              <a href="/phantom" style={{ color: "#9ecbff" }}>Phantom</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
