import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TestRunner } from "@/components/test/TestRunner";

const VERSIONS = new Set(["lite", "full"]);

export function generateStaticParams(): { version: string }[] {
  return [{ version: "lite" }, { version: "full" }];
}

export function generateMetadata({ params }: { params: { version: string } }): Metadata {
  const v = params.version;
  return {
    title: v === "lite" ? "라이트판 검사 (36문항)" : "풀 버전 검사 (136문항)",
    robots: { index: false, follow: false },
  };
}

export default function TestPage({ params }: { params: { version: string } }): JSX.Element {
  if (!VERSIONS.has(params.version)) notFound();
  return <TestRunner version={params.version as "lite" | "full"} />;
}
