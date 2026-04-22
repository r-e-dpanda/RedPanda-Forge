import React, { createContext, useContext, useState, ReactNode } from 'react';
import { strings as enStrings, LocaleStrings } from '../locales/en';
import { strings as viStrings } from '../locales/vi';

type Language = 'en' | 'vi'; 

interface I18nContextType {
  t: LocaleStrings;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Dynamic mapping based on language state
  const t = language === 'vi' ? viStrings : enStrings;

  return (
    <I18nContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
