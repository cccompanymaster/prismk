import Link from "next/link";

const ETHICS_NOTICE =
  "본 결과는 채용·인사·결혼 결정에 단독 사용되지 않습니다. 이는 현재의 패턴이며 자라납니다.";

export function EthicsFooter(): JSX.Element {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-8 text-sm text-slate-600">
      <div className="mx-auto max-w-5xl space-y-3 px-4">
        <p className="text-center font-medium text-slate-700">{ETHICS_NOTICE}</p>
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
          <li>
            <Link href="/privacy" className="hover:text-slate-700">
              개인정보처리방침
            </Link>
          </li>
          <li>
            <Link href="/terms" className="hover:text-slate-700">
              이용약관
            </Link>
          </li>
          <li>
            <Link href="/patterns" className="hover:text-slate-700">
              패턴 사전
            </Link>
          </li>
        </ul>
        <p className="text-center text-xs text-slate-400">© PRISM-K</p>
      </div>
    </footer>
  );
}
