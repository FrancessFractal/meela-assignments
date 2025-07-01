import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import {Card, Container, Theme} from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Therapy application app",
  description: "An app for creating applications for therapy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className={`${geistSans.variable} ${geistMono.variable}`}>
    <Theme>
      <Container size="2">
        <Card>
          {children}
        </Card>
      </Container>
    </Theme>
    </body>
    </html>
  );
}
