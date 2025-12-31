import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unmask – Exam-Ready Learning, On Demand",
  description:
    "Unmask connects university students with expert educators through demand-first, exam-focused study requests.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-cyan-200 selection:text-cyan-900`}
      >
        <div className="bg-mesh" />
        <div className="bg-grid fixed inset-0 z-[-1] opacity-50" />

        <main className="min-h-screen flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16">
          <div className="w-full max-w-6xl glass-panel glow-ring relative overflow-hidden flex flex-col min-h-[85vh]">
            {/* Ambient light effects inside the panel - Reduced intensity for readability */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 bg-cyan-500/10 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 bg-fuchsia-500/10 blur-[120px]" />

            <div className="relative flex-1 p-6 sm:p-10 lg:p-12">
              {children}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
