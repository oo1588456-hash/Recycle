"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PublicShell } from "@/components/layout/PublicShell";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { api } from "@/lib/api/client";
import { useAuthStore, dashboardPath } from "@/lib/auth/auth-store";
import { registerSchema } from "@/lib/schemas/auth";
import type { User } from "@/lib/types";
import type { z } from "zod";

type Form = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(registerSchema), defaultValues: { role: "buyer" } });

  async function onSubmit(data: Form) {
    setApiError(null);
    try {
      await api.post("/auth/register/", {
        email: data.email,
        username: data.username,
        full_name: "",
        password: data.password,
        role: data.role,
        phone_number: data.phone_number || undefined,
      });
      const login = await api.post("/auth/login/", { email: data.email, password: data.password });
      const { access, refresh, user } = login.data as {
        access: string;
        refresh: string;
        user: User;
      };
      setSession(access, refresh, user);
      if (
        user.role === "seller" &&
        (user.seller_account_status === "pending" || user.seller_account_status === "rejected")
      ) {
        router.replace("/seller/pending-approval");
        return;
      }
      router.replace(dashboardPath(user.role));
    } catch {
      setApiError("Registration failed. Email or username may already exist.");
    }
  }

  return (
    <PublicShell>
      <div className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-3xl font-extrabold text-recycle-charcoal">Create your account</h1>
        <p className="mt-2 text-sm text-recycle-muted">
          Join as a buyer or seller. New seller accounts stay pending until a super admin approves them. Superadmin
          accounts are not available here.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <AppInput label="Username" {...register("username")} error={errors.username?.message} />
          <AppInput label="Email" type="email" {...register("email")} error={errors.email?.message} />
          <AppInput label="Phone (optional)" {...register("phone_number")} />
          <div>
            <label className="mb-1.5 block text-sm font-medium">I want to</label>
            <select
              {...register("role")}
              className="w-full rounded-xl border border-recycle-border bg-white px-3 py-2.5 text-sm"
            >
              <option value="buyer">Buy pre-owned items</option>
              <option value="seller">Sell my items</option>
            </select>
          </div>
          <AppInput label="Password" type="password" {...register("password")} error={errors.password?.message} />
          <AppInput label="Confirm password" type="password" {...register("confirm")} error={errors.confirm?.message} />
          {apiError && <p className="text-sm text-recycle-error">{apiError}</p>}
          <AppButton type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Register"}
          </AppButton>
        </form>
        <p className="mt-6 text-center text-sm text-recycle-muted">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-recycle-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </PublicShell>
  );
}
