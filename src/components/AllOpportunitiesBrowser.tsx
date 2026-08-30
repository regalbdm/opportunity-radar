"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";

import {
  Language,
  useLanguage,
} from "@/components/LanguageProvider";

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

const categories = [
  {
    value: "All",
    key: "all",
  },
  {
    value: "Remote Jobs",
    key: "remoteJobs",
  },
  {
    value: "Freelance",
    key: "freelance",
  },
  {
    value: "AI Jobs",
    key: "aiJobs",
  },
  {
    value: "Internship",
    key: "internship",
  },
  {
    value: "Competition",
    key: "competition",
  },
  {
    value: "Grants",
    key: "grants",
  },
];

const PAGE_SIZE = 12;

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

export default function AllOpportunitiesBrowser({
  opportunities,
}: {
  opportunities: Opportunity[];
}) {
  const {
    language,
    t,
  } = useLanguage();

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("All");

  const [search, setSearch] =
    useState("");

  const [sort, setSort] =
    useState<
      "newest" | "score"
    >("newest");

  const [
    remoteOnly,
    setRemoteOnly,
  ] = useState(false);

  const [
    indonesiaOnly,
    setIndonesiaOnly,
  ] = useState(false);

  const [page, setPage] =
    useState(1);

  const filteredItems =
    useMemo(() => {
      let result = [
        ...opportunities,
      ];

      if (
        activeCategory !==
        "All"
      ) {
        result =
          result.filter(
            (item) =>
              item.category ===
              activeCategory
          );
      }

      if (remoteOnly) {
        result =
          result.filter(
            (item) =>
              item.work_mode ===
                "Remote" ||
              item.remote === true
          );
      }

      if (indonesiaOnly) {
        result =
          result.filter(
            (item) =>
              item.indonesia_eligible ===
              true
          );
      }

      const keyword =
        search
          .trim()
          .toLowerCase();

      if (keyword) {
        result =
          result.filter(
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
                ...(item.tags ??
                  []),
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
            (b.xeveza_score ??
              0) -
            (a.xeveza_score ??
              0)
        );
      } else {
        result.sort(
          (a, b) => {
            const aDate =
              a.published_at
                ? new Date(
                    a.published_at
                  ).getTime()
                : 0;

            const bDate =
              b.published_at
                ? new Date(
                    b.published_at
                  ).getTime()
                : 0;

            return (
              bDate - aDate
            );
          }
        );
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

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredItems.length /
          PAGE_SIZE
      )
    );

  const safePage =
    Math.min(
      page,
      totalPages
    );

  const start =
    (safePage - 1) *
    PAGE_SIZE;

  const visibleItems =
    filteredItems.slice(
      start,
      start + PAGE_SIZE
    );

  function resetFilters() {
    setActiveCategory("All");
    setSearch("");
    setSort("newest");
    setRemoteOnly(false);
    setIndonesiaOnly(false);
    setPage(1);
  }

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
            placeholder={t(
              "searchPlaceholder"
            )}
            onChange={(e) => {
              setSearch(
                e.target.value
              );

              setPage(1);
            }}
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
              ×
            </button>
          )}
        </div>

        <select
          className="sort-button"
          value={sort}
          onChange={(e) => {
            setSort(
              e.target
                .value as
                | "newest"
                | "score"
            );

            setPage(1);
          }}
        >
          <option value="newest">
            {t(
              "newestFirst"
            )}
          </option>

          <option value="score">
            {t(
              "highestScore"
            )}
          </option>
        </select>
      </div>

      <div className="categories">
        {categories.map(
          (category) => (
            <button
              key={
                category.value
              }
              type="button"
              onClick={() => {
                setActiveCategory(
                  category.value
                );

                setPage(1);
              }}
              className={
                activeCategory ===
                category.value
                  ? "category active"
                  : "category"
              }
            >
              {t(
                category.key
              )}
            </button>
          )
        )}
      </div>

      <div className="advanced-filters">
        <label>
          <input
            type="checkbox"
            checked={
              remoteOnly
            }
            onChange={(e) => {
              setRemoteOnly(
                e.target.checked
              );

              setPage(1);
            }}
          />

          {t("remoteOnly")}
        </label>

        <label>
          <input
            type="checkbox"
            checked={
              indonesiaOnly
            }
            onChange={(e) => {
              setIndonesiaOnly(
                e.target.checked
              );

              setPage(1);
            }}
          />

          {t(
            "indonesiaEligible"
          )}
        </label>
      </div>

      <div className="all-results-head">
        <div>
          <strong>
            {
              filteredItems.length
            }
          </strong>{" "}
          {t(
            "opportunitiesFound"
          )}
        </div>

        <button
          type="button"
          className="reset-filter"
          onClick={
            resetFilters
          }
        >
          {t(
            "resetFilters"
          )}
        </button>
      </div>

      {visibleItems.length >
      0 ? (
        <>
          <div className="all-opportunity-grid">
            {visibleItems.map(
              (item) => {
                const why =
                  getWhyItMatters(
                    item,
                    language
                  );

                return (
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
                          t(
                            "notSpecified"
                          )}
                      </p>

                      <h3>
                        {item.title}
                      </h3>

                      <div className="meta">
                        <span>
                          🌎{" "}
                          {item.location ||
                            t(
                              "notSpecified"
                            )}
                        </span>

                        <span>
                          ◷{" "}
                          {item.work_mode ||
                            item.category ||
                            t(
                              "notSpecified"
                            )}
                        </span>

                        <span>
                          💰{" "}
                          {item.compensation ||
                            t(
                              "notDisclosed"
                            )}
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
                            {t(
                              "barrier"
                            )}
                            :{" "}
                            {
                              item.entry_barrier
                            }
                          </span>
                        )}

                        {item.indonesia_eligible ===
                          true && (
                          <span>
                            {t(
                              "indonesiaAllowed"
                            )}
                          </span>
                        )}
                      </div>

                      <div className="tags">
                        {(item.tags ??
                          [])
                          .slice(
                            0,
                            4
                          )
                          .map(
                            (
                              tag
                            ) => (
                              <span
                                key={`${item.id}-${tag}`}
                              >
                                {
                                  tag
                                }
                              </span>
                            )
                          )}
                      </div>

                      <div className="why">
                        <span>
                          ✦{" "}
                          {t(
                            "whyItMatters"
                          )}
                        </span>

                        <p>
                          {why ||
                            t(
                              "notSpecified"
                            )}
                        </p>
                      </div>
                    </div>

                    <div className="card-footer">
                      <span>
                        {item.published_at
                          ? new Date(
                              item.published_at
                            ).toLocaleDateString(
                              getLocale(
                                language
                              ),
                              {
                                month:
                                  "short",
                                day:
                                  "numeric",
                              }
                            )
                          : t(
                              "recently"
                            )}
                      </span>

                      <Link
                        href={`/opportunity/${item.id}`}
                      >
                        {t(
                          "viewDetails"
                        )}{" "}
                        →
                      </Link>
                    </div>
                  </article>
                );
              }
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
              ← {t("previous")}
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
                  (
                    pageNumber
                  ) =>
                    pageNumber ===
                      1 ||
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
              {t("next")} →
            </button>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <h3>
            {t(
              "noOpportunities"
            )}
          </h3>

          <p>
            {t("tryAnother")}
          </p>

          <button
            type="button"
            onClick={
              resetFilters
            }
          >
            {t("showAll")}
          </button>
        </div>
      )}
    </div>
  );
}