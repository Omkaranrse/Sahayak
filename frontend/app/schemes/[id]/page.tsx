"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Landmark, MapPin, Wallet } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { DocumentChecklist } from "@/components/document-checklist";
import { DocumentReadinessChecker } from "@/components/document-readiness-checker";
import { EligibilityBadge } from "@/components/eligibility-badge";
import { getScheme } from "@/lib/api";
import { Scheme } from "@/lib/types";

export default function SchemeDetailPage({ params }: { params: { id: string } }) {
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScheme(params.id)
      .then(setScheme)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-2xl px-5 sm:px-8 py-10 sm:py-14">
        <Link
          href="/results"
          className="inline-flex items-center gap-1.5 text-label text-ink-soft hover:text-ink transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to results
        </Link>

        {loading ? (
          <div className="space-y-3" aria-busy="true">
            <div className="h-8 w-2/3 rounded shimmer" />
            <div className="h-24 w-full rounded shimmer" />
          </div>
        ) : error || !scheme ? (
          <div className="rounded-lg border border-dashed border-outline bg-surface-raised px-6 py-14 text-center">
            <h1 className="text-title-lg text-ink mb-2">Couldn't load this scheme</h1>
            <p className="text-body-md text-ink-soft mb-4">
              Make sure the backend is running, or the scheme ID may be incorrect.
            </p>
            <Link href="/results">
              <Button variant="tonal">Back to results</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-4">
              <EligibilityBadge status="eligible" size="md" />
              <div>
                <p className="text-caption uppercase tracking-wide text-ink-faint mb-1">
                  {scheme.level === "central" ? "Central scheme" : `${scheme.state} state scheme`}
                </p>
                <h1 className="font-display text-headline-lg text-ink">{scheme.name}</h1>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <InfoTile icon={Wallet} label="Benefit" value={scheme.benefit} />
              <InfoTile icon={Landmark} label="Category" value={scheme.category} />
              <InfoTile
                icon={MapPin}
                label="Coverage"
                value={scheme.level === "central" ? "All of India" : scheme.state ?? "—"}
              />
            </div>

            {scheme.explanation && (
              <section className="mt-8">
                <h2 className="text-title-lg text-ink mb-2">Why you qualify</h2>
                <p className="text-body-lg text-ink-soft leading-relaxed">{scheme.explanation}</p>
              </section>
            )}

            <div className="perforation my-8" />

            <section className="space-y-6">
              <DocumentReadinessChecker documents={scheme.documents} />
            </section>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <a href={scheme.portalUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button size="lg" className="w-full">
                  Apply on {scheme.portalName}
                  <ArrowUpRight size={18} />
                </Button>
              </a>
              <Link href="/results" className="flex-1">
                <Button variant="outline" size="lg" className="w-full">
                  Back to all results
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-caption text-ink-faint text-center">
              Sahayak is an independent assistant. Always complete your application on the
              official government portal linked above.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-outline bg-surface-raised p-3.5">
      <Icon size={16} className="text-primary-600 dark:text-primary-400 mb-1.5" />
      <p className="text-caption text-ink-faint">{label}</p>
      <p className="text-body-md text-ink font-medium leading-snug">{value}</p>
    </div>
  );
}
