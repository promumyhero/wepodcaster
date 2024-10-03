import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google"
import "./globals.css";
import ConvexClerkProvider from "../providers/ConvexClerkProvider";
import AudioProvider from "@/providers/AudioProvider";

const manrope = Manrope({subsets: ["latin"]});


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
    <ConvexClerkProvider>
      <html lang="en">
        <AudioProvider>
          <body
            className={manrope.className}
          >
              {children}
          </body>
          </AudioProvider>
      </html>
    </ConvexClerkProvider>
  );
}
