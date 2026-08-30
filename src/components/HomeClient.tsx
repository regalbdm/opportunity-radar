"use client";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import OpportunityBrowser from "@/components/OpportunityBrowser";
import { useLanguage } from "@/components/LanguageProvider";

type Opportunity = {
  id: string;
  title: string;
  company: string | null;
  source: string;
  source_url: string;
  category: string | null;
  location: string | null;
  remote: boolean | null;
  compensation: string | null;
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

export default function HomeClient({
  items,
  addedToday,
  sourcesScanned,
}: {
  items: Opportunity[];
  addedToday: number;
  sourcesScanned: number;
}) {
  const { t } = useLanguage();

  const latestTickerItems =
    items.slice(0, 30);

  const tickerItems = [
    ...latestTickerItems,
    ...latestTickerItems,
  ];

  return (
    <main>
      <header className="navbar">
        <div className="container nav-inner">
          <div className="brand">
            Xeveza<span>.</span>
          </div>

          <div className="nav-right">
            <nav>
              <a href="#opportunities">
                {t("opportunities")}
              </a>

              <a href="#how-it-works">
                {t("howItWorks")}
              </a>

              <a href="#about">
                {t("about")}
              </a>
            </nav>

            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">
                {t("radar")}
              </div>

              <h1>
                {t("heroTitle1")}
                <br />
                {t("heroTitle2")}
              </h1>

              <p className="hero-text">
                {t("heroDescription")}
              </p>

              <a
                href="#opportunities"
                className="hero-search-link"
              >
                <div className="search-box">
                  <span>⌕</span>

                  <div className="hero-search-placeholder">
                    {t(
                      "searchPlaceholder"
                    )}
                  </div>

                  <button type="button">
                    {t("search")}
                  </button>
                </div>
              </a>

              <div className="stats">
                <div>
                  <strong>
                    {items.length}
                  </strong>

                  <span>
                    {t(
                      "activeOpportunities"
                    )}
                  </span>
                </div>

                <div>
                  <strong>
                    {addedToday}
                  </strong>

                  <span>
                    {t("addedToday")}
                  </span>
                </div>

                <div>
                  <strong>
                    {sourcesScanned}
                  </strong>

                  <span>
                    {t("sourcesScanned")}
                  </span>
                </div>
              </div>
            </div>

            <div className="radar-panel">
              <div className="radar-head">
                <span className="live-dot" />
                {t("liveRadar")}
              </div>

              <div className="scan-line" />

              {items.length > 0 ? (
                items
                  .slice(0, 3)
                  .map((item) => (
                    <div
                      className="radar-item"
                      key={item.id}
                    >
                      <div>
                        <p>
                          {item.title}
                        </p>

                        <span>
                          {item.location ||
                            t(
                              "notSpecified"
                            )}{" "}
                          ·{" "}
                          {item.compensation ||
                            item.category ||
                            t(
                              "opportunities"
                            )}
                        </span>
                      </div>

                      <strong>
                        {item.xeveza_score ??
                          "--"}
                      </strong>
                    </div>
                  ))
              ) : (
                <div className="radar-item">
                  <div>
                    <p>
                      {t(
                        "noOpportunities"
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="analysis-box">
                <span>
                  {t("aiAnalysis")}
                </span>

                <p>
                  {t(
                    "scanningRequirements"
                  )}
                </p>

                <div className="analysis-row">
                  <span>
                    {t(
                      "remoteEligibility"
                    )}
                  </span>
                  <strong>✓</strong>
                </div>

                <div className="analysis-row">
                  <span>
                    {t("compensation")}
                  </span>
                  <strong>✓</strong>
                </div>

                <div className="analysis-row">
                  <span>
                    {t("entryBarrier")}
                  </span>
                  <strong>✓</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {tickerItems.length > 0 && (
        <section className="live-strip">
          <div className="ticker">
            <div className="ticker-track">
              {tickerItems.map(
                (item, index) => (
                  <span
                    key={`${item.id}-ticker-${index}`}
                  >
                    {item.title} ·{" "}
                    {item.xeveza_score ??
                      "--"}
                    /100
                  </span>
                )
              )}
            </div>
          </div>
        </section>
      )}

      <section
        className="opportunity-section"
        id="opportunities"
      >
        <OpportunityBrowser
          opportunities={items}
        />
      </section>

      <section
        className="how-it-works"
        id="how-it-works"
      >
        <div className="container">
          <p className="section-label">
            {t("howItWorks").toUpperCase()}
          </p>

          <h2>
            {t("lessSearching")}
          </h2>

          <div className="pipeline">
            <div className="pipeline-line">
              <span className="pipeline-dot" />
            </div>

            <div className="steps">
              <div>
                <span>01</span>

                <h3>
                  {t("discoverStep")}
                </h3>

                <p>
                  {t(
                    "discoverDescription"
                  )}
                </p>
              </div>

              <div>
                <span>02</span>

                <h3>
                  {t("analyzeStep")}
                </h3>

                <p>
                  {t(
                    "analyzeDescription"
                  )}
                </p>
              </div>

              <div>
                <span>03</span>

                <h3>
                  {t("rankStep")}
                </h3>

                <p>
                  {t(
                    "rankDescription"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="about">
        <div className="container footer-inner">
          <div>
            <div className="brand">
              Xeveza<span>.</span>
            </div>

            <p>
              {t("footerTagline")}
            </p>
          </div>

          <p className="disclaimer">
            {t("disclaimer")}
          </p>
        </div>
      </footer>
    </main>
  );
}