"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PublicShell } from "@/components/layout/PublicShell";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { api } from "@/lib/api/client";
import { useAuthStore, dashboardPath } from "@/lib/auth/auth-store";
import { loginSchema } from "@/lib/schemas/auth";
import type { User } from "@/lib/types";
import type { z } from "zod";

type Form = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [next, setNext] = useState<string | null>(null);
  useEffect(() => {
    setNext(new URLSearchParams(window.location.search).get("next"));
  }, []);

  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: Form) {
    setApiError(null);
    try {
      const res = await api.post("/auth/login/", data);
      const { access, refresh, user } = res.data as {
        access: string;
        refresh: string;
        user: User;
      };
      setSession(access, refresh, user);
      if (user.role === "seller" && (user.seller_account_status === "pending" || user.seller_account_status === "rejected")) {
        router.replace(next?.startsWith("/seller") ? next : "/seller/pending-approval");
        return;
      }
      router.replace(next || dashboardPath(user.role));
    } catch {
      setApiError("Invalid email or password.");
    }
  }

  return (
    <PublicShell>
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
        <h1 className="text-3xl font-extrabold text-recycle-charcoal">Welcome back</h1>
        <p className="mt-2 text-sm text-recycle-muted">Log in to continue to your ReCycle dashboard.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <AppInput label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <AppInput label="Password" type="password" error={errors.password?.message} {...register("password")} />
          {apiError && <p className="text-sm text-recycle-error">{apiError}</p>}
          <AppButton type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Log in"}
          </AppButton>
        </form>
        <p className="mt-6 text-center text-sm text-recycle-muted">
          New here?{" "}
          <Link href="/register" className="font-semibold text-recycle-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </PublicShell>
  );
}
