import type { Metadata } from "next";
import { LanguageProvider } from "@/lib/i18n/context";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contract AI - Medical Data Contract Auto Analysis",
  description: "AI-powered medical data purchase contract auto-parsing and data extraction system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 min-h-screen">
        <LanguageProvider>
          <Navbar />
          <main>{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
