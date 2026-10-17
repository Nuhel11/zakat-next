import { useState } from "react";
import { formatMoney } from "./money";

// The charity's details. Change these if they change.
const CHARITY = {
  name: "MN Foundation",
  number: "1215654",
  url: "https://mnfoundation.co.uk/",
  facebook: "https://www.facebook.com/profile.php?id=61575194185460",
};

// The message people can paste into their Facebook post.
// (Facebook doesn't let websites fill in the post text, so we copy it for them.)
const SHARE_MESSAGE =
  "Alhamdulillah, I've given my zakat to " + CHARITY.name +
  " (registered charity no. " + CHARITY.number + "). " +
  "You can support their work too: " + CHARITY.url;

export default function DonateCard({ amount, currency }) {
  const [copied, setCopied] = useState(false);

  const heading = amount > 0
    ? "Give your " + formatMoney(amount, currency) + " to " + CHARITY.name
    : "Support " + CHARITY.name;

  // Copy the message, then open Facebook's share window for the charity's website
  function shareOnFacebook() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(SHARE_MESSAGE).catch(() => {});
    }
    setCopied(true);

    window.open(
      "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(CHARITY.url),
      "_blank",
      "noopener,noreferrer,width=640,height=560"
    );
  }

  return (
    <section className="card donate">
      <p className="group-label">Give your zakat</p>
      <h2>{heading}</h2>
      <p className="hint">
        Registered charity no. {CHARITY.number}. If you would like to, you can give your
        zakat through their website. It opens in a new tab, so your figures here stay as they are.
      </p>

      <div className="donate-actions">
        <a
          className="button-primary donate-button"
          href={CHARITY.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Donate to {CHARITY.name} ↗
        </a>
        <a
          className="button-secondary link-as-button"
          href={CHARITY.facebook}
          target="_blank"
          rel="noopener noreferrer"
        >
          {CHARITY.name} on Facebook ↗
        </a>
      </div>

      <div className="share-box">
        <p>
          <strong>Already given?</strong> Share it on Facebook and encourage others to
          support {CHARITY.name} too.
        </p>
        <button type="button" className="fb-share" onClick={shareOnFacebook}>
          Share on Facebook
        </button>
        {copied && (
          <p className="hint">
            We've copied a message for you. Paste it into your Facebook post
            (Ctrl + V, or press and hold on a phone).
          </p>
        )}
      </div>
    </section>
  );
}