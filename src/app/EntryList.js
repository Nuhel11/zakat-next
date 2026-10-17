import { formatMoney } from "./money";
import { findType, entryValue, newEntry, newItem } from "./entries";

// One card: "Assets" or "Liabilities".
// Each row: choose the type from the dropdown, then enter the amount.
// Bank accounts, credit cards and loans hold a list instead: one line per bank.
export default function EntryList({
  kind, title, help, addLabel, totalLabel, types, entries, onChange, prices, currency,
}) {
  // ---------- Rows ----------

  // Change some things in one row, keep the rest the same
  function updateEntry(id, changes) {
    onChange(entries.map((entry) =>
      entry.id === id ? { ...entry, ...changes } : entry
    ));
  }

  // A new type was chosen. Banks, cards and loans start with one empty bank line.
  function changeType(entry, newTypeId) {
    const newType = findType(types, newTypeId);
    const isNamed = newType && newType.named;
    updateEntry(entry.id, {
      type: newTypeId,
      items: isNamed ? (entry.items.length > 0 ? entry.items : [newItem()]) : [],
    });
  }

  function addEntry() {
    onChange([...entries, newEntry()]);
  }

  // Remove a row, but always keep at least one empty row to fill in
  function removeEntry(id) {
    const remaining = entries.filter((entry) => entry.id !== id);
    onChange(remaining.length > 0 ? remaining : [newEntry()]);
  }

  // ---------- Bank lines inside a row ----------

  function updateItem(entry, itemId, changes) {
    updateEntry(entry.id, {
      items: entry.items.map((item) =>
        item.id === itemId ? { ...item, ...changes } : item
      ),
    });
  }

  function addItem(entry) {
    updateEntry(entry.id, { items: [...entry.items, newItem()] });
  }

  // Remove a bank line, but always keep one to fill in
  function removeItem(entry, itemId) {
    const remaining = entry.items.filter((item) => item.id !== itemId);
    updateEntry(entry.id, { items: remaining.length > 0 ? remaining : [newItem()] });
  }

  const total = entries.reduce((sum, entry) => sum + entryValue(entry, types, prices), 0);

  // The dropdown, the same for every row
  function typeDropdown(entry) {
    return (
      <select
        className="entry-type"
        aria-label="Type"
        value={entry.type}
        onChange={(e) => changeType(entry, e.target.value)}
      >
        <option value="">Choose…</option>
        {types.map((option) => (
          <option key={option.id} value={option.id}>{option.label}</option>
        ))}
      </select>
    );
  }

  function removeButton(onClick, label) {
    return (
      <button type="button" className="remove" aria-label={label} onClick={onClick}>
        ✕
      </button>
    );
  }

  return (
    <section className={"card entry-card " + kind}>
      <h2>{title}</h2>
      <p className="hint section-help">{help}</p>

      {entries.map((entry) => {
        const type = findType(types, entry.type);

        // ---------- Banks, cards and loans: a list of names and amounts ----------
        if (type && type.named) {
          return (
            <div className="entry-group" key={entry.id}>
              <div className="entry">
                {typeDropdown(entry)}
                <span className="entry-group-total">
                  {formatMoney(entryValue(entry, types, prices), currency)}
                </span>
                {removeButton(() => removeEntry(entry.id), "Remove " + type.label)}
              </div>

              {entry.items.map((item) => (
                <div className="entry sub-entry" key={item.id}>
                  <input
                    className="entry-name"
                    aria-label="Name"
                    placeholder={type.namePlaceholder}
                    value={item.name}
                    autoFocus={entry.items.length > 1 && item.name === "" && item.value === ""}
                    onChange={(e) => updateItem(entry, item.id, { name: e.target.value })}
                  />
                  <input
                    className="entry-value"
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    aria-label="Amount"
                    placeholder="Amount"
                    value={item.value}
                    onChange={(e) => updateItem(entry, item.id, { value: e.target.value })}
                  />
                  {removeButton(() => removeItem(entry, item.id), "Remove this line")}
                </div>
              ))}

              <button type="button" className="add-row add-sub" onClick={() => addItem(entry)}>
                + {type.addItemLabel}
              </button>
            </div>
          );
        }

        // ---------- Every other row: Type | Amount | ✕ ----------
        const isMetal = type && type.metal;
        const price = isMetal ? prices[type.metal] : 0;
        const amount = Number(entry.value) || 0;

        return (
          <div className="entry" key={entry.id}>
            {typeDropdown(entry)}

            <input
              className="entry-value"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              aria-label={isMetal ? "Grams" : "Amount"}
              placeholder={!type ? "Choose a type" : isMetal ? "grams" : "Amount"}
              disabled={!type}
              value={entry.value}
              onChange={(e) => updateEntry(entry.id, { value: e.target.value })}
            />

            {removeButton(() => removeEntry(entry.id), "Remove row")}

            {/* Gold and silver: show what the grams are worth */}
            {isMetal && amount > 0 && (
              <p className={price > 0 ? "entry-note" : "entry-note warning"}>
                {price > 0
                  ? amount + " g × " + formatMoney(price, currency) + " per gram = " +
                    formatMoney(amount * price, currency)
                  : "There's no " + type.metal + " price yet, so this isn't counted."}
              </p>
            )}

            {/* Crops: show the zakat at their own rate */}
            {type && type.rate && amount > 0 && (
              <p className="entry-note">
                Zakat at {type.rate}%: {formatMoney((amount * type.rate) / 100, currency)}, paid at harvest
              </p>
            )}
          </div>
        );
      })}

      <button type="button" className="add-row" onClick={addEntry}>
        + {addLabel}
      </button>

      <div className="section-total">
        <span>{totalLabel}</span>
        <strong>{formatMoney(total, currency)}</strong>
      </div>
    </section>
  );
}