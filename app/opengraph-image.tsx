import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Juol — Se acabó el no completamos.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 96px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Faint circle decoration */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 560,
          height: 560,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
        }} />
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 320,
          height: 320,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
        }} />

        {/* Logo badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 48,
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "#ff6b00",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            fontWeight: 900,
            color: "white",
          }}>
            J
          </div>
          <span style={{ color: "white", fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px" }}>
            juol
          </span>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{
            color: "white",
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-2px",
          }}>
            Se acabó el
          </span>
          <span style={{
            color: "#ff6b00",
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-2px",
          }}>
            no completamos.
          </span>
        </div>

        {/* Subtext */}
        <p style={{
          marginTop: 28,
          color: "rgba(255,255,255,0.45)",
          fontSize: 24,
          fontWeight: 500,
          lineHeight: 1.5,
          maxWidth: 560,
        }}>
          Organizá y encontrá partidos de fútbol cerca tuyo. Paraguay.
        </p>

        {/* Bottom tag */}
        <div style={{
          position: "absolute",
          bottom: 64,
          right: 96,
          color: "rgba(255,255,255,0.2)",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "2px",
        }}>
          juol.lat
        </div>
      </div>
    ),
    { ...size }
  );
}
