// ---------- Settings ----------

// Grams of gold or silver that make up the nisab
const NISAB_GRAMS = { gold: 87.48, silver: 612.36 };
const ZAKAT_RATE = 0.025; // 2.5%

// Find the settings boxes using their id
const currencyBox = document.getElementById("currency");
const goldPriceBox = document.getElementById("goldPrice");
const silverPriceBox = document.getElementById("silverPrice");
const nisabBasisBox = document.getElementById("nisabBasis");
const nisabAmountText = document.getElementById("nisabAmount");

// Find the family members area and the add button
const membersList = document.getElementById("members");
const addMemberButton = document.getElementById("addMember");

// Find the household total panel
const householdTotalText = document.getElementById("householdTotal");
const householdCountText = document.getElementById("householdCount");
const breakdownList = document.getElementById("breakdown");


// ---------- Helpers ----------

// Reads a box as a number (empty counts as 0)
function readNumber(box) {
  return Number(box.value) || 0;
}

// Turns a number into money, e.g. 8771.6 becomes "£8,771.60"
function formatMoney(amount) {
  return currencyBox.value + amount.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Gets a person's name: what they typed, or "You" / "Family member 2"
function getName(card) {
  const nameBox = card.querySelector(".member-name");
  return nameBox.value.trim() || nameBox.placeholder;
}


// ---------- Calculations ----------

// Works out the nisab in money
function calculateNisab() {
  if (nisabBasisBox.value === "gold") {
    return NISAB_GRAMS.gold * readNumber(goldPriceBox);
  }
  return NISAB_GRAMS.silver * readNumber(silverPriceBox);
}

// Works out one person's net wealth and zakat from their card
function calculateMember(card, nisab) {
  let assets = 0;

  // Add up every box with the class "money"
  card.querySelectorAll(".money").forEach(function (box) {
    assets += readNumber(box);
  });

  // Gold and silver are in grams, so multiply by the price
  assets += readNumber(card.querySelector(".gold-grams")) * readNumber(goldPriceBox);
  assets += readNumber(card.querySelector(".silver-grams")) * readNumber(silverPriceBox);

  const debts = readNumber(card.querySelector(".debts"));
  const net = Math.max(assets - debts, 0); // never below zero

  const aboveNisab = nisab > 0 && net >= nisab;
  const fullYear = card.querySelector(".full-year").checked;
  const zakat = (aboveNisab && fullYear) ? net * ZAKAT_RATE : 0;

  return { net: net, aboveNisab: aboveNisab, zakat: zakat };
}


// ---------- Updating the page ----------

// Updates the whole page with the latest numbers
function update() {
  const nisab = calculateNisab();
  nisabAmountText.textContent = formatMoney(nisab);

  const cards = document.querySelectorAll(".member");
  let householdTotal = 0;
  let peopleWhoOwe = 0;

  // Empty the list, then rebuild it below
  breakdownList.innerHTML = "";

  // Go through every person's card on the page
  cards.forEach(function (card) {
    const result = calculateMember(card, nisab);

    // Update this person's card
    const badge = card.querySelector(".badge");
    badge.textContent = result.aboveNisab ? "Above nisab" : "Below nisab";
    badge.classList.toggle("above", result.aboveNisab);

    card.querySelector(".net").textContent = "Net " + formatMoney(result.net);
    card.querySelector(".zakat").textContent = "Zakat " + formatMoney(result.zakat);

    // Add this person to the household total
    householdTotal += result.zakat;
    if (result.zakat > 0) {
      peopleWhoOwe++;
    }

    // Add a line for this person to the list.
    // We build the empty layout first, then fill in the text with
    // textContent, so a name with symbols like < or > can't break the page.
    const row = document.createElement("li");
    row.innerHTML = `
      <span><span class="person"></span><small></small></span>
      <strong></strong>
    `;
    row.querySelector(".person").textContent = getName(card);
    row.querySelector("small").textContent = "Net wealth " + formatMoney(result.net);
    row.querySelector("strong").textContent = formatMoney(result.zakat);
    breakdownList.appendChild(row);
  });

  // Show the household results
  householdTotalText.textContent = formatMoney(householdTotal);
  householdCountText.textContent = "People who owe zakat: " + peopleWhoOwe + " of " + cards.length;
}


// ---------- Family members ----------

// Sets the grey "default" names: "You", "Family member 2", "Family member 3"...
function renumberMembers() {
  membersList.querySelectorAll(".member").forEach(function (card, index) {
    const nameBox = card.querySelector(".member-name");
    nameBox.placeholder = (index === 0) ? "You" : "Family member " + (index + 1);
  });
}

// "Add family member": copy the first card and empty it
addMemberButton.addEventListener("click", function () {
  const firstCard = membersList.querySelector(".member");
  const newCard = firstCard.cloneNode(true);

  // Empty the number boxes and the name box
  newCard.querySelectorAll("input[type=number], .member-name").forEach(function (box) {
    box.value = "";
  });
  newCard.querySelector(".full-year").checked = true;

  membersList.appendChild(newCard);
  renumberMembers();
  update();
  newCard.scrollIntoView({ behavior: "smooth", block: "start" });
  newCard.querySelector(".member-name").focus(); // ready to type a name
});

// "Remove": one listener on the container handles every card's button,
// including cards that are added later
membersList.addEventListener("click", function (event) {
  if (event.target.classList.contains("remove")) {
    event.target.closest(".member").remove();
    renumberMembers();
    update();
  }
});


// ---------- Start ----------

// Run update() whenever anything is typed, ticked or changed
document.addEventListener("input", update);
document.addEventListener("change", update);
renumberMembers();
update();