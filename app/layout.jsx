// Fonts are installed as npm packages and bundled with the app, so they load even
// with no internet connection (e.g. inside a school network or the Docker image).
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/atkinson-hyperlegible-next/400.css";
import "@fontsource/atkinson-hyperlegible-next/600.css";
import "@fontsource/atkinson-hyperlegible-next/700.css";
import "@fontsource/gentium-plus/400.css";
import "@fontsource/gentium-plus/700.css";
import "./globals.css";
import Header from "../components/Header";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import ThemeInit from "../components/ThemeInit";

export const metadata = {
  title: "HCE Phoneme Activity Builder",
  description:
    "A Wordle and Word Search builder for Speech Pathology classroom phoneme activities.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeInit />
        <div className="shell">
          <Header />
          <NavBar />
          <main className="main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
