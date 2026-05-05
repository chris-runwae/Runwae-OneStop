import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #D40069 0%, #7c0034 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "48px",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: "-2px",
          }}
        >
          Runwae
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 32,
            marginTop: 20,
            maxWidth: 800,
            textAlign: "center",
          }}
        >
          {decodeURIComponent(slug)}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
