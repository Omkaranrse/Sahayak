"use client";

import { useRef } from "react";
import { Printer, X, CheckSquare, ShieldCheck, QrCode } from "lucide-react";
import { MatchResult } from "@/lib/types";
import { Button } from "./ui/button";

interface PassbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  eligibleMatches: MatchResult[];
  profileSnapshot?: Record<string, any> | null;
}

export function CscPassbookModal({
  isOpen,
  onClose,
  profileId,
  eligibleMatches,
  profileSnapshot,
}: PassbookModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const allDocuments = Array.from(
    new Set(eligibleMatches.flatMap((m) => m.scheme.documents))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl border border-outline bg-surface p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Actions bar (hidden in print) */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-soft print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-seal bg-primary-800 text-white font-bold">
              स
            </span>
            <span className="font-display font-bold text-ink">CSC Citizen Application Slip</span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer size={16} /> Print / Save PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 text-ink-soft hover:text-ink rounded-md hover:bg-surface-sunken"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Passbook Slip Body */}
        <div ref={printRef} className="mt-4 p-4 sm:p-6 bg-white text-slate-900 border border-slate-300 rounded-lg">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-7 w-7 flex items-center justify-center rounded-full bg-slate-900 text-white font-bold text-sm">
                  स
                </span>
                <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">
                  Sahayak Civic Eligibility Passbook
                </h1>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Verified Citizen Welfare Pre-Enrollment Slip for Common Service Centres (CSC) & Maha e-Seva Kendras
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p className="font-mono font-bold text-slate-900">ID: {profileId.slice(0, 8).toUpperCase()}</p>
              <p>Issued: {today}</p>
            </div>
          </div>

          {/* Citizen Snapshot */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">State / Domicile</span>
              <span className="font-semibold text-slate-800">{profileSnapshot?.state || "Maharashtra"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Occupation</span>
              <span className="font-semibold text-slate-800 capitalize">{profileSnapshot?.occupation || "Farmer"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Annual Income</span>
              <span className="font-semibold text-slate-800">
                ₹{Number(profileSnapshot?.income || 0).toLocaleString("en-IN")}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Social Category</span>
              <span className="font-semibold text-slate-800 uppercase">{profileSnapshot?.category || "General"}</span>
            </div>
          </div>

          {/* Qualified Schemes Table */}
          <div className="mt-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Verified Qualified Schemes ({eligibleMatches.length})
            </h2>
            <table className="w-full text-left text-xs border border-slate-300 divide-y divide-slate-300">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-2 border-r border-slate-300">Scheme Name</th>
                  <th className="p-2 border-r border-slate-300">Level</th>
                  <th className="p-2 border-r border-slate-300">Entitled Benefit</th>
                  <th className="p-2">Official Portal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {eligibleMatches.map((m) => (
                  <tr key={m.scheme.id}>
                    <td className="p-2 border-r border-slate-200 font-semibold text-slate-900">
                      {m.scheme.name}
                      {m.beneficiary && m.beneficiary !== "You" && (
                        <span className="block text-[10px] text-primary-700">For: {m.beneficiary}</span>
                      )}
                    </td>
                    <td className="p-2 border-r border-slate-200 capitalize">{m.scheme.level}</td>
                    <td className="p-2 border-r border-slate-200 text-slate-800">{m.scheme.benefit}</td>
                    <td className="p-2 font-mono text-[11px] text-blue-700">{m.scheme.portalName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Document Checklist for CSC Operator */}
          <div className="mt-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
              <span>Required Documents Verification Checklist</span>
              <span className="font-normal text-[11px] text-slate-500">(For VLE / Operator Verification)</span>
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {allDocuments.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 border border-dashed border-slate-300 rounded">
                  <div className="h-4 w-4 border-2 border-slate-400 rounded-sm" />
                  <span className="text-slate-800">{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Operator Sign-off & Instructions */}
          <div className="mt-6 pt-4 border-t border-slate-300 flex items-end justify-between text-xs">
            <div className="max-w-md text-slate-500 text-[11px] leading-relaxed">
              <p className="font-semibold text-slate-700 mb-0.5">Instructions for Common Service Centre Operator:</p>
              <p>1. Verify original Aadhaar & verify biometric/OTP e-KYC.</p>
              <p>2. Ensure bank account is active with DBT Aadhaar Seeding for direct cash benefits.</p>
              <p>3. Upload attested documents onto the respective official government portals above.</p>
            </div>

            <div className="text-center w-48 border-t-2 border-slate-800 pt-2 text-xs">
              <p className="font-bold text-slate-900">CSC VLE / Operator Signature</p>
              <p className="text-[10px] text-slate-500">& Center Official Seal</p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-ink-faint print:hidden">
          Tip: Hand this slip along with your document photocopies to your nearest Maha e-Seva Kendra or CSC.
        </p>
      </div>
    </div>
  );
}
