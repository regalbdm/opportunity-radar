"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
} from "react";

export type Language =
  | "en"
  | "id"
  | "es"
  | "pt"
  | "de";

type Dictionary = {
  [key: string]: string;
};

const dictionaries: Record<
  Language,
  Dictionary
> = {
  en: {
    opportunities: "Opportunities",
    howItWorks: "How it works",
    about: "About",

    radar: "OPPORTUNITY RADAR",
    heroTitle1: "Find opportunities",
    heroTitle2: "before everyone else.",
    heroDescription:
      "Remote jobs, freelance gigs, internships, grants, competitions, and digital opportunities — discovered, filtered, and summarized automatically.",

    searchPlaceholder:
      "Search jobs, skills, companies, or opportunities...",
    search: "Search",

    activeOpportunities:
      "Active opportunities",
    addedToday: "Added today",
    sourcesScanned: "Sources scanned",

    liveRadar:
      "LIVE OPPORTUNITY RADAR",
    aiAnalysis: "AI ANALYSIS",
    scanningRequirements:
      "Scanning opportunity requirements...",
    remoteEligibility:
      "Remote eligibility",
    compensation: "Compensation",
    entryBarrier: "Entry barrier",

    discover: "DISCOVER",
    latestOpportunities:
      "Latest opportunities",
    newestFirst: "Newest first",
    highestScore: "Highest score",

    all: "All",
    remoteJobs: "Remote Jobs",
    freelance: "Freelance",
    aiJobs: "AI Jobs",
    internship: "Internship",
    competition: "Competition",
    grants: "Grants",

    remoteOnly: "Remote only",
    indonesiaEligible:
      "Indonesia eligible",
    resetFilters: "Reset filters",

    opportunitiesFound:
      "opportunities",
    whyItMatters: "Why it matters",
    viewDetails: "View details",
    viewAll:
      "View all opportunities",

    notDisclosed: "Not disclosed",
    notSpecified: "Not specified",
    recently: "Recently",
    barrier: "Barrier",

    noOpportunities:
      "No opportunities found",
    tryAnother:
      "Try another category or filter.",
    showAll:
      "Show all opportunities",

    lessSearching:
      "Less searching. Better opportunities.",
    discoverStep: "Discover",
    discoverDescription:
      "Xeveza scans public sources across the internet for new opportunities.",
    analyzeStep: "Analyze",
    analyzeDescription:
      "AI filters duplicates, extracts requirements, and evaluates each opportunity.",
    rankStep: "Rank",
    rankDescription:
      "Every opportunity receives a score so valuable ones are easier to find.",

    footerTagline:
      "Discover what's worth your time.",
    disclaimer:
      "Xeveza does not own or represent listed opportunities. Applications are completed on the original source.",

    exploreAll:
      "Explore all opportunities.",
    opportunityDatabase:
      "OPPORTUNITY DATABASE",
    exploreDescription:
      "Search, filter and compare opportunities discovered by Xeveza.",
    backHome: "Back home",

    interested: "INTERESTED?",
    continueOriginal:
      "Continue to the original source.",
    applicationExplanation:
      "Xeveza helps you discover, filter, and evaluate opportunities. Applications are completed on the original website.",
    openOriginal:
      "Open original opportunity",
    originalSource: "Original source",
    source: "Source",
    company: "Company",
    category: "Category",
    published: "Published",
    discovered: "Discovered",
    tags: "Tags",
    opportunityDetails:
      "Opportunity details",
    requirements: "Requirements",
    backOpportunities:
      "Back to opportunities",
    aiRelevant: "AI Relevant",
    indonesiaAllowed:
      "Indonesia Eligible",
    indonesiaRestricted:
      "Indonesia Restricted",
    indonesiaUnknown:
      "Indonesia Eligibility Unknown",

    previous: "Previous",
    next: "Next",
  },

  id: {
    opportunities: "Peluang",
    howItWorks: "Cara kerja",
    about: "Tentang",

    radar: "RADAR PELUANG",
    heroTitle1: "Temukan peluang",
    heroTitle2:
      "sebelum orang lain.",
    heroDescription:
      "Lowongan remote, freelance, magang, hibah, kompetisi, dan peluang digital — ditemukan, difilter, dan diringkas secara otomatis.",

    searchPlaceholder:
      "Cari pekerjaan, skill, perusahaan, atau peluang...",
    search: "Cari",

    activeOpportunities:
      "Peluang aktif",
    addedToday:
      "Ditambahkan hari ini",
    sourcesScanned:
      "Sumber dipantau",

    liveRadar:
      "RADAR PELUANG LANGSUNG",
    aiAnalysis: "ANALISIS AI",
    scanningRequirements:
      "Menganalisis persyaratan peluang...",
    remoteEligibility:
      "Kelayakan remote",
    compensation: "Kompensasi",
    entryBarrier:
      "Tingkat kesulitan masuk",

    discover: "TEMUKAN",
    latestOpportunities:
      "Peluang terbaru",
    newestFirst:
      "Terbaru dahulu",
    highestScore:
      "Skor tertinggi",

    all: "Semua",
    remoteJobs:
      "Pekerjaan Remote",
    freelance: "Freelance",
    aiJobs: "Pekerjaan AI",
    internship: "Magang",
    competition: "Kompetisi",
    grants: "Hibah",

    remoteOnly:
      "Hanya remote",
    indonesiaEligible:
      "Bisa dari Indonesia",
    resetFilters:
      "Reset filter",

    opportunitiesFound:
      "peluang",
    whyItMatters:
      "Kenapa peluang ini menarik",
    viewDetails:
      "Lihat detail",
    viewAll:
      "Lihat semua peluang",

    notDisclosed:
      "Tidak dicantumkan",
    notSpecified:
      "Tidak dicantumkan",
    recently: "Baru-baru ini",
    barrier: "Kesulitan",

    noOpportunities:
      "Tidak ada peluang ditemukan",
    tryAnother:
      "Coba kategori atau filter lain.",
    showAll:
      "Tampilkan semua peluang",

    lessSearching:
      "Lebih sedikit mencari. Lebih banyak peluang.",
    discoverStep: "Temukan",
    discoverDescription:
      "Xeveza memindai berbagai sumber publik di internet untuk menemukan peluang baru.",
    analyzeStep: "Analisis",
    analyzeDescription:
      "AI menyaring duplikat, membaca persyaratan, dan mengevaluasi setiap peluang.",
    rankStep: "Peringkat",
    rankDescription:
      "Setiap peluang mendapatkan skor agar peluang bernilai tinggi lebih mudah ditemukan.",

    footerTagline:
      "Temukan yang layak untuk waktumu.",
    disclaimer:
      "Xeveza tidak memiliki atau mewakili peluang yang ditampilkan. Lamaran dilakukan melalui sumber aslinya.",

    exploreAll:
      "Jelajahi semua peluang.",
    opportunityDatabase:
      "DATABASE PELUANG",
    exploreDescription:
      "Cari, filter, dan bandingkan peluang yang ditemukan Xeveza.",
    backHome:
      "Kembali ke beranda",

    interested: "TERTARIK?",
    continueOriginal:
      "Lanjutkan ke sumber asli.",
    applicationExplanation:
      "Xeveza membantu menemukan, menyaring, dan mengevaluasi peluang. Proses lamaran dilakukan di situs sumber asli.",
    openOriginal:
      "Buka peluang asli",
    originalSource:
      "Sumber asli",
    source: "Sumber",
    company: "Perusahaan",
    category: "Kategori",
    published: "Dipublikasikan",
    discovered: "Ditemukan",
    tags: "Tag",
    opportunityDetails:
      "Detail peluang",
    requirements:
      "Persyaratan",
    backOpportunities:
      "Kembali ke peluang",
    aiRelevant:
      "Relevan dengan AI",
    indonesiaAllowed:
      "Bisa dari Indonesia",
    indonesiaRestricted:
      "Tidak tersedia untuk Indonesia",
    indonesiaUnknown:
      "Kelayakan Indonesia belum diketahui",

    previous: "Sebelumnya",
    next: "Berikutnya",
  },

  es: {
    opportunities: "Oportunidades",
    howItWorks: "Cómo funciona",
    about: "Acerca de",

    radar:
      "RADAR DE OPORTUNIDADES",
    heroTitle1:
      "Encuentra oportunidades",
    heroTitle2:
      "antes que los demás.",
    heroDescription:
      "Trabajos remotos, proyectos freelance, prácticas, subvenciones, concursos y oportunidades digitales — descubiertos, filtrados y resumidos automáticamente.",

    searchPlaceholder:
      "Buscar empleos, habilidades, empresas u oportunidades...",
    search: "Buscar",

    activeOpportunities:
      "Oportunidades activas",
    addedToday:
      "Añadidas hoy",
    sourcesScanned:
      "Fuentes analizadas",

    liveRadar:
      "RADAR DE OPORTUNIDADES EN VIVO",
    aiAnalysis:
      "ANÁLISIS DE IA",
    scanningRequirements:
      "Analizando los requisitos...",
    remoteEligibility:
      "Elegibilidad remota",
    compensation:
      "Compensación",
    entryBarrier:
      "Nivel de acceso",

    discover: "DESCUBRIR",
    latestOpportunities:
      "Últimas oportunidades",
    newestFirst:
      "Más recientes",
    highestScore:
      "Mayor puntuación",

    all: "Todas",
    remoteJobs:
      "Trabajos remotos",
    freelance: "Freelance",
    aiJobs:
      "Trabajos de IA",
    internship: "Prácticas",
    competition:
      "Competiciones",
    grants: "Subvenciones",

    remoteOnly:
      "Solo remoto",
    indonesiaEligible:
      "Disponible desde Indonesia",
    resetFilters:
      "Restablecer filtros",

    opportunitiesFound:
      "oportunidades",
    whyItMatters:
      "Por qué es relevante",
    viewDetails:
      "Ver detalles",
    viewAll:
      "Ver todas las oportunidades",

    notDisclosed:
      "No especificado",
    notSpecified:
      "No especificado",
    recently: "Reciente",
    barrier: "Dificultad",

    noOpportunities:
      "No se encontraron oportunidades",
    tryAnother:
      "Prueba otra categoría o filtro.",
    showAll:
      "Mostrar todas",

    lessSearching:
      "Menos búsqueda. Mejores oportunidades.",
    discoverStep:
      "Descubrir",
    discoverDescription:
      "Xeveza analiza fuentes públicas de Internet para encontrar nuevas oportunidades.",
    analyzeStep:
      "Analizar",
    analyzeDescription:
      "La IA elimina duplicados, extrae requisitos y evalúa cada oportunidad.",
    rankStep: "Clasificar",
    rankDescription:
      "Cada oportunidad recibe una puntuación para facilitar el descubrimiento de las más valiosas.",

    footerTagline:
      "Descubre lo que merece tu tiempo.",
    disclaimer:
      "Xeveza no posee ni representa las oportunidades listadas. Las solicitudes se realizan en la fuente original.",

    exploreAll:
      "Explora todas las oportunidades.",
    opportunityDatabase:
      "BASE DE OPORTUNIDADES",
    exploreDescription:
      "Busca, filtra y compara oportunidades descubiertas por Xeveza.",
    backHome: "Volver al inicio",

    interested: "¿TE INTERESA?",
    continueOriginal:
      "Continúa en la fuente original.",
    applicationExplanation:
      "Xeveza te ayuda a descubrir, filtrar y evaluar oportunidades. Las solicitudes se realizan en el sitio web original.",
    openOriginal:
      "Abrir oportunidad original",
    originalSource:
      "Fuente original",
    source: "Fuente",
    company: "Empresa",
    category: "Categoría",
    published: "Publicado",
    discovered: "Descubierto",
    tags: "Etiquetas",
    opportunityDetails:
      "Detalles de la oportunidad",
    requirements: "Requisitos",
    backOpportunities:
      "Volver a oportunidades",
    aiRelevant:
      "Relevante para IA",
    indonesiaAllowed:
      "Disponible desde Indonesia",
    indonesiaRestricted:
      "No disponible para Indonesia",
    indonesiaUnknown:
      "Elegibilidad para Indonesia desconocida",

    previous: "Anterior",
    next: "Siguiente",
  },

  pt: {
    opportunities:
      "Oportunidades",
    howItWorks:
      "Como funciona",
    about: "Sobre",

    radar:
      "RADAR DE OPORTUNIDADES",
    heroTitle1:
      "Encontre oportunidades",
    heroTitle2:
      "antes de todo mundo.",
    heroDescription:
      "Vagas remotas, trabalhos freelance, estágios, bolsas, competições e oportunidades digitais — descobertas, filtradas e resumidas automaticamente.",

    searchPlaceholder:
      "Buscar vagas, habilidades, empresas ou oportunidades...",
    search: "Buscar",

    activeOpportunities:
      "Oportunidades ativas",
    addedToday:
      "Adicionadas hoje",
    sourcesScanned:
      "Fontes analisadas",

    liveRadar:
      "RADAR DE OPORTUNIDADES AO VIVO",
    aiAnalysis:
      "ANÁLISE DE IA",
    scanningRequirements:
      "Analisando requisitos...",
    remoteEligibility:
      "Elegibilidade remota",
    compensation:
      "Remuneração",
    entryBarrier:
      "Barreira de entrada",

    discover: "DESCOBRIR",
    latestOpportunities:
      "Oportunidades recentes",
    newestFirst:
      "Mais recentes",
    highestScore:
      "Maior pontuação",

    all: "Todas",
    remoteJobs:
      "Vagas remotas",
    freelance: "Freelance",
    aiJobs: "Vagas de IA",
    internship: "Estágios",
    competition:
      "Competições",
    grants: "Bolsas",

    remoteOnly:
      "Somente remoto",
    indonesiaEligible:
      "Disponível na Indonésia",
    resetFilters:
      "Redefinir filtros",

    opportunitiesFound:
      "oportunidades",
    whyItMatters:
      "Por que é relevante",
    viewDetails:
      "Ver detalhes",
    viewAll:
      "Ver todas as oportunidades",

    notDisclosed:
      "Não informado",
    notSpecified:
      "Não especificado",
    recently: "Recente",
    barrier: "Barreira",

    noOpportunities:
      "Nenhuma oportunidade encontrada",
    tryAnother:
      "Tente outra categoria ou filtro.",
    showAll:
      "Mostrar todas",

    lessSearching:
      "Menos busca. Melhores oportunidades.",
    discoverStep:
      "Descobrir",
    discoverDescription:
      "A Xeveza analisa fontes públicas na internet em busca de novas oportunidades.",
    analyzeStep:
      "Analisar",
    analyzeDescription:
      "A IA remove duplicatas, extrai requisitos e avalia cada oportunidade.",
    rankStep:
      "Classificar",
    rankDescription:
      "Cada oportunidade recebe uma pontuação para facilitar a descoberta das mais valiosas.",

    footerTagline:
      "Descubra o que vale o seu tempo.",
    disclaimer:
      "A Xeveza não possui nem representa as oportunidades listadas. As candidaturas são feitas na fonte original.",

    exploreAll:
      "Explore todas as oportunidades.",
    opportunityDatabase:
      "BASE DE OPORTUNIDADES",
    exploreDescription:
      "Busque, filtre e compare oportunidades encontradas pela Xeveza.",
    backHome:
      "Voltar ao início",

    interested:
      "INTERESSADO?",
    continueOriginal:
      "Continue para a fonte original.",
    applicationExplanation:
      "A Xeveza ajuda você a descobrir, filtrar e avaliar oportunidades. As candidaturas são realizadas no site original.",
    openOriginal:
      "Abrir oportunidade original",
    originalSource:
      "Fonte original",
    source: "Fonte",
    company: "Empresa",
    category: "Categoria",
    published: "Publicado",
    discovered: "Descoberto",
    tags: "Tags",
    opportunityDetails:
      "Detalhes da oportunidade",
    requirements:
      "Requisitos",
    backOpportunities:
      "Voltar às oportunidades",
    aiRelevant:
      "Relevante para IA",
    indonesiaAllowed:
      "Disponível na Indonésia",
    indonesiaRestricted:
      "Indisponível na Indonésia",
    indonesiaUnknown:
      "Elegibilidade na Indonésia desconhecida",

    previous: "Anterior",
    next: "Próximo",
  },

  de: {
    opportunities:
      "Möglichkeiten",
    howItWorks:
      "So funktioniert es",
    about: "Über uns",

    radar:
      "CHANCEN-RADAR",
    heroTitle1:
      "Finde Möglichkeiten",
    heroTitle2:
      "vor allen anderen.",
    heroDescription:
      "Remote-Jobs, Freelance-Projekte, Praktika, Förderungen, Wettbewerbe und digitale Möglichkeiten — automatisch entdeckt, gefiltert und zusammengefasst.",

    searchPlaceholder:
      "Jobs, Fähigkeiten, Unternehmen oder Möglichkeiten suchen...",
    search: "Suchen",

    activeOpportunities:
      "Aktive Möglichkeiten",
    addedToday:
      "Heute hinzugefügt",
    sourcesScanned:
      "Geprüfte Quellen",

    liveRadar:
      "LIVE-CHANCEN-RADAR",
    aiAnalysis:
      "KI-ANALYSE",
    scanningRequirements:
      "Anforderungen werden analysiert...",
    remoteEligibility:
      "Remote-Eignung",
    compensation:
      "Vergütung",
    entryBarrier:
      "Einstiegshürde",

    discover: "ENTDECKEN",
    latestOpportunities:
      "Neueste Möglichkeiten",
    newestFirst:
      "Neueste zuerst",
    highestScore:
      "Höchste Bewertung",

    all: "Alle",
    remoteJobs:
      "Remote-Jobs",
    freelance: "Freelance",
    aiJobs: "KI-Jobs",
    internship: "Praktika",
    competition:
      "Wettbewerbe",
    grants: "Förderungen",

    remoteOnly:
      "Nur Remote",
    indonesiaEligible:
      "Für Indonesien verfügbar",
    resetFilters:
      "Filter zurücksetzen",

    opportunitiesFound:
      "Möglichkeiten",
    whyItMatters:
      "Warum interessant",
    viewDetails:
      "Details ansehen",
    viewAll:
      "Alle Möglichkeiten ansehen",

    notDisclosed:
      "Nicht angegeben",
    notSpecified:
      "Nicht angegeben",
    recently: "Kürzlich",
    barrier: "Hürde",

    noOpportunities:
      "Keine Möglichkeiten gefunden",
    tryAnother:
      "Versuche eine andere Kategorie oder einen anderen Filter.",
    showAll:
      "Alle anzeigen",

    lessSearching:
      "Weniger suchen. Bessere Möglichkeiten.",
    discoverStep:
      "Entdecken",
    discoverDescription:
      "Xeveza durchsucht öffentliche Quellen im Internet nach neuen Möglichkeiten.",
    analyzeStep:
      "Analysieren",
    analyzeDescription:
      "KI entfernt Duplikate, extrahiert Anforderungen und bewertet jede Möglichkeit.",
    rankStep: "Bewerten",
    rankDescription:
      "Jede Möglichkeit erhält eine Bewertung, damit wertvolle Angebote leichter gefunden werden.",

    footerTagline:
      "Entdecke, was deine Zeit wert ist.",
    disclaimer:
      "Xeveza besitzt oder vertritt die aufgeführten Angebote nicht. Bewerbungen erfolgen über die Originalquelle.",

    exploreAll:
      "Alle Möglichkeiten entdecken.",
    opportunityDatabase:
      "CHANCEN-DATENBANK",
    exploreDescription:
      "Suche, filtere und vergleiche von Xeveza entdeckte Möglichkeiten.",
    backHome:
      "Zurück zur Startseite",

    interested:
      "INTERESSIERT?",
    continueOriginal:
      "Weiter zur Originalquelle.",
    applicationExplanation:
      "Xeveza hilft dir, Möglichkeiten zu entdecken, zu filtern und zu bewerten. Bewerbungen erfolgen auf der ursprünglichen Website.",
    openOriginal:
      "Originalangebot öffnen",
    originalSource:
      "Originalquelle",
    source: "Quelle",
    company: "Unternehmen",
    category: "Kategorie",
    published:
      "Veröffentlicht",
    discovered: "Entdeckt",
    tags: "Tags",
    opportunityDetails:
      "Details zur Möglichkeit",
    requirements:
      "Anforderungen",
    backOpportunities:
      "Zurück zu Möglichkeiten",
    aiRelevant:
      "KI-relevant",
    indonesiaAllowed:
      "Für Indonesien verfügbar",
    indonesiaRestricted:
      "Nicht für Indonesien verfügbar",
    indonesiaUnknown:
      "Indonesien-Eignung unbekannt",

    previous: "Zurück",
    next: "Weiter",
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (
    language: Language
  ) => void;
  t: (key: string) => string;
};

const LanguageContext =
  createContext<
    LanguageContextType | undefined
  >(undefined);

const LANGUAGE_KEY =
  "xeveza-language";

const LANGUAGE_EVENT =
  "xeveza-language-change";

const supportedLanguages: Language[] = [
  "en",
  "id",
  "es",
  "pt",
  "de",
];

function isValidLanguage(
  value: string | null
): value is Language {
  return (
    value !== null &&
    supportedLanguages.includes(
      value as Language
    )
  );
}

function subscribeLanguage(
  callback: () => void
) {
  const handleStorage = (
    event: StorageEvent
  ) => {
    if (
      event.key ===
      LANGUAGE_KEY
    ) {
      callback();
    }
  };

  const handleLanguageChange =
    () => {
      callback();
    };

  window.addEventListener(
    "storage",
    handleStorage
  );

  window.addEventListener(
    LANGUAGE_EVENT,
    handleLanguageChange
  );

  return () => {
    window.removeEventListener(
      "storage",
      handleStorage
    );

    window.removeEventListener(
      LANGUAGE_EVENT,
      handleLanguageChange
    );
  };
}

function getLanguageSnapshot(): Language {
  const saved =
    localStorage.getItem(
      LANGUAGE_KEY
    );

  if (
    isValidLanguage(saved)
  ) {
    return saved;
  }

  return "en";
}

function getServerLanguageSnapshot(): Language {
  // HARUS konsisten dengan SSR
  // agar tidak terjadi hydration mismatch.
  return "en";
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const language =
    useSyncExternalStore(
      subscribeLanguage,
      getLanguageSnapshot,
      getServerLanguageSnapshot
    );

  const setLanguage = (
    nextLanguage: Language
  ) => {
    localStorage.setItem(
      LANGUAGE_KEY,
      nextLanguage
    );

    document.documentElement.lang =
      nextLanguage;

    window.dispatchEvent(
      new Event(
        LANGUAGE_EVENT
      )
    );
  };

  const t = (
    key: string
  ) =>
    dictionaries[language][key] ||
    dictionaries.en[key] ||
    key;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}