// components/layout/language-selector.tsx
"use client";

import { useState } from "react";
import { useLanguage } from "./language-provider";
import { ChevronDown, Globe } from "lucide-react";

const LANGUAGES: { code: "en" | "kn" | "hi"; label: string; native: string }[] = [
  { code: "en", label: "English", native: "EN" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
];

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span>{current.native}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {open && (
        <>
          {/* click-away layer */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-40 bg-background border border-border rounded-md shadow-lg z-50 py-1">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLanguage(l.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                  l.code === language ? "font-semibold" : ""
                }`}
              >
                {l.native} <span className="text-muted-foreground text-xs ml-1">{l.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}