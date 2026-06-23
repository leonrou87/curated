import type { Metadata } from "next";
import { getBundlesByType, toCardBundles } from "@/lib/data";
import { StyleQuiz } from "@/components/StyleQuiz";

export const metadata: Metadata = {
  title: "Style Quiz",
  description: "Swipe through looks and discover your Style DNA — then get a feed built for your taste.",
  openGraph: { title: "What's your Style DNA?", description: "Take the 60-second Curated style quiz.", images: [{ url: "/og?type=dna&a1=quiet-luxury&p1=44&a2=clean-girl&p2=33&a3=mob-wife&p3=23", width: 1200, height: 630 }] },
};

export default function QuizPage() {
  const looks = getBundlesByType("look");
  const seen = new Set<string>();
  const deck: typeof looks = [];
  for (const b of looks) {
    const key = `${b.brief.gender}:${b.brief.vibe}`;
    if (seen.has(key) || !b.items.some((i) => i.image)) continue;
    seen.add(key); deck.push(b);
    if (deck.length >= 16) break;
  }
  // a capped, diverse pool for the "picked for you" recommendations
  return <StyleQuiz deck={toCardBundles(deck)} recommendable={toCardBundles(looks.slice(0, 300))} />;
}
