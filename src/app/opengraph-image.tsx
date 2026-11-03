import { ImageResponse } from "next/og";

export const alt = "Pearl Shop — Naturally luminous. Entirely you. Pearl jewellery for Malaysia and Singapore.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 80px", background: "#ffffff", color: "#282724" }}>
      <div style={{ display: "flex", alignItems: "center", fontSize: 28, letterSpacing: 5 }}>PEARL SHOP</div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 76, letterSpacing: -3, lineHeight: 1.15 }}>
        <span>Naturally luminous.</span><span>Entirely you.</span>
      </div>
      <div style={{ display: "flex", paddingTop: 24, borderTop: "1px solid #e2e1dd", color: "#64635f", fontSize: 24 }}>Pearl jewellery · Malaysia & Singapore</div>
    </div>,
    size,
  );
}
