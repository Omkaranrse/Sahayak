"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { LanguageCode } from "./types";

export const LANGUAGES: { code: LanguageCode; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
];

type Dict = Record<string, string>;

const translations: Record<LanguageCode, Dict> = {
  en: {
    "nav.checkEligibility": "Check my eligibility",
    "hero.eyebrow": "Government scheme assistant",
    "hero.title": "Find the government support you already qualify for.",
    "hero.subtitle":
      "Answer a few plain questions. Sahayak matches you against verified scheme rules and explains what you get, in your own language.",
    "hero.cta": "Check my eligibility",
    "hero.ctaSecondary": "See how matching works",
    "stat.schemes": "schemes tracked",
    "stat.languages": "languages available",
    "stat.minutes": "minutes to check",
    "step.of": "Step {current} of {total}",
    "action.back": "Back",
    "action.next": "Continue",
    "action.submit": "Show my results",
    "action.matching": "Matching…",

    // Steps
    "step.basic": "Basic info",
    "step.economic": "Economic info",
    "step.category": "Category & status",

    // Step 0
    "intake.step0.title": "A little about you",
    "intake.step0.subtitle": "This helps us rule out schemes that don't apply to you.",
    "intake.age.label": "Age",
    "intake.age.placeholder": "e.g. 34",
    "intake.gender.label": "Gender",
    "intake.gender.placeholder": "Select gender",
    "intake.gender.female": "Female",
    "intake.gender.male": "Male",
    "intake.gender.other": "Other",
    "intake.state.label": "State",
    "intake.state.placeholder": "Select your state",

    // Step 1
    "intake.step1.title": "Your economic situation",
    "intake.step1.subtitle": "Income and occupation decide most scheme eligibility — answer as accurately as you can.",
    "intake.occupation.label": "Occupation",
    "intake.occupation.placeholder": "Select your occupation",
    "intake.occ.farmer": "Farmer / agricultural worker",
    "intake.occ.daily_wage": "Daily wage labourer",
    "intake.occ.self_employed": "Self-employed / small business",
    "intake.occ.salaried": "Salaried employee",
    "intake.occ.unemployed": "Unemployed",
    "intake.occ.student": "Student",
    "intake.occ.homemaker": "Homemaker",
    "intake.occ.retired": "Retired",
    "intake.income.label": "Annual household income (₹)",
    "intake.income.placeholder": "e.g. 180000",
    "intake.income.hint": "A rough figure is fine — this only determines which income bracket applies.",

    // Step 2
    "intake.step2.title": "Category & status",
    "intake.step2.subtitle": "Last step — a few details that unlock category-specific schemes.",
    "intake.category.label": "Social category",
    "intake.category.placeholder": "Select your category",
    "intake.cat.general": "General",
    "intake.cat.obc": "OBC",
    "intake.cat.sc": "SC",
    "intake.cat.st": "ST",
    "intake.cat.ews": "EWS",
    "intake.disability.label": "I have a registered disability",
    "intake.disability.desc": "Unlocks disability-specific pensions and support schemes",
    "intake.land.label": "I own agricultural land",
    "intake.land.desc": "Relevant for farmer income-support schemes",

    // Errors & footer
    "intake.err.ageRequired": "Enter your age to continue",
    "intake.err.ageValid": "Enter a valid age",
    "intake.err.genderRequired": "Select an option to continue",
    "intake.err.stateRequired": "Select your state to continue",
    "intake.err.occRequired": "Select an option to continue",
    "intake.err.incomeRequired": "Enter your annual household income",
    "intake.err.catRequired": "Select an option to continue",
    "intake.err.submitFailed": "Couldn't reach the matching service. Make sure the backend is running, then try again.",
    "intake.privacy": "Your answers are matched against scheme rules and never sold or shared.",
  },
  hi: {
    "nav.checkEligibility": "अपनी पात्रता जांचें",
    "hero.eyebrow": "सरकारी योजना सहायक",
    "hero.title": "उस सरकारी सहायता को खोजें जिसके आप पहले से ही पात्र हैं।",
    "hero.subtitle":
      "कुछ सरल सवालों के जवाब दें। सहायक आपको सत्यापित योजना नियमों से मिलाता है और आपकी भाषा में बताता है कि आपको क्या मिलेगा।",
    "hero.cta": "अपनी पात्रता जांचें",
    "hero.ctaSecondary": "मिलान कैसे काम करता है",
    "stat.schemes": "योजनाएं ट्रैक की गईं",
    "stat.languages": "भाषाएं उपलब्ध",
    "stat.minutes": "मिनट में जांच",
    "step.of": "चरण {current} / {total}",
    "action.back": "वापस",
    "action.next": "आगे बढ़ें",
    "action.submit": "मेरे परिणाम दिखाएं",
    "action.matching": "मिलान हो रहा है…",

    // Steps
    "step.basic": "मूल जानकारी",
    "step.economic": "आर्थिक जानकारी",
    "step.category": "श्रेणी और स्थिति",

    // Step 0
    "intake.step0.title": "आपके बारे में कुछ जानकारी",
    "intake.step0.subtitle": "इससे हमें उन योजनाओं को हटाने में मदद मिलती है जो आप पर लागू नहीं होती हैं।",
    "intake.age.label": "आयु (उम्र)",
    "intake.age.placeholder": "उदा. 34",
    "intake.gender.label": "लिंग",
    "intake.gender.placeholder": "लिंग चुनें",
    "intake.gender.female": "महिला",
    "intake.gender.male": "पुरुष",
    "intake.gender.other": "अन्य",
    "intake.state.label": "राज्य",
    "intake.state.placeholder": "अपना राज्य चुनें",

    // Step 1
    "intake.step1.title": "आपकी आर्थिक स्थिति",
    "intake.step1.subtitle": "आय और व्यवसाय से अधिकांश योजनाओं की पात्रता तय होती है — यथासंभव सही जानकारी दें।",
    "intake.occupation.label": "व्यवसाय / पेशा",
    "intake.occupation.placeholder": "अपना व्यवसाय चुनें",
    "intake.occ.farmer": "किसान / कृषि श्रमिक",
    "intake.occ.daily_wage": "दैनिक वेतनभोगी श्रमिक",
    "intake.occ.self_employed": "स्वरोजगार / छोटा व्यवसाय",
    "intake.occ.salaried": "वेतनभोगी कर्मचारी",
    "intake.occ.unemployed": "बेरोजगार",
    "intake.occ.student": "छात्र",
    "intake.occ.homemaker": "गृहिणी",
    "intake.occ.retired": "सेवानिवृत्त",
    "intake.income.label": "वार्षिक पारिवारिक आय (₹)",
    "intake.income.placeholder": "उदा. 180000",
    "intake.income.hint": "अनुमानित आंकड़ा भी चलेगा — यह केवल आय सीमा वर्ग तय करने के लिए है।",

    // Step 2
    "intake.step2.title": "श्रेणी और स्थिति",
    "intake.step2.subtitle": "अंतिम चरण — कुछ विवरण जो श्रेणी-विशिष्ट योजनाओं को खोलते हैं।",
    "intake.category.label": "सामाजिक श्रेणी",
    "intake.category.placeholder": "अपनी श्रेणी चुनें",
    "intake.cat.general": "सामान्य (General)",
    "intake.cat.obc": "ओबीसी (OBC)",
    "intake.cat.sc": "एससी (SC)",
    "intake.cat.st": "एसटी (ST)",
    "intake.cat.ews": "ईडब्ल्यूएस (EWS)",
    "intake.disability.label": "मेरे पास पंजीकृत दिव्यांगता (Disability) है",
    "intake.disability.desc": "दिव्यांगजन विशिष्ट पेंशन और सहायता योजनाओं को अनलॉक करता है",
    "intake.land.label": "मेरे पास कृषि भूमि है",
    "intake.land.desc": "किसान आय-सहायता योजनाओं के लिए आवश्यक है",

    // Errors & footer
    "intake.err.ageRequired": "आगे बढ़ने के लिए अपनी आयु दर्ज करें",
    "intake.err.ageValid": "कृपया मान्य आयु दर्ज करें",
    "intake.err.genderRequired": "आगे बढ़ने के लिए लिंग चुनें",
    "intake.err.stateRequired": "आगे बढ़ने के लिए अपना राज्य चुनें",
    "intake.err.occRequired": "आगे बढ़ने के लिए अपना व्यवसाय चुनें",
    "intake.err.incomeRequired": "अपनी वार्षिक पारिवारिक आय दर्ज करें",
    "intake.err.catRequired": "आगे बढ़ने के लिए अपनी श्रेणी चुनें",
    "intake.err.submitFailed": "मिलान सेवा से संपर्क नहीं हो सका। सुनिश्चित करें कि बैकएंड चल रहा है, फिर पुनः प्रयास करें।",
    "intake.privacy": "आपके उत्तरों का केवल योजना नियमों से मिलान किया जाता है, इन्हें कभी बेचा या साझा नहीं किया जाता।",
  },
  mr: {
    "nav.checkEligibility": "माझी पात्रता तपासा",
    "hero.eyebrow": "सरकारी योजना सहाय्यक",
    "hero.title": "तुम्ही आधीच पात्र असलेली सरकारी मदत शोधा.",
    "hero.subtitle":
      "काही सोप्या प्रश्नांची उत्तरे द्या. सहायक तुम्हाला पडताळणी केलेल्या योजनेच्या नियमांशी जुळवतो आणि तुमच्या भाषेत सांगतो.",
    "hero.cta": "माझी पात्रता तपासा",
    "hero.ctaSecondary": "जुळणी कशी कार्य करते",
    "stat.schemes": "योजना ट्रॅक केल्या",
    "stat.languages": "भाषा उपलब्ध",
    "stat.minutes": "मिनिटांत तपासा",
    "step.of": "पायरी {current} / {total}",
    "action.back": "मागे",
    "action.next": "पुढे जा",
    "action.submit": "माझे निकाल दाखवा",
    "action.matching": "जुळणी सुरू आहे…",

    // Steps
    "step.basic": "मूलभूत माहिती",
    "step.economic": "आर्थिक माहिती",
    "step.category": "प्रवर्ग आणि स्थिती",

    // Step 0
    "intake.step0.title": "तुमच्याबद्दल थोडी माहिती",
    "intake.step0.subtitle": "यामुळे तुमच्यासाठी लागू नसलेल्या योजना वगळण्यास मदत होते.",
    "intake.age.label": "वय",
    "intake.age.placeholder": "उदा. 34",
    "intake.gender.label": "लिंग",
    "intake.gender.placeholder": "लिंग निवडा",
    "intake.gender.female": "महिला",
    "intake.gender.male": "पुरुष",
    "intake.gender.other": "इतर",
    "intake.state.label": "राज्य",
    "intake.state.placeholder": "तुमचे राज्य निवडा",

    // Step 1
    "intake.step1.title": "तुमची आर्थिक स्थिती",
    "intake.step1.subtitle": "उत्पन्न आणि व्यवसाय बहुतांश योजनांची पात्रता ठरवतात — शक्य तितकी अचूक माहिती द्या.",
    "intake.occupation.label": "व्यवसाय / काम",
    "intake.occupation.placeholder": "तुमचा व्यवसाय निवडा",
    "intake.occ.farmer": "शेतकरी / शेतमजूर",
    "intake.occ.daily_wage": "दैनिक मजुरी कामगार",
    "intake.occ.self_employed": "स्वयंरोजगार / लहान व्यवसाय",
    "intake.occ.salaried": "पगारदार कर्मचारी",
    "intake.occ.unemployed": "बेरोजगार",
    "intake.occ.student": "विद्यार्थी",
    "intake.occ.homemaker": "गृहिणी",
    "intake.occ.retired": "सेवानिवृत्त",
    "intake.income.label": "वार्षिक कौटुंबिक उत्पन्न (₹)",
    "intake.income.placeholder": "उदा. 180000",
    "intake.income.hint": "अंदाजे आकडेवारी चालेल — हे फक्त उत्पन्न श्रेणी ठरवण्यासाठी आहे.",

    // Step 2
    "intake.step2.title": "प्रवर्ग आणि स्थिती",
    "intake.step2.subtitle": "शेवटची पायरी — काही तपशील जे प्रवर्ग-विशिष्ट योजना अनलॉक करतात.",
    "intake.category.label": "सामाजिक प्रवर्ग",
    "intake.category.placeholder": "तुमचा प्रवर्ग निवडा",
    "intake.cat.general": "सामान्य (General)",
    "intake.cat.obc": "ओबीसी (OBC)",
    "intake.cat.sc": "एससी (SC)",
    "intake.cat.st": "एसटी (ST)",
    "intake.cat.ews": "ईडब्ल्यूएस (EWS)",
    "intake.disability.label": "माझ्याकडे नोंदणीकृत दिव्यांगत्व (Disability) आहे",
    "intake.disability.desc": "दिव्यांगांसाठीच्या विशेष पेन्शन आणि सहाय्य योजना अनलॉक करतो",
    "intake.land.label": "माझ्याकडे शेतजमीन आहे",
    "intake.land.desc": "शेतकरी उत्पन्न-सहाय्य योजनांसाठी आवश्यक आहे",

    // Errors & footer
    "intake.err.ageRequired": "पुढे जाण्यासाठी तुमचे वय प्रविष्ट करा",
    "intake.err.ageValid": "कृपया वैध वय प्रविष्ट करा",
    "intake.err.genderRequired": "पुढे जाण्यासाठी लिंग निवडा",
    "intake.err.stateRequired": "पुढे जाण्यासाठी तुमचे राज्य निवडा",
    "intake.err.occRequired": "पुढे जाण्यासाठी तुमचा व्यवसाय निवडा",
    "intake.err.incomeRequired": "तुमचे वार्षिक कौटुंबिक उत्पन्न प्रविष्ट करा",
    "intake.err.catRequired": "पुढे जाण्यासाठी तुमचा सामाजिक प्रवर्ग निवडा",
    "intake.err.submitFailed": "जुळणी सेवेशी संपर्क होऊ शकला नाही. बॅकएंड सुरू असल्याची खात्री करा आणि पुन्हा प्रयत्न करा.",
    "intake.privacy": "तुमच्या उत्तरांची फक्त योजना नियमांशी पडताळणी केली जाते, ती कधीही विकली किंवा शेअर केली जात नाहीत.",
  },
};

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>("en");

  const t = (key: string, vars?: Record<string, string | number>) => {
    let str = translations[language]?.[key] ?? translations.en[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
