"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, ShieldCheck, FileCheck, ArrowRight } from "lucide-react";

interface DocumentReadinessProps {
  documents: string[];
}

export function DocumentReadinessChecker({ documents }: DocumentReadinessProps) {
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [dbtSeeded, setDbtSeeded] = useState(false);
  const [nameMatches, setNameMatches] = useState(false);

  const toggleDoc = (doc: string) => {
    setCheckedDocs((prev) => ({ ...prev, [doc]: !prev[doc] }));
  };

  const totalItems = documents.length + 2; // documents + DBT check + Name match check
  const readyCount =
    Object.values(checkedDocs).filter(Boolean).length +
    (dbtSeeded ? 1 : 0) +
    (nameMatches ? 1 : 0);

  const percentage = Math.round((readyCount / totalItems) * 100);

  return (
    <div className="rounded-xl border border-outline bg-surface p-6 shadow-tonal-1">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <FileCheck size={16} />
            </span>
            <h3 className="font-display text-title-md text-ink">Smart Document Readiness Pre-Check</h3>
          </div>
          <p className="text-body-md text-ink-soft mt-0.5">
            Avoid application rejections at the government portal by verifying key compliance requirements.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xl font-bold font-mono text-primary-700 dark:text-primary-400">
            {percentage}%
          </span>
          <span className="block text-[11px] text-ink-faint">Readiness Score</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full rounded-full bg-surface-sunken overflow-hidden mb-5">
        <div
          className={`h-full transition-all duration-300 ${
            percentage === 100 ? "bg-emerald-600" : percentage >= 50 ? "bg-primary-600" : "bg-amber-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
          1. Required Documents ({documents.length})
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          {documents.map((doc, idx) => {
            const isChecked = !!checkedDocs[doc];
            return (
              <button
                key={idx}
                type="button"
                onClick={() => toggleDoc(doc)}
                className={`flex items-center gap-2.5 p-3 rounded-lg border text-left text-xs transition-colors ${
                  isChecked
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-ink"
                    : "border-outline bg-surface-raised text-ink-soft hover:border-outline-strong"
                }`}
              >
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    isChecked
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-outline-strong bg-surface"
                  }`}
                >
                  {isChecked && <CheckCircle2 size={12} />}
                </div>
                <span className={isChecked ? "font-medium" : ""}>{doc}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-2">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-2">
            2. Critical Portal Compliance Checks
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setDbtSeeded(!dbtSeeded)}
              className={`flex w-full items-start gap-3 p-3 rounded-lg border text-left text-xs transition-colors ${
                dbtSeeded
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                  : "border-amber-400 bg-amber-50/40 dark:bg-amber-950/20"
              }`}
            >
              <div
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  dbtSeeded
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-amber-500 bg-surface"
                }`}
              >
                {dbtSeeded && <CheckCircle2 size={12} />}
              </div>
              <div>
                <span className="font-semibold text-ink block">
                  Bank Account is Aadhaar-Seeded for DBT (Direct Benefit Transfer)
                </span>
                <span className="text-ink-soft text-[11px] block mt-0.5">
                  Over 40% of government cash benefits fail because the bank account is not linked to NPCI Aadhaar mapper. Check status at your bank or post office.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setNameMatches(!nameMatches)}
              className={`flex w-full items-start gap-3 p-3 rounded-lg border text-left text-xs transition-colors ${
                nameMatches
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                  : "border-outline bg-surface-raised"
              }`}
            >
              <div
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  nameMatches
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-outline-strong bg-surface"
                }`}
              >
                {nameMatches && <CheckCircle2 size={12} />}
              </div>
              <div>
                <span className="font-semibold text-ink block">
                  Name Spelling Matches Exactly Across All Documents
                </span>
                <span className="text-ink-soft text-[11px] block mt-0.5">
                  Ensure first and last name order on Aadhaar matches your Bank Passbook and Land 7/12 extract or Ration card.
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
