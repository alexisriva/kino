import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kino — Cinema & Media Review Journal",
  description: "Curated reviews for movies, TV series, documentaries, and anime with anonymous likes, dislikes, and social sharing.",
  keywords: ["movies", "reviews", "cinema", "tv shows", "documentaries", "letterboxd", "kino"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#0b0e14] text-slate-100">{children}</body>
    </html>
  );
}
