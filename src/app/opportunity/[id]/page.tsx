import Link from "next/link";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export default async function OpportunityDetail({
  params,
}: PageProps) {
  const { id } = await params;

  // Jangan kirim ID tidak valid ke PostgreSQL UUID column.
  if (!isValidUuid(id)) {
    notFound();
  }

  const {
    data: opportunity,
    error,
  } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  // Error database asli tetap masuk error boundary.
  if (error) {
    console.error(
      "Opportunity detail error:",
      error
    );

    throw new Error(
      "Failed to load opportunity"
    );
  }

  // UUID valid tetapi row tidak ada / tidak aktif.
  if (!opportunity) {
    notFound();
  }

  return (
    <main className="detail-page">
      <div className="detail-container">
        <Link
          href="/#opportunities"
          className="detail-back"
        >
          ← Back to opportunities
        </Link>

        <div className="detail-grid">
          <article className="detail-main">
            <div className="detail-header">
              <div>
                <p className="detail-company">
                  {opportunity.company ||
                    "Company not specified"}
                </p>

                <h1>
                  {opportunity.title}
                </h1>

                <div className="detail-meta">
                  <span>
                    🌎{" "}
                    {opportunity.location ||
                      "Not specified"}
                  </span>

                  <span>
                    ◷{" "}
                    {opportunity.work_mode ||
                      opportunity.category ||
                      "Opportunity"}
                  </span>

                  <span>
                    💰{" "}
                    {opportunity.compensation ||
                      "Not disclosed"}
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

                <small>/100</small>
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

              {opportunity.entry_barrier && (
                <span>
                  Barrier:{" "}
                  {
                    opportunity.entry_barrier
                  }
                </span>
              )}

              {opportunity.ai_relevant && (
                <span>
                  AI Relevant
                </span>
              )}

              {opportunity.indonesia_eligible ===
                true && (
                <span>
                  Indonesia Eligible
                </span>
              )}

              {opportunity.indonesia_eligible ===
                false && (
                <span>
                  Indonesia Restricted
                </span>
              )}

              {opportunity.indonesia_eligible ===
                null && (
                <span>
                  Indonesia Eligibility
                  Unknown
                </span>
              )}
            </div>

            <section className="detail-section detail-highlight">
              <p className="detail-section-label">
                ✦ WHY IT MATTERS
              </p>

              <p>
                {opportunity.why_it_matters ||
                  "Worth checking based on Xeveza analysis."}
              </p>
            </section>

            {opportunity.tags?.length >
              0 && (
              <section className="detail-section">
                <h2>Tags</h2>

                <div className="detail-tags">
                  {opportunity.tags.map(
                    (tag: string) => (
                      <span key={tag}>
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
                  Opportunity details
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
                  Requirements
                </h2>

                <p className="detail-description">
                  {
                    opportunity.requirements
                  }
                </p>
              </section>
            )}

            <section className="detail-section">
              <h2>Source</h2>

              <div className="source-box">
                <div>
                  <span>
                    Original source
                  </span>

                  <strong>
                    {opportunity.source}
                  </strong>
                </div>

                <a
                  href={
                    opportunity.source_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open original
                  opportunity ↗
                </a>
              </div>
            </section>
          </article>

          <aside className="detail-sidebar">
            <div className="apply-card">
              <p className="apply-eyebrow">
                INTERESTED?
              </p>

              <h2>
                Continue to the
                original source.
              </h2>

              <p>
                Xeveza helps you
                discover and evaluate
                opportunities.
                Applications are
                completed on the
                original website.
              </p>

              <a
                href={
                  opportunity.source_url
                }
                target="_blank"
                rel="noopener noreferrer"
                className="apply-button"
              >
                Open original
                opportunity ↗
              </a>

              <div className="apply-info">
                <div>
                  <span>Source</span>

                  <strong>
                    {opportunity.source}
                  </strong>
                </div>

                <div>
                  <span>
                    Published
                  </span>

                  <strong>
                    {opportunity.published_at
                      ? new Date(
                          opportunity.published_at
                        ).toLocaleDateString(
                          "en-US",
                          {
                            month:
                              "short",
                            day: "numeric",
                            year:
                              "numeric",
                          }
                        )
                      : "Unknown"}
                  </strong>
                </div>

                <div>
                  <span>
                    Discovered
                  </span>

                  <strong>
                    {opportunity.discovered_at
                      ? new Date(
                          opportunity.discovered_at
                        ).toLocaleDateString(
                          "en-US",
                          {
                            month:
                              "short",
                            day: "numeric",
                            year:
                              "numeric",
                          }
                        )
                      : "Unknown"}
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