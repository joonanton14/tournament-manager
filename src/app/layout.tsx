import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "FIFA Tournament Manager",
  description: "Manage FIFA tournaments, teams, players, results and scorers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f1f3f7] text-slate-950 antialiased">
        <Navbar />

        <main>{children}</main>
      </body>
    </html>
  );
}