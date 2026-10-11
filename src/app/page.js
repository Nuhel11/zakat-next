"use client";

import { useState } from "react";
import { SECTIONS, calculateZakat } from "./sections";
import Section from "./Section";
import Settings from "./Settings";
import Summary from "./Summary";
import PersonTabs from "./PersonTabs";
import Household from "./Household";
import Report from "./Report";
import { NISAB_GRAMS, formatMoney } from "./money";

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
    }));
  });
  return all;
}

export default function Home() {
  // Everyone in the household. Each person has their own name, rows and "full year" tick.
  const [people, setPeople] = useState(() => [
    { id: 1, name: "", rows: startingRows(), fullYear: true },
  ]);
  const [activeId, setActiveId] = useState(1); // whose tab is open
  const [settings, setSettings] = useState({
    currency: "£",
    goldPrice: "",
    silverPrice: "",
    nisabBasis: "gold",
  });

  // ---------- Changing people ----------

  function updatePerson(id, changes) {
    setPeople(people.map((person) =>
      person.id === id ? { ...person, ...changes } : person
    ));
  }

  function addPerson() {
    const person = { id: Date.now(), name: "", rows: startingRows(), fullYear: true };
    setPeople([...people, person]);
    setActiveId(person.id);
  }

  function removePerson(id) {
    const remaining = people.filter((person) => person.id !== id);
    setPeople(remaining);
    setActiveId(remaining[0].id);
  }

  function selectPerson(id) {
    setActiveId(id);
    document.getElementById("people").scrollIntoView({ behavior: "smooth" });
  }

  // Opens the print window. The file name comes from the page title.
  function downloadPdf() {
    const oldTitle = document.title;
    document.title = "Zakat calculation " + new Date().getFullYear();
    window.print();
    document.title = oldTitle;
  }

  // ---------- Working things out ----------

  const prices = {
    gold: Number(settings.goldPrice) || 0,
    silver: Number(settings.silverPrice) || 0,
  };
  const nisab = NISAB_GRAMS[settings.nisabBasis] * prices[settings.nisabBasis];

  function priceFor(section) {
    return section.metal ? prices[section.metal] : 1;
  }

  const names = people.map((person, index) =>
    person.name.trim() || (index === 0 ? "You" : "Person " + (index + 1))
  );

  const results = people.map((person) =>
    calculateZakat(person.rows, prices, nisab, person.fullYear)
  );
  const householdTotal = results.reduce((sum, result) => sum + result.total, 0);

  const activeIndex = people.findIndex((person) => person.id === activeId);
  const active = people[activeIndex];

  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">ZAKAT · 2.5% OF WEALTH HELD FOR A YEAR</p>
        <h1>Family Zakat Calculator</h1>
        <p className="intro">Work out zakat for yourself or for each person in your household.</p>
      </section>

      <Settings settings={settings} onChange={setSettings} nisab={nisab} />

      <PersonTabs
        people={people}
        names={names}
        activeId={activeId}
        onSelect={setActiveId}
        onAdd={addPerson}
      />

      <section className="card person-head">
        <label className="field">
          <span>Name</span>
          <input
            placeholder={names[activeIndex]}
            value={active.name}
            onChange={(e) => updatePerson(active.id, { name: e.target.value })}
          />
        </label>
        {people.length > 1 && (
          <button type="button" className="remove" onClick={() => removePerson(active.id)}>
            Remove {names[activeIndex]}
          </button>
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
          currency={settings.currency}
        />
      ))}

      <Summary
        title={"Zakat due for " + names[activeIndex]}
        result={results[activeIndex]}
        nisab={nisab}
        currency={settings.currency}
        fullYear={active.fullYear}
        onFullYearChange={(checked) => updatePerson(active.id, { fullYear: checked })}
      />

      <Household
        people={people}
        names={names}
        results={results}
        currency={settings.currency}
        onSelect={selectPerson}
      />

      <div className="download">
        <button type="button" className="button-primary" onClick={downloadPdf}>
          Download PDF
        </button>
        <p className="hint">In the window that opens, choose "Save as PDF" as the printer.</p>
      </div>

      {/* Always visible at the bottom of the screen */}
      <a href="#household" className="total-bar">
        <div className="container total-bar-inner">
          <span>Household zakat · {people.length} {people.length === 1 ? "person" : "people"}</span>
          <strong>{formatMoney(householdTotal, settings.currency)}</strong>
        </div>
      </a>

      {/* Only shows when printing / saving as PDF */}
      <Report
        people={people}
        names={names}
        results={results}
        settings={settings}
        prices={prices}
        nisab={nisab}
      />
    </main>
  );
}