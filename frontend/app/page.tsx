"use client";

import Link from "next/link";
import { ArrowRight, FileCheck2, Languages, ShieldCheck, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { EligibilityBadge } from "@/components/eligibility-badge";
import { DocumentChecklist } from "@/components/document-checklist";
import { useLanguage } from "@/lib/language-context";

export default function LandingPage() {
  const { t } = useLanguage();

  const stats = [
    { value: "500+", label: t("stat.schemes") },
    { value: "10+", label: t("stat.languages") },
    { value: "2 min", label: t("stat.minutes") },
  ];

  const steps = [
    {
      number: "01",
      title: t("intake.step0.title"),
      body: t("intake.step0.subtitle"),
      icon: FileCheck2,
    },
    {
      number: "02",
      title: t("intake.step1.title"),
      body: t("intake.step1.subtitle"),
      icon: ShieldCheck,
    },
    {
      number: "03",
      title: t("intake.step2.title"),
      body: t("hero.subtitle"),
      icon: Languages,
    },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] h-[480px] w-[480px] rounded-full bg-primary-100 blur-3xl opacity-60 dark:opacity-20"
        />
        <div className="relative mx-auto max-w-3xl px-5 sm:px-8 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-surface px-3.5 py-1.5 text-label text-ink-soft animate-rise-in">
            <Sparkles size={14} className="text-primary-600 dark:text-primary-400" />
            {t("hero.eyebrow")}
          </span>

          <h1
            className="mt-5 font-display text-display-md sm:text-display-lg text-ink animate-rise-in"
            style={{ animationDelay: "80ms" }}
          >
            {t("hero.title")}
          </h1>

          <p
            className="mx-auto mt-5 max-w-xl text-body-lg text-ink-soft animate-rise-in"
            style={{ animationDelay: "160ms" }}
          >
            {t("hero.subtitle")}
          </p>

          <div
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-rise-in"
            style={{ animationDelay: "240ms" }}
          >
            <Link href="/intake">
              <Button size="lg" className="w-full sm:w-auto">
                {t("hero.cta")}
                <ArrowRight size={18} />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="text" size="lg" className="w-full sm:w-auto">
                {t("hero.ctaSecondary")}
              </Button>
            </a>
          </div>
        </div>

        {/* Trust strip */}
        <div className="relative border-y border-outline-soft bg-surface/60">
          <div className="mx-auto grid max-w-3xl grid-cols-3 divide-x divide-outline-soft px-5 sm:px-8">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5 py-6 text-center">
                <span className="font-mono text-headline-md sm:text-headline-lg text-primary-800 dark:text-primary-400">
                  {s.value}
                </span>
                <span className="text-caption text-ink-faint">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="perforation mx-5 sm:mx-8" />

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-5xl px-5 sm:px-8 py-16 sm:py-24">
        <div className="max-w-xl">
          <p className="text-label uppercase tracking-wide text-primary-700 dark:text-primary-500">
            How it works
          </p>
          <h2 className="mt-2 font-display text-headline-lg text-ink">
            Three steps between you and knowing what you're owed.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative flex flex-col gap-4 rounded-lg border border-outline bg-surface-raised p-6 shadow-tonal-1"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-100 text-primary-800 dark:text-primary-800">
                  <step.icon size={20} strokeWidth={2} />
                </span>
                <span className="font-mono text-caption text-ink-faint">{step.number}</span>
              </div>
              <h3 className="text-title-lg text-ink">{step.title}</h3>
              <p className="text-body-md text-ink-soft leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="perforation mx-5 sm:mx-8" />

      {/* Preview */}
      <section className="mx-auto max-w-5xl px-5 sm:px-8 py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-label uppercase tracking-wide text-primary-700 dark:text-primary-500">
              What you'll see
            </p>
            <h2 className="mt-2 font-display text-headline-lg text-ink">
              Not a list of links. An actual answer.
            </h2>
            <p className="mt-4 text-body-lg text-ink-soft leading-relaxed">
              Every match comes with the reason you qualify, what you'll receive, and a
              checklist of documents to gather before you apply — so the next step is always
              obvious.
            </p>
            <Link href="/intake" className="mt-6 inline-block">
              <Button size="lg">
                {t("hero.cta")}
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>

          {/* Static preview card */}
          <div className="rounded-lg border border-outline bg-surface-raised p-6 shadow-tonal-2 animate-rise-in">
            <div className="flex items-start gap-3.5">
              <EligibilityBadge status="eligible" />
              <div>
                <p className="text-caption uppercase tracking-wide text-ink-faint mb-0.5">
                  Central scheme · Agriculture
                </p>
                <h3 className="text-title-lg text-ink">PM-KISAN</h3>
              </div>
            </div>
            <div className="mt-4 rounded-md bg-surface-sunken px-4 py-3">
              <p className="text-caption uppercase tracking-wide text-ink-faint mb-1">
                You'll receive
              </p>
              <p className="text-title-md text-ink font-display">
                ₹6,000 per year, paid in 3 installments
              </p>
            </div>
            <p className="mt-4 text-body-md text-ink-soft leading-relaxed">
              Because you're a landholding farmer, you qualify for direct income support paid
              straight into your bank account.
            </p>
            <div className="mt-4">
              <DocumentChecklist documents={["Aadhaar card", "Land ownership records", "Bank passbook"]} />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-outline-soft">
        <div className="mx-auto flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-8 py-8 text-caption text-ink-faint">
          <span>Sahayak · An independent eligibility assistant, not a government portal.</span>
          <span>Built to help you navigate, not to replace official sources.</span>
        </div>
      </footer>
    </div>
  );
}
