"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

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
  window.dispatchEvent(new CustomEvent("prismk:consent", { detail: record }));
  return record;
}

export function CookieBanner(): JSX.Element | null {
  const [needsDecision, setNeedsDecision] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    setNeedsDecision(existing === null);
  }, []);

  const decide = (decision: Decision): void => {
    writeConsent(decision);
    setNeedsDecision(false);
  };

  return (
    <AnimatePresence>
      {needsDecision ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
          role="dialog"
          aria-label="쿠키 동의"
          aria-live="polite"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-soft-lg backdrop-blur sm:inset-x-auto sm:left-auto sm:right-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-pattern-DI/10 text-pattern-DI">
              <Cookie className="h-4 w-4" />
            </div>
            <p className="flex-1 text-sm leading-relaxed text-slate-700">
              PRISM-K는 서비스 품질 개선과 익명 분석을 위해 쿠키를 사용할 수 있습니다. 거부하시면
              분석 도구가 비활성화됩니다.{" "}
              <Link href="/privacy" className="text-pattern-DI underline-offset-2 hover:underline">
                개인정보처리방침
              </Link>
              .
            </p>
          </div>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => decide("declined")}>
              거부
            </Button>
            <Button variant="primary" size="sm" onClick={() => decide("accepted")}>
              동의
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
