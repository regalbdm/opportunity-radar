export default function OpportunitiesLoading() {
  return (
    <main className="all-page">
      <header className="navbar">
        <div className="container nav-inner">
          <div className="brand">
            Xeveza<span>.</span>
          </div>
        </div>
      </header>

      <section className="all-page-hero">
        <div className="container">
          <p className="section-label">
            OPPORTUNITY DATABASE
          </p>

          <h1>
            Explore all opportunities.
          </h1>

          <p>
            Loading the latest radar data...
          </p>
        </div>
      </section>

      <section className="all-page-content">
        <div className="container">
          <div className="skeleton-toolbar">
            <div className="skeleton skeleton-search"></div>
            <div className="skeleton skeleton-sort"></div>
          </div>

          <div className="skeleton-grid">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <div
                className="skeleton skeleton-card"
                key={index}
              ></div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}