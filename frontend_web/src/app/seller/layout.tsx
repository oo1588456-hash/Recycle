import { PublicShell } from "@/components/layout/PublicShell";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { SellerApprovalGate } from "@/components/auth/SellerApprovalGate";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicShell>
      <RoleGuard allow={["seller"]}>
        <SellerApprovalGate>{children}</SellerApprovalGate>
      </RoleGuard>
    </PublicShell>
  );
}
