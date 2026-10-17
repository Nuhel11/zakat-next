// The page people land on when they click the card in a Facebook post: /gave
// It also tells Facebook which picture, title and text to show in the post.
import Link from "next/link";
import { CHARITY, cleanName } from "../charity";

// The site's own address, so Facebook gets full links to the picture
function siteAddress() {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL;
  }
  return "http://localhost:3000";
}

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const name = cleanName(params.name);

  const title = name
    ? name + " has given their zakat to " + CHARITY.name
    : "I've given my zakat to " + CHARITY.name;
  const description =
    "Registered charity no. " + CHARITY.number +
    ". Support their work too, or work out your own zakat with this free calculator.";
  const image = "/api/share-image" + (name ? "?name=" + encodeURIComponent(name) : "");

  return {
    metadataBase: new URL(siteAddress()),
    title: title,
    description: description,
    openGraph: {
      type: "website",
      title: title,
      description: description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
  };
}

export default async function GavePage({ searchParams }) {
  const params = await searchParams;
  const name = cleanName(params.name);

  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">ZAKAT GIVEN · ALHAMDULILLAH</p>
        <h1>{name ? name + " has given their zakat" : "Zakat given"}</h1>
        <p className="intro">
          {name ? name + " has" : "Someone has"} given their zakat to {CHARITY.name},
          registered charity no. {CHARITY.number}. You can support their work too,
          or work out your own zakat in a few minutes.
        </p>
      </section>

      <section className="card donate">
        <h2>Support {CHARITY.name}</h2>
        <div className="donate-actions">
          <a
            className="button-primary donate-button"
            href={CHARITY.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Donate to {CHARITY.name} ↗
          </a>
          <Link className="button-secondary link-as-button" href="/">
            Work out your zakat
          </Link>
        </div>
      </section>
    </main>
  );
}