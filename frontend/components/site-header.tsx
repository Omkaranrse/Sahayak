"use client";

import Link from "next/link";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader({ showCta = true }: { showCta?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-soft bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-seal bg-primary-800 text-white dark:bg-primary-500 dark:text-primary-900 transition-transform group-hover:scale-105">
            <span className="font-display text-title-md font-bold">स</span>
          </span>
          <span className="font-display text-title-lg font-bold text-ink">Sahayak</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
