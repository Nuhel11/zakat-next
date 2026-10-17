// The charity's details, used by the donate card, the share page and the share image.
// Change them here and every part of the site updates.
export const CHARITY = {
  name: "MN Foundation",
  number: "1215654",
  url: "https://mnfoundation.co.uk/",
  website: "mnfoundation.co.uk",
  facebook: "https://www.facebook.com/profile.php?id=61575194185460",
};

// A name that's safe to show on the share card: trimmed and not too long
export function cleanName(value) {
  return String(value || "").trim().slice(0, 40);
}