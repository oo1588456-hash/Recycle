import { PublicShell } from "@/components/layout/PublicShell";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicShell>
      <RoleGuard allow={["buyer"]}>{children}</RoleGuard>
    </PublicShell>
  );
}
