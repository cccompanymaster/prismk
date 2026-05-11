"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  useEffect(() => {
    // Surface to the operator's Sentry (gated on DSN env var inside the sdk).
    if (typeof window !== "undefined") {
      console.error("App error boundary caught:", error);
    }
  }, [error]);

  return (
    <Container size="sm" className="py-20 text-center">
      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
        잠시 문제가 생겼어요
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        다시 시도해 보시거나, 잠시 후에 한 번 더 들러주세요. 응답은 안전하게 보관되어 있어요.
      </p>
      {error.digest ? (
        <p className="mt-2 text-[11px] text-slate-400">참조 코드: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex justify-center">
        <Button variant="primary" size="md" onClick={reset}>
          <RotateCcw className="h-4 w-4" /> 다시 시도
        </Button>
      </div>
    </Container>
  );
}
