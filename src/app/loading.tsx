export default function Loading() {
  return (
    <main className="state-page">
      <div className="state-loader">
        <div className="loader-radar">
          <span></span>
        </div>

        <p className="section-label">
          XEVEZA RADAR
        </p>

        <h1>Scanning opportunities...</h1>

        <p>
          Loading the latest opportunities
          from the radar.
        </p>
      </div>
    </main>
  );
}