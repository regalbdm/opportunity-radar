"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
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

export default function OpportunityBrowser({
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

  const carouselRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const isPaused =
    useRef(false);

  const isDragging =
    useRef(false);

  const startX =
    useRef(0);

  const startScrollLeft =
    useRef(0);

  const animationFrame =
    useRef<number | null>(
      null
    );

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
                .filter(
                  Boolean
                )
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

  const visibleItems =
    filteredItems.slice(
      0,
      20
    );

  const carouselItems = [
    ...visibleItems,
    ...visibleItems,
  ];

  const resetFilters = () => {
    setActiveCategory("All");
    setSearch("");
    setRemoteOnly(false);
    setIndonesiaOnly(false);
    setSort("newest");
  };

  useEffect(() => {
    const el =
      carouselRef.current;

    if (!el) return;

    el.scrollLeft = 0;

    let lastTime =
      performance.now();

    const speed = 18;

    const animate = (
      currentTime: number
    ) => {
      const carousel =
        carouselRef.current;

      if (!carousel) {
        return;
      }

      const delta =
        currentTime -
        lastTime;

      lastTime =
        currentTime;

      if (
        !isPaused.current &&
        !isDragging.current
      ) {
        carousel.scrollLeft +=
          (speed * delta) /
          1000;

        const halfWidth =
          carousel.scrollWidth /
          2;

        if (
          carousel.scrollLeft >=
          halfWidth
        ) {
          carousel.scrollLeft -=
            halfWidth;
        }
      }

      animationFrame.current =
        requestAnimationFrame(
          animate
        );
    };

    animationFrame.current =
      requestAnimationFrame(
        animate
      );

    return () => {
      if (
        animationFrame.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrame.current
        );
      }
    };
  }, [
    activeCategory,
    search,
    sort,
    remoteOnly,
    indonesiaOnly,
  ]);

  function handlePointerDown(
  e: React.PointerEvent<HTMLDivElement>
) {
  const target =
    e.target as HTMLElement;

  // Jangan aktifkan drag kalau user
  // mengklik link, button, input atau select.
  if (
    target.closest(
      "a, button, input, select"
    )
  ) {
    return;
  }

  const el =
    carouselRef.current;

  if (!el) return;

  isDragging.current =
    true;

  isPaused.current =
    true;

  startX.current =
    e.clientX;

  startScrollLeft.current =
    el.scrollLeft;

  el.setPointerCapture(
    e.pointerId
  );

  el.classList.add(
    "is-dragging"
  );
}

  function handlePointerMove(
    e: React.PointerEvent<HTMLDivElement>
  ) {
    if (
      !isDragging.current
    ) {
      return;
    }

    const el =
      carouselRef.current;

    if (!el) return;

    const delta =
      e.clientX -
      startX.current;

    el.scrollLeft =
      startScrollLeft.current -
      delta;
  }

  function stopDragging(
    e?: React.PointerEvent<HTMLDivElement>
  ) {
    const el =
      carouselRef.current;

    if (!el) return;

    isDragging.current =
      false;

    if (
      e &&
      el.hasPointerCapture(
        e.pointerId
      )
    ) {
      el.releasePointerCapture(
        e.pointerId
      );
    }

    el.classList.remove(
      "is-dragging"
    );
  }

  return (
    <>
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="section-label">
              {t("discover")}
            </p>

            <h2>
              {t(
                "latestOpportunities"
              )}
            </h2>
          </div>

          <select
            className="sort-button"
            value={sort}
            onChange={(e) =>
              setSort(
                e.target
                  .value as
                  | "newest"
                  | "score"
              )
            }
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

        <div className="browser-search">
          <span>⌕</span>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder={t(
              "searchPlaceholder"
            )}
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              className="clear-search"
            >
              ×
            </button>
          )}
        </div>

        <div className="categories">
          {categories.map(
            (category) => (
              <button
                key={
                  category.value
                }
                type="button"
                onClick={() =>
                  setActiveCategory(
                    category.value
                  )
                }
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
              onChange={(e) =>
                setRemoteOnly(
                  e.target
                    .checked
                )
              }
            />
            {t("remoteOnly")}
          </label>

          <label>
            <input
              type="checkbox"
              checked={
                indonesiaOnly
              }
              onChange={(e) =>
                setIndonesiaOnly(
                  e.target
                    .checked
                )
              }
            />
            {t(
              "indonesiaEligible"
            )}
          </label>
        </div>

        <div className="results-row">
          <span>
            {
              filteredItems.length
            }{" "}
            {t(
              "opportunitiesFound"
            )}
          </span>

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
      </div>

      {filteredItems.length >
      0 ? (
        <>
          <div
            ref={carouselRef}
            className="carousel manual-carousel"
            onPointerDown={
              handlePointerDown
            }
            onPointerMove={
              handlePointerMove
            }
            onPointerUp={
              stopDragging
            }
            onPointerCancel={
              stopDragging
            }
            onMouseEnter={() => {
              isPaused.current =
                true;
            }}
            onMouseLeave={() => {
              isPaused.current =
                false;
            }}
          >
            <div className="carousel-track manual-track">
              {carouselItems.map(
                (
                  item,
                  index
                ) => (
                  <article
                    className="opportunity-card"
                    key={`${item.id}-${index}`}
                  >
                    <div className="card-top">
                      <div className="company-logo">
                        {(
                          item.company ||
                          "X"
                        )
                          .charAt(
                            0
                          )
                          .toUpperCase()}
                      </div>

                      <div className="score">
                        <span>
                          XEVEZA
                          SCORE
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
                          {getWhyItMatters(
                            item,
                            language
                          ) ||
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
                              language ===
                                "id"
                                ? "id-ID"
                                : language ===
                                    "de"
                                  ? "de-DE"
                                  : language ===
                                      "es"
                                    ? "es-ES"
                                    : language ===
                                        "pt"
                                      ? "pt-BR"
                                      : "en-US",
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
                )
              )}
            </div>
          </div>

          <div className="container view-all-row">
            <Link
              href="/opportunities"
              className="view-all-button"
            >
              {t("viewAll")} →
            </Link>
          </div>
        </>
      ) : (
        <div className="container empty-state">
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
    </>
  );
}