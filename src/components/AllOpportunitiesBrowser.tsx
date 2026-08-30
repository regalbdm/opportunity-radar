"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
  why_it_matters: string | null;
  published_at: string | null;

  indonesia_eligible?: boolean | null;
  seniority?: string | null;
  work_mode?: string | null;
  ai_relevant?: boolean | null;
  entry_barrier?: string | null;
};

const categories = [
  "All",
  "Remote Jobs",
  "Freelance",
  "AI Jobs",
  "Internship",
  "Competition",
  "Grants",
];

const PAGE_SIZE = 12;

export default function AllOpportunitiesBrowser({
  opportunities,
}: {
  opportunities: Opportunity[];
}) {
  const [activeCategory, setActiveCategory] =
    useState("All");

  const [search, setSearch] =
    useState("");

  const [sort, setSort] =
    useState<"newest" | "score">(
      "newest"
    );

  const [remoteOnly, setRemoteOnly] =
    useState(false);

  const [
    indonesiaOnly,
    setIndonesiaOnly,
  ] = useState(false);

  const [page, setPage] = useState(1);

  const filteredItems = useMemo(() => {
    let result = [...opportunities];

    if (activeCategory !== "All") {
      result = result.filter(
        (item) =>
          item.category ===
          activeCategory
      );
    }

    if (remoteOnly) {
      result = result.filter(
        (item) =>
          item.work_mode === "Remote" ||
          item.remote === true
      );
    }

    if (indonesiaOnly) {
      result = result.filter(
        (item) =>
          item.indonesia_eligible ===
          true
      );
    }

    const keyword =
      search.trim().toLowerCase();

    if (keyword) {
      result = result.filter(
        (item) => {
          const haystack = [
            item.title,
            item.company,
            item.location,
            item.category,
            item.compensation,
            item.seniority,
            item.work_mode,
            item.entry_barrier,
            ...(item.tags ?? []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(
            keyword
          );
        }
      );
    }

    if (sort === "score") {
      result.sort(
        (a, b) =>
          (b.xeveza_score ?? 0) -
          (a.xeveza_score ?? 0)
      );
    } else {
      result.sort((a, b) => {
        const aDate = a.published_at
          ? new Date(
              a.published_at
            ).getTime()
          : 0;

        const bDate = b.published_at
          ? new Date(
              b.published_at
            ).getTime()
          : 0;

        return bDate - aDate;
      });
    }

    return result;
  }, [
    opportunities,
    activeCategory,
    search,
    sort,
    remoteOnly,
    indonesiaOnly,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredItems.length /
        PAGE_SIZE
    )
  );

  const safePage = Math.min(
    page,
    totalPages
  );

  const start =
    (safePage - 1) * PAGE_SIZE;

  const visibleItems =
    filteredItems.slice(
      start,
      start + PAGE_SIZE
    );

  const resetFilters = () => {
    setActiveCategory("All");
    setSearch("");
    setSort("newest");
    setRemoteOnly(false);
    setIndonesiaOnly(false);
    setPage(1);
  };

  function goToPage(
    nextPage: number
  ) {
    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div className="all-browser">
      <div className="all-browser-toolbar">
        <div className="browser-search all-search">
          <span>⌕</span>

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(
                e.target.value
              );
              setPage(1);
            }}
            placeholder="Search title, company, location, skill..."
          />

          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
            >
              Clear
            </button>
          )}
        </div>

        <select
          className="sort-button"
          value={sort}
          onChange={(e) => {
            setSort(
              e.target.value as
                | "newest"
                | "score"
            );
            setPage(1);
          }}
        >
          <option value="newest">
            Newest first
          </option>

          <option value="score">
            Highest score
          </option>
        </select>
      </div>

      <div className="categories">
        {categories.map(
          (category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setActiveCategory(
                  category
                );
                setPage(1);
              }}
              className={
                activeCategory ===
                  category
                  ? "category active"
                  : "category"
              }
            >
              {category}
            </button>
          )
        )}
      </div>

      <div className="advanced-filters">
        <label>
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => {
              setRemoteOnly(
                e.target.checked
              );
              setPage(1);
            }}
          />

          Remote only
        </label>

        <label>
          <input
            type="checkbox"
            checked={indonesiaOnly}
            onChange={(e) => {
              setIndonesiaOnly(
                e.target.checked
              );
              setPage(1);
            }}
          />

          Indonesia eligible
        </label>
      </div>

      <div className="all-results-head">
        <div>
          <strong>
            {filteredItems.length}
          </strong>{" "}
          opportunities found
        </div>

        <button
          type="button"
          className="reset-filter"
          onClick={
            resetFilters
          }
        >
          Reset filters
        </button>
      </div>

      {visibleItems.length > 0 ? (
        <>
          <div className="all-opportunity-grid">
            {visibleItems.map(
              (item) => (
                <article
                  className="opportunity-card all-opportunity-card"
                  key={item.id}
                >
                  <div className="card-top">
                    <div className="company-logo">
                      {(
                        item.company ||
                        "X"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="score">
                      <span>
                        XEVEZA SCORE
                      </span>

                      <strong>
                        {item.xeveza_score ??
                          "--"}
                      </strong>

                      <small>
                        /100
                      </small>
                    </div>
                  </div>

                  <div className="card-content">
                    <p className="company">
                      {item.company ||
                        "Company not specified"}
                    </p>

                    <h3>
                      {item.title}
                    </h3>

                    <div className="meta">
                      <span>
                        🌎{" "}
                        {item.location ||
                          "Not specified"}
                      </span>

                      <span>
                        ◷{" "}
                        {item.work_mode ||
                          item.category ||
                          "Opportunity"}
                      </span>

                      <span>
                        💰{" "}
                        {item.compensation ||
                          "Not disclosed"}
                      </span>
                    </div>

                    <div className="card-flags">
                      {item.seniority && (
                        <span>
                          {
                            item.seniority
                          }
                        </span>
                      )}

                      {item.entry_barrier && (
                        <span>
                          Barrier:{" "}
                          {
                            item.entry_barrier
                          }
                        </span>
                      )}

                      {item.indonesia_eligible ===
                        true && (
                        <span>
                          Indonesia ✓
                        </span>
                      )}
                    </div>

                    <div className="tags">
                      {(item.tags ?? [])
                        .slice(0, 4)
                        .map(
                          (tag) => (
                            <span
                              key={`${item.id}-${tag}`}
                            >
                              {tag}
                            </span>
                          )
                        )}
                    </div>

                    <div className="why">
                      <span>
                        ✦ Why it
                        matters
                      </span>

                      <p>
                        {item.why_it_matters ||
                          "Worth checking based on Xeveza analysis."}
                      </p>
                    </div>
                  </div>

                  <div className="card-footer">
                    <span>
                      {item.published_at
                        ? new Date(
                            item.published_at
                          ).toLocaleDateString(
                            "en-US",
                            {
                              month:
                                "short",
                              day:
                                "numeric",
                            }
                          )
                        : "Recently"}
                    </span>

                    <Link
                      href={`/opportunity/${item.id}`}
                    >
                      View details →
                    </Link>
                  </div>
                </article>
              )
            )}
          </div>

          <div className="pagination">
            <button
              type="button"
              disabled={
                safePage === 1
              }
              onClick={() =>
                goToPage(
                  safePage - 1
                )
              }
            >
              ← Previous
            </button>

            <div className="pagination-pages">
              {Array.from(
                {
                  length:
                    totalPages,
                },
                (_, index) =>
                  index + 1
              )
                .filter(
                  (pageNumber) =>
                    pageNumber === 1 ||
                    pageNumber ===
                      totalPages ||
                    Math.abs(
                      pageNumber -
                        safePage
                    ) <= 1
                )
                .map(
                  (
                    pageNumber,
                    index,
                    array
                  ) => {
                    const previous =
                      array[
                        index - 1
                      ];

                    return (
                      <span
                        key={
                          pageNumber
                        }
                      >
                        {previous &&
                          pageNumber -
                            previous >
                            1 && (
                            <span className="pagination-dots">
                              …
                            </span>
                          )}

                        <button
                          type="button"
                          className={
                            safePage ===
                            pageNumber
                              ? "pagination-number active"
                              : "pagination-number"
                          }
                          onClick={() =>
                            goToPage(
                              pageNumber
                            )
                          }
                        >
                          {
                            pageNumber
                          }
                        </button>
                      </span>
                    );
                  }
                )}
            </div>

            <button
              type="button"
              disabled={
                safePage ===
                totalPages
              }
              onClick={() =>
                goToPage(
                  safePage + 1
                )
              }
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <h3>
            No opportunities found
          </h3>

          <p>
            Try another category,
            search term, or filter.
          </p>

          <button
            type="button"
            onClick={
              resetFilters
            }
          >
            Show all
            opportunities
          </button>
        </div>
      )}
    </div>
  );
}