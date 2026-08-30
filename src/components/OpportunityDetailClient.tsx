"use client";

import Link from "next/link";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  Language,
  useLanguage,
} from "@/components/LanguageProvider";

type Opportunity = {
  id: string;
  title: string;
  company: string | null;
  source: string | null;
  source_url: string;
  category: string | null;
  location: string | null;
  compensation: string | null;
  description: string | null;
  requirements: string | null;
  tags: string[] | null;
  xeveza_score: number | null;
  published_at: string | null;
  discovered_at: string | null;

  why_it_matters?: string | null;
  why_it_matters_en?: string | null;
  why_it_matters_id?: string | null;
  why_it_matters_es?: string | null;
  why_it_matters_pt?: string | null;
  why_it_matters_de?: string | null;

  indonesia_eligible?: boolean | null;
  seniority?: string | null;
  work_mode?: string | null;
  ai_relevant?: boolean | null;
  entry_barrier?: string | null;
};

function getWhyItMatters(
  item: Opportunity,
  language: Language
) {
  const values = {
    en: item.why_it_matters_en,
    id:
      item.why_it_matters_id ||
      item.why_it_matters,
    es: item.why_it_matters_es,
    pt: item.why_it_matters_pt,
    de: item.why_it_matters_de,
  };

  return (
    values[language] ||
    item.why_it_matters_en ||
    item.why_it_matters_id ||
    item.why_it_matters ||
    ""
  );
}

function getLocale(
  language: Language
) {
  switch (language) {
    case "id":
      return "id-ID";
    case "es":
      return "es-ES";
    case "pt":
      return "pt-BR";
    case "de":
      return "de-DE";
    default:
      return "en-US";
  }
}

export default function OpportunityDetailClient({
  opportunity,
}: {
  opportunity: Opportunity;
}) {
  const {
    language,
    t,
  } = useLanguage();

  const why =
    getWhyItMatters(
      opportunity,
      language
    );

  const locale =
    getLocale(language);

  return (
    <main className="detail-page">
      <header className="navbar">
        <div className="container nav-inner">
          <Link
            href="/"
            className="brand"
          >
            Xeveza<span>.</span>
          </Link>

          <div className="nav-right">
            <nav>
              <Link href="/">
                {t("backHome")}
              </Link>

              <Link href="/opportunities">
                {t("opportunities")}
              </Link>
            </nav>

            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="detail-container">
        <Link
          href="/opportunities"
          className="detail-back"
        >
          ← {t("backOpportunities")}
        </Link>

        <div className="detail-grid">
          <article className="detail-main">
            <div className="detail-header">
              <div>
                <p className="detail-company">
                  {opportunity.company ||
                    t("notSpecified")}
                </p>

                <h1>
                  {opportunity.title}
                </h1>

                <div className="detail-meta">
                  <span>
                    🌎{" "}
                    {opportunity.location ||
                      t("notSpecified")}
                  </span>

                  <span>
                    ◷{" "}
                    {opportunity.work_mode ||
                      opportunity.category ||
                      t("notSpecified")}
                  </span>

                  <span>
                    💰{" "}
                    {opportunity.compensation ||
                      t("notDisclosed")}
                  </span>
                </div>
              </div>

              <div className="detail-score">
                <span>
                  XEVEZA SCORE
                </span>

                <strong>
                  {opportunity.xeveza_score ??
                    "--"}
                </strong>

                <small>
                  /100
                </small>
              </div>
            </div>

            <div className="detail-badges">
              {opportunity.category && (
                <span>
                  {opportunity.category}
                </span>
              )}

              {opportunity.seniority && (
                <span>
                  {opportunity.seniority}
                </span>
              )}

              {opportunity.work_mode && (
                <span>
                  {opportunity.work_mode}
                </span>
              )}

              {opportunity.entry_barrier && (
                <span>
                  {t("barrier")}:{" "}
                  {
                    opportunity.entry_barrier
                  }
                </span>
              )}

              {opportunity.ai_relevant ===
                true && (
                <span>
                  {t("aiRelevant")}
                </span>
              )}

              {opportunity.indonesia_eligible ===
                true && (
                <span>
                  {t(
                    "indonesiaAllowed"
                  )}
                </span>
              )}

              {opportunity.indonesia_eligible ===
                false && (
                <span>
                  {t(
                    "indonesiaRestricted"
                  )}
                </span>
              )}

              {opportunity.indonesia_eligible ===
                null && (
                <span>
                  {t(
                    "indonesiaUnknown"
                  )}
                </span>
              )}
            </div>

            <section className="detail-section detail-highlight">
              <p className="detail-section-label">
                ✦ {t("whyItMatters")}
              </p>

              <p>
                {why ||
                  t("notSpecified")}
              </p>
            </section>

            {opportunity.tags &&
              opportunity.tags.length >
                0 && (
                <section className="detail-section">
                  <h2>
                    {t("tags")}
                  </h2>

                  <div className="detail-tags">
                    {opportunity.tags.map(
                      (tag) => (
                        <span
                          key={tag}
                        >
                          {tag}
                        </span>
                      )
                    )}
                  </div>
                </section>
              )}

            {opportunity.description && (
              <section className="detail-section">
                <h2>
                  {t(
                    "opportunityDetails"
                  )}
                </h2>

                <p className="detail-description">
                  {
                    opportunity.description
                  }
                </p>
              </section>
            )}

            {opportunity.requirements && (
              <section className="detail-section">
                <h2>
                  {t(
                    "requirements"
                  )}
                </h2>

                <p className="detail-description">
                  {
                    opportunity.requirements
                  }
                </p>
              </section>
            )}

            <section className="detail-section">
              <h2>
                {t("originalSource")}
              </h2>

              <div className="source-box">
                <div>
                  <span>
                    {t("source")}
                  </span>

                  <strong>
                    {opportunity.source ||
                      t(
                        "notSpecified"
                      )}
                  </strong>
                </div>

                <a
                  href={
                    opportunity.source_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("openOriginal")} ↗
                </a>
              </div>
            </section>
          </article>

          <aside className="detail-sidebar">
            <div className="apply-card">
              <p className="apply-eyebrow">
                {t("interested")}
              </p>

              <h2>
                {t(
                  "continueOriginal"
                )}
              </h2>

              <p>
                {t(
                  "applicationExplanation"
                )}
              </p>

              <a
                href={
                  opportunity.source_url
                }
                target="_blank"
                rel="noopener noreferrer"
                className="apply-button"
              >
                {t("openOriginal")} ↗
              </a>

              <div className="apply-info">
                <div>
                  <span>
                    {t("company")}
                  </span>

                  <strong>
                    {opportunity.company ||
                      t(
                        "notSpecified"
                      )}
                  </strong>
                </div>

                <div>
                  <span>
                    {t("source")}
                  </span>

                  <strong>
                    {opportunity.source ||
                      t(
                        "notSpecified"
                      )}
                  </strong>
                </div>

                <div>
                  <span>
                    {t("category")}
                  </span>

                  <strong>
                    {opportunity.category ||
                      t(
                        "notSpecified"
                      )}
                  </strong>
                </div>

                <div>
                  <span>
                    {t("published")}
                  </span>

                  <strong>
                    {opportunity.published_at
                      ? new Date(
                          opportunity.published_at
                        ).toLocaleDateString(
                          locale,
                          {
                            month:
                              "short",
                            day:
                              "numeric",
                            year:
                              "numeric",
                          }
                        )
                      : t(
                          "notSpecified"
                        )}
                  </strong>
                </div>

                <div>
                  <span>
                    {t("discovered")}
                  </span>

                  <strong>
                    {opportunity.discovered_at
                      ? new Date(
                          opportunity.discovered_at
                        ).toLocaleDateString(
                          locale,
                          {
                            month:
                              "short",
                            day:
                              "numeric",
                            year:
                              "numeric",
                          }
                        )
                      : t(
                          "notSpecified"
                        )}
                  </strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}