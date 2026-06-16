import { getBundlesByType } from "@/lib/data";
import { HomeFeed } from "@/components/HomeFeed";

export default function HomePage() {
  return <HomeFeed looks={getBundlesByType("look")} kits={getBundlesByType("kit")} />;
}
