import type { Metadata } from "next";
import { ConvexClientProvider } from "@/lib/convex";
import "./globals.css";

export const metadata: Metadata = {
  title: "Enchatto",
  description: "Real-time multilingual conversation rooms",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
