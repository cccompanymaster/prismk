import { Loader2 } from "lucide-react";
import { Container } from "@/components/ui/Container";

export default function Loading(): JSX.Element {
  return (
    <Container size="sm" className="flex flex-col items-center py-24 text-sm text-slate-500">
      <Loader2 className="h-7 w-7 animate-spin text-pattern-DI" />
      <p className="mt-3">불러오는 중…</p>
    </Container>
  );
}
