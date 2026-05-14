import { PublicShell } from "@/components/layout/PublicShell";
import { Card } from "@/components/ui/Card";

export default function AboutPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-recycle-charcoal">About ReCycle</h1>
        <p className="mt-4 text-lg text-recycle-muted">
          ReCycle is an AI-assisted second-hand marketplace built for UK buyers and sellers who want transparent
          pricing, clearer condition signals, and a calmer shopping experience than typical classifieds.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-recycle-charcoal">Our mission</h2>
            <p className="mt-2 text-sm text-recycle-muted">
              Extend the life of quality goods, reduce e-waste, and help people trade with confidence through fair
              resale estimates and human moderation.
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-bold text-recycle-charcoal">Who we serve</h2>
            <p className="mt-2 text-sm text-recycle-muted">
              Buyers looking for vetted listings, sellers who want help pricing phones and laptops fairly, and
              administrators who keep the marketplace safe and consistent.
            </p>
          </Card>
        </div>
      </div>
    </PublicShell>
  );
}
