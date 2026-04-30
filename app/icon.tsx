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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 5 12 L 16 4 L 27 12"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <line
            x1="5"
            y1="12"
            x2="5"
            y2="28"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="27"
            y1="12"
            x2="27"
            y2="28"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="5"
            y1="28"
            x2="27"
            y2="28"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <rect x="9" y="20" width="2" height="6" fill="white" />
          <rect x="13" y="20" width="2" height="6" fill="white" />
          <rect x="17" y="20" width="2" height="6" fill="white" />
          <rect x="21" y="20" width="2" height="6" fill="white" />
        </svg>
      </div>
    ),
    size,
  );
}
