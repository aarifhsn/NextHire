import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import Header from "../components/Header";
import JobApplicationButton from "../components/JobApplicationButton";
import { jobsAPI } from "../services/api";

import {
  Building2,
  ChevronDown,
  Clock,
  MapPin,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";

export default function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    type: [],
    experienceLevel: [],
    salaryRange: [],
    skills: [],
  });
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [coverMessage, setCoverMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationIds, setApplicationIds] = useState(new Map());

  useEffect(() => {
    fetchJobs();
    fetchAppliedJobs();
  }, [page, filters, sortBy, searchQuery]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        sort: sortBy === "recent" ? "-createdAt" : sortBy,
        search: searchQuery || undefined,
        type: filters.type.length > 0 ? filters.type.join(",") : undefined,
        experienceLevel:
          filters.experienceLevel.length > 0
            ? filters.experienceLevel.join(",")
            : undefined,
        salaryRange:
          filters.salaryRange.length > 0
            ? filters.salaryRange.join(",")
            : undefined,
        skills:
          filters.skills.length > 0 ? filters.skills.join(",") : undefined,
      };

      // Remove undefined values
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key],
      );

      const response = await jobsAPI.getJobs(params);
      setJobs(response.data.data || []);
      setTotalJobs(response.data.count || 0);
    } catch (err) {
      console.error("Fetch jobs error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const response = await jobsAPI.getAppliedJobs();
      const applications = response.data?.data || [];

      const jobIdSet = new Set();
      const jobToApplicationMap = new Map();

      applications.forEach((app) => {
        jobIdSet.add(app.job.id);
        jobToApplicationMap.set(app.job.id, app.id);
      });

      setApplicationIds(jobToApplicationMap);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const handleFilterChange = (filterType, value, checked) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: checked
        ? [...prev[filterType], value]
        : prev[filterType].filter((v) => v !== value),
    }));
    setPage(1); // Reset to page 1
  };

  const getTimeAgo = (date) => {
    const days = Math.floor(
      (Date.now() - new Date(date)) / (1000 * 60 * 60 * 24),
    );
    return days === 0 ? "Today" : `${days} days ago`;
  };

  const start = (page - 1) * 10 + 1;
  const end = Math.min(page * 10, totalJobs);

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeApplyDialog = () => {
    setShowApplyModal(false);
    setSelectedJob(null);
    setCoverMessage("");
    // Reset file input
    const fileInput = document.getElementById("resumeInput");
    if (fileInput) fileInput.value = "";
  };

  const submitApplication = async () => {
    // Remove resume validation
    if (!coverMessage.trim()) {
      toast.error("Please write a cover letter");
      return;
    }

    try {
      setIsSubmitting(true);

      await jobsAPI.applyToJob(selectedJob.id, {
        coverLetter: coverMessage,
      });

      toast.success("Application submitted successfully!");
      closeApplyDialog();
    } catch (error) {
      console.error("Application error:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit application",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawApplication = async (jobId) => {
    const applicationId = applicationIds.get(jobId);

    if (!applicationId) {
      toast.error("Application not found.");
      return;
    }

    if (
      !window.confirm("Are you sure you want to withdraw this application?")
    ) {
      return;
    }

    try {
      await jobsAPI.withdrawApplication(applicationId);

      setApplicationIds((prev) => {
        const next = new Map(prev);
        next.delete(jobId);
        return next;
      });

      toast.success("Application withdrawn successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to withdraw application.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] font-body text-slate-200">
      <Header />

      <main>
        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="relative border-b border-slate-800 overflow-hidden">
          {/* background grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          {/* emerald glow blob */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 py-24 md:py-36 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="block w-8 h-px bg-emerald-400" />
                <span className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase">
                  Open Roles · {totalJobs} Live
                </span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-[0.95] tracking-tight text-white mb-8">
                Find Work
                <br />
                That{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-emerald-400">
                    Matters
                  </span>
                  <span className="absolute bottom-1 left-0 w-full h-3 bg-emerald-400/10 -skew-x-3" />
                </span>
              </h1>

              <p className="text-slate-400 text-lg font-light leading-relaxed max-w-sm mb-10">
                Curated engineering and design roles from companies building
                things worth caring about.
              </p>

              {/* search bar */}
              <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-sm focus-within:border-emerald-500 transition-colors duration-200">
                <Search className="absolute left-4 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchJobs()}
                  placeholder="Role, skill, or keyword…"
                  className="flex-1 bg-transparent pl-11 pr-4 py-4 text-sm text-slate-200 placeholder-slate-600 outline-none"
                />
                <button
                  onClick={() => {
                    setPage(1);
                    fetchJobs();
                  }}
                  className="m-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-sm transition-colors duration-150"
                >
                  Search
                </button>
              </div>

              {/* quick stats */}
              <div className="flex gap-8 mt-10">
                {[
                  { label: "Live Jobs", value: totalJobs },
                  { label: "Companies", value: "50+" },
                  { label: "Placed This Month", value: "120+" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-2xl font-display font-bold text-white">
                      {value}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-widest">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* right side decorative */}
            <div className="hidden md:flex flex-col gap-3">
              {[
                "React Engineer",
                "Product Designer",
                "Backend — Go",
                "ML Infra",
              ].map((title, i) => (
                <div
                  key={title}
                  className="border border-slate-800 bg-slate-900/60 backdrop-blur-sm rounded-sm px-5 py-4 flex items-center justify-between group hover:border-emerald-500/40 transition-colors duration-200"
                  style={{
                    opacity: 1 - i * 0.15,
                    transform: `translateX(${i * 16}px)`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-sm bg-slate-800 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-slate-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-300">
                      {title}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded-sm">
                    Hiring
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FILTERS BAR ──────────────────────────────────── */}
        <section className="sticky top-0 z-30 bg-[#0a0a0b]/95 backdrop-blur border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-2">
            {/* filter pills */}
            {[
              {
                id: "jobType",
                label: "Type",
                filterKey: "type",
                options: ["Full-time", "Part-time", "Contract", "Internship"],
              },
              {
                id: "experience",
                label: "Level",
                filterKey: "experienceLevel",
                options: ["entry", "mid", "senior", "lead"],
                display: ["Entry", "Mid", "Senior", "Lead"],
              },
              {
                id: "salary",
                label: "Salary",
                filterKey: "salaryRange",
                options: [
                  "0-50000",
                  "50000-100000",
                  "100000-150000",
                  "150000+",
                ],
                display: ["$0–50k", "$50–100k", "$100–150k", "$150k+"],
              },
              {
                id: "skills",
                label: "Skills",
                filterKey: "skills",
                options: ["React", "Node.js", "Python", "TypeScript"],
              },
            ].map((f) => (
              <div key={f.id} className="dropdown relative">
                <button
                  onClick={() => toggleDropdown(f.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-medium transition-colors duration-150 ${
                    filters[f.filterKey].length > 0
                      ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                      : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300 bg-transparent"
                  }`}
                >
                  {f.label}
                  {filters[f.filterKey].length > 0 && (
                    <span className="w-4 h-4 bg-emerald-500 text-black rounded-full text-[10px] font-bold flex items-center justify-center">
                      {filters[f.filterKey].length}
                    </span>
                  )}
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>

                {openDropdown === f.id && (
                  <div className="absolute top-full left-0 mt-2 bg-slate-900 border border-slate-700 rounded-sm shadow-2xl shadow-black/50 z-40 min-w-[160px] py-1">
                    {f.options.map((opt, idx) => (
                      <label
                        key={opt}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={filters[f.filterKey].includes(opt)}
                          onChange={(e) =>
                            handleFilterChange(
                              f.filterKey,
                              opt,
                              e.target.checked,
                            )
                          }
                          className="accent-emerald-500 w-3.5 h-3.5"
                        />
                        <span className="text-xs text-slate-300">
                          {f.display ? f.display[idx] : opt}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* sort */}
            <div className="dropdown relative ml-auto">
              <button
                onClick={() => toggleDropdown("sort")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-slate-700 text-slate-400 hover:border-slate-500 text-xs font-medium transition-colors"
              >
                {sortBy === "recent" && "Recent"}
                {sortBy === "-salaryMax" && "Salary ↓"}
                {sortBy === "salaryMin" && "Salary ↑"}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
              {openDropdown === "sort" && (
                <div className="absolute top-full right-0 mt-2 bg-slate-900 border border-slate-700 rounded-sm shadow-2xl shadow-black/50 z-40 min-w-[160px] py-1">
                  {[
                    { val: "recent", label: "Most Recent" },
                    { val: "-salaryMax", label: "Salary: High → Low" },
                    { val: "salaryMin", label: "Salary: Low → High" },
                  ].map((s) => (
                    <button
                      key={s.val}
                      onClick={() => {
                        setSortBy(s.val);
                        setOpenDropdown(null);
                        setPage(1);
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

            {/* clear */}
            {(filters.type.length > 0 ||
              filters.experienceLevel.length > 0 ||
              filters.salaryRange.length > 0 ||
              filters.skills.length > 0 ||
              searchQuery) && (
              <button
                onClick={() => {
                  setFilters({
                    type: [],
                    experienceLevel: [],
                    salaryRange: [],
                    skills: [],
                  });
                  setSearchQuery("");
                  setPage(1);
                }}
                className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        </section>

        {/* ── JOB LISTINGS ─────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          {/* section header */}
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-white tracking-tight">
                Open Positions
              </h2>
              <p className="text-slate-500 text-xs mt-1 tracking-wide">
                {loading ? "Loading…" : `${start}–${end} of ${totalJobs} roles`}
              </p>
            </div>
            <span className="hidden md:block w-24 h-px bg-slate-800" />
          </div>

          {/* loading skeleton */}
          {loading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-sm bg-slate-900 border border-slate-800 animate-pulse"
                />
              ))}
            </div>
          )}

          {/* job cards */}
          {!loading && jobs.length > 0 && (
            <div className="space-y-px">
              {jobs.map((job, index) => (
                <article
                  key={job.slug}
                  className="group relative bg-slate-900/40 border border-slate-800/80 hover:border-emerald-500/30 hover:bg-slate-900/80 transition-all duration-200 rounded-sm"
                >
                  {/* left accent bar on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400 scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top rounded-sm" />

                  <div className="flex flex-col md:flex-row gap-5 p-5 md:p-6 pl-5 md:pl-7">
                    {/* company logo placeholder */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-sm bg-slate-800 border border-slate-700/50 flex items-center justify-center group-hover:border-emerald-500/20 transition-colors">
                        <Building2 className="h-5 w-5 text-slate-500" />
                      </div>
                    </div>

                    {/* main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div>
                          <h3 className="font-display font-bold text-lg text-white tracking-tight group-hover:text-emerald-300 transition-colors duration-200">
                            <Link to={`/jobs/${job.slug}`}>{job.title}</Link>
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                            <Link
                              to={`/company-profile/${job.companyId}`}
                              className="text-slate-400 hover:text-emerald-400 font-medium transition-colors"
                            >
                              {job.company.name}
                            </Link>
                            <span className="text-slate-700">·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location || "Remote"}
                            </span>
                            <span className="text-slate-700">·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getTimeAgo(job.createdAt)}
                            </span>
                            <span className="text-slate-700">·</span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {job.applicants || 0} applicants
                            </span>
                          </div>
                        </div>

                        {/* salary */}
                        <div className="flex-shrink-0 text-right">
                          <span className="text-emerald-400 font-semibold text-sm font-display">
                            {job?.salaryMin != null && job?.salaryMax != null
                              ? `$${(job.salaryMin / 1000).toFixed(0)}k – $${(job.salaryMax / 1000).toFixed(0)}k`
                              : "Negotiable"}
                          </span>
                          <p className="text-[10px] text-slate-600 mt-0.5 uppercase tracking-widest">
                            per year
                          </p>
                        </div>
                      </div>

                      <p className="text-slate-500 text-sm leading-relaxed mt-3 line-clamp-2 max-w-2xl">
                        {job.description}
                      </p>

                      {/* tags + actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                        <div className="flex flex-wrap gap-1.5">
                          {job.type && (
                            <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 border border-slate-700 text-slate-400 rounded-sm">
                              {job.type}
                            </span>
                          )}
                          {job.skills?.slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="text-[10px] font-medium px-2 py-1 bg-slate-800 text-slate-400 rounded-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/jobs/${job.slug}`}
                            className="text-xs px-4 py-2 border border-slate-700 text-slate-300 hover:border-slate-500 rounded-sm transition-colors font-medium"
                          >
                            Details
                          </Link>
                          <JobApplicationButton job={job} />
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* empty state */}
          {!loading && jobs.length === 0 && (
            <div className="border border-slate-800 border-dashed rounded-sm py-24 text-center">
              <Search className="h-8 w-8 text-slate-700 mx-auto mb-4" />
              <h3 className="text-slate-400 font-display font-bold text-xl">
                No roles found
              </h3>
              <p className="text-slate-600 text-sm mt-2">
                Try broadening your search or clearing filters.
              </p>
              <button
                onClick={() => {
                  setFilters({
                    type: [],
                    experienceLevel: [],
                    salaryRange: [],
                    skills: [],
                  });
                  setSearchQuery("");
                  setPage(1);
                }}
                className="mt-6 px-5 py-2.5 border border-slate-700 text-slate-400 hover:border-emerald-500 hover:text-emerald-400 text-sm rounded-sm transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* load more */}
          {!loading && jobs.length > 0 && (
            <div className="mt-12 flex flex-col items-center gap-3">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={jobs.length >= totalJobs}
                className="flex items-center gap-2 px-8 py-3 border border-slate-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed rounded-sm text-sm font-medium transition-all duration-150"
              >
                Load more roles
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <p className="text-xs text-slate-600">
                {jobs.length} of {totalJobs} shown
              </p>
              {page >= Math.ceil(totalJobs / 10) && (
                <p className="text-xs text-slate-600 border-t border-slate-800 pt-3 w-24 text-center">
                  end of list
                </p>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ── APPLY MODAL ──────────────────────────────────── */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-sm w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/60">
            <div className="p-6 space-y-6">
              {/* header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-[0.15em] mb-2">
                    Application
                  </p>
                  <h2 className="font-display text-2xl font-bold text-white tracking-tight">
                    {selectedJob?.title}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedJob?.company?.name}
                  </p>
                </div>
                <button
                  onClick={closeApplyDialog}
                  className="p-2 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-sm transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* resume note */}
              <div className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-sm">
                <div className="w-1 self-stretch bg-emerald-500 rounded-full flex-shrink-0" />
                <p className="text-sm text-slate-300">
                  Your profile resume will be attached automatically. Keep it up
                  to date before applying.
                </p>
              </div>

              {/* cover letter */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Cover Note
                  </label>
                  <span className="text-xs text-slate-600">
                    {coverMessage.length}/500
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={coverMessage}
                  onChange={(e) =>
                    setCoverMessage(e.target.value.slice(0, 500))
                  }
                  placeholder="Why are you the right fit for this role…"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none resize-none transition-colors"
                />
              </div>

              {/* actions */}
              <div className="flex gap-3 pt-2 border-t border-slate-800">
                <button
                  onClick={closeApplyDialog}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 rounded-sm text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitApplication}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold rounded-sm text-sm transition-colors"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Sending…" : "Submit Application"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
