import { ASSET_TYPES, LIABILITY_TYPES, findType, entryValue } from "./entries";
import { formatMoney } from "./money";

// Only rows with a type chosen and something entered
function filledRows(entries, types) {
  return entries.filter((entry) => {
    const type = findType(types, entry.type);
    if (!type) return false;
    if (type.named) return entry.items.some((item) => Number(item.value) > 0);
    return Number(entry.value) > 0;
  });
}

export default function Report({ person, name, result, currency, nisabBasis, prices, nisab }) {
  const money = (amount) => formatMoney(amount, currency);
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const assets = filledRows(person.assets, ASSET_TYPES);
  const liabilities = filledRows(person.liabilities, LIABILITY_TYPES);

  // One table line per row, e.g. "Cash in hand     £7,000.00".
  // Banks, cards and loans get one line per bank, e.g. "Bank account – HSBC     £20,000.00".
  function tableRows(entries, types, sign) {
    return entries.flatMap((entry) => {
      const type = findType(types, entry.type);

      if (type.named) {
        return entry.items
          .filter((item) => Number(item.value) > 0)
          .map((item) => (
            <tr key={item.id}>
              <td>{type.label}{item.name ? " – " + item.name : ""}</td>
              <td className="num">{sign}{money(Number(item.value))}</td>
            </tr>
          ));
      }

      return [
        <tr key={entry.id}>
          <td>
            {type.label}
            {type.metal ? " (" + entry.value + " g)" : ""}
          </td>
          <td className="num">{sign}{money(entryValue(entry, types, prices))}</td>
        </tr>,
      ];
    });
  }

  return (
    <div className="report">
      <h1>{name ? "Zakat calculation for " + name : "Zakat calculation"}</h1>
      <p className="report-meta">
        Worked out on {today} · Gold {money(prices.gold)}/g · Silver {money(prices.silver)}/g ·
        Nisab {money(nisab)} (based on {nisabBasis})
      </p>

      <div className="report-total">
        <span>Zakat due</span>
        <strong>{money(result.total)}</strong>
      </div>

      {assets.length === 0 && liabilities.length === 0 ? (
        <p>Nothing entered.</p>
      ) : (
        <table>
          <tbody>
            {assets.length > 0 && (
              <tr className="report-section"><th colSpan={2}>Assets</th></tr>
            )}
            {tableRows(assets, ASSET_TYPES, "")}

            {liabilities.length > 0 && (
              <tr className="report-section"><th colSpan={2}>Liabilities</th></tr>
            )}
            {tableRows(liabilities, LIABILITY_TYPES, "− ")}
          </tbody>
        </table>
      )}

      <table className="report-summary">
        <tbody>
          <tr><td>Total wealth</td><td className="num">{money(result.assets)}</td></tr>
          <tr><td>Less liabilities</td><td className="num">− {money(result.debts)}</td></tr>
          <tr><td>Net wealth</td><td className="num">{money(result.net)}</td></tr>
          <tr>
            <td>Nisab check</td>
            <td className="num">
              {result.aboveNisab ? "Above nisab" : "Below nisab"}
              {!person.fullYear ? " · not held for a full year" : ""}
            </td>
          </tr>
          {result.cropZakat > 0 && (
            <tr><td>Zakat on crops</td><td className="num">{money(result.cropZakat)}</td></tr>
          )}
          <tr className="report-due">
            <td>Zakat due</td>
            <td className="num">{money(result.total)}</td>
          </tr>
        </tbody>
      </table>

      <p className="report-note">
        This calculation is a guide. Please check with a scholar if you are unsure.
      </p>
    </div>
  );
}