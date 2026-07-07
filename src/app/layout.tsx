import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Wallet } from "lucide-react";
import "./globals.css";
import { SidebarNav } from "@/components/sidebar-nav";
import { MobileNav } from "@/components/mobile-nav";
import { BottomNav } from "@/components/bottom-nav";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finance OS — Personal Finance Dashboard",
  description: "Track income, expenses, budgets, savings, goals and investments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <div className="flex min-h-screen">
          {/* Desktop sidebar */}
          <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-sidebar md:flex">
            <Link
              href="/"
              className="flex items-center gap-2.5 border-b px-5 py-4 font-semibold"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Wallet className="size-4.5" />
              </span>
              Finance OS
            </Link>
            <div className="flex-1 overflow-y-auto p-3">
              <SidebarNav />
            </div>
            <div className="border-t px-5 py-3 text-xs text-muted-foreground">
              Personal Finance OS
            </div>
          </aside>

          {/* Main column */}
          <div className="flex min-w-0 flex-1 flex-col md:pl-64">
            {/* Mobile top bar */}
            <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur md:hidden">
              <MobileNav />
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
                  <Wallet className="size-4" />
                </span>
                Finance OS
              </Link>
            </header>

            <main className="flex-1 px-4 py-6 pb-28 sm:px-6 md:pb-8 lg:px-8">
              {children}
            </main>
          </div>
        </div>
        <BottomNav />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
