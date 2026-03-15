import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Designer | ebiidesign",
  description:
    "Upload your photo and generate 4 printable AI styles for t-shirt design."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}