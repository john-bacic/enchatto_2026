import type { Metadata, Viewport } from "next";
import { Dela_Gothic_One, Zen_Maru_Gothic } from "next/font/google";
import { ConvexClientProvider } from "@/lib/convex";
import "./globals.css";

// Japanese glyphs come in unicode-range chunks, so skip preloading.
const chunky = Dela_Gothic_One({
  weight: "400",
  subsets: ["latin"],
  preload: false,
  display: "swap",
  variable: "--font-chunky",
});
const round = Zen_Maru_Gothic({
  weight: ["500", "700", "900"],
  subsets: ["latin"],
  preload: false,
  display: "swap",
  variable: "--font-round",
});

export const metadata: Metadata = {
  title: "Enchatto",
  description: "Real-time multilingual conversation rooms",
  appleWebApp: { capable: true, title: "Enchatto", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#fff8ec",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${chunky.variable} ${round.variable}`}>
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
