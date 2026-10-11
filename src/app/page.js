"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { SECTIONS, calculateZakat } from "./sections";
import Section from "./Section";
import PriceStrip from "./PriceStrip";
import Summary from "./Summary";
import PersonTabs from "./PersonTabs";
import Household from "./Household";
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

// A new, empty person
function newPerson(id) {
  return { id: id, name: "", rows: startingRows(), fullYear: true };
}

export default function Home() {
  const [people, setPeople] = useState(() => [newPerson(1)]);
  const [activeId, setActiveId] = useState(1); // whose tab is open
  const [printId, setPrintId] = useState(null); // whose PDF to make (null = everyone)
  const [nameError, setNameError] = useState(false);
  const [prices, setPrices] = useState({
    gold: 0,
    silver: 0,
    status: "loading", // "loading", then "ready" or "failed"
    updatedAt: null,
  });

  // ---------- Today's prices ----------

  // Runs once, when the page first opens
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

  // Only used if the prices couldn't be fetched and are typed in instead
  function setManualPrice(metal, value) {
    setPrices({ ...prices, [metal]: Number(value) || 0 });
  }

  // ---------- Changing people ----------

  function updatePerson(id, changes) {
    setPeople(people.map((person) =>
      person.id === id ? { ...person, ...changes } : person
    ));
  }

  // Makes sure a person has a name. If not, takes them to the name box.
  function hasName(person) {
    if (person.name.trim()) return true;

    setActiveId(person.id);
    setNameError(true);
    const box = document.getElementById("person-name");
    box.scrollIntoView({ behavior: "smooth", block: "center" });
    box.focus({ preventScroll: true });
    return false;
  }

  // "Done – add the next person"
  function addPerson() {
    if (!hasName(active)) return;

    const person = newPerson(Date.now());
    setPeople([...people, person]);
    setActiveId(person.id);
    setNameError(false);
    document.getElementById("people").scrollIntoView({ behavior: "smooth" });
  }

  function removePerson(id) {
    const remaining = people.filter((person) => person.id !== id);
    setPeople(remaining);
    setActiveId(remaining[0].id);
    setNameError(false);
  }

  function selectPerson(id) {
    setActiveId(id);
    setNameError(false);
    document.getElementById("people").scrollIntoView({ behavior: "smooth" });
  }

  // ---------- PDF ----------

  // personId = one person's PDF, null = everyone
  function downloadPdf(personId) {
    // Everyone in the PDF needs a name first
    const toCheck = personId === null
      ? people
      : people.filter((person) => person.id === personId);
    const unnamed = toCheck.find((person) => !person.name.trim());
    if (unnamed && !hasName(unnamed)) return;

    // Redraw the hidden report for this person right now, before the print window opens
    flushSync(() => setPrintId(personId));

    // The PDF file name comes from the page title
    const year = new Date().getFullYear();
    const index = people.findIndex((person) => person.id === personId);
    const oldTitle = document.title;
    document.title = personId === null
      ? "Zakat " + year + " - household"
      : "Zakat " + year + " - " + names[index];

    window.addEventListener("afterprint", () => { document.title = oldTitle; }, { once: true });
    window.print();
  }

  // ---------- Working things out ----------

  const nisab = NISAB_GRAMS[NISAB_BASIS] * prices[NISAB_BASIS];

  function priceFor(section) {
    return section.metal ? prices[section.metal] : 1;
  }

  // The name they typed, or "Person 1", "Person 2"... until they do
  const names = people.map((person, index) =>
    person.name.trim() || "Person " + (index + 1)
  );

  const results = people.map((person) =>
    calculateZakat(person.rows, prices, nisab, person.fullYear)
  );
  const householdTotal = results.reduce((sum, result) => sum + result.total, 0);

  const activeIndex = people.findIndex((person) => person.id === activeId);
  const active = people[activeIndex];
  const showNameError = nameError && !active.name.trim();

  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">ZAKAT · 2.5% OF WEALTH HELD FOR A YEAR</p>
        <h1>Family Zakat Calculator</h1>
        <p className="intro">
          Enter your own details first, then add each family member one at a time.
          Everyone gets their own result and their own PDF.
        </p>
        <PriceStrip
          prices={prices}
          nisab={nisab}
          currency={CURRENCY}
          onManualChange={setManualPrice}
        />
      </section>

      <PersonTabs
        people={people}
        names={names}
        activeId={activeId}
        onSelect={selectPerson}
        onAdd={addPerson}
      />

      <section className="card person-head">
        <label className="field name-field">
          <span>Full name</span>
          <input
            id="person-name"
            placeholder="Enter name"
            className={showNameError ? "invalid" : ""}
            value={active.name}
            onChange={(e) => {
              updatePerson(active.id, { name: e.target.value });
              setNameError(false);
            }}
          />
        </label>
        {people.length > 1 && (
          <button type="button" className="remove" onClick={() => removePerson(active.id)}>
            Remove {names[activeIndex]}
          </button>
        )}
        {showNameError && (
          <p className="warning name-warning">
            Please enter a name before downloading the PDF or adding the next person.
          </p>
        )}
      </section>

      {SECTIONS.map((section) => (
        <Section
          key={section.id}
          section={section}
          rows={active.rows[section.id]}
          onChange={(newRows) =>
            updatePerson(active.id, { rows: { ...active.rows, [section.id]: newRows } })
          }
          price={priceFor(section)}
          currency={CURRENCY}
        />
      ))}

      <Summary
        title={"Zakat due for " + names[activeIndex]}
        name={names[activeIndex]}
        result={results[activeIndex]}
        nisab={nisab}
        currency={CURRENCY}
        fullYear={active.fullYear}
        onFullYearChange={(checked) => updatePerson(active.id, { fullYear: checked })}
        onDownload={() => downloadPdf(active.id)}
        onAddNext={addPerson}
      />

      <Household
        people={people}
        names={names}
        results={results}
        currency={CURRENCY}
        onSelect={selectPerson}
        onDownload={downloadPdf}
      />

      {/* Always visible at the bottom of the screen */}
      <a href="#household" className="total-bar">
        <div className="container total-bar-inner">
          <span>Household zakat · {people.length} {people.length === 1 ? "person" : "people"}</span>
          <strong>{formatMoney(householdTotal, CURRENCY)}</strong>
        </div>
      </a>

      {/* Only shows when printing / saving as PDF */}
      <Report
        people={people}
        names={names}
        results={results}
        currency={CURRENCY}
        nisabBasis={NISAB_BASIS}
        prices={prices}
        nisab={nisab}
        printId={printId}
      />
    </main>
  );
}