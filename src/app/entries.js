// Everything a person can choose from the two dropdowns, and the zakat maths.
//
// Each type can have:
//   metal:  "gold" or "silver" — the amount is in grams and is valued at today's price
//   rate:   a different zakat rate in % (crops), worked out separately
//   named:  holds a list of names + amounts, e.g. one line per bank
//           (namePlaceholder = the example in the name box, addItemLabel = the "+ Add" button)

export const ASSET_TYPES = [
  { id: "gold", label: "Gold", metal: "gold" },
  { id: "silver", label: "Silver", metal: "silver" },
  { id: "cash", label: "Cash in hand" },
  { id: "bank", label: "Bank account", named: true, namePlaceholder: "Bank name, e.g. HSBC", addItemLabel: "Add another bank" },
  { id: "lent", label: "Money lent to others (expected back)" },
  { id: "savings", label: "Savings bonds (e.g. NS&I)" },
  { id: "shares", label: "Shares, funds and investments" },
  { id: "stones", label: "Precious stones" },
  { id: "property", label: "Property held to sell or invest" },
  { id: "stock", label: "Business stock for sale" },
  { id: "customers", label: "Money owed by customers" },
  { id: "partnership", label: "Share in a partnership" },
  { id: "animals", label: "Animals, poultry and fish farming" },
  { id: "cropsRain", label: "Crops – rain-fed (10%)", rate: 10 },
  { id: "cropsIrrigated", label: "Crops – irrigated (5%)", rate: 5 },
  { id: "cropsMixed", label: "Crops – partly irrigated (7.5%)", rate: 7.5 },
  { id: "otherAsset", label: "Other zakatable wealth" },
];

export const LIABILITY_TYPES = [
  { id: "creditCard", label: "Credit card", named: true, namePlaceholder: "Card, e.g. Barclaycard", addItemLabel: "Add another card" },
  { id: "bankLoan", label: "Bank loan", named: true, namePlaceholder: "Bank name, e.g. HSBC", addItemLabel: "Add another bank loan" },
  { id: "familyLoan", label: "Loan from family or friends", named: true, namePlaceholder: "Who you owe", addItemLabel: "Add another person" },
  { id: "tax", label: "Tax owed" },
  { id: "bills", label: "Bills due now" },
  { id: "mortgage", label: "Mortgage (amount due this year)" },
  { id: "suppliers", label: "Money owed to suppliers" },
  { id: "otherDebt", label: "Other debt" },
];

// A unique id for each row and each bank line
function makeId() {
  return Date.now() + "-" + Math.random().toString(36).slice(2);
}

// A new, empty row: no type chosen yet
export function newEntry() {
  return { id: makeId(), type: "", value: "", items: [] };
}

// A new, empty line inside a named row, e.g. one bank
export function newItem() {
  return { id: makeId(), name: "", value: "" };
}

// Find a type by its id, e.g. "gold" → { id: "gold", label: "Gold", ... }
export function findType(types, id) {
  return types.find((type) => type.id === id);
}

// What one row is worth in money.
// Gold and silver: grams × today's price. Banks, cards and loans: all their lines added up.
export function entryValue(entry, types, prices) {
  const type = findType(types, entry.type);
  if (!type) return 0; // no type chosen yet

  if (type.named) {
    return entry.items.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  }

  const amount = Number(entry.value) || 0;
  return type.metal ? amount * prices[type.metal] : amount;
}

// Works out the whole calculation for one person
export function calculateZakat(person, prices, nisab) {
  let assets = 0;
  let debts = 0;
  let cropZakat = 0;

  person.assets.forEach((entry) => {
    const type = findType(ASSET_TYPES, entry.type);
    if (!type) return;
    const value = entryValue(entry, ASSET_TYPES, prices);

    if (type.rate) {
      cropZakat += (value * type.rate) / 100; // crops: own rate, paid at harvest
    } else {
      assets += value;                       // everything else is wealth
    }
  });

  person.liabilities.forEach((entry) => {
    debts += entryValue(entry, LIABILITY_TYPES, prices);
  });

  const net = Math.max(assets - debts, 0);          // never below zero
  const aboveNisab = nisab > 0 && net >= nisab;
  const wealthZakat = (aboveNisab && person.fullYear) ? net * 0.025 : 0;

  return {
    assets: assets,
    debts: debts,
    net: net,
    aboveNisab: aboveNisab,
    wealthZakat: wealthZakat,
    cropZakat: cropZakat,
    total: wealthZakat + cropZakat,
  };
}