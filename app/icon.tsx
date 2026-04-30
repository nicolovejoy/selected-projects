import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#171717",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: -0.5,
          borderRadius: 6,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        PH
      </div>
    ),
    size,
  );
}
