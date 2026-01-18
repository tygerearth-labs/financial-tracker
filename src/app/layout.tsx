import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ProfileProvider } from "@/contexts/ProfileContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Financial Tracker",
  description: "Modern financial tracking application with multi-profile support. Built with Next.js, TypeScript, and shadcn/ui.",
  keywords: ["Financial Tracker", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "React"],
  authors: [{ name: "Tyger Earth | Ahtjong Labs" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Financial Tracker",
    description: "Multi-profile financial tracking application",
    url: "/",
    siteName: "Financial Tracker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Financial Tracker",
    description: "Multi-profile financial tracking application",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ProfileProvider>
            {children}
            <Toaster />
          </ProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
