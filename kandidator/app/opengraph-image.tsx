import { ImageResponse } from "next/og";

export const alt = "Kandidator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0E3A48",
          color: "#F6F3EE",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
        }}
      >
        <div style={{ fontSize: 72 }}>Kandidator</div>
        <div style={{ fontSize: 36, marginTop: 24 }}>Rekrytering, headhunting och bemanning</div>
      </div>
    ),
    { ...size },
  );
}
