'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'kn' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return context;
}

import { translations, TranslationKey } from '@/lib/translations';

export function useTranslation() {
  const { language } = useLanguage();
  const t = (key: TranslationKey) => translations[language][key] ?? translations.en[key];
  return { t, language };
}