/**
 * Next.js instrumentation hook. Loads Sentry only when
 * NEXT_PUBLIC_SENTRY_DSN is set so local/dev runs incur no overhead.
 */
export async function register(): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
