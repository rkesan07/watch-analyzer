"use client";

const shimmerStyle = `
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
`;

function Bone({
  width = "100%",
  height = 16,
  borderRadius = 4,
  style = {},
}: {
  width?: string | number;
  height?: number;
  borderRadius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background:
          "linear-gradient(90deg, #1a1a1f 25%, #222228 50%, #1a1a1f 75%)",
        backgroundSize: "600px 100%",
        animation: "shimmer 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

function SkeletonCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "0.5rem",
        padding: "1.5rem",
      }}
    >
      {children}
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* VerdictHero skeleton */}
        <SkeletonCard>
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                flexShrink: 0,
                background:
                  "linear-gradient(90deg, #1a1a1f 25%, #222228 50%, #1a1a1f 75%)",
                backgroundSize: "600px 100%",
                animation: "shimmer 1.4s ease-in-out infinite",
              }}
            />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
              <Bone width="40%" height={12} />
              <Bone width="60%" height={28} borderRadius={6} />
              <Bone width="90%" height={12} />
              <Bone width="70%" height={12} />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                <Bone width="100%" height={6} borderRadius={3} />
                <Bone width="100%" height={6} borderRadius={3} />
                <Bone width="100%" height={6} borderRadius={3} />
              </div>
            </div>
          </div>
        </SkeletonCard>

        {/* MarketPrice skeleton */}
        <SkeletonCard>
          <Bone width="30%" height={10} style={{ marginBottom: "12px" }} />
          <Bone width="50%" height={40} borderRadius={6} style={{ marginBottom: "8px" }} />
          <Bone width="35%" height={10} style={{ marginBottom: "20px" }} />
          <Bone width="100%" height={8} borderRadius={4} style={{ marginBottom: "8px" }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Bone width="20%" height={10} />
            <Bone width="20%" height={10} />
          </div>
        </SkeletonCard>

        {/* PriceTrend skeleton */}
        <SkeletonCard>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <Bone width="25%" height={10} />
            <Bone width="20%" height={10} />
          </div>
          <Bone width="100%" height={160} borderRadius={6} style={{ marginBottom: "1.25rem" }} />
          <div style={{ display: "flex", gap: "10px" }}>
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.375rem",
                  padding: "10px 16px",
                }}
              >
                <Bone width="60%" height={10} style={{ marginBottom: "8px" }} />
                <Bone width="40%" height={18} />
              </div>
            ))}
          </div>
        </SkeletonCard>

        {/* QuickStats skeleton */}
        <SkeletonCard>
          <div style={{ display: "flex" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ flex: 1, padding: "1.125rem 1.25rem" }}>
                <Bone width="70%" height={10} style={{ marginBottom: "12px" }} />
                <Bone width="50%" height={20} style={{ marginBottom: "6px" }} />
                <Bone width="80%" height={9} />
              </div>
            ))}
          </div>
        </SkeletonCard>

        {/* ReferenceInfo skeleton */}
        <SkeletonCard>
          <Bone width="30%" height={10} style={{ marginBottom: "8px" }} />
          <Bone width="55%" height={22} borderRadius={4} style={{ marginBottom: "1.25rem" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 2.5rem" }}>
            {[0, 1].map((col) => (
              <div key={col}>
                {[0, 1, 2, 3, 4].map((row) => (
                  <div
                    key={row}
                    style={{
                      padding: "12px 0",
                      borderBottom: "1px solid var(--border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <Bone width="40%" height={9} />
                    <Bone width="65%" height={13} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>
    </>
  );
}
