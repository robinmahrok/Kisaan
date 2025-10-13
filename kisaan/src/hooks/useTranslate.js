import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const cache = {};

const fetchTranslation = async (text, targetLang) => {
  const cacheKey = `${text}_${targetLang}`;

  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  if (targetLang === "en") {
    return text;
  }

  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
        text
      )}`
    );
    const data = await response.json();
    const translated = data[0][0][0] || text;
    cache[cacheKey] = translated;
    return translated;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
};

export const useTranslate = () => {
  const { i18n } = useTranslation();
  const [translations, setTranslations] = useState({});

  const t = (text) => {
    const lang = i18n.language;

    // If English or already translated, return immediately
    if (lang === "en") return text;
    if (translations[text]) return translations[text];

    // Fetch translation asynchronously
    fetchTranslation(text, lang).then((translated) => {
      setTranslations((prev) => ({ ...prev, [text]: translated }));
    });

    // Return original text while loading
    return text;
  };

  // Clear translations when language changes
  useEffect(() => {
    setTranslations({});
  }, [i18n.language]);

  return { t, language: i18n.language, changeLanguage: i18n.changeLanguage };
};
