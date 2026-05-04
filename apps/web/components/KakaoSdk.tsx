"use client";

import Script from "next/script";

interface Props {
  appKey: string | undefined;
}

export function KakaoSdk({ appKey }: Props): JSX.Element | null {
  if (!appKey) return null;
  return (
    <Script
      id="kakao-sdk"
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        const w = window as unknown as {
          Kakao?: { isInitialized: () => boolean; init: (key: string) => void };
        };
        if (w.Kakao && !w.Kakao.isInitialized()) w.Kakao.init(appKey);
      }}
    />
  );
}
