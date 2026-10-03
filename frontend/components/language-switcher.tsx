"use client";

import { useState, useRef, useEffect } from "react";
import { Languages, Check } from "lucide-react";
import clsx from "clsx";
import { useLanguage, LANGUAGES } from "@/lib/language-context";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = LANGUAGES.find((l) => l.code === language)!;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-11 items-center gap-2 rounded-md border-[1.5px] border-outline bg-surface px-3.5 text-label text-ink hover:bg-surface-sunken transition-colors min-w-[44px]"
      >
        <Languages size={17} strokeWidth={2} className="text-primary-700 dark:text-primary-500" />
        <span>{current.nativeLabel}</span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-md border border-outline bg-surface-raised shadow-tonal-3 animate-rise-in"
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={lang.code === language}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={clsx(
                "flex w-full items-center justify-between px-4 py-3 text-left text-body-md hover:bg-surface-sunken transition-colors min-h-[44px]",
                lang.code === language ? "text-primary-700 dark:text-primary-500 font-semibold" : "text-ink"
              )}
            >
              <span className="flex flex-col">
                <span>{lang.nativeLabel}</span>
                {lang.label !== lang.nativeLabel && (
                  <span className="text-caption text-ink-faint">{lang.label}</span>
                )}
              </span>
              {lang.code === language && <Check size={16} className="text-primary-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
