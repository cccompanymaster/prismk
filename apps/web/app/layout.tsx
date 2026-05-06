import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import type { ReactNode } from "react";
import { CookieBanner } from "@/components/CookieBanner";
import { EthicsFooter } from "@/components/EthicsFooter";
import { KakaoSdk } from "@/components/KakaoSdk";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const koreanFont = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "PRISM-K — 한국형 차세대 성격 검사",
    template: "%s · PRISM-K",
  },
  description:
    "PRISM-K는 6개 광역 차원과 16개 패턴으로 자기이해를 돕는 온라인 성격 검사입니다. 36문항 라이트판과 136문항 풀 버전을 제공합니다.",
  applicationName: "PRISM-K",
  keywords: ["성격검사", "PRISM-K", "MBTI 대안", "자기이해"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7E57C2",
};

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="ko" className={koreanFont.variable}>
      <head>
        {process.env.NEXT_PUBLIC_API_BASE ? (
          <link rel="preconnect" href={new URL(process.env.NEXT_PUBLIC_API_BASE).origin} />
        ) : null}
      </head>
      <body className="min-h-screen bg-white font-sans text-slate-900">
        <SiteHeader />
        <main className="min-h-[calc(100vh-10rem)]">{children}</main>
        <EthicsFooter />
        <CookieBanner />
        <KakaoSdk appKey={process.env.NEXT_PUBLIC_KAKAO_KEY} />
      </body>
    </html>
  );
}
