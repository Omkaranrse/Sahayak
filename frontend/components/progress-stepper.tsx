import { Check } from "lucide-react";
import clsx from "clsx";

interface Step {
  label: string;
}

export function ProgressStepper({
  steps,
  currentStep,
}: {
  steps: Step[];
  currentStep: number;
}) {
  return (
    <div className="w-full">
      {/* Mobile: compact fraction + bar */}
      <div className="flex sm:hidden items-center justify-between mb-2.5">
        <span className="text-label text-ink-soft">
          Step {currentStep + 1} of {steps.length}
        </span>
        <span className="text-label text-primary-700 dark:text-primary-500">{steps[currentStep].label}</span>
      </div>
      <div className="flex sm:hidden h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
        <div
          className="h-full rounded-full bg-primary-700 dark:bg-primary-500 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Desktop: full stepper with labels */}
      <div className="hidden sm:flex items-center">
        {steps.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <div key={step.label} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-label transition-colors",
                    done && "border-primary-700 bg-primary-700 text-white dark:border-primary-500 dark:bg-primary-500 dark:text-primary-900",
                    active && "border-primary-700 bg-primary-100 text-primary-800 dark:border-primary-500 dark:text-primary-800",
                    !done && !active && "border-outline bg-surface text-ink-faint"
                  )}
                >
                  {done ? <Check size={16} strokeWidth={2.5} /> : i + 1}
                </div>
                <span
                  className={clsx(
                    "text-label whitespace-nowrap",
                    active ? "text-ink" : "text-ink-faint"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={clsx(
                    "mx-3 h-[1.5px] flex-1 transition-colors",
                    done ? "bg-primary-700 dark:bg-primary-500" : "bg-outline"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
