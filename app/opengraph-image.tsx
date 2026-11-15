import { ImageResponse } from "next/og";

export const alt = "FabriTrack fabric business management";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 58%, #dbeafe 100%)",
          color: "#111827",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 68, height: 68, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 18, background: "linear-gradient(135deg, #2563eb, #1e3a8a)", color: "white", fontSize: 42, fontWeight: 800 }}>F</div>
          <span style={{ fontSize: 34, fontWeight: 700, color: "#1e3a8a" }}>FabriTrack</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 980 }}>
          <div style={{ fontSize: 64, lineHeight: 1.1, fontWeight: 800 }}>Run your fabric business with clarity.</div>
          <div style={{ fontSize: 30, lineHeight: 1.4, color: "#475569" }}>Manage fabric and thread, employees, production counts, earnings, payments, and billing in one workspace.</div>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 20, color: "#1d4ed8", fontWeight: 600 }}>
          <span>Inventory</span><span>·</span><span>Employees</span><span>·</span><span>Production</span><span>·</span><span>Billing</span>
        </div>
      </div>
    ),
    size,
  );
}
