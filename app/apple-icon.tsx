import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 38,
          background: "linear-gradient(135deg, #2563eb, #1e3a8a)",
          color: "white",
          fontSize: 118,
          fontWeight: 800,
          letterSpacing: -12,
        }}
      >
        F<span style={{ color: "#93c5fd", fontSize: 64, alignSelf: "flex-end", marginBottom: 35 }}>T</span>
      </div>
    ),
    size,
  );
}
