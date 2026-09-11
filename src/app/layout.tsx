import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "FIFA Turnausmanager",
  description: "Hallinnoi FIFA-turnauksia, joukkueita, pelaajia, tuloksia ja sijoituksia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi">
      <body className="min-h-screen bg-[#f1f3f7] text-slate-950 antialiased">
        <Navbar />

        <main>{children}</main>
      </body>
    </html>
  );
}