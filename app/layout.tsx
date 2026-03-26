import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import VisitorTracker from "@/components/VisitorTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Modlr", template: "%s — Modlr" },
  description: "Buy and sell 3D models from independent creators on Modlr.",
  verification: { google: "XNv0lg3qkY0Y02Fi3ukm1voWVh0Up3prKJ7mgzsP2a4" },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%234f46e5'/><path d='M16 5L27 11.5V12L16 18.5L5 12V11.5L16 5Z' fill='white' opacity='0.95'/><path d='M5 12L16 18.5V27L5 20.5V12Z' fill='white' opacity='0.5'/><path d='M27 12L16 18.5V27L27 20.5V12Z' fill='white' opacity='0.25'/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ colorScheme: 'dark' }}
      suppressHydrationWarning
    >
      <head>
        {/* Apply saved theme before first paint to prevent colour flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('modlr-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}})()` }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          <VisitorTracker />
          {children}
        </Providers>
      </body>
    </html>
  );
}
