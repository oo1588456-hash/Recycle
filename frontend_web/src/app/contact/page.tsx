import { PublicShell } from "@/components/layout/PublicShell";
import { Card } from "@/components/ui/Card";

export default function ContactPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-recycle-charcoal">Contact</h1>
        <p className="mt-4 text-lg text-recycle-muted">
          For marketplace support, moderation appeals, or partnership enquiries, reach our team through the channels
          below. Typical response within one UK business day.
        </p>
        <Card className="mt-10 space-y-4 p-8 text-sm">
          <div>
            <p className="font-semibold text-recycle-charcoal">Support email</p>
            <p className="text-recycle-muted">support@recycle-marketplace.example</p>
          </div>
          <div>
            <p className="font-semibold text-recycle-charcoal">Press & partnerships</p>
            <p className="text-recycle-muted">press@recycle-marketplace.example</p>
          </div>
          <div>
            <p className="font-semibold text-recycle-charcoal">Registered office</p>
            <p className="text-recycle-muted">Demo address — replace with your company details.</p>
          </div>
        </Card>
      </div>
    </PublicShell>
  );
}
