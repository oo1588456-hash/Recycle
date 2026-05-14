import { PublicShell } from "@/components/layout/PublicShell";
import { Card } from "@/components/ui/Card";
import { Upload, SlidersHorizontal, Sparkles, ShieldCheck } from "lucide-react";

const steps = [
  {
    title: "List with photos and details",
    body: "Upload clear images, choose your category, and describe wear honestly. Accurate listings get better AI suggestions.",
    icon: Upload,
  },
  {
    title: "Tell us the story of the item",
    body: "Age, original price, accessories, and declared condition help our models anchor a fair resale band.",
    icon: SlidersHorizontal,
  },
  {
    title: "Review AI-assisted pricing",
    body: "You receive a suggested range, confidence, and plain-English rationale. You remain in control — accept, tweak, or ignore.",
    icon: Sparkles,
  },
  {
    title: "Buyers shop with clarity",
    body: "Condition scores, seller chat, and admin oversight create a more trustworthy second-hand experience.",
    icon: ShieldCheck,
  },
];

export default function HowItWorksPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-recycle-charcoal">How AI pricing works</h1>
        <p className="mt-4 max-w-2xl text-lg text-recycle-muted">
          ReCycle never exposes model keys in the browser. Your listing data is sent securely to our Django API,
          analysed server-side, and returned as structured guidance you can accept or override.
        </p>
        <ol className="mt-12 space-y-6">
          {steps.map((s, i) => (
            <li key={s.title}>
              <Card className="flex gap-4 p-6 sm:gap-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-recycle-mint text-recycle-primary-dark">
                  <s.icon className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-recycle-primary">Step {i + 1}</p>
                  <h2 className="mt-1 text-xl font-bold text-recycle-charcoal">{s.title}</h2>
                  <p className="mt-2 text-sm text-recycle-muted">{s.body}</p>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </PublicShell>
  );
}
