import { Building2, Calendar, ChevronDown, MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { useJobApplication } from "../../hooks/useJobApplication";
import { userAPI } from "../../services/api";

export default function AppliedJobs() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { withdrawApplication } = useJobApplication();

  const [statusFilter, setStatusFilter] = useState([]);
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, statusFilter, dateFilter, sortBy]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".dropdown")) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await userAPI.getAppliedJobs({ sort: "-createdAt" });
      const data = response.data?.data || response.data || [];
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];
    if (statusFilter.length > 0) {
      filtered = filtered.filter((app) => statusFilter.includes(app.status));
    }
    const now = new Date();
    if (dateFilter !== "all") {
      filtered = filtered.filter((app) => {
        const diff = Math.ceil(
          Math.abs(now - new Date(app.createdAt)) / (1000 * 60 * 60 * 24),
        );
        if (dateFilter === "7days") return diff <= 7;
        if (dateFilter === "30days") return diff <= 30;
        if (dateFilter === "3months") return diff <= 90;
        return true;
      });
    }
    filtered.sort((a, b) => {
      const diff = new Date(b.createdAt) - new Date(a.createdAt);
      return sortBy === "newest" ? diff : -diff;
    });
    setFilteredApplications(filtered);
  };

  const toggleStatus = (status) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const handleResetFilters = () => {
    setStatusFilter([]);
    setDateFilter("all");
    setSortBy("newest");
  };

  const handleWithdraw = async (jobId, applicationId) => {
    const result = await withdrawApplication(jobId);
    if (result.success) {
      setApplications((prev) => prev.filter((app) => app.id !== applicationId));
    }
  };

  const statusConfig = {
    pending: {
      label: "Pending",
      color: "text-amber-400 border-amber-400/30 bg-amber-400/5",
    },
    shortlisted: {
      label: "Shortlisted",
      color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
    },
    accepted: {
      label: "Accepted",
      color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
    },
    rejected: {
      label: "Rejected",
      color: "text-red-400 border-red-400/30 bg-red-400/5",
    },
    "under review": {
      label: "Under Review",
      color: "text-sky-400 border-sky-400/30 bg-sky-400/5",
    },
  };

  const getStatusStyle = (status) =>
    statusConfig[status?.toLowerCase()]?.color ??
    "text-slate-400 border-slate-600 bg-slate-800";
  const getStatusLabel = (status) =>
    statusConfig[status?.toLowerCase()]?.label ?? status;

  const counts = {
    pending: applications.filter((a) => a.status === "pending").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const hasActiveFilters = statusFilter.length > 0 || dateFilter !== "all";

  return (
    <div className="min-h-screen bg-[#0a0a0b] font-body text-slate-200">
      <Header />

      <main>
        {/* ── PAGE HEADER ─────────────────────────────────── */}
        <section className="relative border-b border-slate-800 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="absolute top-0 left-0 w-[500px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            {/* breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-8">
              <Link
                to="/dashboard"
                className="hover:text-emerald-400 transition-colors"
              >
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-slate-400">Applied Jobs</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="block w-8 h-px bg-emerald-400" />
                  <span className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase">
                    Application Tracker
                  </span>
                </div>
                <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-[0.95] tracking-tight text-white mb-4">
                  Your
                  <br />
                  <span className="relative inline-block">
                    <span className="relative z-10 text-emerald-400">
                      Applications
                    </span>
                    <span className="absolute bottom-1 left-0 w-full h-3 bg-emerald-400/10 -skew-x-3" />
                  </span>
                </h1>
                <p className="text-slate-400 text-base font-light leading-relaxed max-w-sm">
                  Track every role you've pursued — all in one focused view.
                </p>
              </div>

              {/* quick stats */}
              <div className="flex gap-8">
                {[
                  { label: "Total", value: applications.length },
                  { label: "Shortlisted", value: counts.shortlisted },
                  { label: "Pending", value: counts.pending },
                ].map(({ label, value }) => (
                  <div key={label} className="text-right">
                    <p className="text-3xl font-display font-bold text-white">
                      {value}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FILTER BAR ──────────────────────────────────── */}
        <section className="sticky top-0 z-30 bg-[#0a0a0b]/95 backdrop-blur border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-2">
            {/* Status dropdown */}
            <div className="dropdown relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "status" ? null : "status")
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-medium transition-colors duration-150 ${
                  statusFilter.length > 0
                    ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                    : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300"
                }`}
              >
                Status
                {statusFilter.length > 0 && (
                  <span className="w-4 h-4 bg-emerald-500 text-black rounded-full text-[10px] font-bold flex items-center justify-center">
                    {statusFilter.length}
                  </span>
                )}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
              {openDropdown === "status" && (
                <div className="absolute top-full left-0 mt-2 bg-slate-900 border border-slate-700 rounded-sm shadow-2xl shadow-black/50 z-40 min-w-[160px] py-1">
                  {[
                    { val: "pending", label: "Pending", count: counts.pending },
                    {
                      val: "shortlisted",
                      label: "Shortlisted",
                      count: counts.shortlisted,
                    },
                    {
                      val: "rejected",
                      label: "Rejected",
                      count: counts.rejected,
                    },
                  ].map(({ val, label, count }) => (
                    <label
                      key={val}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={statusFilter.includes(val)}
                        onChange={() => toggleStatus(val)}
                        className="accent-emerald-500 w-3.5 h-3.5"
                      />
                      <span className="text-xs text-slate-300 flex-1">
                        {label}
                      </span>
                      <span className="text-[10px] text-slate-600">
                        {count}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Date dropdown */}
            <div className="dropdown relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "date" ? null : "date")
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-medium transition-colors duration-150 ${
                  dateFilter !== "all"
                    ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                    : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300"
                }`}
              >
                Date
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
              {openDropdown === "date" && (
                <div className="absolute top-full left-0 mt-2 bg-slate-900 border border-slate-700 rounded-sm shadow-2xl shadow-black/50 z-40 min-w-[160px] py-1">
                  {[
                    { val: "all", label: "All Time" },
                    { val: "7days", label: "Last 7 Days" },
                    { val: "30days", label: "Last 30 Days" },
                    { val: "3months", label: "Last 3 Months" },
                  ].map(({ val, label }) => (
                    <button
                      key={val}
                      onClick={() => {
                        setDateFilter(val);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-slate-800 ${
                        dateFilter === val
                          ? "text-emerald-400"
                          : "text-slate-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="dropdown relative ml-auto">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === "sort" ? null : "sort")
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-slate-700 text-slate-400 hover:border-slate-500 text-xs font-medium transition-colors"
              >
                {sortBy === "newest" ? "Newest First" : "Oldest First"}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
              {openDropdown === "sort" && (
                <div className="absolute top-full right-0 mt-2 bg-slate-900 border border-slate-700 rounded-sm shadow-2xl shadow-black/50 z-40 min-w-[160px] py-1">
                  {[
                    { val: "newest", label: "Newest First" },
                    { val: "oldest", label: "Oldest First" },
                  ].map((s) => (
                    <button
                      key={s.val}
                      onClick={() => {
                        setSortBy(s.val);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-slate-800 ${
                        sortBy === s.val ? "text-emerald-400" : "text-slate-300"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        </section>

        {/* ── APPLICATIONS LIST ────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-white tracking-tight">
                All Applications
              </h2>
              <p className="text-slate-500 text-xs mt-1 tracking-wide">
                {loading
                  ? "Loading…"
                  : `${filteredApplications.length} of ${applications.length} shown`}
              </p>
            </div>
            <span className="hidden md:block w-24 h-px bg-slate-800" />
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-sm bg-slate-900 border border-slate-800 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="border border-red-400/20 bg-red-400/5 rounded-sm py-16 text-center">
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button
                onClick={fetchApplications}
                className="px-5 py-2.5 border border-slate-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 text-sm rounded-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredApplications.length === 0 && (
            <div className="border border-slate-800 border-dashed rounded-sm py-24 text-center">
              <Calendar className="h-8 w-8 text-slate-700 mx-auto mb-4" />
              <h3 className="text-slate-400 font-display font-bold text-xl">
                {hasActiveFilters ? "No matches found" : "No applications yet"}
              </h3>
              <p className="text-slate-600 text-sm mt-2">
                {hasActiveFilters
                  ? "Try adjusting your filters."
                  : "Start applying to roles to track them here."}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={handleResetFilters}
                  className="mt-6 px-5 py-2.5 border border-slate-700 text-slate-400 hover:border-emerald-500 hover:text-emerald-400 text-sm rounded-sm transition-colors"
                >
                  Clear filters
                </button>
              ) : (
                <Link
                  to="/"
                  className="inline-block mt-6 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-sm transition-colors"
                >
                  Browse Jobs
                </Link>
              )}
            </div>
          )}

          {/* Cards */}
          {!loading && !error && filteredApplications.length > 0 && (
            <div className="space-y-px">
              {filteredApplications.map((app) => (
                <article
                  key={app.id}
                  className={`group relative border border-slate-800/80 hover:border-emerald-500/30 hover:bg-slate-900/80 transition-all duration-200 rounded-sm ${
                    app.status === "rejected"
                      ? "bg-slate-900/20 opacity-60"
                      : "bg-slate-900/40"
                  }`}
                >
                  {/* left accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400 scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top rounded-sm" />

                  <div className="flex flex-col md:flex-row gap-5 p-5 md:p-6 pl-5 md:pl-7">
                    {/* logo */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-sm bg-slate-800 border border-slate-700/50 flex items-center justify-center group-hover:border-emerald-500/20 transition-colors">
                        <Building2 className="h-5 w-5 text-slate-500" />
                      </div>
                    </div>

                    {/* content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div>
                          <h3 className="font-display font-bold text-lg text-white tracking-tight group-hover:text-emerald-300 transition-colors duration-200">
                            <Link to={`/jobs/${app.job?.slug}`}>
                              {app.job?.title || "Job Title"}
                            </Link>
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                            <Link
                              to={`/companies/${app.job?.company?.slug || ""}`}
                              className="text-slate-400 hover:text-emerald-400 font-medium transition-colors"
                            >
                              {app.job?.company?.name || "Company"}
                            </Link>
                            {app.job?.location && (
                              <>
                                <span className="text-slate-700">·</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {app.job.location}
                                </span>
                              </>
                            )}
                            {app.job?.jobType && (
                              <>
                                <span className="text-slate-700">·</span>
                                <span>{app.job.jobType}</span>
                              </>
                            )}
                            <span className="text-slate-700">·</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Applied{" "}
                              {new Date(app.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </div>

                        {/* salary + status */}
                        <div className="flex-shrink-0 flex flex-col items-end gap-2">
                          {app.job?.salaryMin && app.job?.salaryMax && (
                            <div className="text-right">
                              <span className="text-emerald-400 font-semibold text-sm font-display">
                                ${(app.job.salaryMin / 1000).toFixed(0)}k – $
                                {(app.job.salaryMax / 1000).toFixed(0)}k
                              </span>
                              <p className="text-[10px] text-slate-600 mt-0.5 uppercase tracking-widest">
                                per year
                              </p>
                            </div>
                          )}
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 border rounded-sm ${getStatusStyle(app.status)}`}
                          >
                            {getStatusLabel(app.status)}
                          </span>
                        </div>
                      </div>

                      {/* actions */}
                      <div className="flex items-center justify-end gap-2 mt-4">
                        <Link
                          to={`/jobs/${app.job?.slug}`}
                          className="text-xs px-4 py-2 border border-slate-700 text-slate-300 hover:border-slate-500 rounded-sm transition-colors font-medium"
                        >
                          View Job
                        </Link>
                        {app.status !== "rejected" && (
                          <button
                            onClick={() => handleWithdraw(app.job?.id, app.id)}
                            className="text-xs px-4 py-2 border border-slate-700 text-slate-400 hover:border-red-500/50 hover:text-red-400 rounded-sm transition-colors font-medium flex items-center gap-1.5"
                          >
                            <X className="h-3 w-3" />
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
