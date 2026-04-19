function SkeletonBlock({ width = "100%", height = 14, radius = 6, style = {} }) {
  return (
    <div style={{
      width, height,
      background: "linear-gradient(90deg, #ece8e0 25%, #f5f2ed 50%, #ece8e0 75%)",
      backgroundSize: "400px 100%",
      animation: "shimmer 1.4s ease infinite",
      borderRadius: radius,
      ...style,
    }} />
  );
}

export default function ResultsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Score rings skeleton */}
      <div>
        <SkeletonBlock width={90} height={10} style={{ marginBottom: 14 }} />
        <div style={{
          display: "flex", alignItems: "center", gap: 24,
          padding: "18px 24px", border: "1px solid #e8e3da",
          borderRadius: 16, width: "fit-content",
        }}>
          <SkeletonBlock width={80} height={80} radius={40} />
          <SkeletonBlock width={24} height={10} />
          <SkeletonBlock width={80} height={80} radius={40} />
        </div>
      </div>

      {/* Highlighted text skeleton */}
      <div>
        <SkeletonBlock width={160} height={10} style={{ marginBottom: 10 }} />
        <div style={{ padding: "14px 16px", border: "1px solid #e8e3da", borderRadius: 12, display: "flex", flexDirection: "column", gap: 9 }}>
          <SkeletonBlock width="90%" />
          <SkeletonBlock width="78%" />
          <SkeletonBlock width="55%" />
        </div>
      </div>

      {/* Corrected text skeleton */}
      <div>
        <SkeletonBlock width={80} height={10} style={{ marginBottom: 8 }} />
        <div style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #e8e3da", display: "flex", flexDirection: "column", gap: 8 }}>
          <SkeletonBlock width="85%" />
          <SkeletonBlock width="60%" />
        </div>
      </div>

      {/* Error cards skeleton */}
      <div>
        <SkeletonBlock width={100} height={10} style={{ marginBottom: 10 }} />
        {[1, 2].map((i) => (
          <div key={i} style={{ borderRadius: 10, border: "1px solid #e8e3da", marginBottom: 8, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid #e8e3da", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <SkeletonBlock width={130} height={12} />
              <SkeletonBlock width={80} height={12} />
            </div>
            <div style={{ padding: "10px 14px" }}>
              <SkeletonBlock width="70%" height={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
