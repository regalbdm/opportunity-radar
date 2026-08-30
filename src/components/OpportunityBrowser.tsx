"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

export default function OpportunityBrowser({
  opportunities,
}: {
  opportunities: Opportunity[];
}) {
  const [activeCategory, setActiveCategory] =
    useState("All");

  const [search, setSearch] = useState("");

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

  const carouselRef =
    useRef<HTMLDivElement | null>(null);

  const isPaused = useRef(false);
  const isDragging = useRef(false);

  const startX = useRef(0);
  const startScrollLeft = useRef(0);

  const animationFrame =
    useRef<number | null>(null);

  const filteredItems = useMemo(() => {
    let result = [...opportunities];

    if (activeCategory !== "All") {
      result = result.filter(
        (item) =>
          item.category === activeCategory
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
          item.indonesia_eligible === true
      );
    }

    const keyword =
      search.trim().toLowerCase();

    if (keyword) {
      result = result.filter((item) => {
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
      });
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

  const visibleItems =
    filteredItems.slice(0, 20);

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

  // =================================
  // AUTO SCROLL
  // =================================

  useEffect(() => {
    const el = carouselRef.current;

    if (!el) return;

    // reset posisi saat filter berubah
    el.scrollLeft = 0;

    let lastTime =
      performance.now();

    const speed = 22;
    // pixels per second

    const animate = (
      currentTime: number
    ) => {
      const carousel =
        carouselRef.current;

      if (!carousel) return;

      const delta =
        currentTime - lastTime;

      lastTime = currentTime;

      if (
        !isPaused.current &&
        !isDragging.current
      ) {
        carousel.scrollLeft +=
          (speed * delta) / 1000;

        const halfWidth =
          carousel.scrollWidth / 2;

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

  // =================================
  // MANUAL DRAG
  // =================================

  function handlePointerDown(
    e: React.PointerEvent<HTMLDivElement>
  ) {
    const el =
      carouselRef.current;

    if (!el) return;

    isDragging.current = true;
    isPaused.current = true;

    startX.current = e.clientX;

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

    isDragging.current = false;

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

  function handleMouseEnter() {
    isPaused.current = true;
  }

  function handleMouseLeave() {
    isPaused.current = false;
  }

  return (
    <>
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="section-label">
              DISCOVER
            </p>

            <h2>
              Latest opportunities
            </h2>
          </div>

          <select
            className="sort-button"
            value={sort}
            onChange={(e) =>
              setSort(
                e.target.value as
                  | "newest"
                  | "score"
              )
            }
          >
            <option value="newest">
              Newest first
            </option>

            <option value="score">
              Highest score
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
            placeholder="Search title, company, location, skill..."
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              className="clear-search"
            >
              Clear
            </button>
          )}
        </div>

        <div className="categories">
          {categories.map(
            (category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setActiveCategory(
                    category
                  )
                }
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
              onChange={(e) =>
                setRemoteOnly(
                  e.target.checked
                )
              }
            />

            Remote only
          </label>

          <label>
            <input
              type="checkbox"
              checked={
                indonesiaOnly
              }
              onChange={(e) =>
                setIndonesiaOnly(
                  e.target.checked
                )
              }
            />

            Indonesia eligible
          </label>
        </div>

        <div className="results-row">
          <span>
            {filteredItems.length}{" "}
            opportunities
          </span>

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
      </div>

      {filteredItems.length > 0 ? (
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
            onMouseEnter={
              handleMouseEnter
            }
            onMouseLeave={
              handleMouseLeave
            }
          >
            <div className="carousel-track manual-track">
              {carouselItems.map(
                (item, index) => (
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
          </div>

          <div className="container view-all-row">
            <Link
              href="/opportunities"
              className="view-all-button"
            >
              View all opportunities →
            </Link>
          </div>
        </>
      ) : (
        <div className="container empty-state">
          <h3>
            No opportunities found
          </h3>

          <p>
            Try another category
            or filter.
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
    </>
  );
}