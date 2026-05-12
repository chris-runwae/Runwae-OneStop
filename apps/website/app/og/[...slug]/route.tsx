import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const TITLES: Record<string, string> = {
  home: "Plan Together. Book Together. Split the Cost.",
  about: "Built for the way you gather.",
  hosts: "Your attendees are already spending. Now you can earn from it.",
  partners: "Get Booked by Event Crowds.",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const key = (slug?.[0] ?? "home").replace(/\.png$/, "");
  const fromQuery = req.nextUrl.searchParams.get("title");
  const title = fromQuery ?? TITLES[key] ?? "Runwae";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "radial-gradient(ellipse at top, #ffe2ee 0%, #ffffff 55%, #f5f5f5 100%)",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#d30b6b",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            R
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, color: "#252525" }}>
            Runwae
          </div>
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 600,
            lineHeight: 1.1,
            color: "#252525",
            maxWidth: 980,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 28, color: "#6b7280" }}>runwae.io</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
