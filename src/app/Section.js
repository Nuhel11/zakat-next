import { useState } from "react";
import { formatMoney } from "./money";
import { sectionTotals } from "./sections";

export default function Section({ section, rows, onChange, price, currency }) {
  // Whether this section is open. Rare sections start closed.
  const [open, setOpen] = useState(!section.collapsed);

  function updateRow(id, field, newValue) {
    onChange(rows.map((row) =>
      row.id === id ? { ...row, [field]: newValue } : row
    ));
  }

  function addRow() {
    onChange([
      ...rows,
      {
        id: section.id + "-" + Date.now(),
        label: "",
        value: "",
        minus: false,
        rate: section.rate,
        isNew: true, // so the cursor goes straight into its name box
      },
    ]);
  }

  function removeRow(id) {
    onChange(rows.filter((row) => row.id !== id));
  }

  // Scroll up to the price box in the settings and put the cursor in it
  function goToPrice() {
    const box = document.getElementById(section.metal + "Price");
    if (!box) return;
    box.scrollIntoView({ behavior: "smooth", block: "center" });
    box.focus({ preventScroll: true });
  }

  const totals = sectionTotals(rows, price);

  // What the line at the bottom of the card says
  let footerLabel = "Total value";
  let footerAmount = totals.value;
  if (section.liability) {
    footerLabel = "Total debts";
  } else if (section.separate) {
    footerLabel = "Zakat on produce";
    footerAmount = totals.zakat;
  }

  // Grams have been entered, but there's no price to value them with
  const missingPrice =
    section.metal && price === 0 && rows.some((row) => Number(row.value) > 0);

  return (
    <section className={section.liability ? "card liability" : "card"}>
      <h2 className="section-head">
        <button
          type="button"
          className="section-toggle"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span>{section.title}</span>
          {!open && footerAmount !== 0 && (
            <span className="section-peek">{formatMoney(footerAmount, currency)}</span>
          )}
          <span className="chevron" aria-hidden="true">{open ? "−" : "+"}</span>
        </button>
      </h2>

      {open && (
        <>
          <p className="hint section-help">{section.help}</p>

          {missingPrice && (
            <p className="warning">
              There's no {section.metal} price yet, so this isn't counted.{" "}
              <button type="button" className="warning-link" onClick={goToPrice}>
                Enter the {section.metal} price
              </button>
            </p>
          )}

          {rows.map((row) => (
            <div className={row.minus ? "row minus" : "row"} key={row.id}>
              <input
                className="row-label"
                placeholder={section.rowPlaceholder || "Name this row"}
                aria-label="Name"
                value={row.label}
                autoFocus={row.isNew}
                onChange={(e) => updateRow(row.id, "label", e.target.value)}
              />
              <input
                className="row-value"
                type="number"
                min="0"
                step="any"
                placeholder={section.metal ? "grams" : "Amount"}
                aria-label={section.metal ? "Grams" : "Amount"}
                value={row.value}
                onChange={(e) => updateRow(row.id, "value", e.target.value)}
              />
              {section.metal && (
                <span className="row-worth">
                  {formatMoney((Number(row.value) || 0) * price, currency)}
                </span>
              )}
              {row.rate !== 2.5 && <span className="rate-tag">{row.rate}%</span>}
              <button
                type="button"
                className="remove"
                aria-label="Remove row"
                onClick={() => removeRow(row.id)}
              >
                ✕
              </button>
            </div>
          ))}

          <button type="button" className="add-row" onClick={addRow}>
            + {section.addLabel || "Add row"}
          </button>

          <div className="section-total">
            <span>{footerLabel}</span>
            <strong>{formatMoney(footerAmount, currency)}</strong>
          </div>
        </>
      )}
    </section>
  );
}