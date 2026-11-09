import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tour of Utah — The Road Trip Game",
  description: "Explore Utah by car with up to eight human and computer drivers.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
