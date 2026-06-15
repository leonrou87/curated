import { readConfig } from "@/lib/affiliate-config";
import { NetworkSettings } from "@/components/admin/NetworkSettings";

export const dynamic = "force-dynamic";

export default async function NetworksPage() {
  return <NetworkSettings initial={await readConfig()} />;
}
