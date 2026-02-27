import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] font-body text-slate-200 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* glow blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-emerald-500/3 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          {/* 404 large display */}
          <div className="relative mb-8 select-none">
            <p className="font-display text-[clamp(120px,20vw,220px)] font-extrabold leading-none tracking-tighter text-slate-900">
              404
            </p>
            <p
              className="absolute inset-0 font-display text-[clamp(120px,20vw,220px)] font-extrabold leading-none tracking-tighter text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #10b981 0%, #059669 50%, transparent 100%)",
                WebkitBackgroundClip: "text",
              }}
            >
              404
            </p>
          </div>

          {/* eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="block w-8 h-px bg-emerald-400" />
            <span className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase">
              Page Not Found
            </span>
            <span className="block w-8 h-px bg-emerald-400" />
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-white mb-4">
            Looks like this page{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-emerald-400">
                doesn't exist
              </span>
              <span className="absolute bottom-1 left-0 w-full h-2.5 bg-emerald-400/10 -skew-x-3" />
            </span>
          </h1>

          <p className="text-slate-500 text-base font-light leading-relaxed mb-10 max-w-sm mx-auto">
            The page you're looking for may have been moved, deleted, or never
            existed in the first place.
          </p>

          {/* actions */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-sm transition-colors duration-150"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Back to Home
            </Link>
            <Link
              to="/jobs"
              className="flex items-center gap-2 px-6 py-3 border border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400 text-sm font-medium rounded-sm transition-colors duration-150"
            >
              Browse Jobs
            </Link>
          </div>

          {/* decorative job cards */}
          <div className="mt-16 flex flex-col gap-2 max-w-xs mx-auto opacity-30 pointer-events-none select-none">
            {["React Engineer", "Product Designer", "Backend — Go"].map(
              (title, i) => (
                <div
                  key={title}
                  className="border border-slate-800 bg-slate-900/60 rounded-sm px-4 py-3 flex items-center justify-between"
                  style={{
                    transform: `translateX(${i % 2 === 0 ? "-" : ""}${i * 10}px)`,
                  }}
                >
                  <span className="text-xs font-medium text-slate-400">
                    {title}
                  </span>
                  <span className="text-[10px] text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded-sm">
                    404
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
