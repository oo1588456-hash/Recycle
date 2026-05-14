"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import type { Category, Product } from "@/lib/types";

type PageData = { results: Product[]; count: number; next: string | null };

export function ProductsExplorer({
  categories,
  initial,
  initialQuery,
}: {
  categories: Category[];
  initial: PageData;
  initialQuery: Record<string, string>;
}) {
  const router = useRouter();
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc" | "ai">("newest");

  const sorted = useMemo(() => {
    const list = [...initial.results];
    if (sort === "price_asc") {
      list.sort((a, b) => Number(a.final_price || a.original_price) - Number(b.final_price || b.original_price));
    } else if (sort === "price_desc") {
      list.sort((a, b) => Number(b.final_price || b.original_price) - Number(a.final_price || a.original_price));
    } else if (sort === "ai") {
      list.sort(
        (a, b) => (b.ai_condition_score ?? 0) - (a.ai_condition_score ?? 0)
      );
    } else {
      list.sort(
        (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
      );
    }
    return list;
  }, [initial.results, sort]);

  function applyFilters(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = new URLSearchParams();
    Array.from(fd.entries()).forEach(([k, v]) => {
      if (typeof v === "string" && v.trim()) q.set(k, v.trim());
    });
    router.push(`/products?${q.toString()}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-recycle-charcoal">Marketplace</h1>
        <p className="mt-2 text-recycle-muted">
          Search, filter, and sort pre-owned inventory with the same rigour you would expect from a UK marketplace.
        </p>
      </div>

      <form onSubmit={applyFilters} className="mt-8 grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <AppInput
            name="search"
            label="Search"
            placeholder="iPhone, Dell laptop, desk…"
            defaultValue={initialQuery.search ?? ""}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Category</label>
          <select
            name="category"
            defaultValue={initialQuery.category ?? ""}
            className="w-full rounded-xl border border-recycle-border bg-white px-3 py-2.5 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Min price</label>
            <input
              name="min_price"
              defaultValue={initialQuery.min_price ?? ""}
              className="w-full rounded-xl border border-recycle-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Max price</label>
            <input
              name="max_price"
              defaultValue={initialQuery.max_price ?? ""}
              className="w-full rounded-xl border border-recycle-border px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Condition</label>
          <select
            name="condition"
            defaultValue={initialQuery.condition ?? ""}
            className="w-full rounded-xl border border-recycle-border bg-white px-3 py-2.5 text-sm"
          >
            <option value="">Any</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Brand</label>
          <input
            name="brand"
            defaultValue={initialQuery.brand ?? ""}
            className="w-full rounded-xl border border-recycle-border px-3 py-2 text-sm"
          />
        </div>
        <div className="lg:col-span-2">
          <label className="mb-1.5 block text-sm font-medium">Location</label>
          <input
            name="location"
            defaultValue={initialQuery.location ?? ""}
            className="w-full rounded-xl border border-recycle-border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-end gap-2 lg:col-span-4">
          <AppButton type="submit">Apply filters</AppButton>
          <Link href="/products">
            <AppButton type="button" variant="outline">
              Reset
            </AppButton>
          </Link>
        </div>
      </form>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-recycle-border pb-4">
        <p className="text-sm text-recycle-muted">
          Showing <span className="font-semibold text-recycle-charcoal">{sorted.length}</span> on this page ·{" "}
          {initial.count} total matches
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-recycle-muted">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-xl border border-recycle-border bg-white px-3 py-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="ai">Best AI score</option>
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-recycle-border bg-white p-16 text-center">
          <p className="text-lg font-semibold text-recycle-charcoal">No products found</p>
          <p className="mt-2 text-recycle-muted">
            Try adjusting your filters or search for something else.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
