import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KINO — Cinema & Media Review Journal",
  description: "Curated reviews for movies, TV series, documentaries, and anime with anonymous likes, dislikes, and social sharing.",
  keywords: ["kino", "movies", "reviews", "cinema", "tv shows", "documentaries", "letterboxd"],
  icons: {
    icon: [
      { url: "/kino-logo.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/kino-logo.png",
    apple: "/kino-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <head>
        <link rel="icon" href="/kino-logo.png" type="image/png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#121315] text-[#e3e2e5]">{children}</body>
    </html>
  );
}
