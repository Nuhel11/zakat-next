// The picture that appears in the Facebook post, at /api/share-image
// Add ?name=Nazmin to put a name on it.
import { ImageResponse } from "next/og";
import { CHARITY, cleanName } from "../../charity";

export async function GET(request) {
  const name = cleanName(new URL(request.url).searchParams.get("name"));
  const headline = name ? name + " has given their zakat" : "I've given my zakat";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 36,
          background: "linear-gradient(160deg, #0f5a3c, #0b3d2a)",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px",
            border: "3px solid #c9a24a",
            borderRadius: 28,
            color: "white",
          }}
        >
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: "#c9a24a" }}>
            ZAKAT GIVEN · ALHAMDULILLAH
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>
              {headline}
            </div>
            <div style={{ display: "flex", fontSize: 68, fontWeight: 700, color: "#e3c27a", marginTop: 8 }}>
              {"to " + CHARITY.name}
            </div>
            <div style={{ display: "flex", fontSize: 28, marginTop: 24, color: "rgba(255,255,255,0.8)" }}>
              {"Registered charity no. " + CHARITY.number + " · " + CHARITY.website}
            </div>
          </div>

          <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,0.75)" }}>
            Work out your own zakat with the free Zakat Calculator
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}