import { Inter, Fraunces } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display" });

export const metadata = {
  title: "Family Zakat Calculator",
  description: "Work out zakat for yourself and your family.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fraunces.variable}`}>
        {/* The patterned band behind the top of every page */}
        <div className="backdrop" aria-hidden="true"></div>

        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="logo">Zakat Calculator</Link>
            <nav className="nav">
              <Link href="/">Calculator</Link>
              <Link href="/about">About &amp; FAQ</Link>
            </nav>
          </div>
        </header>

        {children}

        <footer className="site-footer">
          <div className="container">
            <p>This calculator is a guide. Please check with a scholar if you are unsure.</p>
            <p>Your figures stay in your browser. Nothing is sent or saved anywhere.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}