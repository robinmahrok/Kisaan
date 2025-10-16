import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Translation cache in memory
const translationCache = {};

// Google Translate API function
const translateText = async (text, targetLang) => {
  const cacheKey = `${text}_${targetLang}`;

  // Return from cache if exists
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  // If English, no translation needed
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

    // Cache the result
    translationCache[cacheKey] = translated;
    return translated;
  } catch (error) {
    console.error("Translation failed:", error);
    return text;
  }
};

// Batch translate multiple texts at once
const batchTranslate = async (texts, targetLang) => {
  const promises = texts.map((text) => translateText(text, targetLang));
  return await Promise.all(promises);
};

// Pre-translate common phrases when language changes
const preTranslateCommonPhrases = async (lang) => {
  if (lang === "en") return;

  const commonPhrases = [
    "Home",
    "My Items",
    "Requests",
    "About Us",
    "Contact Us",
    "Log Out",
    "Uniting farmers, nurturing growth.",
    "Kisaan. Made with",
    "for farmers",
    "Welcome",
    "Loading...",
    "Error",
    "Success",
  ];

  const translations = await batchTranslate(commonPhrases, lang);

  commonPhrases.forEach((phrase, index) => {
    i18n.addResource(lang, "translation", phrase, translations[index]);
  });
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "hi", "pa", "bn", "ta", "te", "mr", "gu"],

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },

    resources: {
      en: { translation: {} },
      hi: { translation: {} },
      pa: { translation: {} },
      bn: { translation: {} },
      ta: { translation: {} },
      te: { translation: {} },
      mr: { translation: {} },
      gu: { translation: {} },
    },
  });

// Pre-translate when language is initialized
i18n.on("initialized", () => {
  preTranslateCommonPhrases(i18n.language);
});

// Pre-translate when language changes
i18n.on("languageChanged", (lng) => {
  preTranslateCommonPhrases(lng);
});

// Export both i18n and the translate function for custom usage
export { translateText };
export default i18n;
