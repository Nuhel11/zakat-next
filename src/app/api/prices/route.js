// Your site's own price service, at /api/prices
// Gets gold and silver in US dollars per troy ounce, converts to pounds per gram.

const GRAMS_PER_TROY_OUNCE = 31.1034768;

// Fetch a web address and read the JSON, or explain clearly what went wrong
async function getJson(url) {
  const response = await fetch(url, { next: { revalidate: 600 } }); // remember for 10 minutes
  if (!response.ok) {
    throw new Error(url + " returned " + response.status);
  }
  return response.json();
}

export async function GET() {
  try {
    // Ask all three at the same time
    const [gold, silver, exchange] = await Promise.all([
      getJson("https://api.gold-api.com/price/XAU"),          // gold, USD per ounce
      getJson("https://api.gold-api.com/price/XAG"),          // silver, USD per ounce
      getJson("https://api.frankfurter.dev/v2/rate/USD/GBP"), // how many £ for $1
    ]);

    const usdToGbp = exchange.rate;

    // Make sure we got real numbers back
    if (!gold.price || !silver.price || !usdToGbp) {
      throw new Error("Unexpected answer: " + JSON.stringify({ gold, silver, exchange }));
    }

    return Response.json({
      gold: (gold.price * usdToGbp) / GRAMS_PER_TROY_OUNCE,
      silver: (silver.price * usdToGbp) / GRAMS_PER_TROY_OUNCE,
      updatedAt: gold.updatedAt,
    });
  } catch (error) {
    // Show the real reason in the VS Code terminal...
    console.error("Price fetch failed:", error);
    // ...and in the browser
    return Response.json(
      { error: "Could not get today's prices", detail: String(error.message || error) },
      { status: 502 }
    );
  }
}