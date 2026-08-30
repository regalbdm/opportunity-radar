import Link from "next/link";

export default function NotFound() {
  return (
    <main className="state-page">
      <div className="state-card">
        <p className="section-label">
          404 — NOT FOUND
        </p>

        <h1>
          Opportunity not found.
        </h1>

        <p>
          It may have been removed,
          expired, or is no longer active.
        </p>

        <div className="state-actions">
          <Link
            href="/opportunities"
            className="state-primary-button"
          >
            Browse opportunities
          </Link>

          <Link
            href="/"
            className="state-secondary-link"
          >
            ← Back home
          </Link>
        </div>
      </div>
    </main>
  );
}