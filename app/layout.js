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
