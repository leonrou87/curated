import { getBundlesByType, toCardBundles } from "@/lib/data";
import { HomeFeed } from "@/components/HomeFeed";
import { NewsletterCTA } from "@/components/NewsletterCTA";
import { RecentlyViewed } from "@/components/RecentlyViewed";

export default function HomePage() {
  const looks = getBundlesByType("look");
  // diverse preview sample for the home feed (full catalog lives on /looks)
  const sample = [...looks.filter((b) => b.featured), ...looks].slice(0, 160);
  return (
    <>
      <HomeFeed looks={toCardBundles(sample)} kits={toCardBundles(getBundlesByType("kit"))} total={looks.length} />
      <RecentlyViewed />
      <NewsletterCTA source="home" />
    </>
  );
}
