"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { api } from "@/lib/api/client";
import { STORE_CURRENCY } from "@/lib/storeCurrency";
import { unwrapList } from "@/lib/unwrap";
import type { Category } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppTextarea } from "@/components/ui/AppTextarea";
import { Badge } from "@/components/ui/Badge";

const steps = ["Basics", "Details", "Specs & photos", "AI & publish"];

export function SellerListingWizard({ productId }: { productId?: number }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [cats, setCats] = useState<Category[]>([]);
  const [pid, setPid] = useState<number | null>(productId ?? null);
  const [busy, setBusy] = useState(false);
  const [ai, setAi] = useState<Record<string, unknown> | null>(null);
  const [catsLoading, setCatsLoading] = useState(true);
  const [catsError, setCatsError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState<number | "">("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [loc, setLoc] = useState("");
  const [orig, setOrig] = useState("50000");
  const [age, setAge] = useState("12");
  const [usage, setUsage] = useState("8");
  const [cond, setCond] = useState("good");
  const [storage, setStorage] = useState("");
  const [ram, setRam] = useState("");
  const [battery, setBattery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [customPrice, setCustomPrice] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setCatsLoading(true);
    setCatsError(null);
    try {
      const r = await api.get("/categories/");
      const list = unwrapList<Category>(r.data);
      setCats(list);
      setCatsError(
        list.length === 0
          ? "No categories are available yet. Run database migrations (they seed defaults) or ask a superadmin to install default categories."
          : null
      );
    } catch {
      setCats([]);
      setCatsError(
        "Could not load categories. Check that the API is running and NEXT_PUBLIC_API_URL matches your backend (e.g. http://127.0.0.1:8005/api/v1)."
      );
    } finally {
      setCatsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!productId) return;
    void api.get(`/seller/products/${productId}/`).then((r) => {
      const p = r.data as Record<string, unknown>;
      setTitle(String(p.title ?? ""));
      setDesc(String(p.description ?? ""));
      setCat((p.category as number) ?? "");
      setBrand(String(p.brand ?? ""));
      setModel(String(p.model_name ?? ""));
      setLoc(String(p.location ?? ""));
      setOrig(String(p.original_price ?? ""));
      setAge(String(p.product_age_months ?? ""));
      setUsage(String(p.usage_duration_months ?? ""));
      setCond(String(p.user_declared_condition ?? "good"));
      setStorage(String(p.storage ?? ""));
      setRam(String(p.ram ?? ""));
      setBattery(String(p.battery_health ?? ""));
    });
  }, [productId]);

  async function saveDraft() {
    setBusy(true);
    try {
      const body = {
        title,
        description: desc,
        category: cat,
        brand,
        model_name: model,
        location: loc,
        original_price: orig,
        final_price: orig,
        currency: STORE_CURRENCY,
        product_age_months: Number(age) || 0,
        usage_duration_months: Number(usage) || 0,
        user_declared_condition: cond,
        storage: storage || undefined,
        ram: ram || undefined,
        battery_health: battery || undefined,
        status: "draft",
      };
      if (pid) {
        await api.patch(`/seller/products/${pid}/`, body);
      } else {
        const r = await api.post("/seller/products/", body);
        setPid((r.data as { id: number }).id);
      }
    } finally {
      setBusy(false);
    }
  }

  async function uploadPhoto() {
    if (!pid || !file) return;
    setBusy(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("is_primary", "true");
      // Do not set Content-Type manually: multipart needs a boundary; the browser sets it for FormData.
      await api.post(`/seller/products/${pid}/upload-image/`, fd);
      setFile(null);
    } catch (e: unknown) {
      let msg = "Could not upload image.";
      if (isAxiosError(e)) {
        const data = e.response?.data as { detail?: string; image?: string[] } | undefined;
        if (data && typeof data.detail === "string") msg = data.detail;
        else if (data?.image && Array.isArray(data.image)) msg = data.image.join(" ");
        else if (e.message) msg = e.message;
      } else if (e instanceof Error) {
        msg = e.message;
      }
      setUploadError(msg);
    } finally {
      setBusy(false);
    }
  }

  async function runAi() {
    if (!pid) return;
    setBusy(true);
    try {
      const r = await api.post(`/seller/products/${pid}/analyze-with-ai/`);
      setAi(r.data as Record<string, unknown>);
      setCustomPrice(String((r.data as { suggested_price_avg?: number }).suggested_price_avg ?? ""));
    } finally {
      setBusy(false);
    }
  }

  async function acceptAi() {
    if (!pid) return;
    await api.post(`/seller/products/${pid}/accept-ai-price/`);
  }

  async function publish() {
    if (!pid) return;
    await api.post(`/seller/products/${pid}/publish/`);
    router.push("/seller/products");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">{productId ? "Edit listing" : "Create listing"}</h1>
      <div className="mt-6 flex gap-2">
        {steps.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(i)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              step === i ? "bg-recycle-primary text-white" : "bg-recycle-surface text-recycle-muted"
            }`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {step === 0 && (
        <Card className="mt-6 space-y-4 p-6">
          <AppInput label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <AppTextarea label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Category</label>
            {catsLoading ? (
              <p className="rounded-xl border border-dashed px-3 py-2 text-sm text-recycle-muted">Loading categories…</p>
            ) : (
              <>
                <select
                  value={cat}
                  onChange={(e) => setCat(e.target.value ? Number(e.target.value) : "")}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  disabled={cats.length === 0}
                >
                  <option value="">Select…</option>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {catsError && (
                  <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
                    {catsError}{" "}
                    <button type="button" className="font-semibold underline" onClick={() => void loadCategories()}>
                      Retry
                    </button>
                  </p>
                )}
              </>
            )}
          </div>
          <AppInput label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
          <AppInput label="Model" value={model} onChange={(e) => setModel(e.target.value)} />
          <AppInput label="Location" value={loc} onChange={(e) => setLoc(e.target.value)} />
          <AppButton onClick={() => void saveDraft().then(() => setStep(1))} disabled={busy}>
            Save & continue
          </AppButton>
        </Card>
      )}

      {step === 1 && (
        <Card className="mt-6 space-y-4 p-6">
          <AppInput label={`Original price (${STORE_CURRENCY})`} value={orig} onChange={(e) => setOrig(e.target.value)} />
          <AppInput label="Product age (months)" value={age} onChange={(e) => setAge(e.target.value)} />
          <AppInput label="Usage (months)" value={usage} onChange={(e) => setUsage(e.target.value)} />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Declared condition</label>
            <select value={cond} onChange={(e) => setCond(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm">
              {["excellent", "good", "fair", "poor"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <AppButton onClick={() => void saveDraft().then(() => setStep(2))} disabled={busy}>
            Save & continue
          </AppButton>
        </Card>
      )}

      {step === 2 && (
        <Card className="mt-6 space-y-4 p-6">
          <AppInput label="Storage" value={storage} onChange={(e) => setStorage(e.target.value)} />
          <AppInput label="RAM" value={ram} onChange={(e) => setRam(e.target.value)} />
          <AppInput label="Battery health" value={battery} onChange={(e) => setBattery(e.target.value)} />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Primary photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setUploadError(null);
                setFile(e.target.files?.[0] ?? null);
              }}
            />
          </div>
          {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
          <AppButton onClick={() => void saveDraft()} disabled={busy}>
            Save details
          </AppButton>
          <AppButton variant="outline" disabled={busy || !file || !pid} onClick={() => void uploadPhoto()}>
            Upload image
          </AppButton>
          <AppButton variant="ghost" onClick={() => setStep(3)}>
            Continue to AI
          </AppButton>
        </Card>
      )}

      {step === 3 && (
        <Card className="mt-6 space-y-4 p-6">
          <p className="text-sm text-recycle-muted">
            Analysing your product details with Gemini AI… (falls back locally if the key is not configured.)
          </p>
          <AppButton onClick={() => void runAi()} disabled={busy || !pid}>
            Get AI price suggestion
          </AppButton>
          {ai && (
            <div className="rounded-xl border border-recycle-mint bg-recycle-mint/30 p-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge tone="success">Score {String(ai.condition_score)}</Badge>
                <Badge tone="neutral">{String(ai.condition_label)}</Badge>
              </div>
              <p className="mt-3 font-semibold">
                {STORE_CURRENCY} {String(ai.suggested_price_min)} – {String(ai.suggested_price_avg)} –{" "}
                {String(ai.suggested_price_max)}
              </p>
              <p className="mt-2 text-recycle-muted">{String(ai.explanation ?? "")}</p>
              <AppInput label="Custom final price" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} />
              <div className="mt-4 flex flex-wrap gap-2">
                <AppButton onClick={() => void acceptAi()}>Accept AI average</AppButton>
                <AppButton
                  variant="outline"
                  onClick={() => pid && api.patch(`/seller/products/${pid}/`, { final_price: customPrice })}
                >
                  Save custom price
                </AppButton>
                <AppButton variant="secondary" onClick={() => void publish()}>
                  Publish listing
                </AppButton>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
