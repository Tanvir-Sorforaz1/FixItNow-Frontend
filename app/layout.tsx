import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { PageShell } from "@/components/ui/PageShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FixItNow",
  description: "Book trusted home services, manage technicians, and keep work moving.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <Providers>
          <PageShell title="FixItNow" description="Book trusted home services, manage technicians, and keep work moving.">
            {children}
          </PageShell>
        </Providers>
      </body>
    </html>
  );
}
