import { getAdminBundles } from "@/lib/data";
import { ApprovalQueue } from "@/components/admin/ApprovalQueue";

export const dynamic = "force-dynamic";

export default function ApprovalsPage() {
  return <ApprovalQueue rows={getAdminBundles()} />;
}
