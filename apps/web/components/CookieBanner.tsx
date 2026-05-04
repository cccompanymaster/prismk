"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "prismk:cookie-consent";
const TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000;

type Decision = "accepted" | "declined";

interface ConsentRecord {
  decision: Decision;
  decidedAt: number;
  expiresAt: number;
}

function readConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (parsed.expiresAt < Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeConsent(decision: Decision): ConsentRecord {
  const now = Date.now();
  const record: ConsentRecord = {
    decision,
    decidedAt: now,
    expiresAt: now + TWELVE_MONTHS_MS,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* ignore storage errors */
  }
  // Notify analytics consumers (e.g. PostHog wrapper) via a window event.
  window.dispatchEvent(new CustomEvent("prismk:consent", { detail: record }));
  return record;
}

export function CookieBanner(): JSX.Element | null {
  const [needsDecision, setNeedsDecision] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    setNeedsDecision(existing === null);
  }, []);

  if (!needsDecision) return null;

  const decide = (decision: Decision): void => {
    writeConsent(decision);
    setNeedsDecision(false);
  };

  return (
    <div
      role="dialog"
      aria-label="쿠키 동의"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:inset-x-auto sm:left-auto sm:right-6"
    >
      <p className="text-sm leading-relaxed text-slate-700">
        PRISM-K는 서비스 품질 개선과 익명 분석을 위해 쿠키를 사용할 수 있습니다. 거부하시면 분석
        도구가 비활성화됩니다. 자세한 내용은{" "}
        <Link href="/privacy" className="underline">
          개인정보처리방침
        </Link>
        을 확인해 주세요.
      </p>
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => decide("declined")}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-slate-300"
        >
          거부
        </button>
        <button
          type="button"
          onClick={() => decide("accepted")}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
        >
          동의
        </button>
      </div>
    </div>
  );
}
