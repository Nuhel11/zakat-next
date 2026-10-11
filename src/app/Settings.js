import { formatMoney } from "./money";

export default function Settings({ settings, onChange, nisab }) {
  // Change one setting, keep the others the same
  function update(field, value) {
    onChange({ ...settings, [field]: value });
  }

  return (
    <section className="card">
      <h2>Settings</h2>
      <div className="grid">
        <label className="field">
          <span>Currency</span>
          <select value={settings.currency} onChange={(e) => update("currency", e.target.value)}>
            <option value="£">British pound (£)</option>
            <option value="$">US dollar ($)</option>
            <option value="€">Euro (€)</option>
            <option value="৳">Bangladeshi taka (৳)</option>
          </select>
        </label>

        <label className="field">
          <span>Gold price per gram</span>
          <input
            id="goldPrice"
            type="number" min="0" step="any" placeholder="Today's price"
            value={settings.goldPrice}
            onChange={(e) => update("goldPrice", e.target.value)}
          />
        </label>

        <label className="field">
          <span>Silver price per gram</span>
          <input
            id="silverPrice"
            type="number" min="0" step="any" placeholder="Today's price"
            value={settings.silverPrice}
            onChange={(e) => update("silverPrice", e.target.value)}
          />
        </label>

        <label className="field">
          <span>Nisab based on</span>
          <select value={settings.nisabBasis} onChange={(e) => update("nisabBasis", e.target.value)}>
            <option value="gold">Gold · 87.48 g</option>
            <option value="silver">Silver · 612.36 g</option>
          </select>
        </label>
      </div>

      <p className="nisab-line">
        Nisab today <strong>{formatMoney(nisab, settings.currency)}</strong>
      </p>
    </section>
  );
}