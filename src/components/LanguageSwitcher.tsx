"use client";

import {
  Language,
  useLanguage,
} from "@/components/LanguageProvider";

const languages: {
  value: Language;
  label: string;
}[] = [
  {
    value: "en",
    label: "EN — English",
  },
  {
    value: "id",
    label: "ID — Indonesia",
  },
  {
    value: "es",
    label: "ES — Español",
  },
  {
    value: "pt",
    label: "PT — Português",
  },
  {
    value: "de",
    label: "DE — Deutsch",
  },
];

export default function LanguageSwitcher() {
  const {
    language,
    setLanguage,
  } = useLanguage();

  return (
    <select
      className="language-switcher"
      value={language}
      aria-label="Language"
      onChange={(event) =>
        setLanguage(
          event.target.value as Language
        )
      }
    >
      {languages.map(
        (item) => (
          <option
            value={item.value}
            key={item.value}
          >
            {item.label}
          </option>
        )
      )}
    </select>
  );
}