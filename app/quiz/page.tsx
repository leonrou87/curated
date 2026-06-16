import type { Metadata } from "next";
import { getBundlesByType } from "@/lib/data";
import { StyleQuiz } from "@/components/StyleQuiz";

export const metadata: Metadata = {
  title: "Style Quiz",
  description: "Swipe through looks and discover your Style DNA — then get a feed built for your taste.",
  openGraph: { title: "What's your Style DNA?", description: "Take the 60-second Curated style quiz.", images: [{ url: "/og?type=dna&a1=quiet-luxury&p1=44&a2=clean-girl&p2=33&a3=mob-wife&p3=23", width: 1200, height: 630 }] },
};

export default function QuizPage() {
  const looks = getBundlesByType("look");
  // a diverse deck: spread across aesthetics + both genders, with real imagery
  const seen = new Set<string>();
  const deck: typeof looks = [];
  for (const b of looks) {
    const key = `${b.brief.gender}:${b.brief.vibe}`;
    if (seen.has(key)) continue;
    if (!b.items.some((i) => i.image)) continue;
    seen.add(key);
    deck.push(b);
    if (deck.length >= 16) break;
  }
  return <StyleQuiz deck={deck} recommendable={looks} />;
}
