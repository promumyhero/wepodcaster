import type { Metadata } from "next";
import { Inter } from "next/font/google"
import "./globals.css";
import ConvexClerkProvider from "./providers/ConvexClerkProvider";

const inter = Inter({subsets: ["latin"]});


export const metadata: Metadata = {
  title: "WePodcaster",
  description: "Generate podcast episodes from your blog posts",
  icons: "icons/logo.svg"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={inter.className}
      >
        <ConvexClerkProvider>
          {children}
        </ConvexClerkProvider>
      </body>
    </html>
  );
}
