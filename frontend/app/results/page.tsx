"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Printer,
  Share2,
  Sparkles,
  Users,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SchemeCard } from "@/components/scheme-card";
import { Button } from "@/components/ui/button";
import { CscPassbookModal } from "@/components/csc-passbook-modal";
import { SevaKendraLocator } from "@/components/seva-kendra-locator";
import { getMatches } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";
import { MatchResult, HouseholdSummary } from "@/lib/types";

function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="rounded-lg border border-outline bg-surface-raised p-6 animate-rise-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3.5">
        <div className="h-11 w-11 shrink-0 rounded-seal shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 rounded shimmer" />
          <div className="h-4 w-44 rounded shimmer" />
        </div>
      </div>
      <div className="mt-4 h-14 rounded-md shimmer" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded shimmer" />
        <div className="h-3 w-4/5 rounded shimmer" />
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsFallback />}>
      <ResultsContent />
    </Suspense>
  );
}

function ResultsFallback() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-3xl px-5 sm:px-8 py-10 sm:py-14">
        <div className="flex flex-col gap-4">
          <SkeletonCard delay={0} />
          <SkeletonCard delay={90} />
          <SkeletonCard delay={180} />
        </div>
      </main>
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const profileId = searchParams.get("profileId");
  const { language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eligible, setEligible] = useState<MatchResult[]>([]);
  const [nearMisses, setNearMisses] = useState<MatchResult[]>([]);
  const [householdSummary, setHouseholdSummary] = useState<HouseholdSummary | null>(null);
  const [profileSnapshot, setProfileSnapshot] = useState<Record<string, any> | null>(null);
  const [isPassbookOpen, setIsPassbookOpen] = useState(false);

  useEffect(() => {
    if (!profileId) {
      setError("No profile found. Start by answering a few questions.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getMatches(profileId, language)
      .then(({ eligible, nearMisses, householdSummary, profileSnapshot }) => {
        setEligible(eligible);
        setNearMisses(nearMisses);
        setHouseholdSummary(householdSummary ?? null);
        setProfileSnapshot(profileSnapshot ?? null);
      })
      .catch(() => {
        setError("Couldn't reach the matching service. Make sure the backend is running.");
      })
      .finally(() => setLoading(false));
  }, [profileId, language]);

  const handleWhatsAppShare = () => {
    const schemeLines = eligible
      .map(
        (m) =>
          `• ${m.scheme.name} (${m.scheme.benefit})${
            m.beneficiary ? ` - For: ${m.beneficiary}` : ""
          }`
      )
      .join("\n");

    const allDocs = Array.from(new Set(eligible.flatMap((m) => m.scheme.documents))).slice(0, 8);
    const docLines = allDocs.map((d) => `▫️ ${d}`).join("\n");

    const benefitText =
      householdSummary && householdSummary.total_benefit_value_annual > 0
        ? `💰 *Total Household Benefit:* ${householdSummary.total_benefit_value_display}\n\n`
        : "";

    const text = `🇮🇳 *Sahayak Citizen Welfare Card*
━━━━━━━━━━━━━━━━━━━━
${benefitText}✅ *Qualified Schemes (${eligible.length}):*
${schemeLines}

📋 *Documents to Bring to Seva Kendra / CSC:*
${docLines}

📍 Locate nearest CSC / Maha e-Seva Kendra:
https://sahayak.gov.in/results?profileId=${profileId ?? ""}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const beneficiaryNames = householdSummary
    ? Object.keys(householdSummary.breakdown_by_member)
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-3xl px-5 sm:px-8 py-10 sm:py-14 space-y-8">
        {/* Header and Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-label uppercase tracking-wide text-primary-700 dark:text-primary-500">
              Your results
            </p>
            <h1 className="mt-1 font-display text-headline-lg text-ink">
              {loading
                ? "Matching your profile\u2026"
                : error
                ? "We hit a snag"
                : `${eligible.length} schemes you qualify for`}
            </h1>
          </div>

          {!loading && !error && eligible.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsPassbookOpen(true)}
                className="gap-1.5 border-primary-300 dark:border-primary-800 text-primary-800 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-950"
              >
                <Printer size={16} />
                CSC Slip (PDF)
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={handleWhatsAppShare}
                className="gap-1.5 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              >
                <Share2 size={16} />
                WhatsApp
              </Button>
              <Link href="/intake">
                <Button variant="ghost" size="md">
                  <RotateCcw size={16} />
                  Edit
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Household Welfare Maximizer Hero Banner */}
        {!loading && !error && householdSummary && householdSummary.total_benefit_value_annual > 0 && (
          <div className="relative overflow-hidden rounded-2xl border border-primary-200 dark:border-primary-900 bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 text-white p-6 sm:p-8 shadow-xl">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-2">
                <Sparkles size={16} />
                <span>Household Welfare Maximizer</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold leading-tight">
                Your family qualifies for up to{" "}
                <span className="text-amber-300 font-mono underline decoration-amber-400/60 decoration-wavy">
                  {householdSummary.total_benefit_value_display}
                </span>{" "}
                in combined welfare this year.
              </h2>
              <p className="mt-2 text-sm sm:text-base text-primary-100 max-w-xl">
                Across healthcare, direct DBT income support, and education savings for{" "}
                <span className="font-semibold text-white">
                  {beneficiaryNames.length} family member
                  {beneficiaryNames.length > 1 ? "s" : ""}
                </span>
                .
              </p>

              {/* Family members tag pills */}
              {beneficiaryNames.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-primary-200 flex items-center gap-1 mr-1">
                    <Users size={14} /> Beneficiaries:
                  </span>
                  {beneficiaryNames.map((member, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/15 text-white backdrop-blur-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {member}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-4" aria-live="polite" aria-busy="true">
            <span className="sr-only">Matching your profile against verified scheme rules</span>
            <SkeletonCard delay={0} />
            <SkeletonCard delay={90} />
            <SkeletonCard delay={180} />
          </div>
        ) : error ? (
          <ErrorState message={error} />
        ) : eligible.length === 0 && nearMisses.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-10">
            {eligible.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <h2 className="text-title-lg text-ink">You're eligible</h2>
                  </div>
                  <span className="text-xs font-medium text-ink-faint">
                    {eligible.length} scheme{eligible.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {eligible.map((m, i) => (
                    <SchemeCard key={m.scheme.id} match={m} index={i} />
                  ))}
                </div>
              </section>
            )}

            {nearMisses.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-amber-600" />
                    <h2 className="text-title-lg text-ink">Almost there (Near-Misses)</h2>
                  </div>
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Actionable advice included
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {nearMisses.map((m, i) => (
                    <SchemeCard key={m.scheme.id} match={m} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* Offline Seva Kendra / CSC Locator */}
            <div className="perforation my-4" />
            <section>
              <SevaKendraLocator />
            </section>
          </div>
        )}

        {/* 1-Click CSC Passbook Slip Modal */}
        {profileId && (
          <CscPassbookModal
            isOpen={isPassbookOpen}
            onClose={() => setIsPassbookOpen(false)}
            profileId={profileId}
            eligibleMatches={eligible}
            profileSnapshot={profileSnapshot}
          />
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-outline bg-surface-raised px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-seal bg-primary-100 text-primary-700">
        <Clock size={22} />
      </span>
      <h2 className="text-title-lg text-ink">No matches yet on the schemes we track</h2>
      <p className="max-w-sm text-body-md text-ink-soft">
        We're steadily adding more schemes and states. Try adjusting your answers, or check back
        as our coverage grows.
      </p>
      <Link href="/intake" className="mt-2">
        <Button variant="tonal">Edit my answers</Button>
      </Link>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-amber-500 bg-amber-100/40 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-seal bg-amber-100 text-amber-600">
        <AlertTriangle size={22} />
      </span>
      <h2 className="text-title-lg text-ink">{message}</h2>
      <Link href="/intake" className="mt-2">
        <Button variant="tonal">Go to the intake form</Button>
      </Link>
    </div>
  );
}
