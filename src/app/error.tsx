"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      "Xeveza page error:",
      error
    );
  }, [error]);

  return (
    <main className="state-page">
      <div className="state-card">
        <p className="section-label">
          RADAR INTERRUPTED
        </p>

        <h1>
          Something went wrong.
        </h1>

        <p>
          Xeveza could not load this
          section. Your data is safe.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="state-primary-button"
        >
          Try again
        </button>

        <Link
          href="/"
          className="state-secondary-link"
        >
          ← Back home
        </Link>
      </div>
    </main>
  );
}