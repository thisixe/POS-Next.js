import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ApolloProvider } from "@/lib/apollo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  variable: "--font-noto-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FullOption.IT | Computer & Technology",
  description: "อุปกรณ์คอมพิวเตอร์และเทคโนโลยีคุณภาพ ราคาดี พร้อมบริการหลังการขาย",
  keywords: ["คอมพิวเตอร์", "อุปกรณ์ไอที", "เทคโนโลยี", "computer", "technology", "IT equipment"],
  openGraph: {
    title: "FullOption.IT | Computer & Technology",
    description: "อุปกรณ์คอมพิวเตอร์และเทคโนโลยีคุณภาพ",
    type: "website",
    locale: "th_TH",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${notoSansThai.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ApolloProvider>
            {children}
          </ApolloProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
