import * as Sentry from "@sentry/node";

let initialized = false;

/**
 * Initializes Sentry only when SENTRY_DSN is set, so local/dev runs
 * incur zero overhead and CI builds without secrets do not trip up.
 */
export function initSentry(): void {
  if (initialized) return;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1"),
  });
  initialized = true;
}

export function isSentryEnabled(): boolean {
  return initialized;
}

export function captureException(err: unknown): void {
  if (!initialized) return;
  Sentry.captureException(err);
}
