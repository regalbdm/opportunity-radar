"use client";

import Link from "next/link";

import AllOpportunitiesBrowser from "@/components/AllOpportunitiesBrowser";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/LanguageProvider";

type Opportunity = Parameters<
  typeof AllOpportunitiesBrowser
>[0]["opportunities"][number];

export default function OpportunitiesPageClient({
  opportunities,
}: {
  opportunities: Opportunity[];
}) {
  const { t } = useLanguage();

  return (
    <main className="all-page">
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

              <Link href="/#how-it-works">
                {t("howItWorks")}
              </Link>

              <Link href="/#about">
                {t("about")}
              </Link>
            </nav>

            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <section className="all-page-hero">
        <div className="container">
          <Link
            href="/"
            className="detail-back"
          >
            ← {t("backHome")}
          </Link>

          <p className="section-label">
            {t(
              "opportunityDatabase"
            )}
          </p>

          <h1>
            {t("exploreAll")}
          </h1>

          <p>
            {t(
              "exploreDescription"
            )}
          </p>
        </div>
      </section>

      <section className="all-page-content">
        <div className="container">
          <AllOpportunitiesBrowser
            opportunities={
              opportunities
            }
          />
        </div>
      </section>

      <footer>
        <div className="container footer-inner">
          <div>
            <div className="brand">
              Xeveza<span>.</span>
            </div>

            <p>
              {t(
                "footerTagline"
              )}
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