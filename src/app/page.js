"use client";

import { useEffect, useState } from "react";
import { ASSET_TYPES, LIABILITY_TYPES, newEntry, calculateZakat } from "./entries";
import EntryList from "./EntryList";
import PriceStrip from "./PriceStrip";
import Summary from "./Summary";
import DonateCard from "./DonateCard";
import Report from "./Report";
import { NISAB_GRAMS, formatMoney } from "./money";

const CURRENCY = "£";
const NISAB_BASIS = "gold"; // change to "silver" to use the silver nisab

// A fresh, empty form: one empty row in each list
function emptyPerson() {
  return {
    name: "",
    assets: [newEntry()],
    liabilities: [newEntry()],
    fullYear: true,
  };
}

export default function Home() {
  const [person, setPerson] = useState(emptyPerson);
  const [downloaded, setDownloaded] = useState(false); // has this PDF been made?
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

  function downloadPdf() {
    // The PDF file name comes from the page title. The name is added only if one was typed.
    const year = new Date().getFullYear();
    const oldTitle = document.title;
    document.title = name ? "Zakat " + year + " - " + name : "Zakat " + year;
    window.addEventListener("afterprint", () => { document.title = oldTitle; }, { once: true });

    window.print();
    setDownloaded(true);
  }

  // "Start the next person": clear the form for the next family member
  function startNext() {
    const hasFigures = name !== "" || result.assets > 0 || result.debts > 0 || result.cropZakat > 0;
    if (
      hasFigures &&
      !downloaded &&
      !window.confirm(
        (name ? "You haven't downloaded " + name + "'s PDF yet. " : "You haven't downloaded the PDF yet. ") +
        "Start a new form anyway? These figures will be cleared."
      )
    ) {
      return;
    }

    setPerson(emptyPerson());
    setDownloaded(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ---------- Working things out ----------

  const nisab = NISAB_GRAMS[NISAB_BASIS] * prices[NISAB_BASIS];
  const name = person.name.trim(); // "" if no name was typed
  const result = calculateZakat(person, prices, nisab);

  return (
    <main className="container">
      <section className="hero">
        <h1>Zakat Calculator</h1>
        <PriceStrip
          prices={prices}
          nisab={nisab}
          currency={CURRENCY}
          onManualChange={setManualPrice}
        />
      </section>

      <section className="card person-head">
        <label className="field name-field">
          <span>Full name (optional)</span>
          <input
            id="person-name"
            placeholder="Enter your full name"
            value={person.name}
            onChange={(e) => updatePerson({ name: e.target.value })}
          />
        </label>
      </section>

      <EntryList
        kind="assets"
        title="Assets"
        help="What you own. Choose each item from the list, then enter the amount. For a bank account, add the bank's name too. Gold and silver are entered in grams."
        addLabel="Add an asset"
        totalLabel="Total assets"
        types={ASSET_TYPES}
        entries={person.assets}
        onChange={(assets) => updatePerson({ assets: assets })}
        prices={prices}
        currency={CURRENCY}
      />

      <EntryList
        kind="liabilities"
        title="Liabilities"
        help="What you owe that is due now or within the coming year. Choose each debt from the list, then enter the amount. For cards and loans, add who it's with."
        addLabel="Add a liability"
        totalLabel="Total liabilities"
        types={LIABILITY_TYPES}
        entries={person.liabilities}
        onChange={(liabilities) => updatePerson({ liabilities: liabilities })}
        prices={prices}
        currency={CURRENCY}
      />

      <Summary
        title={name ? "Zakat due for " + name : "Zakat due"}
        name={name}
        result={result}
        nisab={nisab}
        currency={CURRENCY}
        fullYear={person.fullYear}
        onFullYearChange={(checked) => updatePerson({ fullYear: checked })}
        onDownload={downloadPdf}
        onAddNext={startNext}
      />

            <DonateCard amount={result.total} currency={CURRENCY} name={name} />

      {/* Always visible at the bottom of the screen */}
      <a href="#result" className="total-bar">
        <div className="container total-bar-inner">
          <span>{name ? "Zakat due for " + name : "Zakat due"}</span>
          <strong>{formatMoney(result.total, CURRENCY)}</strong>
        </div>
      </a>

      {/* Only shows when printing / saving as PDF */}
      <Report
        person={person}
        name={name}
        result={result}
        currency={CURRENCY}
        nisabBasis={NISAB_BASIS}
        prices={prices}
        nisab={nisab}
      />
    </main>
  );
}