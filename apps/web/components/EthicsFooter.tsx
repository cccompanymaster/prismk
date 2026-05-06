import Link from "next/link";
import { Container } from "@/components/ui/Container";

const ETHICS_NOTICE =
  "본 결과는 채용·인사·결혼 결정에 단독 사용되지 않습니다. 이는 현재의 패턴이며 자라납니다.";

const LINKS = [
  { href: "/patterns", label: "16 패턴 사전" },
  { href: "/match", label: "매칭 분석" },
  { href: "/privacy", label: "개인정보처리방침" },
  { href: "/terms", label: "이용약관" },
];

export function EthicsFooter(): JSX.Element {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-10 text-sm text-slate-600">
      <Container className="space-y-5">
        <p className="text-center text-[13px] font-medium text-slate-700">
          {ETHICS_NOTICE}
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-slate-700">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-center text-[11px] text-slate-400">© PRISM-K · 한국형 차세대 성격 검사</p>
      </Container>
    </footer>
  );
}
