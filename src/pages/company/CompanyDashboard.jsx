import {
  Briefcase,
  Check,
  Clock,
  Download,
  Edit,
  Eye,
  List,
  MapPin,
  Plus,
  Settings,
  Star,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { companyAPI } from "../../services/api";

export default function CompanyDashboard() {
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [companyStats, setCompanyStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCompanyDetails();
    fetchCompanyStats();
    fetchRecentCompaniesJobs();
    fetchRecentApplicants();
    fetchCompanyJobs();
  }, []);

  const fetchCompanyDetails = async () => {
    try {
      const response = await companyAPI.getProfile();
      setCompany(response.data.data);
    } catch (err) {
      console.error("Profile error:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyStats = async () => {
    try {
      const response = await companyAPI.getDashboardStats();
      setCompanyStats(response.data.data);
      console.log(response);
    } catch (err) {
      console.error("Stats error:", err.response || err);
    }
  };

  const fetchCompanyJobs = async () => {
    try {
      const response = await companyAPI.getCompanyJobs(company?.slug);
      setRecentJobs(response.data.data || []);
    } catch (err) {
      console.error("Jobs error:", err.response || err);
    }
  };

  const fetchRecentCompaniesJobs = async () => {
    try {
      const response = await companyAPI.getJobs({ limit: 4 });
      setRecentJobs(response.data.data || []);
    } catch (err) {
      console.error("Jobs error:", err.response || err);
    }
  };

  const fetchRecentApplicants = async () => {
    try {
      const response = await companyAPI.getApplicants({ limit: 3 });
      setRecentApplicants(response.data.data || []);
      console.log("Recent applicants fetched:", response.data.data);
    } catch (err) {
      console.error("Applicants error:", err.response || err);
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return "Unknown";
    const time = new Date(date).getTime();
    if (isNaN(time)) return "Unknown";

    const hours = Math.floor((Date.now() - time) / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    if (days < 14) return "1 week ago";
    return `${Math.floor(days / 7)} weeks ago`;
  };

  const handleShortlist = async (applicationId) => {
    try {
      await companyAPI.updateApplicationStatus(applicationId, "shortlisted");
      fetchRecentApplicants(); // Refresh list
      alert("Applicant shortlisted successfully!");
    } catch (err) {
      console.error("Shortlist error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] font-body text-slate-200">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="space-y-3 text-center">
            <div className="w-8 h-8 border border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-600 uppercase tracking-widest">
              Loading dashboard…
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] font-body text-slate-200">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] font-body text-slate-200">
      <Header />

      <main>
        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="relative border-b border-slate-800 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">
            <div className="flex items-center gap-3 mb-5">
              <span className="block w-8 h-px bg-emerald-400" />
              <span className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase">
                Company Dashboard
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-[0.95] tracking-tight text-white mb-3">
              Welcome back,
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-emerald-400">
                  {company?.name || "—"}
                </span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-emerald-400/10 -skew-x-3" />
              </span>
            </h1>
            <p className="text-slate-500 text-sm font-light mt-4">
              Here's what's happening with your job postings today.
            </p>
          </div>
        </section>

        {/* ── STATS ────────────────────────────────────────── */}
        <section className="border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-800">
            {[
              {
                icon: Briefcase,
                label: "Active Jobs",
                value: companyStats?.activeJobs ?? 0,
              },
              {
                icon: User,
                label: "Total Applicants",
                value: companyStats?.totalApplicants ?? 0,
              },
              {
                icon: Clock,
                label: "Pending Reviews",
                value: companyStats?.pendingReviews ?? 0,
              },
              {
                icon: Star,
                label: "Shortlisted",
                value: companyStats?.shortLists ?? 0,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="bg-[#0a0a0b] px-6 py-7 flex flex-col gap-3"
              >
                <div className="w-9 h-9 rounded-sm bg-slate-900 border border-slate-700/50 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="font-display text-3xl font-extrabold text-white tracking-tight">
                  {value}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── BODY ─────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── MAIN ─────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">
              {/* Recent Job Posts */}
              <div className="border border-slate-800 bg-slate-900/40 rounded-sm">
                <div className="flex items-baseline justify-between px-6 py-5 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="block w-5 h-px bg-emerald-400" />
                    <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-white">
                      Recent Job Posts
                    </h2>
                  </div>
                  <Link
                    to="/companies/jobs"
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    View all
                  </Link>
                </div>

                {recentJobs.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <Briefcase className="h-7 w-7 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-600 text-sm">No job posts yet.</p>
                  </div>
                ) : (
                  <div className="space-y-px">
                    {recentJobs.map((job) => (
                      <div
                        key={job.id}
                        className="group relative px-6 py-5 pl-7 hover:bg-slate-900/80 transition-all duration-150"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400 scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top" />

                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div>
                            <h3 className="font-display font-bold text-sm text-white group-hover:text-emerald-300 transition-colors mb-1">
                              <Link to={`/jobs/${job.slug}`}>{job.title}</Link>
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {job.location || "Remote"}
                              </span>
                              <span className="text-slate-700">·</span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {job.type || "Full-time"}
                              </span>
                              <span className="text-slate-700">·</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Posted {getTimeAgo(job.createdAt)}
                              </span>
                              <span className="text-slate-700">·</span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {job.applicants || 0} applicants
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Link
                              to={`/jobs/${job.slug}`}
                              className="text-xs px-3 py-1.5 border border-slate-700 text-slate-300 hover:border-slate-500 rounded-sm transition-colors font-medium flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" /> View
                            </Link>
                            <Link
                              to={`/companies/jobs/${job.id}/edit`}
                              className="text-xs px-3 py-1.5 border border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400 rounded-sm transition-colors font-medium flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" /> Edit
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Applicants */}
              <div className="border border-slate-800 bg-slate-900/40 rounded-sm">
                <div className="flex items-baseline justify-between px-6 py-5 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="block w-5 h-px bg-emerald-400" />
                    <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-white">
                      Recent Applicants
                    </h2>
                  </div>
                  <Link
                    to="/companies/applicants"
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    View all
                  </Link>
                </div>

                {recentApplicants.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <User className="h-7 w-7 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-600 text-sm">No applicants yet.</p>
                  </div>
                ) : (
                  <div className="space-y-px">
                    {recentApplicants.map((applicant) => (
                      <div
                        key={applicant.id}
                        className="group relative px-6 py-5 pl-7 hover:bg-slate-900/80 transition-all duration-150"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400 scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top" />

                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-slate-800 border border-slate-700/50 flex items-center justify-center group-hover:border-emerald-500/20 transition-colors">
                            <User className="h-4 w-4 text-slate-500" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                                  {applicant.user?.name || "Unnamed Applicant"}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Applied for{" "}
                                  <span className="text-slate-300 font-medium">
                                    {applicant.job?.title || "Unknown Position"}
                                  </span>
                                </p>
                              </div>
                              <span className="text-[10px] text-slate-600 whitespace-nowrap flex-shrink-0">
                                {getTimeAgo(applicant.updatedAt)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-3">
                              <button
                                onClick={() => handleShortlist(applicant.id)}
                                className="text-xs px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-sm transition-colors flex items-center gap-1"
                              >
                                <Check className="h-3 w-3" /> Shortlist
                              </button>
                              <button className="text-xs px-3 py-1.5 border border-slate-700 text-slate-300 hover:border-slate-500 rounded-sm transition-colors font-medium flex items-center gap-1">
                                <Eye className="h-3 w-3" /> Profile
                              </button>
                              <button className="text-xs px-3 py-1.5 border border-slate-700 text-slate-300 hover:border-slate-500 rounded-sm transition-colors font-medium flex items-center gap-1">
                                <Download className="h-3 w-3" /> Resume
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── SIDEBAR ──────────────────────────────────── */}
            <div className="lg:col-span-1 space-y-4">
              {/* Quick Actions */}
              <div className="border border-slate-800 bg-slate-900/40 rounded-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <span className="block w-5 h-px bg-emerald-400" />
                  <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-white">
                    Quick Actions
                  </h3>
                </div>
                <div className="space-y-2">
                  <Link
                    to="/jobs"
                    className="flex items-center gap-2.5 w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold rounded-sm transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Post New Job
                  </Link>
                  {[
                    { to: "/companies/jobs", icon: List, label: "Manage Jobs" },
                    {
                      to: "/companies/applicants",
                      icon: Users,
                      label: "View Applicants",
                    },
                    {
                      to: "/companies/settings",
                      icon: Settings,
                      label: "Company Settings",
                    },
                  ].map(({ to, icon: Icon, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className="flex items-center gap-2.5 w-full px-4 py-3 border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100 text-xs font-medium rounded-sm transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Pro Tip */}
              <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-sm p-6">
                <div className="flex items-start gap-3">
                  <div className="w-1 self-stretch bg-emerald-500 rounded-full flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">
                      Pro Tip
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Jobs with detailed descriptions get 40% more quality
                      applicants. Keep your postings updated!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
