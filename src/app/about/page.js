// The title shown on the browser tab for this page
export const metadata = {
  title: "About and FAQ · Zakat Calculator",
};

// Questions and answers, kept as data so they're easy to add to
const FAQS = [
  {
    q: "Why does each person get their own calculation?",
    a: "Zakat is due on each person's own wealth, so each person is checked against the nisab on their own. Fill in one person, download their PDF, then press 'Start the next person' for the next family member.",
  },
  {
    q: "Where do the gold and silver prices come from?",
    a: "They are fetched automatically each time you open the calculator, and converted to pounds per gram. If they can't be fetched, you'll be asked to type them in.",
  },
  {
    q: "Should the nisab be based on gold or silver?",
    a: "This calculator uses the gold nisab (87.48 g). The silver nisab is much lower, so more people end up paying, and many scholars recommend it because it benefits the poor more. Ask your local scholar which your community follows.",
  },
  {
    q: "Do I pay zakat on jewellery I wear?",
    a: "Scholars differ. The Hanafi school says yes, while the other main schools generally say jewellery worn regularly is exempt. Gold kept as savings counts either way.",
  },
  {
    q: "Which debts can I take off?",
    a: "Debts due now, such as credit cards, bills, tax owed and loan instalments, are generally deducted. Scholars differ on long-term debts like a mortgage: many only allow the part due in the coming year.",
  },
  {
    q: "What about pensions?",
    a: "Views differ, often depending on whether you can access the money now. If you are unsure, ask a scholar or a zakat organisation.",
  },
  {
    q: "Is my information saved anywhere?",
    a: "No. Everything stays in your browser and nothing is sent or stored. Download your PDF before closing the page, because the figures are cleared when you leave.",
  },
  {
    q: "When should I pay?",
    a: "When your zakat year is complete. Many people fix a date, such as the 1st of Ramadan, and work out their wealth on that day each year.",
  },
];

export default function About() {
  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">ABOUT</p>
        <h1>About zakat</h1>
        <p className="intro">
          Zakat is one of the five pillars of Islam. Every adult Muslim whose wealth stays at or
          above the nisab for a full lunar year gives 2.5% of it to people in need.
        </p>
      </section>

      <section className="info-grid">
        <div className="card">
          <h2>How it is worked out</h2>
          <ol className="steps">
            <li>Add up everything you own that counts for zakat.</li>
            <li>Take away debts that are due now.</li>
            <li>Compare what is left with the nisab: the value of 87.48 g of gold.</li>
            <li>If it is at or above the nisab and has been for a full lunar year, zakat is 2.5% of it.</li>
            <li>Crops are separate: 10%, 5% or 7.5% at each harvest, depending on how the land is watered.</li>
          </ol>
        </div>

        <div className="card">
          <h2>What counts</h2>
          <p className="group-label">Include</p>
          <ul className="list yes">
            <li>Cash at home and in the bank</li>
            <li>Gold and silver</li>
            <li>Shares, funds and savings schemes</li>
            <li>Stock you are holding to sell</li>
            <li>Money you are owed and expect back</li>
          </ul>
          <p className="group-label minus">Leave out</p>
          <ul className="list no">
            <li>The home you live in</li>
            <li>Your car, furniture and clothes</li>
            <li>Tools and machinery you use for work</li>
            <li>Property you rent out (but count rent you have saved)</li>
          </ul>
        </div>
      </section>

      <h2 className="section-title">Common questions</h2>
      {FAQS.map((item) => (
        <details className="faq" key={item.q}>
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}

      <p className="back-link">
        <a href="/">← Go to the calculator</a>
      </p>
    </main>
  );
}