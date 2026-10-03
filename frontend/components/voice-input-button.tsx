"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, Sparkles, Loader2 } from "lucide-react";
import { parseVoiceTranscript } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

interface VoiceInputProps {
  onParsed: (data: {
    age?: number | null;
    gender?: string | null;
    occupation?: string | null;
    annual_income?: number | null;
    state?: string | null;
    category?: string | null;
    disability_status?: boolean;
    land_ownership?: boolean;
    extracted_summary?: string;
  }) => void;
}

export function VoiceInputButton({ onParsed }: VoiceInputProps) {
  const { language } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const langCodeMap: Record<string, string> = {
    hi: "hi-IN",
    mr: "mr-IN",
    en: "en-IN",
  };

  const samplePrompts: Record<string, string> = {
    hi: "मैं सतारा महाराष्ट्र का 48 साल का किसान हूँ, 2 एकड़ जमीन है और सालाना 75 हजार कमाता हूँ।",
    mr: "मी सातारा महाराष्ट्रातील ४८ वर्षांचा शेतकरी आहे, शेतजमीन आहे आणि वार्षिक उत्पन्न ७५ हजार आहे.",
    en: "I am a 48 year old farmer from Satara Maharashtra with agricultural land and annual income 75000.",
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Browser doesn't support Web Speech API — use sample demo prompt
      processTranscript(samplePrompts[language] || samplePrompts.hi);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = langCodeMap[language] || "hi-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setStatusMessage(language === "hi" ? "सुन रहे हैं... बोलिए" : language === "mr" ? "ऐकत आहे... बोला" : "Listening... speak now");
      };

      recognition.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(spokenText);
        setIsRecording(false);
        processTranscript(spokenText);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        // Fallback to sample voice prompt
        processTranscript(samplePrompts[language] || samplePrompts.hi);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch {
      setIsRecording(false);
      processTranscript(samplePrompts[language] || samplePrompts.hi);
    }
  };

  const processTranscript = async (textToProcess: string) => {
    setLoading(true);
    setTranscript(textToProcess);
    setStatusMessage(language === "hi" ? "एआई प्रोफाइल बना रहा है..." : language === "mr" ? "एआय माहिती जुळवत आहे..." : "Parsing profile details...");

    try {
      const parsed = await parseVoiceTranscript(textToProcess, language);
      onParsed(parsed);
      setStatusMessage(parsed.extracted_summary || "Details filled successfully!");
    } catch (err) {
      setStatusMessage("Could not parse speech. Please fill in details manually.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border-[1.5px] border-primary-300 dark:border-primary-800 bg-primary-50/60 dark:bg-primary-950/40 p-4 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={startVoiceInput}
            disabled={loading}
            className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition-all shadow-md ${
              isRecording
                ? "bg-red-600 animate-pulse ring-4 ring-red-200"
                : "bg-primary-700 hover:bg-primary-800 hover:scale-105"
            }`}
            aria-label="Speak your details"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : isRecording ? (
              <MicOff size={20} />
            ) : (
              <Mic size={20} />
            )}
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-ink text-title-md">
                {language === "hi"
                  ? "बोलकर फॉर्म भरें"
                  : language === "mr"
                  ? "बोलून फॉर्म भरा"
                  : "Voice-First Auto Fill"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 dark:bg-primary-900 px-2 py-0.5 text-caption font-medium text-primary-800 dark:text-primary-300">
                <Sparkles size={11} /> AI Voice
              </span>
            </div>
            <p className="text-caption text-ink-soft">
              {language === "hi"
                ? "माइक दबाएं और अपनी उम्र, पेशा, राज्य व आय बोलें"
                : language === "mr"
                ? "माइक दाबा आणि आपले वय, व्यवसाय, राज्य व उत्पन्न सांगा"
                : "Tap the mic and speak your age, state, job & income"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => processTranscript(samplePrompts[language] || samplePrompts.hi)}
          disabled={loading || isRecording}
          className="text-xs text-primary-700 dark:text-primary-400 hover:underline text-left sm:text-right font-medium"
        >
          {language === "hi"
            ? "उदाहरण वॉइस से भरें (Demo Click) →"
            : language === "mr"
            ? "नमुना आवाजाने भरा (Demo Click) →"
            : "Try with Sample Voice (Demo) →"}
        </button>
      </div>

      {(statusMessage || transcript) && (
        <div className="mt-3 rounded-md bg-surface p-2.5 text-xs text-ink-soft border border-outline-soft flex items-center justify-between gap-2">
          <span className="italic truncate">"{transcript || statusMessage}"</span>
          {loading && <span className="font-semibold text-primary-700 animate-pulse">Extracting…</span>}
        </div>
      )}
    </div>
  );
}
