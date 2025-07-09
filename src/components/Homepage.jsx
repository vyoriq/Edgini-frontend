import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Homepage() {
  const [locale, setLocale] = useState('en');
  const [greeting, setGreeting] = useState('Welcome to Vyoriq');
  const navigate = useNavigate();

  useEffect(() => {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = localStorage.getItem("vyoriqLanguage") || browserLang.split('-')[0] || "en";
    setLocale(langCode);
    localStorage.setItem("vyoriqLanguage", langCode);

    const greetings = {
      en: 'Welcome to Vyoriq',
      hi: 'वायोरिक में आपका स्वागत है',
      bn: 'ভায়োরিকে স্বাগতম',
      ar: 'مرحبًا بك في Vyoriq',
      es: 'Bienvenido a Vyoriq',
      kn: 'ವಯೋರಿಕ್‌ಗೆ ಸ್ವಾಗತ'
    };

    setGreeting(greetings[langCode] || greetings['en']);
  }, []);

  const handleLanguageChange = (e) => {
    const langCode = e.target.value;
    setLocale(langCode);
    localStorage.setItem("vyoriqLanguage", langCode);

    const greetings = {
      en: 'Welcome to Vyoriq',
      hi: 'वायोरिक में आपका स्वागत है',
      bn: 'ভায়োরিকে স্বাগতম',
      ar: 'مرحبًا بك في Vyoriq',
      es: 'Bienvenido a Vyoriq',
      kn: 'ವಯೋರಿಕ್‌ಗೆ ಸ್ವಾಗತ'
    };

    setGreeting(greetings[langCode] || greetings['en']);
  };

const translations = {
  en: {
    button: "Start Your Journey",
    tagline: "Education for Everyone Everywhere",
    subTagline: "Let's build tomorrow, today"
  },
  hi: {
    button: "अपनी यात्रा शुरू करें",
    tagline: "हर किसी के लिए हर जगह शिक्षा",
    subTagline: "आइए हम कल का निर्माण आज करें"
  },
  bn: {
    button: "আপনার যাত্রা শুরু করুন",
    tagline: "সবাইয়ের জন্য সর্বত্র শিক্ষা",
    subTagline: "আসুন আগামীকালকে আজই গড়ে তুলি"
  },
  ar: {
    button: "ابدأ رحلتك",
    tagline: "التعليم للجميع في كل مكان",
    subTagline: "دعونا نبني الغد اليوم"
  },
  es: {
    button: "Comienza tu viaje",
    tagline: "Educación para todos en todas partes",
    subTagline: "Construyamos el mañana, hoy"
  },
  kn: {
    button: "ನಿಮ್ಮ ಪ್ರಯಾಣ ಪ್ರಾರಂಭಿಸಿ",
    tagline: "ಎಲ್ಲರಿಗೂ ಎಲ್ಲೆಲ್ಲಾದರೂ ಶಿಕ್ಷಣ",
    subTagline: "ನಾಳೆ ನಿರ್ಮಿಸಲು ಇಂದು ಪ್ರಾರಂಭಿಸೋಣ"
  }
};


  const t = translations[locale] || translations['en'];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 to-blue-600 text-white relative">
      <div className="absolute top-4 right-4">
        <select
          value={locale}
          onChange={handleLanguageChange}
          className="bg-white text-black p-2 rounded shadow"
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
        src="/assets/vyoriq-logo.png"
        alt="Vyoriq Logo"
        className="h-24 w-auto mb-4"
      />

      <p className="text-xl md:text-2xl mb-2">{greeting}</p>
      <p className="text-md md:text-lg mb-8">{t.tagline}</p>


      <button
        onClick={() => navigate('/auth')}
        className="bg-white text-blue-800 px-6 py-3 rounded-full font-semibold shadow hover:bg-gray-100 transition"
      >
        {t.button}
      </button>

      <p className="text-sm mt-4">{t.subTagline}</p>

    </div>
  );
}
