import {
  Building2,
  Clock,
  Facebook,
  Github,
  Globe,
  Heart,
  Instagram,
  Lightbulb,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Share2,
  Target,
  Twitter,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { companyAPI } from "../../services/api";

export default function CompanyProfile() {
  const { slug } = useParams(); // Extract slug from URL
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanyData();
    fetchCompanyJobs();
  }, [slug]);

  const fetchCompanyData = async () => {
    try {
      const response = await companyAPI.getCompanyBySlug(slug);
      setCompany(response.data.data);
    } catch (err) {
      console.error("Error fetching company data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyJobs = async () => {
    try {
      const response = await companyAPI.getCompanyJobs(slug);
      setJobs(response.data.data || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]); // Set empty array on error
    }
  };

  const toK = (value) => `${Math.round(value / 1000)}k`;

  const formatSalary = (job) => {
    if (job?.salaryMin != null && job?.salaryMax != null) {
      return `$${toK(job.salaryMin)} - $${toK(job.salaryMax)}`;
    }
    return "Negotiable";
  };

  // Add this helper function in your JobDetails component
  const parseRequirements = (text) => {
    if (!text) return [];

    // Split by newline and remove empty lines and leading "- "
    return text
      .split("\\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => line.replace(/^-\s*/, "")); // Remove leading "- "
  };

  const handleSaveJob = (jobId) => {
    companyAPI
      .saveJob(jobId)
      .then(() => {
        alert("Job saved successfully!");
      })
      .catch((err) => {
        console.error("Save job error:", err);
      });
  };

  const getTimeAgo = (date) => {
    if (!date) return "Unknown";

    const time = new Date(date).getTime();
    if (isNaN(time)) return "Unknown";

    const days = Math.floor((Date.now() - time) / (1000 * 60 * 60 * 24));

    if (days <= 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success("Company profile link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };
  return (
    <div className="min-h-screen bg-[#0a0a0b] font-body text-slate-200">
      <Header />

      <main>
        {/* ── COMPANY HERO ─────────────────────────────────── */}
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

          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
              {/* logo */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-sm bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <Building2 className="h-9 w-9 text-slate-500" />
                </div>
              </div>

              {/* info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="block w-8 h-px bg-emerald-400" />
                  <span className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase">
                    {company?.industry || "Company"}
                  </span>
                </div>
                <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-[0.95] tracking-tight text-white mb-4">
                  {company?.name || "Company Name"}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {company?.location || "Location"}
                  </span>
                  <span className="text-slate-700">·</span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {company?.employeeCount
                      ? `${company.employeeCount} Employees`
                      : "—"}
                  </span>
                  <span className="text-slate-700">·</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    {jobs.length} open roles
                  </span>
                </div>
              </div>

              {/* action */}
              <div className="flex-shrink-0">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2.5 border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100 text-sm font-medium rounded-sm transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── BODY ─────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── LEFT / MAIN ──────────────────────────────── */}
            <div className="lg:col-span-2 space-y-px">
              {/* About */}
              <div className="border border-slate-800 bg-slate-900/40 rounded-sm p-7 mb-6">
                <div className="flex items-center gap-3 mb-5">
                  <span className="block w-5 h-px bg-emerald-400" />
                  <h2 className="font-display text-lg font-bold text-white tracking-tight uppercase text-xs tracking-[0.15em]">
                    About
                  </h2>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {company?.description || "No description provided yet."}
                </p>
              </div>

              {/* Values */}
              <div className="border border-slate-800 bg-slate-900/40 rounded-sm p-7 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="block w-5 h-px bg-emerald-400" />
                  <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-white">
                    Our Values
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    {
                      icon: Lightbulb,
                      label: "Innovation",
                      desc: "We encourage creative thinking and embrace new ideas to solve problems.",
                    },
                    {
                      icon: User,
                      label: "Collaboration",
                      desc: "Teamwork and open communication are at the heart of everything we do.",
                    },
                    {
                      icon: Target,
                      label: "Excellence",
                      desc: "We strive for the highest quality in our products and services.",
                    },
                    {
                      icon: Heart,
                      label: "Integrity",
                      desc: "Honesty and transparency guide our decisions and actions.",
                    },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="flex gap-4 group">
                      <div className="flex-shrink-0 w-9 h-9 rounded-sm bg-slate-800 border border-slate-700/50 flex items-center justify-center group-hover:border-emerald-500/30 transition-colors">
                        <Icon className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white mb-1">
                          {label}
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Open Positions */}
              <div
                className="border border-slate-800 bg-slate-900/40 rounded-sm p-7"
                id="jobs"
              >
                <div className="flex items-baseline justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="block w-5 h-px bg-emerald-400" />
                    <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-white">
                      Open Positions
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500">
                    {jobs.length} roles
                  </span>
                </div>

                {jobs.length === 0 ? (
                  <div className="border border-slate-800 border-dashed rounded-sm py-14 text-center">
                    <Building2 className="h-7 w-7 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">
                      No open positions right now.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-px">
                    {jobs.map((job) => (
                      <article
                        key={job.id}
                        className="group relative bg-slate-900/40 border border-slate-800/80 hover:border-emerald-500/30 hover:bg-slate-900/80 transition-all duration-200 rounded-sm"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400 scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top rounded-sm" />

                        <div className="p-5 pl-7">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                            <div>
                              <h3 className="font-display font-bold text-base text-white tracking-tight group-hover:text-emerald-300 transition-colors duration-200">
                                <Link to={`/jobs/${job.slug}`}>
                                  {job.title}
                                </Link>
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
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
                                  {job.applicantsCount || 0} applicants
                                </span>
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <span className="text-emerald-400 font-semibold text-sm font-display">
                                {formatSalary(job)}
                              </span>
                              <p className="text-[10px] text-slate-600 mt-0.5 uppercase tracking-widest">
                                per year
                              </p>
                            </div>
                          </div>

                          <p className="text-slate-500 text-xs leading-relaxed mt-3 line-clamp-2">
                            {job.description}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                            <div className="flex flex-wrap gap-1.5">
                              {job.type && (
                                <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 border border-slate-700 text-slate-400 rounded-sm">
                                  {job.type}
                                </span>
                              )}
                              {parseRequirements(job?.requirements)
                                .slice(0, 3)
                                .map((req, i) => (
                                  <span
                                    key={i}
                                    className="text-[10px] font-medium px-2 py-1 bg-slate-800 text-slate-400 rounded-sm"
                                  >
                                    {req}
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
                              <button className="text-xs px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-sm transition-colors">
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT / SIDEBAR ──────────────────────────── */}
            <div className="lg:col-span-1 space-y-4">
              {/* Contact */}
              <div className="border border-slate-800 bg-slate-900/40 rounded-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <span className="block w-5 h-px bg-emerald-400" />
                  <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-white">
                    Contact
                  </h3>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      icon: Globe,
                      label: "Website",
                      value: company?.website || "www.example.com",
                      href: company?.website,
                    },
                    {
                      icon: Mail,
                      label: "Email",
                      value: company?.email || "careers@company.com",
                      href: `mailto:${company?.email}`,
                    },
                    {
                      icon: Phone,
                      label: "Phone",
                      value: company?.phone || "+1 (415) 555-1234",
                      href: `tel:${company?.phone}`,
                    },
                    {
                      icon: MapPin,
                      label: "HQ",
                      value:
                        [company?.address, company?.city, company?.country]
                          .filter(Boolean)
                          .join(", ") || "—",
                    },
                  ].map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-slate-800 border border-slate-700/50 flex items-center justify-center mt-0.5">
                        <Icon className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-0.5">
                          {label}
                        </p>
                        {href ? (
                          <a
                            href={href}
                            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors break-all"
                          >
                            {value}
                          </a>
                        ) : (
                          <p className="text-xs text-slate-300">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div className="border border-slate-800 bg-slate-900/40 rounded-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <span className="block w-5 h-px bg-emerald-400" />
                  <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-white">
                    Follow
                  </h3>
                </div>
                <div className="space-y-1">
                  {[
                    { icon: Linkedin, label: "LinkedIn" },
                    { icon: Twitter, label: "Twitter / X" },
                    { icon: Facebook, label: "Facebook" },
                    { icon: Instagram, label: "Instagram" },
                    { icon: Github, label: "GitHub" },
                  ].map(({ icon: Icon, label }) => (
                    <a
                      key={label}
                      href="#"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all duration-150 group"
                    >
                      <Icon className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                      <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors font-medium">
                        {label}
                      </span>
                    </a>
                  ))}
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
