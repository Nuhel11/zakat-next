import { formatMoney } from "./money";

export default function Household({ people, names, results, currency, onSelect, onDownload }) {
  const total = results.reduce((sum, result) => sum + result.total, 0);
  const peopleWhoOwe = results.filter((result) => result.total > 0).length;

  return (
    <section className="card summary household" id="household">
      <p className="group-label">Household zakat due</p>
      <p className="total">{formatMoney(total, currency)}</p>
      <p className="hint">People who owe zakat: {peopleWhoOwe} of {results.length}</p>

      <ul className="breakdown">
        {results.map((result, index) => {
          const person = people[index];
          return (
            <li key={person.id}>
              <button type="button" className="link-button" onClick={() => onSelect(person.id)}>
                {names[index]}
                <small>
                  
                  Net wealth {formatMoney(result.net, currency)}
                </small>
              </button>
              <span className="row-actions">
                <strong>{formatMoney(result.total, currency)}</strong>
                <button
                  type="button"
                  className="small-button"
                  aria-label={"Download PDF for " + names[index]}
                  onClick={() => onDownload(person.id)}
                >
                  PDF
                </button>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="actions">
        <button type="button" className="button-primary" onClick={() => onDownload(null)}>
          Download everyone's PDF
        </button>
      </div>
    </section>
  );
}