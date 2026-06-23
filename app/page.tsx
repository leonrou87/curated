import { getBundlesByType, toCardBundles } from "@/lib/data";
import { HomeFeed } from "@/components/HomeFeed";

export default function HomePage() {
  const looks = getBundlesByType("look");
  // diverse preview sample for the home feed (full catalog lives on /looks)
  const sample = [...looks.filter((b) => b.featured), ...looks].slice(0, 160);
  return <HomeFeed looks={toCardBundles(sample)} kits={toCardBundles(getBundlesByType("kit"))} total={looks.length} />;
}
