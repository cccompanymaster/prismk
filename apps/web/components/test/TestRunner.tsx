"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Item } from "@prism-k/data";
import type { TestVersion } from "@prism-k/types";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { fetchItems, submitResponses } from "@/lib/api";
import { LikertScale } from "@/components/test/LikertScale";

const PAGE_SIZE: Record<TestVersion, number> = { lite: 4, full: 5 };
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type AnswerValue = 1 | 2 | 3 | 4 | 5 | 6;
type AnswerMap = Record<number, AnswerValue>;

interface DraftPayload {
  version: TestVersion;
  items: Item[];
  answers: AnswerMap;
  startedAt: number;
  pageIndex: number;
  expiresAt: number;
}

function draftKey(version: TestVersion): string {
  return `prismk:draft:${version}`;
}

function loadDraft(version: TestVersion): DraftPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(draftKey(version));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftPayload;
    if (parsed.expiresAt < Date.now()) {
      window.localStorage.removeItem(draftKey(version));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveDraft(payload: DraftPayload): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(draftKey(payload.version), JSON.stringify(payload));
  } catch {
    /* ignore quota errors */
  }
}

function clearDraft(version: TestVersion): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(draftKey(version));
}

export function TestRunner({ version }: { version: TestVersion }): JSX.Element {
  const router = useRouter();
  const pageSize = PAGE_SIZE[version];

  const [items, setItems] = useState<Item[] | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  // Initial load: try draft first, otherwise fetch fresh items.
  useEffect(() => {
    const draft = loadDraft(version);
    if (draft && draft.items.length > 0) {
      setItems(draft.items);
      setAnswers(draft.answers);
      setPageIndex(draft.pageIndex);
      startedAtRef.current = draft.startedAt;
      return;
    }
    let aborted = false;
    fetchItems(version)
      .then((res) => {
        if (aborted) return;
        setItems(res.items);
        startedAtRef.current = Date.now();
      })
      .catch((err: unknown) => {
        if (aborted) return;
        setError(err instanceof Error ? err.message : "문항을 불러오지 못했습니다.");
      });
    return () => {
      aborted = true;
    };
  }, [version]);

  // Persist draft whenever answers / page changes.
  useEffect(() => {
    if (!items) return;
    saveDraft({
      version,
      items,
      answers,
      pageIndex,
      startedAt: startedAtRef.current,
      expiresAt: Date.now() + DRAFT_TTL_MS,
    });
    if (Object.keys(answers).length > 0) {
      setSavedAt(Date.now());
    }
  }, [items, answers, pageIndex, version]);

  // Warn before unload if there are answers in flight.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent): string | undefined => {
      if (Object.keys(answers).length === 0 || submitting) return undefined;
      e.preventDefault();
      e.returnValue = "응답이 저장되었습니다. 7일 안에 다시 들어와 이어서 응답할 수 있어요.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [answers, submitting]);

  const totalPages = useMemo(
    () => (items ? Math.ceil(items.length / pageSize) : 0),
    [items, pageSize],
  );

  const currentItems = useMemo(
    () => (items ? items.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize) : []),
    [items, pageIndex, pageSize],
  );

  const answeredOnPage = currentItems.every((it) => answers[it.id] !== undefined);
  const answeredTotal = items ? items.filter((it) => answers[it.id] !== undefined).length : 0;
  const isLast = pageIndex === totalPages - 1;

  const handleAnswer = useCallback((itemId: number, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [itemId]: value }));
  }, []);

  const handleNext = useCallback(() => {
    if (!isLast) {
      setPageIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isLast]);

  const handlePrev = useCallback(() => {
    if (pageIndex > 0) {
      setPageIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pageIndex]);

  // Keyboard shortcuts: 1-6 to answer the next unanswered item on the page,
  // ArrowLeft/Right to navigate between pages.
  useEffect(() => {
    if (!items) return;
    const handler = (e: KeyboardEvent): void => {
      // Ignore if user is typing in an input/textarea or holding a modifier.
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "ArrowRight" && answeredOnPage && !isLast) {
        e.preventDefault();
        handleNext();
        return;
      }
      if (e.key === "ArrowLeft" && pageIndex > 0) {
        e.preventDefault();
        handlePrev();
        return;
      }
      if (/^[1-6]$/.test(e.key)) {
        const value = Number(e.key) as 1 | 2 | 3 | 4 | 5 | 6;
        const next = currentItems.find((it) => answers[it.id] === undefined);
        if (next) {
          e.preventDefault();
          setAnswers((prev) => ({ ...prev, [next.id]: value }));
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [items, answers, currentItems, answeredOnPage, isLast, pageIndex, handleNext, handlePrev]);

  const handleSubmit = useCallback(async () => {
    if (!items) return;
    setSubmitting(true);
    setError(null);
    try {
      const elapsedSeconds = Math.round((Date.now() - startedAtRef.current) / 1000);
      const payload = {
        version,
        responses: items
          .filter((it) => answers[it.id] !== undefined)
          .map((it) => ({ itemId: it.id, value: answers[it.id]! })),
        elapsedSeconds,
      };
      const { token } = await submitResponses(payload);
      clearDraft(version);
      router.push(`/result/${token}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "제출에 실패했습니다.");
      setSubmitting(false);
    }
  }, [answers, items, router, version]);

  if (error) {
    return (
      <Container size="sm" className="py-16 text-center">
        <h2 className="text-xl font-semibold text-red-600">문제가 발생했어요</h2>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
      </Container>
    );
  }

  if (!items) {
    return (
      <Container size="sm" className="flex flex-col items-center py-24 text-sm text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-pattern-DI" />
        <p className="mt-3">문항을 불러오고 있어요…</p>
      </Container>
    );
  }

  const progress = items.length === 0 ? 0 : Math.round((answeredTotal / items.length) * 100);
  const remainingItems = items.length - answeredTotal;
  const elapsedMs = Date.now() - startedAtRef.current;
  const msPerItem = answeredTotal > 0 ? elapsedMs / answeredTotal : version === "lite" ? 10_000 : 9_500;
  const minutesRemaining =
    remainingItems > 0 ? Math.max(1, Math.round((remainingItems * msPerItem) / 60_000)) : null;

  return (
    <Container size="sm" className="py-10">
      <header className="sticky top-14 z-10 -mx-4 mb-1 space-y-3 bg-white/80 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-700">
            {pageIndex + 1} / {totalPages}
          </span>
          <div className="flex items-center gap-3">
            {savedAt ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600">
                <Check className="h-3 w-3" strokeWidth={3} />
                자동 저장됨
              </span>
            ) : null}
            <span className="text-slate-500">
              {answeredTotal} / {items.length} 응답
            </span>
          </div>
        </div>
        <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-100">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-pattern-DI to-pattern-SS"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          />
        </div>
        <div className="flex flex-col gap-1 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-pattern-DI" />
            1 (전혀 그렇지 않다) ~ 6 (매우 그렇다) 중 가장 가까운 것을 선택해 주세요.
          </p>
          <p className="flex items-center gap-3 text-slate-400">
            {minutesRemaining !== null ? (
              <span className="inline-flex items-center gap-1">
                약 {minutesRemaining}분 남음
              </span>
            ) : null}
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="rounded border border-slate-200 bg-white px-1 text-[10px] font-medium text-slate-600">1-6</kbd>
              응답 ·
              <kbd className="rounded border border-slate-200 bg-white px-1 text-[10px] font-medium text-slate-600">←</kbd>
              <kbd className="rounded border border-slate-200 bg-white px-1 text-[10px] font-medium text-slate-600">→</kbd>
              이동
            </span>
          </p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.ol
          key={pageIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
          className="mt-6 space-y-5"
        >
          {currentItems.map((item, idx) => (
            <li
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"
            >
              <p className="text-base font-medium leading-relaxed text-slate-900">
                <span className="mr-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-pattern-DI/10 px-1.5 text-xs font-semibold text-pattern-DI">
                  Q{pageIndex * pageSize + idx + 1}
                </span>
                {item.text}
              </p>
              <div className="mt-4">
                <LikertScale
                  itemId={item.id}
                  value={answers[item.id] ?? null}
                  onChange={(v) => handleAnswer(item.id, v)}
                />
              </div>
            </li>
          ))}
        </motion.ol>
      </AnimatePresence>

      <nav className="mt-10 flex items-center justify-between">
        <Button
          variant="outline"
          size="md"
          onClick={handlePrev}
          disabled={pageIndex === 0}
        >
          <ArrowLeft className="h-4 w-4" /> 이전
        </Button>
        {isLast ? (
          <Button
            variant="accent"
            size="lg"
            onClick={handleSubmit}
            disabled={!answeredOnPage || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> 결과 분석 중…
              </>
            ) : (
              <>
                결과 보기 <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={handleNext}
            disabled={!answeredOnPage}
          >
            다음 <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </nav>
    </Container>
  );
}
