import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = site.footerTagline;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const lastSpace = site.title.lastIndexOf(" ");
const ogTitleTop = lastSpace === -1 ? site.title : site.title.slice(0, lastSpace);
const ogTitleBottom = lastSpace === -1 ? "" : site.title.slice(lastSpace + 1);

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 96px",
          background: "#ffffff",
          color: "#171717",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 24,
            color: "#525252",
            letterSpacing: 1,
            textTransform: "uppercase",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: "#171717",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              borderRadius: 6,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            PH
          </div>
          <span>pianohouseproject.org</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 128,
              fontWeight: 600,
              letterSpacing: -4,
              lineHeight: 0.95,
            }}
          >
            <span>{ogTitleTop}</span>
            <span>{ogTitleBottom}</span>
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 44,
              color: "#525252",
              lineHeight: 1.3,
            }}
          >
            {site.description}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
