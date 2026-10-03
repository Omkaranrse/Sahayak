"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import clsx from "clsx";

export function DocumentChecklist({ documents }: { documents: string[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (doc: string) => setChecked((c) => ({ ...c, [doc]: !c[doc] }));
  const doneCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <p className="text-label uppercase tracking-wide text-ink-faint">Documents needed</p>
        <p className="font-mono text-caption text-ink-faint">
          {doneCount}/{documents.length} ready
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {documents.map((doc) => {
          const isChecked = !!checked[doc];
          return (
            <li key={doc}>
              <button
                type="button"
                onClick={() => toggle(doc)}
                aria-pressed={isChecked}
                className={clsx(
                  "flex w-full min-h-[48px] items-center gap-3 rounded-md border-[1.5px] px-3.5 py-3 text-left transition-colors",
                  isChecked
                    ? "border-emerald-500 bg-emerald-100/60"
                    : "border-outline bg-surface hover:bg-surface-sunken"
                )}
              >
                <span
                  className={clsx(
                    "flex h-5.5 w-5.5 h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-2 transition-colors",
                    isChecked ? "border-emerald-500 bg-emerald-500" : "border-outline bg-transparent"
                  )}
                >
                  {isChecked && <Check size={13} strokeWidth={3} className="text-white" />}
                </span>
                <span
                  className={clsx(
                    "text-body-md",
                    isChecked ? "text-ink-soft line-through decoration-emerald-500/60" : "text-ink"
                  )}
                >
                  {doc}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
