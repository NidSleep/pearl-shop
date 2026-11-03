import { ImageResponse } from "next/og";

export const alt = "Pearl Shop — A little lustre. A lasting impression. Pearl jewellery for Malaysia and Singapore.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 80px", background: "#faf8f4", color: "#302b27" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32 }}>Pearl Shop<span style={{ width: 10, height: 10, borderRadius: 50, background: "#b59b72" }} /></div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 76, letterSpacing: -3, lineHeight: 1.15 }}>
        <span>A little lustre.</span><span style={{ color: "#806137" }}>A lasting impression.</span>
      </div>
      <div style={{ display: "flex", paddingTop: 24, borderTop: "1px solid #ded5c9", color: "#6e6258", fontSize: 24 }}>Pearl jewellery · Malaysia & Singapore</div>
    </div>,
    size,
  );
}
