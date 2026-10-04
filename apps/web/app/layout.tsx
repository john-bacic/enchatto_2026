import type { Metadata, Viewport } from "next";
import { Zen_Maru_Gothic } from "next/font/google";
import localFont from "next/font/local";
import { ConvexClientProvider } from "@/lib/convex";
import { DeployRefresh } from "@/components/deploy-refresh";
import "./globals.css";

// Dela Gothic One without its kanji: Latin, kana and punctuation only. Its kanji strokes are so heavy
// that dense characters fill in at button and label sizes, so --chunky hands kanji to the next face.
const chunky = localFont({
  src: "./fonts/DelaGothicOne-NoKanji.woff2",
  weight: "400",
  display: "swap",
  variable: "--font-chunky",
  adjustFontFallback: false,
});
// The kanji of bold text: Zen Maru Gothic at its heaviest. A family of its own with this one weight,
// so that text set at weight 400 for Dela Gothic One still gets it.
// Japanese glyphs come in unicode-range chunks, so skip preloading.
const chunkyKanji = Zen_Maru_Gothic({
  weight: "900",
  subsets: ["latin"],
  preload: false,
  display: "swap",
  variable: "--font-chunky-kanji",
  adjustFontFallback: false,
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
    <html lang="en" className={`${chunky.variable} ${chunkyKanji.variable} ${round.variable}`}>
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <DeployRefresh />
      </body>
    </html>
  );
}
