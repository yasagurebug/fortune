import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

function clampText(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawText = searchParams.get("t");
  const fortune = clampText(rawText?.trim() || "今日の占い", 2000);
  const origin = new URL(request.url).origin;
  const fontResponse = await fetch(
    `${origin}/fonts/ShipporiMincho-Regular.ttf`
  );
  const font = await fontResponse.arrayBuffer();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 72px",
          backgroundColor: "#f6efe3",
          backgroundImage:
            "radial-gradient(circle at 12% 10%, rgba(201, 90, 59, 0.22), transparent 55%), radial-gradient(circle at 90% 0%, rgba(44, 111, 125, 0.22), transparent 55%), linear-gradient(145deg, #f6efe3 0%, #f6d8c8 60%, #f1e2d0 100%)",
          color: "#1b1612",
          fontFamily: "ShipporiMincho",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ fontSize: 58, lineHeight: 1.1 }}>
            今日の占い
          </div>
        </div>

        <div
          style={{
            fontSize: 34,
            lineHeight: 1.5,
            background: "rgba(255, 255, 255, 0.75)",
            borderRadius: 32,
            padding: "32px 36px",
            border: "1px solid rgba(60, 42, 28, 0.18)",
          }}
        >
          {fortune}
        </div>

      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "ShipporiMincho",
          data: font,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
}
