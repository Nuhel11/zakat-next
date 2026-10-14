import { formatMoney } from "./money";

export default function Summary({
  title, name, result, nisab, currency, fullYear,
  onFullYearChange, onDownload, onAddNext,
}) {
  const money = (amount) => formatMoney(amount, currency);

  // Explain why no zakat is due, if that's the case
  let message = "";
  if (nisab === 0) {
    message = "Enter today's gold or silver price in the settings to work out the nisab.";
  } else if (!result.aboveNisab) {
    message = "Net wealth is below the nisab, so no zakat is due on it this year.";
  } else if (!fullYear) {
    message = "Zakat on wealth is only due once it has stayed above the nisab for a full lunar year.";
  }

  return (
    <section className="card summary" id="result">
      <p className="group-label">{title}</p>
      <p className="total">{money(result.total)}</p>

      <ul className="breakdown">
        <li><span>Total wealth</span><strong>{money(result.assets)}</strong></li>
        <li><span>Less debts</span><strong className="minus-amount">− {money(result.debts)}</strong></li>
        <li><span>Net wealth</span><strong>{money(result.net)}</strong></li>
        <li><span>Nisab</span><strong>{money(nisab)}</strong></li>
      </ul>

      <div className="member-result">
        <span className={result.aboveNisab ? "badge above" : "badge"}>
          {result.aboveNisab ? "Above nisab" : "Below nisab"}
        </span>
        <span className="net">Zakat on wealth (2.5%)</span>
        <strong className="zakat">{money(result.wealthZakat)}</strong>
      </div>

      {result.cropZakat > 0 && (
        <div className="section-total">
          <span>Zakat on crops</span>
          <strong>{money(result.cropZakat)}</strong>
        </div>
      )}

      <label className="check">
        <input
          type="checkbox"
          checked={fullYear}
          onChange={(e) => onFullYearChange(e.target.checked)}
        />
        This wealth has stayed at or above the nisab for a full lunar year
      </label>

      {message && <p className="hint">{message}</p>}

      <div className="actions">
        <button type="button" className="button-primary" onClick={onDownload}>
                    {name ? "Download " + name + "'s PDF" : "Download PDF"}
        </button>
        <button type="button" className="button-secondary" onClick={onAddNext}>
          Start the next person
        </button>
      </div>
    </section>
  );
}