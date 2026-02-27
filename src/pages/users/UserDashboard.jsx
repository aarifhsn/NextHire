import {
  Bookmark,
  Building2,
  Calendar,
  Edit,
  FileText,
  Lightbulb,
  MapPin,
  Settings,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import JobApplicationButton from "../../components/JobApplicationButton";
import { useAuth } from "../../context/AuthContext";
import { useJobApplication } from "../../hooks/useJobApplication";
import { jobsAPI, userAPI } from "../../services/api";

export default function UserDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const { withdrawApplication } = useJobApplication();
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch recent applications (limit to 3)
      const appsResponse = await userAPI.getAppliedJobs({
        limit: 3,
        sort: "-createdAt",
      });

      const applicationsData =
        appsResponse.data?.data || appsResponse.data || [];
      setApplications(Array.isArray(applicationsData) ? applicationsData : []);

      // Fetch recommended jobs
      const jobsResponse = await jobsAPI.getRecommendedJobs();
      const jobsData = jobsResponse.data?.data || jobsResponse.data || [];
      setRecommendedJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (err) {
      console.error("Dashboard data error:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (jobId, applicationId) => {
    const result = await withdrawApplication(jobId);

    if (result.success) {
      setApplications((prevApps) =>
        prevApps.filter((app) => app.id !== applicationId),
      );
    }
  };
  return (
    <div className="min-h-screen bg-[#0a0a0b] font-body text-slate-200">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-8 h-px bg-emerald-400" />
            <span className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase">
              Dashboard
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white tracking-tight">
            Welcome back,{" "}
            <span className="text-emerald-400">
              {user?.name?.split(" ")[0] || "there"}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Here's a snapshot of your job search activity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── MAIN COLUMN ──────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Recent Applications */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                  Recent Applications
                </p>
                <Link
                  to="/user/applied-jobs"
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  View all →
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 rounded-sm bg-slate-800 border border-slate-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : error ? (
                <div className="py-10 text-center">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              ) : applications.length > 0 ? (
                <div className="space-y-px">
                  {applications.map((app) => {
                    const statusStyles = {
                      pending:
                        "text-amber-400 border-amber-400/30 bg-amber-400/5",
                      accepted:
                        "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
                      rejected: "text-red-400 border-red-400/30 bg-red-400/5",
                    };
                    const statusStyle =
                      statusStyles[app.status] ||
                      "text-slate-400 border-slate-700 bg-slate-800";

                    return (
                      <div
                        key={app.id}
                        className="group flex items-start gap-4 p-4 border border-slate-800 hover:border-slate-700 rounded-sm transition-colors bg-slate-900/20 hover:bg-slate-900/60"
                      >
                        {/* Company icon */}
                        <div className="w-10 h-10 rounded-sm bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-4 w-4 text-slate-500" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <div>
                              <Link
                                to={`/jobs/${app.job?.slug}`}
                                className="text-sm font-semibold text-slate-200 hover:text-emerald-400 transition-colors"
                              >
                                {app.job?.title || "Job Title"}
                              </Link>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {app.job?.company?.name || "Company"}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-1 border rounded-sm flex-shrink-0 ${statusStyle}`}
                            >
                              {app.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-600 mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {app.job?.location || "Remote"}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Applied{" "}
                              {new Date(app.createdAt).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )}
                            </span>
                            {app.job?.salaryMin && app.job?.salaryMax && (
                              <>
                                <span>·</span>
                                <span className="text-emerald-400 font-medium">
                                  ${(app.job.salaryMin / 1000).toFixed(0)}k – $
                                  {(app.job.salaryMax / 1000).toFixed(0)}k
                                </span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Link
                              to={`/jobs/${app.job?.slug}`}
                              className="text-[10px] font-medium px-3 py-1.5 border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 rounded-sm transition-colors"
                            >
                              View Job
                            </Link>
                            <button
                              onClick={() =>
                                handleWithdraw(app.job?.id, app.id)
                              }
                              className="text-[10px] font-medium px-3 py-1.5 text-red-500/60 hover:text-red-400 hover:border-red-500/30 border border-transparent rounded-sm transition-colors"
                            >
                              Withdraw
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-dashed border-slate-800 rounded-sm py-16 text-center">
                  <FileText className="h-8 w-8 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm font-medium mb-1">
                    No applications yet
                  </p>
                  <p className="text-slate-600 text-xs mb-5">
                    Start applying to roles you care about.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-sm transition-colors"
                  >
                    Browse Jobs
                  </Link>
                </div>
              )}
            </div>

            {/* Recommended Jobs */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                  Recommended for You
                </p>
                <Link
                  to="/"
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Browse all →
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-24 rounded-sm bg-slate-800 border border-slate-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : recommendedJobs.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-slate-600 text-sm">
                    No recommendations yet — update your skills to get matched.
                  </p>
                </div>
              ) : (
                <div className="space-y-px">
                  {recommendedJobs.map((job) => (
                    <article
                      key={job.id}
                      className="group relative flex items-start gap-4 p-4 border border-slate-800 hover:border-emerald-500/30 rounded-sm transition-all bg-slate-900/20 hover:bg-slate-900/60"
                    >
                      {/* accent bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400 scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top rounded-sm" />

                      <div className="w-10 h-10 rounded-sm bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-4 w-4 text-slate-500" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div>
                            <Link
                              to={`/jobs/${job.slug}`}
                              className="text-sm font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors"
                            >
                              {job.title}
                            </Link>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {job.company?.name || "Company"}
                            </p>
                          </div>
                          {job.salaryMin && job.salaryMax && (
                            <span className="text-xs font-semibold text-emerald-400 flex-shrink-0">
                              ${(job.salaryMin / 1000).toFixed(0)}k – $
                              {(job.salaryMax / 1000).toFixed(0)}k
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-1 mb-3">
                          {job.description || "No description available"}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap gap-1.5">
                            {job.jobType && (
                              <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 border border-slate-700 text-slate-400 rounded-sm">
                                {job.jobType}
                              </span>
                            )}
                            {job.skills?.slice(0, 2).map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-medium px-2 py-1 bg-slate-800 text-slate-400 rounded-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/jobs/${job.slug}`}
                              className="text-[10px] font-medium px-3 py-1.5 border border-slate-700 text-slate-400 hover:border-slate-500 rounded-sm transition-colors"
                            >
                              Details
                            </Link>
                            <JobApplicationButton job={job} />
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── SIDEBAR ──────────────────────────────────── */}
          <div className="space-y-4">
            {/* Profile card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-4">
                <div className="w-10 h-10 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">
                    {user?.name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-3">
                Quick Links
              </p>
              <div className="space-y-px">
                {[
                  {
                    to: "/users/profile",
                    icon: <User className="h-3.5 w-3.5" />,
                    label: "View Profile",
                  },
                  {
                    to: "/users/profile/edit",
                    icon: <Edit className="h-3.5 w-3.5" />,
                    label: "Edit Profile",
                  },
                  {
                    to: "/user/applied-jobs",
                    icon: <FileText className="h-3.5 w-3.5" />,
                    label: "My Applications",
                  },
                  {
                    to: "/saved-jobs",
                    icon: <Bookmark className="h-3.5 w-3.5" />,
                    label: "Saved Jobs",
                  },
                  {
                    to: "/settings",
                    icon: <Settings className="h-3.5 w-3.5" />,
                    label: "Settings",
                  },
                ].map(({ to, icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center justify-between w-full px-3 py-2.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-sm transition-colors group"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-slate-600 group-hover:text-emerald-400 transition-colors">
                        {icon}
                      </span>
                      {label}
                    </span>
                    <svg
                      className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Pro tip */}
            <div className="bg-slate-900/40 border border-emerald-500/15 rounded-sm p-5">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-sm bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-400 mb-1.5 uppercase tracking-widest">
                    Pro Tip
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Applications submitted within 24 hours of posting have a{" "}
                    <span className="text-slate-300 font-medium">
                      3× higher
                    </span>{" "}
                    response rate. Check back daily.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-4">
                Activity
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Applied", value: applications.length },
                  { label: "Recommended", value: recommendedJobs.length },
                  {
                    label: "In Review",
                    value: applications.filter((a) => a.status === "pending")
                      .length,
                  },
                  {
                    label: "Accepted",
                    value: applications.filter((a) => a.status === "accepted")
                      .length,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-slate-800/60 border border-slate-700/50 rounded-sm p-3"
                  >
                    <p className="font-display text-2xl font-bold text-emerald-400">
                      {value}
                    </p>
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-0.5">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
