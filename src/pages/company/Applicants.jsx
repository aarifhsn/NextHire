import {
  Briefcase,
  Calendar,
  ChevronRight,
  Eye,
  Loader,
  Mail,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

import { companyAPI } from "../../services/api";
import { getTimeAgo } from "../../utils/utils";

export default function Applicants() {
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: ["New", "Shortlisted"], // default checked
    experienceLevel: ["Mid", "Senior"], // default checked
    date: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Fetch company jobs first
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await companyAPI.getJobs();
      const jobsData = response.data?.data || response.data || [];
      setJobs(jobsData);

      // Auto-select first job if available
      if (jobsData.length > 0) {
        setSelectedJob(jobsData[0].id);
      }
    } catch (err) {
      console.error("Jobs error:", err);
      toast.error("Failed to load jobs");
    }
  };

  // Fetch applicants when job is selected
  useEffect(() => {
    if (selectedJob) {
      fetchApplicants();
    }
  }, [selectedJob, filters]);

  const fetchApplicants = async () => {
    if (!selectedJob) return;

    try {
      setLoading(true);

      // Build query params from filters
      const params = {
        status: filters.status?.join(","),
        experienceLevel: filters.experienceLevel?.join(","),
        date: filters.date,
        search: filters.search,
      };

      const response = await companyAPI.getApplicantsForJob(
        selectedJob,
        params,
      );
      console.log("Applicants data:", response.data);

      setApplicants(response.data?.data || response.data || []);
    } catch (err) {
      console.error("Applicants error:", err);
      toast.error("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  };

  const handleExperienceChange = (exp) => {
    setFilters((prev) => ({
      ...prev,
      experienceLevel: prev.experienceLevel.includes(exp)
        ? prev.experienceLevel.filter((e) => e !== exp)
        : [...prev.experienceLevel, exp],
    }));
  };

  const handleDateChange = (date) => {
    setFilters((prev) => ({ ...prev, date }));
  };

  const handleReset = () => {
    setFilters({
      status: [],
      experienceLevel: [],
      date: "",
      search: "",
    });
  };

  const handleShortlist = async (applicationId, applicantName) => {
    try {
      await companyAPI.updateApplicationStatus(applicationId, "Shortlisted");

      // Update local state
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: "Shortlisted" } : app,
        ),
      );

      toast.success(`${applicantName} has been shortlisted!`);
    } catch (err) {
      console.error("Shortlist error:", err);
      toast.error(
        err.response?.data?.message || "Failed to shortlist applicant",
      );
    }
  };

  const handleReject = async (applicationId, applicantName) => {
    if (!window.confirm(`Are you sure you want to reject ${applicantName}?`)) {
      return;
    }

    try {
      await companyAPI.updateApplicationStatus(applicationId, "Rejected");

      // Update local state
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: "Rejected" } : app,
        ),
      );

      toast.success(`${applicantName} has been rejected`);
    } catch (err) {
      console.error("Reject error:", err);
      toast.error(err.response?.data?.message || "Failed to reject applicant");
    }
  };

  const getInitials = (name) => {
    const names = name.split(" ");
    const initials = names.map((n) => n.charAt(0).toUpperCase()).join("");
    return initials;
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      New: "badge-info",
      Shortlisted: "badge-success",
      Interviewed: "badge-warning",
      Rejected: "badge-error",
    };
    return classes[status] || "badge-secondary";
  };
  const handleLoadMore = () => {
    setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
  };
  const handleViewResume = (resumeUrl, userName) => {
    if (!resumeUrl) {
      toast.warning(`${userName} hasn't uploaded a resume yet`);
      return;
    }
    if (
      resumeUrl.includes("resume.storage.com") ||
      resumeUrl.includes("example.com")
    ) {
      toast.info(
        `This is demo data. ${userName}'s resume is not actually available.`,
      );
      return;
    }
    const correctedUrl = resumeUrl.replace("localhost:9000", "localhost:5000");

    window.open(correctedUrl, "_blank");
  };

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
          <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-6">
              <a
                href="/companies/dashboard"
                className="hover:text-emerald-400 transition-colors"
              >
                Dashboard
              </a>
              <ChevronRight className="h-3 w-3" />
              <span className="text-slate-400">Applicants</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="block w-8 h-px bg-emerald-400" />
              <span className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase">
                Review
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-[0.95] tracking-tight text-white">
              Job
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-emerald-400">
                  Applicants
                </span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-emerald-400/10 -skew-x-3" />
              </span>
            </h1>
          </div>
        </section>

        {/* ── JOB SELECTOR ────────────────────────────────── */}
        <section className="border-b border-slate-800 bg-slate-900/40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">
                Job Position
              </label>
              <select
                value={selectedJob || ""}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="flex-1 max-w-md bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-2 text-sm text-slate-200 outline-none transition-colors"
              >
                <option value="">Select a job…</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({job.applicants?.length || 0} applicants)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ── BODY ─────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* ── SIDEBAR FILTERS ──────────────────────────── */}
            <aside className="lg:col-span-1">
              <div className="border border-slate-800 bg-slate-900/40 rounded-sm p-6 sticky top-20">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="block w-4 h-px bg-emerald-400" />
                    <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-white">
                      Filters
                    </h3>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-[10px] text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest"
                  >
                    Reset
                  </button>
                </div>

                {/* Status */}
                <div className="mb-6">
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-3">
                    Application Status
                  </p>
                  <div className="space-y-2">
                    {[
                      { val: "New", label: "New Applications" },
                      { val: "Shortlisted", label: "Shortlisted" },
                      { val: "Interviewed", label: "Interviewed" },
                      { val: "Rejected", label: "Rejected" },
                    ].map(({ val, label }) => (
                      <label
                        key={val}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={filters.status?.includes(val) || false}
                          onChange={() => handleStatusChange(val)}
                          className="accent-emerald-500 w-3.5 h-3.5"
                        />
                        <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="mb-6">
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-3">
                    Experience Level
                  </p>
                  <div className="space-y-2">
                    {[
                      { val: "Entry", label: "Entry Level (0-2 yrs)" },
                      { val: "Mid", label: "Mid Level (3-5 yrs)" },
                      { val: "Senior", label: "Senior (5+ yrs)" },
                    ].map(({ val, label }) => (
                      <label
                        key={val}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={filters.experienceLevel.includes(val)}
                          onChange={() => handleExperienceChange(val)}
                          className="accent-emerald-500 w-3.5 h-3.5"
                        />
                        <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-3">
                    Applied Date
                  </p>
                  <div className="space-y-2">
                    {[
                      { val: "last 7 days", label: "Last 7 days" },
                      { val: "last 30 days", label: "Last 30 days" },
                      { val: "3 months", label: "Last 3 months" },
                      { val: "", label: "All time" },
                    ].map(({ val, label }) => (
                      <label
                        key={label}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name="date"
                          checked={filters.date === val}
                          onChange={() => handleDateChange(val)}
                          className="accent-emerald-500 w-3.5 h-3.5"
                        />
                        <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* ── APPLICANTS LIST ───────────────────────────── */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="space-y-3 text-center">
                    <div className="w-8 h-8 border border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-600 uppercase tracking-widest">
                      Loading applicants…
                    </p>
                  </div>
                </div>
              ) : applicants.length === 0 ? (
                <div className="border border-slate-800 border-dashed rounded-sm py-24 text-center">
                  <Briefcase className="h-7 w-7 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No applicants found.</p>
                </div>
              ) : (
                <div className="space-y-px">
                  {applicants.map((applicant) => {
                    const statusColor =
                      {
                        New: "text-sky-400 border-sky-400/30 bg-sky-400/5",
                        Shortlisted:
                          "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
                        Interviewed:
                          "text-amber-400 border-amber-400/30 bg-amber-400/5",
                        Rejected: "text-red-400 border-red-400/30 bg-red-400/5",
                      }[applicant.status] ??
                      "text-slate-400 border-slate-600 bg-slate-800";

                    return (
                      <article
                        key={applicant.id}
                        className="group relative bg-slate-900/40 border border-slate-800/80 hover:border-emerald-500/30 hover:bg-slate-900/80 transition-all duration-200 rounded-sm"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400 scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top rounded-sm" />

                        <div className="flex flex-col md:flex-row gap-5 p-5 md:p-6 pl-5 md:pl-7">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-sm bg-slate-800 border border-slate-700/50 flex items-center justify-center text-sm font-bold text-emerald-400 group-hover:border-emerald-500/20 transition-colors">
                              {getInitials(applicant.user?.name || "?")}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                              <div>
                                <h3 className="font-display font-bold text-base text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                                  {applicant.user?.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {applicant.user?.email}
                                  </span>
                                  <span className="text-slate-700">·</span>
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="h-3 w-3" />
                                    {applicant.user?.experienceLevel} yrs exp
                                  </span>
                                  <span className="text-slate-700">·</span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {getTimeAgo(applicant.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 border rounded-sm flex-shrink-0 ${statusColor}`}
                              >
                                {applicant.status}
                              </span>
                            </div>

                            {/* Skills */}
                            {applicant.user?.skills?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {applicant.user.skills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="text-[10px] font-medium px-2 py-1 bg-slate-800 text-slate-400 rounded-sm"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                to={`/users/profile/${applicant.user?.id}`}
                                className="flex items-center gap-1.5 text-xs px-3 py-2 border border-slate-700 text-slate-300 hover:border-slate-500 rounded-sm transition-colors font-medium"
                              >
                                <Eye className="h-3 w-3" /> Profile
                              </Link>
                              <button
                                onClick={() =>
                                  handleViewResume(
                                    applicant.resumeUrl,
                                    applicant.user?.name,
                                  )
                                }
                                className="flex items-center gap-1.5 text-xs px-3 py-2 border border-slate-700 text-slate-300 hover:border-slate-500 rounded-sm transition-colors font-medium"
                              >
                                <Loader className="h-3 w-3" /> Resume
                              </button>
                              <button
                                onClick={() =>
                                  handleShortlist(
                                    applicant.id,
                                    applicant.user?.name,
                                  )
                                }
                                disabled={applicant.status === "Shortlisted"}
                                className="flex items-center gap-1.5 text-xs px-3 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold rounded-sm transition-colors"
                              >
                                {applicant.status === "Shortlisted"
                                  ? "Shortlisted ✓"
                                  : "Shortlist"}
                              </button>
                              <button
                                onClick={() =>
                                  handleReject(
                                    applicant.id,
                                    applicant.user?.name,
                                  )
                                }
                                disabled={applicant.status === "Rejected"}
                                className="flex items-center gap-1.5 text-xs px-3 py-2 border border-red-500/30 text-red-400 hover:border-red-500/60 disabled:opacity-40 disabled:cursor-not-allowed rounded-sm transition-colors font-medium"
                              >
                                {applicant.status === "Rejected"
                                  ? "Rejected"
                                  : "Reject"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {/* Load more */}
              {!loading && applicants.length > 0 && (
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={pagination.page >= pagination.totalPages}
                    className="flex items-center gap-2 px-8 py-3 border border-slate-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed rounded-sm text-sm font-medium transition-all duration-150"
                  >
                    Load More Applicants
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
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
