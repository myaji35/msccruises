import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MSC Cruises - 세계 최고의 크루즈 여행",
  description: "지중해부터 카리브해까지, MSC Cruises와 함께하는 럭셔리 크루즈 여행",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
