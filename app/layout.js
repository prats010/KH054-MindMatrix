import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";

export const metadata = {
  title: "JanSahayak — Official Government Scheme Portal",
  description: "Find government schemes you are eligible for. An official public welfare discovery portal.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <LanguageProvider>
          {children}
          
          <footer className="footer">
            <div className="footer-content">
              <div>© 2026 JanSahayak Public Scheme Discovery Initiative.</div>
              <div className="footer-links">
                <a href="#">National Portal of India</a>
                <a href="#">Data Privacy & Security</a>
                <a href="#">Terms of Service</a>
                <a href="#">Accessibility Statement</a>
              </div>
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
