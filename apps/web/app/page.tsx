import { Differentiators } from "@/components/landing/Differentiators";
import { FaqSection } from "@/components/landing/FaqSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { VersionCards } from "@/components/landing/VersionCards";

export default function HomePage(): JSX.Element {
  return (
    <>
      <HeroSection />
      <Differentiators />
      <VersionCards />
      <FaqSection />
    </>
  );
}
