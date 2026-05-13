import Link from "next/link";
import { Container } from "@/components/ui/Container";

const LINKS = [
  { href: "/patterns", label: "16 패턴" },
  { href: "/match", label: "매칭" },
];

export function SiteHeader(): JSX.Element {
  return (
    <header
      role="banner"
      className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur print:hidden"
    >
      <Container size="full">
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base font-extrabold tracking-tight text-slate-900"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{
                background:
                  "conic-gradient(from 180deg, #7E57C2, #EC407A, #FF7043, #7CB342, #7E57C2)",
              }}
              aria-hidden
            />
            PRISM-K
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/test/lite"
              className="ml-2 inline-flex h-8 items-center justify-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              검사 시작
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}
