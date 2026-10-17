import { useState } from "react";
import { formatMoney } from "./money";
import { CHARITY } from "./charity";

// The ready-made message for the Facebook post. People can change it before posting.
function defaultMessage() {
  return (
    "Alhamdulillah, I've given my zakat to " + CHARITY.name +
    " (registered charity no. " + CHARITY.number + "). " +
    "May Allah accept it from all of us.\n\n" +
    "If you'd like to support their work too: " + CHARITY.url
  );
}

export default function DonateCard({ amount, currency, name }) {
  const [sharing, setSharing] = useState(false);       // is the share panel open?
  const [message, setMessage] = useState(defaultMessage);
  const [showName, setShowName] = useState(true);      // put their name on the card?
  const [copied, setCopied] = useState(false);

  const heading = amount > 0
    ? "Give your " + formatMoney(amount, currency) + " to " + CHARITY.name
    : "Support " + CHARITY.name;

  // The name on the card (only if they typed one and want it shown)
  const nameOnCard = showName && name ? name : "";
  const nameQuery = nameOnCard ? "?name=" + encodeURIComponent(nameOnCard) : "";

  // Facebook can't let a website type the post for them, so we copy the message to paste
  function copyMessage() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message).catch(() => {});
    }
    setCopied(true);
  }

  // Copy the message, then open Facebook's share window with our "zakat given" page.
  // Facebook reads that page and shows its card (picture, title, text) in the post.
  function shareOnFacebook() {
    copyMessage();
    const pageAddress = window.location.origin + "/gave" + nameQuery;
    window.open(
      "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(pageAddress),
      "_blank",
      "noopener,noreferrer,width=640,height=600"
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
        {!sharing ? (
          <>
            <p>
              <strong>Already given?</strong> Share it on Facebook and encourage others to
              support {CHARITY.name} too.
            </p>
            <button type="button" className="fb-share" onClick={() => setSharing(true)}>
              I've donated – share on Facebook
            </button>
          </>
        ) : (
          <div className="share-panel">
            <p className="group-label">Your Facebook post</p>

            {/* The card exactly as Facebook will show it */}
            <img
              className="share-preview"
              src={"/api/share-image" + nameQuery}
              alt="The card that will appear in your Facebook post"
              width={1200}
              height={630}
            />

            {name && (
              <label className="check">
                <input
                  type="checkbox"
                  checked={showName}
                  onChange={(e) => setShowName(e.target.checked)}
                />
                Show my name ({name}) on the card
              </label>
            )}

            <label className="field share-message">
              <span>Your message – change it if you like</span>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setCopied(false);
                }}
              />
            </label>

            <div className="share-actions">
              <button type="button" className="fb-share" onClick={shareOnFacebook}>
                Copy message and open Facebook
              </button>
              <button type="button" className="button-secondary" onClick={copyMessage}>
                Copy message only
              </button>
            </div>

            {copied && (
              <p className="hint">
                Message copied. In Facebook, click in the post box and paste it
                (Ctrl + V, or press and hold on a phone), then press Post.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}