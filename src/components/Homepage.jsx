import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Homepage() {
  const [locale, setLocale] = useState('en');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = localStorage.getItem("vyoriqLanguage") || browserLang.split('-')[0] || "en";
    setLocale(langCode);
    localStorage.setItem("vyoriqLanguage", langCode);
    i18n.changeLanguage(langCode);
  }, [i18n]);

  const handleLanguageChange = (e) => {
    const langCode = e.target.value;
    setLocale(langCode);
    localStorage.setItem("vyoriqLanguage", langCode);
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 to-blue-600 text-white relative">
      <div className="absolute top-4 right-4">
        <select
          value={locale}
          onChange={handleLanguageChange}
          className="bg-white text-black p-2 rounded shadow"
          aria-label={t('selectLanguage')}
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="bn">বাংলা</option>
          <option value="ar">العربية</option>
          <option value="es">Español</option>
          <option value="kn">ಕನ್ನಡ</option>
        </select>
      </div>

      <img
        src="/assets/edgini-logo.png"
        alt="EdGini Logo"
        className="h-24 w-auto mb-4"
      />

      <p className="text-xl md:text-2xl mb-2">{t('welcome')}</p>
      <p className="text-md md:text-lg mb-8">{t('educationTagline')}</p>

      <button
        onClick={() => navigate('/auth')}
        className="bg-white text-blue-800 px-6 py-3 rounded-full font-semibold shadow hover:bg-gray-100 transition"
      >
        {t('startYourJourney')}
      </button>

      <p className="text-sm mt-4">{t('futureTagline')}</p>
    </div>
  );
}