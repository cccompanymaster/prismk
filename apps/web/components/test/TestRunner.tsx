"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Item } from "@prism-k/data";
import type { TestVersion } from "@prism-k/types";
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
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-red-600">문제가 발생했어요</h2>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
      </div>
    );
  }

  if (!items) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center text-sm text-slate-500">
        문항을 불러오고 있어요…
      </div>
    );
  }

  const progress = items.length === 0 ? 0 : Math.round((answeredTotal / items.length) * 100);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <header className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {pageIndex + 1} / {totalPages}
          </span>
          <span>
            {answeredTotal} / {items.length} 응답
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-pattern-DI transition-all"
            style={{ width: `${progress}%` }}
            aria-hidden
          />
        </div>
        <p className="text-xs text-slate-500">
          1 (전혀 그렇지 않다) ~ 6 (매우 그렇다) 중 가장 가까운 것을 선택해 주세요.
        </p>
      </header>

      <ol className="mt-8 space-y-7">
        {currentItems.map((item, idx) => (
          <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-base font-medium leading-relaxed text-slate-900">
              <span className="mr-2 text-sm font-semibold text-pattern-DI">
                Q{pageIndex * pageSize + idx + 1}.
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
      </ol>

      <nav className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          disabled={pageIndex === 0}
          className="rounded-lg border border-slate-200 px-5 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          이전
        </button>
        {isLast ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!answeredOnPage || submitting}
            className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "결과 분석 중…" : "결과 보기"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!answeredOnPage}
            className="rounded-lg bg-pattern-DI px-6 py-2.5 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음
          </button>
        )}
      </nav>
    </div>
  );
}
