import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";
import { prefix } from "@/app/lib/prefix";

export const metadata: Metadata = {
  title: "Ritual Xmas",
  description: "Decorate your Christmas tree with Ritual!",
  icons: {
    icon: [
      {
        url: "/assets/X_RitualVN.jpg",
        type: "image/jpeg",
      },
    ],
    apple: [
      {
        url: "/assets/X_RitualVN.jpg",
        type: "image/jpeg",
      },
    ],
    shortcut: "/assets/X_RitualVN.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet" />
        <link rel="icon" href="/assets/X_RitualVN.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/assets/X_RitualVN.jpg" />
        <link rel="shortcut icon" href="/assets/X_RitualVN.jpg" type="image/jpeg" />
      </head>
      <body>
        {/* Project logo (links to X) */}
        <a
          href="https://x.com/ritualfnd"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ritual on X"
          className="fixed top-3 z-30 w-14 h-14 rounded-md overflow-hidden bg-white/0 shadow-sm logo-effect"
          style={{ left: 'calc(0.75rem + 3px)' }}
        >
          <Image
            src={`${prefix}/assets/X_Ritual.jpg`}
            alt="Ritual logo"
            width={56}
            height={56}
            quality={100}
            style={{ objectFit: 'cover' }}
          />
        </a>

        {children}
      </body>
    </html>
  );
}
