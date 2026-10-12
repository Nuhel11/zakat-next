"use client";

import { useEffect, useState } from "react";
import { SECTIONS, calculateZakat } from "./sections";
import Section from "./Section";
import PriceStrip from "./PriceStrip";
import Summary from "./Summary";
import Report from "./Report";
import { NISAB_GRAMS, formatMoney } from "./money";

const CURRENCY = "£";
const NISAB_BASIS = "gold"; // change to "silver" to use the silver nisab

// Builds the starting rows for every section from the list
function startingRows() {
  const all = {};
  SECTIONS.forEach((section) => {
    all[section.id] = section.rows.map((row, index) => ({
      id: section.id + "-" + index,
      label: row.label,
      value: "",
      minus: row.minus || false,
      rate: row.rate ?? section.rate,
      // Groups (like Bank loans) hold a list of banks, starting with one empty line
      group: row.group || false,
      itemPlaceholder: row.itemPlaceholder,
      addItemLabel: row.addItemLabel,
      items: row.group
        ? [{ id: section.id + "-" + index + "-0", label: "", value: "" }]
        : [],
    }));
  });
  return all;
}

// A fresh, empty form
function emptyPerson() {
  return { name: "", rows: startingRows(), fullYear: true };
}

export default function Home() {
  const [person, setPerson] = useState(emptyPerson);
  const [formNumber, setFormNumber] = useState(1); // goes up for each new person
  const [downloaded, setDownloaded] = useState(false); // has this person's PDF been made?
  const [nameError, setNameError] = useState(false);
  const [prices, setPrices] = useState({
    gold: 0,
    silver: 0,
    status: "loading", // "loading", then "ready" or "failed"
    updatedAt: null,
  });

  // ---------- Today's prices ----------

  useEffect(() => {
    fetch("/api/prices")
      .then((response) => {
        if (!response.ok) throw new Error("No prices");
        return response.json();
      })
      .then((data) => {
        setPrices({
          gold: data.gold,
          silver: data.silver,
          status: "ready",
          updatedAt: data.updatedAt,
        });
      })
      .catch(() => {
        setPrices((old) => ({ ...old, status: "failed" }));
      });
  }, []);

  function setManualPrice(metal, value) {
    setPrices({ ...prices, [metal]: Number(value) || 0 });
  }

  // ---------- Changing the form ----------

  function updatePerson(changes) {
    setPerson({ ...person, ...changes });
    setDownloaded(false); // something changed since the last PDF
  }

  // Makes sure a name has been entered. If not, takes them to the name box.
  function hasName() {
    if (person.name.trim()) return true;

    setNameError(true);
    const box = document.getElementById("person-name");
    box.scrollIntoView({ behavior: "smooth", block: "center" });
    box.focus({ preventScroll: true });
    return false;
  }

  function downloadPdf() {
    if (!hasName()) return;

    // The PDF file name comes from the page title
    const oldTitle = document.title;
    document.title = "Zakat " + new Date().getFullYear() + " - " + person.name.trim();
    window.addEventListener("afterprint", () => { document.title = oldTitle; }, { once: true });

    window.print();
    setDownloaded(true);
  }

  // "Start the next person": clear the form for the next family member
  function startNext() {
    const hasName = person.name.trim() !== "";
    if (
      hasName &&
      !downloaded &&
      !window.confirm(
        "You haven't downloaded " + person.name.trim() + "'s PDF yet. " +
        "Start a new form anyway? Their figures will be cleared."
      )
    ) {
      return;
    }

    setPerson(emptyPerson());
    setFormNumber(formNumber + 1); // also closes the sections back to how they started
    setDownloaded(false);
    setNameError(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- Working things out ----------

  const nisab = NISAB_GRAMS[NISAB_BASIS] * prices[NISAB_BASIS];

  function priceFor(section) {
    return section.metal ? prices[section.metal] : 1;
  }

  const displayName = person.name.trim() || "this person";
  const result = calculateZakat(person.rows, prices, nisab, person.fullYear);
  const showNameError = nameError && !person.name.trim();

  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">ZAKAT · 2.5% OF WEALTH HELD FOR A YEAR</p>
        <h1>Zakat Calculator</h1>
        <p className="intro">
          Enter your full name and what you own. Download your PDF, then start the
          next person, for example your wife or mother.
        </p>
        <PriceStrip
          prices={prices}
          nisab={nisab}
          currency={CURRENCY}
          onManualChange={setManualPrice}
        />
      </section>

      <section className="card person-head">
        <label className="field name-field">
          <span>Full name</span>
          <input
            id="person-name"
            placeholder="Enter your full name"
            className={showNameError ? "invalid" : ""}
            value={person.name}
            onChange={(e) => {
              updatePerson({ name: e.target.value });
              setNameError(false);
            }}
          />
        </label>
        {showNameError && (
          <p className="warning name-warning">
            Please enter a full name before downloading the PDF.
          </p>
        )}
      </section>

      {SECTIONS.map((section) => (
        <Section
          key={formNumber + "-" + section.id}
          section={section}
          rows={person.rows[section.id]}
          onChange={(newRows) =>
            updatePerson({ rows: { ...person.rows, [section.id]: newRows } })
          }
          price={priceFor(section)}
          currency={CURRENCY}
        />
      ))}

      <Summary
        title={"Zakat due for " + displayName}
        name={displayName}
        result={result}
        nisab={nisab}
        currency={CURRENCY}
        fullYear={person.fullYear}
        onFullYearChange={(checked) => updatePerson({ fullYear: checked })}
        onDownload={downloadPdf}
        onAddNext={startNext}
      />

      {/* Always visible at the bottom of the screen */}
      <a href="#result" className="total-bar">
        <div className="container total-bar-inner">
          <span>Zakat due for {displayName}</span>
          <strong>{formatMoney(result.total, CURRENCY)}</strong>
        </div>
      </a>

      {/* Only shows when printing / saving as PDF */}
      <Report
        person={person}
        name={displayName}
        result={result}
        currency={CURRENCY}
        nisabBasis={NISAB_BASIS}
        prices={prices}
        nisab={nisab}
      />
    </main>
  );
}