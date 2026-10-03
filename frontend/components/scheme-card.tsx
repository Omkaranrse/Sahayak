"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowUpRight, Compass, Sparkles, UserCheck } from "lucide-react";
import clsx from "clsx";
import { MatchResult } from "@/lib/types";
import { EligibilityBadge, EligibilityPill } from "./eligibility-badge";
import { DocumentChecklist } from "./document-checklist";

export function SchemeCard({ match, index }: { match: MatchResult; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const { scheme, status } = match;

  return (
    <div
      className={clsx(
        "group rounded-lg border-[1.5px] bg-surface-raised p-5 sm:p-6 shadow-tonal-1 hover:shadow-tonal-2 transition-shadow animate-rise-in",
        status === "eligible" ? "border-outline" : "border-outline border-dashed"
      )}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <EligibilityBadge status={status} />
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <p className="text-caption uppercase tracking-wide text-ink-faint">
                {scheme.level === "central" ? "Central scheme" : `${scheme.state} state scheme`} · {scheme.category}
              </p>
              {match.beneficiary && match.beneficiary !== "You" && (
                <span className="inline-flex items-center gap-1 rounded bg-primary-100 dark:bg-primary-950 px-2 py-0.5 text-[11px] font-semibold text-primary-800 dark:text-primary-300">
                  <UserCheck size={11} /> {match.beneficiary}
                </span>
              )}
            </div>
            <h3 className="text-title-lg text-ink">{scheme.name}</h3>
          </div>
        </div>
        <EligibilityPill status={status} />
      </div>

      <div className="mt-4 rounded-md bg-surface-sunken px-4 py-3">
        <p className="text-caption uppercase tracking-wide text-ink-faint mb-1">
          {status === "eligible" ? "You'll receive" : "The gap"}
        </p>
        <p className="text-title-md text-ink font-display">
          {status === "eligible" ? scheme.benefit : match.gapReason}
        </p>
      </div>

      {scheme.explanation && (
        <p className="mt-4 text-body-md text-ink-soft leading-relaxed">{scheme.explanation}</p>
      )}

      {/* Bridge the Gap Action for Near Misses */}
      {status === "near-miss" && match.bridgeRecommendation && (
        <div className="mt-4 rounded-lg border border-amber-300 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 p-4 animate-rise-in">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-semibold text-xs uppercase tracking-wider mb-1.5">
            <Compass size={14} className="text-amber-600 dark:text-amber-400" />
            Bridge the Gap: {match.bridgeRecommendation.title}
          </div>
          <p className="text-xs text-ink leading-relaxed">
            {match.bridgeRecommendation.action}
          </p>
          {match.bridgeRecommendation.timeline_months && (
            <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-mono font-medium text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded">
              ⏳ Timeline: ~{Math.round(match.bridgeRecommendation.timeline_months / 12)} years remaining
            </span>
          )}
        </div>
      )}

      {status === "eligible" && (
        <>
          <button
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="mt-4 flex items-center gap-1.5 text-label text-primary-700 dark:text-primary-500 hover:text-primary-800 min-h-[44px]"
          >
            View documents needed
            <ChevronDown
              size={16}
              className={clsx("transition-transform", expanded && "rotate-180")}
            />
          </button>

          {expanded && (
            <div className="mt-3 animate-rise-in">
              <DocumentChecklist documents={scheme.documents} />
            </div>
          )}
        </>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-outline-soft pt-4">
        <Link
          href={`/schemes/${scheme.id}`}
          className="text-label text-ink-soft hover:text-ink transition-colors"
        >
          Full scheme details
        </Link>
        {status === "eligible" && (
          <a
            href={scheme.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-label text-primary-700 dark:text-primary-500 hover:underline"
          >
            Apply on {scheme.portalName}
            <ArrowUpRight size={14} />
          </a>
        )}
      </div>
    </div>
  );
}
