// app/layout.js
import "./globals.css"; // your Tailwind + global css
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Deadlines",
  description: "Never miss an exam or submission deadline",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
