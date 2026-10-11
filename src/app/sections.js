// Every section of the calculator.
// rate is a percentage. A row can have its own rate, or minus: true to be taken away.
// metal: gold/silver rows are in grams. separate: worked out on its own (crops).
// liability: the rows are debts, taken away from wealth.
// group: a row that holds its own list (e.g. Bank loans with one line per bank).
export const SECTIONS = [
  {
    id: "gold",
    title: "Gold",
    rate: 2.5,
    metal: "gold",
    help: "Enter the weight in grams. It is valued at today's gold price.",
    rows: [{ label: "Gold jewellery" }, { label: "Gold coins and bars" }],
  },
  {
    id: "silver",
    title: "Silver",
    rate: 2.5,
    metal: "silver",
    help: "Jewellery, utensils and ornaments in grams, valued at today's silver price. Household silver is usually about 90% pure, so use 90% of its weight.",
    rows: [{ label: "Silver jewellery" }, { label: "Silver items" }],
  },
  {
    id: "cash",
    title: "Cash and bank",
    rate: 2.5,
    help: "Type each bank's name on the left and its balance on the right. Add a row for every account.",
    addLabel: "Add bank account",
    rowPlaceholder: "Bank name, e.g. HSBC",
    rows: [{ label: "Cash in hand" }, { label: "" }],
  },
  {
    id: "investments",
    title: "Loans given, investments and shares",
    rate: 2.5,
    help: "Money you have lent and expect back, savings schemes, shares and funds. Use today's value.",
    addLabel: "Add investment",
    rowPlaceholder: "e.g. Moneybox",
    rows: [
      { label: "Money you have lent (expected back)" },
      { label: "Savings bonds (e.g. NS&I)" },
      { label: "Shares and funds" },
    ],
  },
  {
    id: "stones",
    title: "Precious stones",
    collapsed: true,
    rate: 2.5,
    help: "What you could sell them for today. Scholars differ on whether stones count.",
    rows: [{ label: "Diamonds, rubies and other stones" }],
  },
  {
    id: "property",
    title: "Property held to sell or invest",
    collapsed: true,
    rate: 2.5,
    help: "Not your own home or property you rent out. Only property you intend to sell, at today's market value.",
    rows: [{ label: "Market value" }],
  },
  {
    id: "business",
    title: "Business",
    collapsed: true,
    rate: 2.5,
    help: "Stock you hold to sell, valued at cost. Damaged stock at its scrap value.",
    rows: [
      { label: "Stock for sale" },
      { label: "Damaged or dead stock (scrap value)" },
      { label: "Money owed by customers" },
      { label: "Less: owed to suppliers", minus: true },
      { label: "Less: bad debts", minus: true },
    ],
  },
  {
    id: "partnership",
    title: "Share in a partnership",
    collapsed: true,
    rate: 2.5,
    help: "Skip this if the firm pays zakat itself.",
    rows: [
      { label: "Capital balance (last balance sheet)" },
      { label: "Loans you made to the firm" },
      { label: "Less: your withdrawals this year", minus: true },
      { label: "Estimated profit since the balance sheet" },
    ],
  },
  {
    id: "crops",
    title: "Crops and produce",
    collapsed: true,
    rate: 10,
    separate: true,
    help: "Paid at each harvest, not after a year. The rate depends on how the land is watered.",
    rows: [
      { label: "Rain-fed crops", rate: 10 },
      { label: "Irrigated crops", rate: 5 },
      { label: "Partly irrigated crops", rate: 7.5 },
    ],
  },
  {
    id: "animals",
    title: "Animals, poultry and fish farming",
    collapsed: true,
    rate: 2.5,
    help: "Animals or birds over six months old. One in forty, or its value.",
    rows: [{ label: "Value of animals" }],
  },
  {
    id: "liabilities",
    title: "Debts and liabilities",
    rate: 2.5,
    liability: true,
    help: "Debts you owe that are not already taken off above, such as loans, credit cards and tax due. Scholars differ on long-term debts like a mortgage: many only allow what is due in the coming year.",
    addLabel: "Add debt",
    rows: [
      { label: "Loans from friends or family" },
      {
        label: "Credit cards",
        group: true,
        itemPlaceholder: "Card name, e.g. Barclaycard",
        addItemLabel: "Add card",
      },
      {
        label: "Bank loans",
        group: true,
        itemPlaceholder: "Bank name, e.g. HSBC",
        addItemLabel: "Add bank",
      },
      { label: "Tax owed" },
    ],
  },
];

// How much one row is worth.
// A normal row is its own value. A group (like Bank loans) is the total of the banks inside it.
export function rowAmount(row) {
  if (row.group) {
    return row.items.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  }
  return Number(row.value) || 0;
}

// Adds up one section: its total value and its zakat.
// price is the price per gram for gold and silver, and 1 for everything else.
export function sectionTotals(rows, price = 1) {
  let value = 0;
  let zakat = 0;

  rows.forEach((row) => {
    const amount = rowAmount(row) * price * (row.minus ? -1 : 1);
    value += amount;
    zakat += (amount * row.rate) / 100;
  });

  return { value: value, zakat: Math.max(zakat, 0) }; // zakat is never negative
}

// Works out the whole calculation for one person
export function calculateZakat(allRows, prices, nisab, fullYear) {
  let assets = 0;
  let debts = 0;
  let cropZakat = 0;

  SECTIONS.forEach((section) => {
    const price = section.metal ? prices[section.metal] : 1;
    const totals = sectionTotals(allRows[section.id], price);

    if (section.liability) {
      debts += totals.value;        // debts are taken away
    } else if (section.separate) {
      cropZakat += totals.zakat;    // crops have their own rates
    } else {
      assets += totals.value;       // everything else is wealth
    }
  });

  const net = Math.max(assets - debts, 0);          // never below zero
  const aboveNisab = nisab > 0 && net >= nisab;
  const wealthZakat = (aboveNisab && fullYear) ? net * 0.025 : 0;

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