"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck, Users, Plus, Trash2, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ProgressStepper } from "@/components/progress-stepper";
import { Button } from "@/components/ui/button";
import { SelectField, TextField, ToggleRow } from "@/components/ui/field";
import { VoiceInputButton } from "@/components/voice-input-button";
import { ProfileData, FamilyMember } from "@/lib/types";
import { submitProfile } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

const STATES = [
  "Maharashtra", "Uttar Pradesh", "Bihar", "West Bengal", "Madhya Pradesh",
  "Tamil Nadu", "Rajasthan", "Karnataka", "Gujarat", "Andhra Pradesh",
  "Odisha", "Telangana", "Kerala", "Punjab", "Haryana",
].map((s) => ({ value: s, label: s }));

const initialProfile: ProfileData = {
  age: "",
  gender: "",
  state: "",
  occupation: "",
  income: "",
  category: "",
  disability: false,
  landOwnership: false,
  familyMembers: [],
};

export default function IntakePage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // New family member draft state
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberAge, setNewMemberAge] = useState("");
  const [newMemberGender, setNewMemberGender] = useState<"female" | "male" | "other">("female");
  const [newMemberRelation, setNewMemberRelation] = useState<"daughter" | "son" | "spouse" | "parent" | "other">("daughter");
  const [newMemberDisability, setNewMemberDisability] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);

  const steps = [
    { label: t("step.basic") },
    { label: t("step.economic") },
    { label: t("step.category") },
  ];

  const genderOptions = [
    { value: "female", label: t("intake.gender.female") },
    { value: "male", label: t("intake.gender.male") },
    { value: "other", label: t("intake.gender.other") },
  ];

  const occupationOptions = [
    { value: "farmer", label: t("intake.occ.farmer") },
    { value: "daily_wage", label: t("intake.occ.daily_wage") },
    { value: "self_employed", label: t("intake.occ.self_employed") },
    { value: "salaried", label: t("intake.occ.salaried") },
    { value: "unemployed", label: t("intake.occ.unemployed") },
    { value: "student", label: t("intake.occ.student") },
    { value: "homemaker", label: t("intake.occ.homemaker") },
    { value: "retired", label: t("intake.occ.retired") },
  ];

  const categoryOptions = [
    { value: "general", label: t("intake.cat.general") },
    { value: "obc", label: t("intake.cat.obc") },
    { value: "sc", label: t("intake.cat.sc") },
    { value: "st", label: t("intake.cat.st") },
    { value: "ews", label: t("intake.cat.ews") },
  ];

  const update = (patch: Partial<ProfileData>) => setProfile((p) => ({ ...p, ...patch }));

  const handleVoiceParsed = (parsed: any) => {
    setProfile((prev) => ({
      ...prev,
      age: parsed.age ? String(parsed.age) : prev.age,
      gender: parsed.gender || prev.gender,
      occupation: parsed.occupation || prev.occupation,
      income: parsed.annual_income ? String(parsed.annual_income) : prev.income,
      state: parsed.state || prev.state,
      category: parsed.category || prev.category,
      disability: parsed.disability_status ?? prev.disability,
      landOwnership: parsed.land_ownership ?? prev.landOwnership,
    }));
  };

  const addFamilyMember = () => {
    if (!newMemberAge) return;
    const member: FamilyMember = {
      name: newMemberName.trim() || newMemberRelation.toUpperCase(),
      age: newMemberAge,
      gender: newMemberGender,
      relation: newMemberRelation,
      disability: newMemberDisability,
    };
    update({ familyMembers: [...(profile.familyMembers || []), member] });
    setNewMemberName("");
    setNewMemberAge("");
    setShowMemberForm(false);
  };

  const removeFamilyMember = (index: number) => {
    const list = [...(profile.familyMembers || [])];
    list.splice(index, 1);
    update({ familyMembers: list });
  };

  const validateStep = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!profile.age) e.age = t("intake.err.ageRequired");
      else if (Number(profile.age) < 0 || Number(profile.age) > 120) e.age = t("intake.err.ageValid");
      if (!profile.gender) e.gender = t("intake.err.genderRequired");
      if (!profile.state) e.state = t("intake.err.stateRequired");
    }
    if (step === 1) {
      if (!profile.occupation) e.occupation = t("intake.err.occRequired");
      if (!profile.income) e.income = t("intake.err.incomeRequired");
    }
    if (step === 2) {
      if (!profile.category) e.category = t("intake.err.catRequired");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { profileId } = await submitProfile(profile);
      router.push(`/results?profileId=${profileId}`);
    } catch (err: any) {
      setSubmitError(err.message || t("intake.err.submitFailed"));
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 mx-auto w-full max-w-xl px-5 sm:px-8 py-8 sm:py-12">
        {/* Voice-First Multilingual Bar */}
        <div className="mb-6">
          <VoiceInputButton onParsed={handleVoiceParsed} />
        </div>

        <div className="mb-8">
          <ProgressStepper steps={steps} currentStep={step} />
        </div>

        <div className="rounded-lg border border-outline bg-surface-raised p-6 sm:p-8 shadow-tonal-1 animate-rise-in" key={step}>
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div>
                <h1 className="text-headline-md text-ink">{t("intake.step0.title")}</h1>
                <p className="mt-1 text-body-md text-ink-soft">
                  {t("intake.step0.subtitle")}
                </p>
              </div>
              <TextField
                id="age"
                label={t("intake.age.label")}
                type="number"
                inputMode="numeric"
                placeholder={t("intake.age.placeholder")}
                value={profile.age}
                error={errors.age}
                onChange={(e) => update({ age: e.target.value })}
              />
              <SelectField
                id="gender"
                label={t("intake.gender.label")}
                placeholder={t("intake.gender.placeholder")}
                options={genderOptions}
                value={profile.gender}
                error={errors.gender}
                onChange={(e) => update({ gender: e.target.value })}
              />
              <SelectField
                id="state"
                label={t("intake.state.label")}
                placeholder={t("intake.state.placeholder")}
                options={STATES}
                value={profile.state}
                error={errors.state}
                onChange={(e) => update({ state: e.target.value })}
              />
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <h1 className="text-headline-md text-ink">{t("intake.step1.title")}</h1>
                <p className="mt-1 text-body-md text-ink-soft">
                  {t("intake.step1.subtitle")}
                </p>
              </div>
              <SelectField
                id="occupation"
                label={t("intake.occupation.label")}
                placeholder={t("intake.occupation.placeholder")}
                options={occupationOptions}
                value={profile.occupation}
                error={errors.occupation}
                onChange={(e) => update({ occupation: e.target.value })}
              />
              <TextField
                id="income"
                label={t("intake.income.label")}
                type="number"
                inputMode="numeric"
                placeholder={t("intake.income.placeholder")}
                hint={t("intake.income.hint")}
                value={profile.income}
                error={errors.income}
                onChange={(e) => update({ income: e.target.value })}
              />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <h1 className="text-headline-md text-ink">{t("intake.step2.title")}</h1>
                <p className="mt-1 text-body-md text-ink-soft">
                  {t("intake.step2.subtitle")}
                </p>
              </div>
              <SelectField
                id="category"
                label={t("intake.category.label")}
                placeholder={t("intake.category.placeholder")}
                options={categoryOptions}
                value={profile.category}
                error={errors.category}
                onChange={(e) => update({ category: e.target.value })}
              />
              <ToggleRow
                label={t("intake.disability.label")}
                description={t("intake.disability.desc")}
                checked={profile.disability}
                onChange={(v) => update({ disability: v })}
              />
              <ToggleRow
                label={t("intake.land.label")}
                description={t("intake.land.desc")}
                checked={profile.landOwnership}
                onChange={(v) => update({ landOwnership: v })}
              />

              {/* Household Welfare Maximizer Section */}
              <div className="pt-4 border-t border-outline-soft">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-primary-700 dark:text-primary-400" />
                    <span className="font-semibold text-sm text-ink">
                      {language === "hi"
                        ? "परिवार के सदस्य (Household Maximizer)"
                        : language === "mr"
                        ? "कुटुंबातील सदस्य (Household Maximizer)"
                        : "Family Members (Household Maximizer)"}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    + Unlocks More Schemes
                  </span>
                </div>
                <p className="text-xs text-ink-soft mb-3">
                  {language === "hi"
                    ? "बेटी (सुकन्या समृद्धि) या बुजुर्ग माता-पिता (पेंशन) को जोड़ें ताकि पूरे परिवार के लाभ मिल सकें।"
                    : language === "mr"
                    ? "मुलगी (सुकन्या समृद्धी) किंवा वृद्ध आई-वडील (पेन्शन) जोडा जेणेकरून संपूर्ण कुटुंबाचे लाभ मिळतील."
                    : "Add children (for Sukanya Samriddhi) or senior parents (for Old Age Pension) to maximize family welfare."}
                </p>

                {/* Added Family Members List */}
                {profile.familyMembers && profile.familyMembers.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {profile.familyMembers.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-md border border-outline bg-surface text-xs"
                      >
                        <div>
                          <span className="font-semibold text-ink">{m.name}</span>
                          <span className="text-ink-soft ml-2">
                            ({m.relation.toUpperCase()}, Age: {m.age}, {m.gender})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFamilyMember(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                          aria-label="Remove member"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Member Form / Button */}
                {showMemberForm ? (
                  <div className="rounded-lg border border-primary-300 dark:border-primary-800 bg-surface p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-ink">Relation</label>
                        <select
                          value={newMemberRelation}
                          onChange={(e: any) => setNewMemberRelation(e.target.value)}
                          className="mt-1 h-9 w-full rounded border border-outline bg-surface px-2 text-xs"
                        >
                          <option value="daughter">Daughter (मुलगी / बेटी)</option>
                          <option value="son">Son (मुलगा / बेटा)</option>
                          <option value="spouse">Spouse (पती/पत्नी)</option>
                          <option value="parent">Parent/Grandparent (आई-वडील)</option>
                          <option value="other">Other Dependent</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-ink">Age</label>
                        <input
                          type="number"
                          placeholder="e.g. 7 or 65"
                          value={newMemberAge}
                          onChange={(e) => setNewMemberAge(e.target.value)}
                          className="mt-1 h-9 w-full rounded border border-outline bg-surface px-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-ink">Name (Optional)</label>
                        <input
                          type="text"
                          placeholder="Member name"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          className="mt-1 h-9 w-full rounded border border-outline bg-surface px-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-ink">Gender</label>
                        <select
                          value={newMemberGender}
                          onChange={(e: any) => setNewMemberGender(e.target.value)}
                          className="mt-1 h-9 w-full rounded border border-outline bg-surface px-2 text-xs"
                        >
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setShowMemberForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="button" size="sm" onClick={addFamilyMember}>
                        Save Member
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowMemberForm(true)}
                    className="flex w-full items-center justify-center gap-1.5 py-2.5 rounded-md border border-dashed border-primary-500 text-xs font-semibold text-primary-700 dark:text-primary-400 hover:bg-primary-50/50"
                  >
                    <Plus size={14} /> Add Family Member (Daughter, Parent, etc.)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {submitError && (
          <p className="mt-4 rounded-md bg-amber-100 px-4 py-3 text-body-md text-amber-700">
            {submitError}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="outline" size="lg" onClick={handleBack} disabled={step === 0 || submitting}>
            <ArrowLeft size={18} />
            {t("action.back")}
          </Button>
          <Button size="lg" onClick={handleNext} disabled={submitting}>
            {submitting ? t("action.matching") : step === steps.length - 1 ? t("action.submit") : t("action.next")}
            <ArrowRight size={18} />
          </Button>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-caption text-ink-faint text-center">
          <ShieldCheck size={14} />
          {t("intake.privacy")}
        </p>
      </main>
    </div>
  );
}
