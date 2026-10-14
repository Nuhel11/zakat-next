import { formatMoney } from "./money";

// The charity's details. Change these if they change.
const CHARITY = {
  name: "MN Foundation",
  number: "1215654",
  url: "https://mnfoundation.co.uk/",
};

export default function DonateCard({ amount, currency }) {
  const heading = amount > 0
    ? "Give your " + formatMoney(amount, currency) + " to " + CHARITY.name
    : "Support " + CHARITY.name;

  return (
    <section className="card donate">
      <p className="group-label">Give your zakat</p>
      <h2>{heading}</h2>
      <p className="hint">
        Registered charity no. {CHARITY.number}. If you would like to, you can give your
        zakat through their website. It opens in a new tab, so your figures here stay as they are.
      </p>
      <a
        className="button-primary donate-button"
        href={CHARITY.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Donate to {CHARITY.name} ↗
      </a>
    </section>
  );
}