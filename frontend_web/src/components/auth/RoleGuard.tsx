"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, dashboardPath } from "@/lib/auth/auth-store";
import type { UserRole } from "@/lib/types";

export function RoleGuard({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow: UserRole[];
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const access = useAuthStore((s) => s.access);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const finish = () => setHydrated(true);
    if (useAuthStore.persist.hasHydrated()) finish();
    else {
      const unsub = useAuthStore.persist.onFinishHydration(finish);
      return unsub;
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!access || !user) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!allow.includes(user.role)) {
      router.replace(dashboardPath(user.role));
    }
  }, [hydrated, access, user, allow, router]);

  if (!hydrated || !access || !user || !allow.includes(user.role)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-recycle-muted">
        {!hydrated ? "Loading…" : "Checking your session…"}
      </div>
    );
  }

  return <>{children}</>;
}
