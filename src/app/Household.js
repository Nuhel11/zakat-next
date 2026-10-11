import { formatMoney } from "./money";

export default function Household({ people, names, results, currency, onSelect }) {
  // Add up everyone's zakat, and count who owes any
  const total = results.reduce((sum, result) => sum + result.total, 0);
  const peopleWhoOwe = results.filter((result) => result.total > 0).length;

  return (
    <section className="card summary household" id="household">
      <p className="group-label">Household zakat due</p>
      <p className="total">{formatMoney(total, currency)}</p>
      <p className="hint">People who owe zakat: {peopleWhoOwe} of {results.length}</p>

      <ul className="breakdown">
        {results.map((result, index) => (
          <li key={people[index].id}>
            <button
              type="button"
              className="link-button"
              onClick={() => onSelect(people[index].id)}
            >
              {names[index]}
              <small>Net wealth {formatMoney(result.net, currency)}</small>
            </button>
            <strong>{formatMoney(result.total, currency)}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}