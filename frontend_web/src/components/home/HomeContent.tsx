import Link from "next/link";
import {
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Camera,
  Headphones,
  Gamepad2,
  Shirt,
  Footprints,
  Armchair,
  BookOpen,
  Cable,
  MoreHorizontal,
} from "lucide-react";
import { AppButton } from "@/components/ui/AppButton";
import { Card } from "@/components/ui/Card";
import { ProductCard } from "@/components/product/ProductCard";
import { STORE_CURRENCY } from "@/lib/storeCurrency";
import type { Category, Product } from "@/lib/types";

const iconFor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("phone")) return Smartphone;
  if (n.includes("laptop")) return Laptop;
  if (n.includes("tablet")) return Tablet;
  if (n.includes("watch")) return Watch;
  if (n.includes("camera")) return Camera;
  if (n.includes("headphone")) return Headphones;
  if (n.includes("gaming") || n.includes("console")) return Gamepad2;
  if (n.includes("fashion")) return Shirt;
  if (n.includes("shoe")) return Footprints;
  if (n.includes("furniture")) return Armchair;
  if (n.includes("book")) return BookOpen;
  if (n.includes("accessor")) return Cable;
  return MoreHorizontal;
};

const blurbs: Record<string, string> = {
  "mobile phones": "Certified-style listings for used handsets.",
  laptops: "Work-from-home ready second-hand machines.",
  tablets: "Compact screens for study and travel.",
  watches: "Wearables and timepieces with clear condition notes.",
  cameras: "Capture memories for less.",
  headphones: "Audio gear with honest wear grading.",
  "gaming consoles": "Play more, spend less.",
  fashion: "Circular wardrobe pieces.",
  shoes: "Sneakers and dress shoes, accurately described.",
  furniture: "Homeware with delivery-friendly sizing.",
  books: "Textbooks and reads in good nick.",
  accessories: "Cables, cases, and everyday add-ons.",
  other: "Everything else, responsibly recirculated.",
};

export function HomeContent({
  categories,
  featured,
}: {
  categories: Category[];
  featured: Product[];
}) {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-recycle-mint via-white to-recycle-surface">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-recycle-primary">
              Second-hand shopping, made smarter
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-recycle-charcoal sm:text-5xl text-balance">
              Buy and sell used products with AI-powered fair pricing
            </h1>
            <p className="mt-5 max-w-xl text-lg text-recycle-muted text-balance">
              ReCycle helps sellers price second-hand products fairly using Gemini AI and local market
              baselines — and gives buyers transparent condition scores before they purchase.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products">
                <AppButton size="lg">Start shopping</AppButton>
              </Link>
              <Link href="/register">
                <AppButton variant="outline" size="lg">
                  Register to buy or sell
                </AppButton>
              </Link>
            </div>
          </div>
          <div className="relative">
            <Card className="relative overflow-hidden p-6 shadow-lift">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-recycle-charcoal">Live listing preview</span>
                <span className="rounded-full bg-recycle-mint px-3 py-1 text-xs font-bold text-recycle-primary-dark">
                  AI price range
                </span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-recycle-surface p-4">
                  <p className="text-xs text-recycle-muted">Suggested</p>
                  <p className="text-2xl font-bold text-recycle-charcoal">£420 – £480</p>
                  <p className="mt-2 text-xs text-recycle-muted">Condition score</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-emerald-200">
                      <div className="h-2 w-[78%] rounded-full bg-recycle-primary" />
                    </div>
                    <span className="text-sm font-bold text-recycle-primary">78</span>
                  </div>
                </div>
                <div className="rounded-xl border border-dashed border-recycle-border p-4 text-sm text-recycle-muted">
                  Upload photos, add specs, and ReCycle returns a structured JSON valuation — min, average,
                  and max — plus plain-English warnings if anything looks incomplete.
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-recycle-charcoal">Shop by category</h2>
            <p className="text-recycle-muted">Curated lanes for the products students and families resell most.</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-recycle-primary hover:underline">
            View all products →
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 12).map((c) => {
            const Icon = iconFor(c.name);
            return (
              <Link key={c.id} href={`/products?category=${c.id}`}>
                <Card className="h-full p-5 transition hover:border-recycle-primary/40 hover:shadow-md">
                  <Icon className="h-8 w-8 text-recycle-primary" />
                  <h3 className="mt-4 font-semibold text-recycle-charcoal">{c.name}</h3>
                  <p className="mt-2 text-sm text-recycle-muted">
                    {(c.description && c.description.trim()) ||
                      blurbs[c.name.toLowerCase()] ||
                      "Browse quality-checked listings."}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-recycle-charcoal">Featured picks</h2>
          <p className="mt-1 text-recycle-muted">Freshly published items with clear pricing and seller context.</p>
          {featured.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-recycle-border bg-recycle-surface p-10 text-center text-recycle-muted">
              No active listings yet — seed the backend or publish a seller listing.
            </p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-recycle-charcoal">How AI pricing works</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-recycle-muted">
          Our AI helps sellers price fairly and gives buyers more confidence before purchase.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {[
            { step: "1", title: "Upload photos", body: "Show angles, imperfections, and accessories." },
            { step: "2", title: "Tell the story", body: "Brand, model, age, usage, and declared condition." },
            { step: "3", title: "Gemini analysis", body: `Structured ${STORE_CURRENCY} range with confidence and warnings.` },
            { step: "4", title: "Transparent shop", body: "Buyers read the same AI explanation on the listing." },
          ].map((s) => (
            <Card key={s.step} className="p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-recycle-primary text-lg font-black text-white">
                {s.step}
              </span>
              <h3 className="mt-4 font-semibold text-recycle-charcoal">{s.title}</h3>
              <p className="mt-2 text-sm text-recycle-muted">{s.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-recycle-charcoal py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Why shoppers trust ReCycle</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              "AI-assisted fair pricing with visible explanations",
              "Seller chat built-in — ask before you buy",
              "Superadmin moderation for blocked accounts and listings",
              "Sustainable circulation of phones, laptops, and homeware",
              "Cash on delivery and mock payment flows for coursework demos",
              "Condition scores aligned to seller declarations",
            ].map((t) => (
              <Card key={t} className="border-white/10 bg-white/5 p-5 text-sm text-white/90 shadow-none">
                {t}
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="flex flex-col items-start gap-6 bg-gradient-to-r from-recycle-mint to-white p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-recycle-charcoal">Want to buy or sell pre-owned tech?</h2>
            <p className="mt-2 max-w-xl text-recycle-muted">
              Create one account and choose buyer or seller. Sellers can still shop listings from other sellers; use
              your seller tools when you are ready to list.
            </p>
          </div>
          <Link href="/register">
            <AppButton size="lg">Create account</AppButton>
          </Link>
        </Card>
      </section>
    </>
  );
}
