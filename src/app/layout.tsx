import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Heillo",
  description: "A deterministic Italian phonetic word-transformation playtest tool."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
