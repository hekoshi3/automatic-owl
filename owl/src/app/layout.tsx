import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AuOwl",
  description: "Next Image Generaion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        {children}
      </body>
    </html>
  );
}
