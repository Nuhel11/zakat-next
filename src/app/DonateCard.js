import { useEffect, useState } from "react";
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

// True on phones and tablets (touch screens)
function isTouchDevice() {
  return window.matchMedia("(pointer: coarse)").matches;
}

export default function DonateCard({ amount, currency, name }) {
  const [sharing, setSharing] = useState(false);       // is the share panel open?
  const [message, setMessage] = useState(defaultMessage);
  const [showName, setShowName] = useState(true);      // put their name on the card?
  const [copied, setCopied] = useState(false);
  const [cardFile, setCardFile] = useState(null);      // the card picture, ready to share

  const heading = amount > 0
    ? "Give your " + formatMoney(amount, currency) + " to " + CHARITY.name
    : "Support " + CHARITY.name;

  // The name on the card (only if they typed one and want it shown)
  const nameOnCard = showName && name ? name : "";
  const nameQuery = nameOnCard ? "?name=" + encodeURIComponent(nameOnCard) : "";
  const imageAddress = "/api/share-image" + nameQuery;

  // While the panel is open, get the card picture ready, so phones can attach it to the post.
  // (It has to be ready before the button is pressed, or phones block the share.)
  useEffect(() => {
    if (!sharing) return;
    let cancelled = false;

    fetch(imageAddress)
      .then((response) => response.blob())
      .then((blob) => {
        if (!cancelled) {
          setCardFile(new File([blob], "zakat-given.png", { type: "image/png" }));
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [sharing, imageAddress]);

  // Facebook doesn't allow websites to type the post for people, so we copy it for them
  function copyMessage() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message).catch(() => {});
    }
    setCopied(true);
  }

  function shareOnFacebook() {
    copyMessage();

    // Phones: open the phone's share menu with the card picture attached.
    // They pick Facebook, and its "Create post" screen opens with the picture in it.
    const canShareFile =
      cardFile && navigator.canShare && navigator.canShare({ files: [cardFile] });

    if (isTouchDevice() && canShareFile) {
      navigator.share({ files: [cardFile], text: message }).catch(() => {});
      return;
    }

    // Computers: Facebook's own "Create post" window, with the card attached as a link preview
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

            {/* The card as it will appear in the post */}
            <img
              className="share-preview"
              src={imageAddress}
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

            <ol className="share-steps">
              <li>Press <strong>Share on Facebook</strong>. Your message is copied for you.</li>
              <li>Facebook opens its <strong>Create post</strong> screen with the card already in it (on a phone, choose <strong>Facebook</strong> from the list).</li>
              <li>Tap the text box, <strong>paste</strong> your message (Ctrl + V, or press and hold → Paste), then press <strong>Post</strong>.</li>
            </ol>

            <div className="share-actions">
              <button type="button" className="fb-share" onClick={shareOnFacebook}>
                Share on Facebook
              </button>
              <button type="button" className="button-secondary" onClick={copyMessage}>
                Copy message only
              </button>
              <a
                className="button-secondary link-as-button"
                href={imageAddress}
                download="zakat-given.png"
              >
                Save the card picture
              </a>
            </div>

            {copied && (
              <p className="hint copied-note">
                ✓ Message copied – paste it into your Facebook post.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}