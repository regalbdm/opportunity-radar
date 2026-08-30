import Link from "next/link";

import { supabase } from "@/lib/supabase";
import AllOpportunitiesBrowser from "@/components/AllOpportunitiesBrowser";

export default async function OpportunitiesPage() {
  const {
    data: opportunities,
    error,
  } = await supabase
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

  const items =
    opportunities ?? [];

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

          <nav>
            <Link href="/">
              Home
            </Link>

            <Link href="/#how-it-works">
              How it works
            </Link>

            <Link href="/#about">
              About
            </Link>
          </nav>
        </div>
      </header>

      <section className="all-page-hero">
        <div className="container">
          <Link
            href="/"
            className="detail-back"
          >
            ← Back home
          </Link>

          <p className="section-label">
            OPPORTUNITY DATABASE
          </p>

          <h1>
            Explore all
            opportunities.
          </h1>

          <p>
            Search, filter and
            compare opportunities
            discovered by Xeveza.
          </p>
        </div>
      </section>

      <section className="all-page-content">
        <div className="container">
          <AllOpportunitiesBrowser
            opportunities={items}
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
              Discover what&apos;s
              worth your time.
            </p>
          </div>

          <p className="disclaimer">
            Xeveza does not own or
            represent listed
            opportunities.
            Applications are
            completed on the
            original source.
          </p>
        </div>
      </footer>
    </main>
  );
}