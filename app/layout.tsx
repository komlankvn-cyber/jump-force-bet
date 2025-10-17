import "./globals.css";
import BackButton from "../src/components/BackButton";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <BackButton />
        {children}
      </body>
    </html>
  );
}
