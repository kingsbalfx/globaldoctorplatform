import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../lib/i18n';

const LanguageSelector = ({ className = "" }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(
    SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) || SUPPORTED_LANGUAGES[0]
  );

  useEffect(() => {
    const lang = SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) || SUPPORTED_LANGUAGES[0];
    setCurrentLanguage(lang);

    // Update document direction for RTL languages
    document.documentElement.dir = lang.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang.code;
  }, [i18n.language]);

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language.code);
    setCurrentLanguage(language);
    setIsOpen(false);

    // Store preference
    localStorage.setItem('userLanguagePreference', language.code);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('landing.selectLanguage')}
      >
        <Globe className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {currentLanguage.nativeName}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute z-20 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            role="listbox"
            aria-label={t('landing.chooseLanguage')}
          >
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors ${
                  currentLanguage.code === language.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
                role="option"
                aria-selected={currentLanguage.code === language.code}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-sm text-gray-500">{language.name}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;