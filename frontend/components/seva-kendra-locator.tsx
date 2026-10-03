"use client";

import { useState, useEffect } from "react";
import { MapPin, Phone, ExternalLink, Search, Building2, CheckCircle2 } from "lucide-react";
import { getSevaKendras } from "@/lib/api";
import { SevaKendra } from "@/lib/types";
import { Button } from "./ui/button";

export function SevaKendraLocator() {
  const [kendras, setKendras] = useState<SevaKendra[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchKendras = async (query?: string) => {
    setLoading(true);
    try {
      const data = await getSevaKendras(query);
      setKendras(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKendras();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchKendras(searchQuery);
  };

  return (
    <div className="rounded-xl border border-outline bg-surface-raised p-6 shadow-tonal-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-100 text-primary-800 dark:text-primary-300">
              <MapPin size={16} />
            </span>
            <h3 className="font-display text-title-lg text-ink">Find Nearest Seva Kendra (CSC)</h3>
          </div>
          <p className="text-body-md text-ink-soft mt-1">
            Locate verified Common Service Centres & Maha e-Seva Kendras near you to submit physical documents and biometric e-KYC.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Enter PIN code or City (e.g. 415001)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-md border border-outline bg-surface px-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button type="submit" size="sm" disabled={loading}>
            <Search size={14} /> Search
          </Button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kendras.map((k) => (
          <div
            key={k.id}
            className="flex flex-col justify-between rounded-lg border border-outline bg-surface p-4 hover:border-primary-500 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 rounded bg-primary-100 dark:bg-primary-900/60 px-2 py-0.5 text-[11px] font-semibold text-primary-800 dark:text-primary-300">
                  <Building2 size={12} />
                  {k.center_type}
                </span>
                <span className="text-xs font-mono text-ink-faint">{k.pincode}</span>
              </div>

              <h4 className="font-semibold text-ink text-sm leading-snug">{k.name}</h4>
              <p className="text-xs text-ink-soft mt-1.5 line-clamp-2">{k.address}</p>

              {k.services.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {k.services.slice(0, 3).map((srv, i) => (
                    <span key={i} className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                      <CheckCircle2 size={10} /> {srv}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-outline-soft flex items-center justify-between text-xs">
              {k.phone ? (
                <a href={`tel:${k.phone}`} className="flex items-center gap-1 text-ink-soft hover:text-ink">
                  <Phone size={12} /> {k.phone}
                </a>
              ) : (
                <span className="text-ink-faint">Open Mon-Sat</span>
              )}

              <a
                href={k.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary-700 dark:text-primary-400 hover:underline font-medium"
              >
                Directions <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
