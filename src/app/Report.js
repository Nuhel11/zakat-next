import { SECTIONS, rowAmount } from "./sections";
import { formatMoney } from "./money";

export default function Report({ person, name, result, currency, nisabBasis, prices, nisab }) {
  const money = (amount) => formatMoney(amount, currency);
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  // Only the sections where something was filled in
  const filledSections = SECTIONS
    .map((section) => ({
      section: section,
      rows: person.rows[section.id].filter((row) => rowAmount(row) > 0),
    }))
    .filter((item) => item.rows.length > 0);

  return (
    <div className="report">
      <h1>Zakat calculation for {name}</h1>
      <p className="report-meta">
        Worked out on {today} · Gold {money(prices.gold)}/g · Silver {money(prices.silver)}/g ·
        Nisab {money(nisab)} (based on {nisabBasis})
      </p>

      <div className="report-total">
        <span>Zakat due</span>
        <strong>{money(result.total)}</strong>
      </div>

      {filledSections.length === 0 ? (
        <p>Nothing entered.</p>
      ) : (
        <table>
          <tbody>
            {filledSections.map(({ section, rows }) => {
              const price = section.metal ? prices[section.metal] : 1;
              const sign = section.liability ? "− " : "";

              return [
                <tr className="report-section" key={section.id}>
                  <th colSpan={2}>{section.title}</th>
                </tr>,

                ...rows.flatMap((row) =>
                  row.group
                    ? // A group: one line per bank, e.g. "Bank loans: HSBC"
                      row.items
                        .filter((item) => Number(item.value) > 0)
                        .map((item) => (
                          <tr key={item.id}>
                            <td>{row.label}: {item.label || "Unnamed"}</td>
                            <td className="num">{sign}{money(Number(item.value))}</td>
                          </tr>
                        ))
                    : // A normal row
                      [
                        <tr key={row.id}>
                          <td>
                            {row.label || "Unnamed"}
                            {section.metal ? ` (${row.value} g)` : ""}
                            {row.rate !== 2.5 ? ` at ${row.rate}%` : ""}
                          </td>
                          <td className="num">
                            {row.minus ? "− " : sign}
                            {money(Number(row.value) * price)}
                          </td>
                        </tr>,
                      ]
                ),
              ];
            })}
          </tbody>
        </table>
      )}

      <table className="report-summary">
        <tbody>
          <tr><td>Total wealth</td><td className="num">{money(result.assets)}</td></tr>
          <tr><td>Less debts</td><td className="num">− {money(result.debts)}</td></tr>
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