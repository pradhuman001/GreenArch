import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GreenArch - Sustainable Gardening Platform",
  description: "Connect with nurseries and gardeners for all your green space needs",
  keywords: "nursery, gardening, plants, landscaping, India",
  authors: [{ name: "GreenArch Team" }],
  openGraph: {
    title: "GreenArch",
    description: "Sustainable Gardening Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
