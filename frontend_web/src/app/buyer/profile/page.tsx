"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/auth/auth-store";
import { Card } from "@/components/ui/Card";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";

export default function BuyerProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [full, setFull] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    void api.get("/auth/me/").then((r) => {
      const u = r.data as { full_name?: string | null; phone_number?: string | null };
      setFull(u.full_name ?? "");
      setPhone(u.phone_number ?? "");
    });
  }, []);

  async function save() {
    const r = await api.patch("/auth/me/", { full_name: full, phone_number: phone || null });
    setUser(r.data as never);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-extrabold">Profile</h1>
      <Card className="mt-6 space-y-4 p-6">
        <AppInput label="Email" value={user?.email ?? ""} disabled />
        <AppInput label="Full name" value={full} onChange={(e) => setFull(e.target.value)} />
        <AppInput label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <AppButton onClick={() => void save()}>Save changes</AppButton>
      </Card>
    </div>
  );
}
