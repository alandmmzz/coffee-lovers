import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import Header from "./components/Header";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Coffee Lovers — Ficha de catación",
  description: "Registrá y valorá cada café que probás: marca, tipo, tueste, aroma, cuerpo y más.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Coffee Lovers",
  },
};

export const viewport: Viewport = {
  themeColor: "#241812",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-body bg-ink text-cream antialiased`}
      >
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
