import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Address Map Visualizer",
  description: "Upload spreadsheets containing addresses and visualize them on Google Maps",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
