import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CODEXEDOC — The Operating System For Learning",
  description: "Active Recall, Spaced Repetition, and Learning Blueprints to master complex skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
