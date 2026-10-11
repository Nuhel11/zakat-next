export default function PersonTabs({ people, names, activeId, onSelect, onAdd }) {
  return (
    <nav className="tabs" id="people">
      {people.map((person, index) => (
        <button
          key={person.id}
          type="button"
          className={person.id === activeId ? "tab active" : "tab"}
          onClick={() => onSelect(person.id)}
        >
          {names[index]}
        </button>
      ))}
      <button type="button" className="tab add" onClick={onAdd}>
        + Add person
      </button>
    </nav>
  );
}