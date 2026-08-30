import { supabase } from "@/lib/supabase";
import OpportunityBrowser from "@/components/OpportunityBrowser";

export default async function Home() {
  const { data: opportunities, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("status", "active")
    .order("published_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Supabase error:",
      error
    );
  }

  const items = opportunities ?? [];

  const latestTickerItems = items.slice(0, 30);
  const tickerItems = [
    ...latestTickerItems,
    ...latestTickerItems,
  ];

  const today = new Date();

  const addedToday = items.filter((item) => {
    if (!item.discovered_at) {
      return false;
    }

    const discovered = new Date(
      item.discovered_at
    );

    return (
      discovered.getFullYear() ===
        today.getFullYear() &&
      discovered.getMonth() ===
        today.getMonth() &&
      discovered.getDate() ===
        today.getDate()
    );
  }).length;

  const sourcesScanned = new Set(
    items
      .map((item) => item.source)
      .filter(Boolean)
  ).size;

  return (
    <main>
      <header className="navbar">
        <div className="container nav-inner">
          <div className="brand">
            Xeveza<span>.</span>
          </div>

          <nav>
            <a href="#opportunities">
              Opportunities
            </a>

            <a href="#how-it-works">
              How it works
            </a>

            <a href="#about">
              About
            </a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">
                OPPORTUNITY RADAR
              </div>

              <h1>
                Find opportunities
                <br />
                before everyone else.
              </h1>

              <p className="hero-text">
                Remote jobs, freelance gigs,
                internships, grants,
                competitions, and digital
                opportunities — discovered,
                filtered, and summarized
                automatically.
              </p>

              <a
                href="#opportunities"
                className="hero-search-link"
              >
                <div className="search-box">
                  <span>⌕</span>

                  <div className="hero-search-placeholder">
                    Search jobs, skills,
                    companies, or
                    opportunities...
                  </div>

                  <button type="button">
                    Search
                  </button>
                </div>
              </a>

              <div className="stats">
                <div>
                  <strong>
                    {items.length}
                  </strong>

                  <span>
                    Active opportunities
                  </span>
                </div>

                <div>
                  <strong>
                    {addedToday}
                  </strong>

                  <span>
                    Added today
                  </span>
                </div>

                <div>
                  <strong>
                    {sourcesScanned}
                  </strong>

                  <span>
                    Sources scanned
                  </span>
                </div>
              </div>
            </div>

            <div className="radar-panel">
              <div className="radar-head">
                <span className="live-dot"></span>
                LIVE OPPORTUNITY RADAR
              </div>

              <div className="scan-line"></div>

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
                            "Location not specified"}{" "}
                          ·{" "}
                          {item.compensation ||
                            item.category ||
                            "Opportunity"}
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
                      No opportunities yet
                    </p>

                    <span>
                      Waiting for new
                      opportunities...
                    </span>
                  </div>
                </div>
              )}

              <div className="analysis-box">
                <span>
                  AI ANALYSIS
                </span>

                <p>
                  Scanning opportunity
                  requirements...
                </p>

                <div className="analysis-row">
                  <span>
                    Remote eligibility
                  </span>

                  <strong>✓</strong>
                </div>

                <div className="analysis-row">
                  <span>
                    Compensation
                  </span>

                  <strong>✓</strong>
                </div>

                <div className="analysis-row">
                  <span>
                    Entry barrier
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
            HOW IT WORKS
          </p>

          <h2>
            Less searching. Better
            opportunities.
          </h2>

          <div className="pipeline">
            <div className="pipeline-line">
              <span className="pipeline-dot"></span>
            </div>

            <div className="steps">
              <div>
                <span>01</span>

                <h3>Discover</h3>

                <p>
                  Xeveza scans public
                  sources across the internet
                  for new opportunities.
                </p>
              </div>

              <div>
                <span>02</span>

                <h3>Analyze</h3>

                <p>
                  AI filters duplicates,
                  extracts requirements, and
                  evaluates each opportunity.
                </p>
              </div>

              <div>
                <span>03</span>

                <h3>Rank</h3>

                <p>
                  Every opportunity receives
                  a score so valuable ones
                  are easier to find.
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
              Discover what&apos;s worth
              your time.
            </p>
          </div>

          <p className="disclaimer">
            Xeveza does not own or
            represent listed opportunities.
            Applications are completed on
            the original source.
          </p>
        </div>
      </footer>
    </main>
  );
}