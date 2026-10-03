"use client";

import { useState } from "react";
import { Check, CheckCircle2, PlayCircle, ExternalLink, HelpCircle, FileText, ArrowRight } from "lucide-react";
import clsx from "clsx";

interface ApplicationGuideProps {
  schemeName: string;
  portalUrl: string;
  portalName: string;
  steps?: string[];
  youtubeVideoId?: string;
  videoTitle?: string;
}

export function SchemeApplicationGuide({
  schemeName,
  portalUrl,
  portalName,
  steps = [],
  youtubeVideoId,
  videoTitle,
}: ApplicationGuideProps) {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 1. How to Fill the Form & Apply Section */}
      <div className="rounded-xl border border-outline bg-surface p-6 shadow-tonal-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300">
                <FileText size={16} />
              </span>
              <h3 className="font-display text-title-lg text-ink">How to Fill the Form & Apply</h3>
            </div>
            <p className="text-body-md text-ink-soft mt-1">
              Step-by-step walkthrough to successfully complete your application on {portalName}.
            </p>
          </div>

          {steps.length > 0 && (
            <div className="text-left sm:text-right shrink-0">
              <span className="text-sm font-mono font-bold text-primary-700 dark:text-primary-400">
                {completedCount} of {steps.length} steps completed
              </span>
              <div className="h-1.5 w-32 rounded-full bg-surface-sunken overflow-hidden mt-1">
                <div
                  className="h-full bg-primary-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Steps List */}
        <div className="space-y-3 mt-5">
          {steps.map((step, idx) => {
            const isDone = !!completedSteps[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleStep(idx)}
                className={clsx(
                  "flex items-start gap-3.5 p-3.5 rounded-lg border cursor-pointer transition-all duration-150 select-none",
                  isDone
                    ? "border-emerald-300 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30 text-ink-soft"
                    : "border-outline bg-surface-raised hover:border-primary-300 text-ink"
                )}
              >
                <div
                  className={clsx(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors mt-0.5",
                    isDone
                      ? "bg-emerald-600 text-white"
                      : "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                  )}
                >
                  {isDone ? <Check size={13} strokeWidth={3} /> : idx + 1}
                </div>
                <div className="flex-1">
                  <p className={clsx("text-body-md leading-relaxed", isDone && "line-through opacity-85")}>
                    {step}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-4 border-t border-outline-soft flex items-center justify-between">
          <span className="text-xs text-ink-faint flex items-center gap-1">
            <HelpCircle size={14} /> Tap any step to mark as completed
          </span>
          <a
            href={portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 dark:text-primary-400 hover:underline"
          >
            Open {portalName} <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* 2. Official Video Tutorial Section (if video exists) */}
      {youtubeVideoId && (
        <div className="rounded-xl border border-outline bg-surface p-6 shadow-tonal-1">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                <PlayCircle size={17} />
              </span>
              <div>
                <h3 className="font-display text-title-md text-ink">Video Tutorial: Step-by-Step Guide</h3>
                <p className="text-caption text-ink-soft">
                  {videoTitle || `Watch how to apply for ${schemeName}`}
                </p>
              </div>
            </div>

            <a
              href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 hover:underline"
            >
              Watch on YouTube <ExternalLink size={12} />
            </a>
          </div>

          {/* Embedded YouTube Player */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-outline bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`}
              title={videoTitle || `Tutorial: ${schemeName}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>

          <div className="mt-3 flex items-center justify-between sm:hidden">
            <a
              href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 hover:underline"
            >
              Watch on YouTube <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
