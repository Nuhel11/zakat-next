import { formatMoney } from "./money";

export default function PriceStrip({ prices, nisab, currency, onManualChange }) {
  const money = (amount) => formatMoney(amount, currency);

  if (prices.status === "loading") {
    return <div className="price-strip">Getting today's gold and silver prices…</div>;
  }

  // The price service didn't answer, so let people type the prices in
  if (prices.status === "failed") {
    return (
      <div className="price-strip failed">
        <p>We couldn't get today's prices automatically. Please type them in:</p>
        <div className="price-inputs">
          <label>
            Gold, {currency} per gram
            <input
              id="goldPrice"
              type="number" min="0" step="any"
              value={prices.gold || ""}
              onChange={(e) => onManualChange("gold", e.target.value)}
            />
          </label>
          <label>
            Silver, {currency} per gram
            <input
              id="silverPrice"
              type="number" min="0" step="any"
              value={prices.silver || ""}
              onChange={(e) => onManualChange("silver", e.target.value)}
            />
          </label>
        </div>
      </div>
    );
  }

  const updated = prices.updatedAt
    ? new Date(prices.updatedAt).toLocaleString("en-GB", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
      })
    : "";

  return (
    <div className="price-strip">
      <span>Gold <strong>{money(prices.gold)}</strong>/g</span>
      <span>Silver <strong>{money(prices.silver)}</strong>/g</span>
      <span>Nisab <strong>{money(nisab)}</strong></span>
      {updated && <span className="price-time">Updated {updated}</span>}
    </div>
  );
}