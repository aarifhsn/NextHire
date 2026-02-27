import {
  BarChart,
  Bookmark,
  Briefcase,
  Building2,
  Calendar,
  ChevronRight,
  Clock,
  Code,
  DollarSign,
  Facebook,
  Globe,
  Link2,
  Linkedin,
  MapPin,
  Twitter,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import Header from "../components/Header";
import JobApplicationButton from "../components/JobApplicationButton";
import { useAuth } from "../context/AuthContext";
import { jobsAPI } from "../services/api";

export default function JobDetails() {
  const { id } = useParams(); // Get job ID from URL
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    fetchSimilarJobs();
    if (isAuthenticated()) {
      checkIfJobSaved();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await jobsAPI.getJob(id);
      setJob(response.data.data);
    } catch (err) {
      console.error("Full error:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (job) => {
    if (job?.salaryMin != null && job?.salaryMax != null) {
      return `$${job.salaryMin} - $${job.salaryMax}`;
    }
    return "Negotiable";
  };

  const fetchSimilarJobs = async () => {
    try {
      const response = await jobsAPI.getRecommendedJobs();
      setSimilarJobs(response.data.data || []);
    } catch (err) {
      console.error("Error fetching similar jobs:", err);
      setSimilarJobs([]); // Set empty array on error
    }
  };

  const handleApply = () => {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: `/jobs/${id}` } });
      return;
    }
    setShowApplyModal(true);
  };

  const submitApplication = async (coverLetter) => {
    try {
      await jobsAPI.applyToJob(id, coverLetter);
      setHasApplied(true);
      setShowApplyModal(false);
      alert("Application submitted successfully!");
    } catch (err) {
      console.error("Apply error:", err);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this job: ${job?.title}`;

    const urls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      alert("Link copied!");
    } else {
      window.open(urls[platform], "_blank");
    }
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

  const closeApplyDialog = () => setShowApplyModal(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // later: upload or preview
  };

  const checkIfJobSaved = async () => {
    try {
      const response = await jobsAPI.checkIfSaved(id);
      setIsSaved(response.data.isSaved);
    } catch (err) {
      console.error("Error checking saved status:", err);
    }
  };

  // Update the handleSaveJob function
  const handleSaveJob = async () => {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: `/jobs/${id}` } });
      return;
    }

    try {
      if (isSaved) {
        // Unsave the job
        await jobsAPI.unsaveJob(id);
        setIsSaved(false);
        toast.success("Job removed from saved jobs");
      } else {
        // Save the job
        await jobsAPI.saveJob(id);
        setIsSaved(true);
        toast.success("Job saved successfully!");
      }
    } catch (err) {
      console.error("Save job error:", err);
      toast.error(err.response?.data?.message || "Failed to save job");
    }
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

  const parseBenefits = (text) => {
    if (!text) return [];

    return text
      .split("\\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => line.replace(/^-\s*/, ""));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] font-body text-slate-200">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-600 mb-8">
          <Link to="/" className="hover:text-slate-400 transition-colors">
            Jobs
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="hover:text-slate-400 transition-colors cursor-pointer">
            Technology
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-400 truncate max-w-xs">
            {loading ? "Loading…" : job?.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT COLUMN ─────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Job header card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-sm bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-6 w-6 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="font-display text-3xl font-bold text-white tracking-tight leading-tight mb-2">
                        {job?.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <Link
                          to={`/company/${job?.company?.slug}`}
                          className="text-slate-300 font-medium hover:text-emerald-400 transition-colors"
                        >
                          {job?.company?.name}
                        </Link>
                        <span className="text-slate-700">·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job?.location}
                        </span>
                        <span className="text-slate-700">·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Posted {getTimeAgo(job?.createdAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleSaveJob}
                      className={`p-2 rounded-sm transition-colors flex-shrink-0 ${
                        isSaved
                          ? "text-emerald-400 bg-emerald-500/10"
                          : "text-slate-600 hover:text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <Bookmark
                        className="h-5 w-5"
                        fill={isSaved ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {job?.type && (
                      <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 border border-slate-700 text-slate-400 rounded-sm">
                        {job.type}
                      </span>
                    )}
                    {job?.location && (
                      <span className="text-[10px] font-medium px-2 py-1 bg-slate-800 text-slate-400 rounded-sm">
                        {job.location}
                      </span>
                    )}
                    {job?.experienceLevel && (
                      <span className="text-[10px] font-medium px-2 py-1 bg-slate-800 text-slate-400 rounded-sm capitalize">
                        {job.experienceLevel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Overview grid */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-5">
                Job Overview
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: <Briefcase className="h-4 w-4" />,
                    label: "Type",
                    value: job?.type,
                  },
                  {
                    icon: <MapPin className="h-4 w-4" />,
                    label: "Location",
                    value: job?.location,
                  },
                  {
                    icon: <DollarSign className="h-4 w-4" />,
                    label: "Salary",
                    value: formatSalary(job),
                  },
                  {
                    icon: <BarChart className="h-4 w-4" />,
                    label: "Experience",
                    value: job?.experience || "2+ years",
                  },
                  {
                    icon: <Calendar className="h-4 w-4" />,
                    label: "Deadline",
                    value: job?.deadline ?? "Open",
                  },
                  {
                    icon: <User className="h-4 w-4" />,
                    label: "Applicants",
                    value: `${job?.applicationsCount ?? 0} applied`,
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-sm bg-slate-800 flex items-center justify-center text-emerald-400 flex-shrink-0">
                      {icon}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-600 uppercase tracking-widest">
                        {label}
                      </p>
                      <p className="text-sm font-medium text-slate-300 mt-0.5">
                        {value || "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-5">
                Description
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                {job?.description}
              </p>

              {parseRequirements(job?.requirements).length > 0 && (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mt-8 mb-4">
                    Requirements
                  </p>
                  <ul className="space-y-2">
                    {parseRequirements(job?.requirements).map((req, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm text-slate-400"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {parseBenefits(job?.benefits).length > 0 && (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mt-8 mb-4">
                    What We Offer
                  </p>
                  <ul className="space-y-2">
                    {parseBenefits(job?.benefits).map((benefit, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm text-slate-400"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Skills */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-4">
                Required Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job?.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-medium px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Similar jobs */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-5">
                Similar Roles
              </p>
              <div className="space-y-px">
                {similarJobs.map((sj) => (
                  <div
                    key={sj.id}
                    className="group flex items-center gap-4 py-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 -mx-2 px-2 rounded-sm transition-colors"
                  >
                    <div className="w-9 h-9 rounded-sm bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                      <Code className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/jobs/${sj.slug}`}
                        className="text-sm font-medium text-slate-300 group-hover:text-emerald-400 transition-colors truncate block"
                      >
                        {sj.title}
                      </Link>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {sj.company?.name} · {sj.location}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 flex-shrink-0">
                      {formatSalary(sj)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ───────────────── */}
          <div className="lg:col-span-1 space-y-4">
            {/* Apply card — sticky */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-5 lg:sticky lg:top-20">
              <div className="text-center pb-4 border-b border-slate-800 mb-4">
                <p className="font-display text-3xl font-bold text-emerald-400">
                  {formatSalary(job)}
                </p>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-1">
                  per year
                </p>
              </div>

              <JobApplicationButton
                job={job}
                className="w-full justify-center"
              />

              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2.5">
                {[
                  { label: "Applicants", value: job?.applicants ?? 0 },
                  { label: "Posted", value: getTimeAgo(job?.createdAt) },
                  { label: "Deadline", value: job?.deadline ?? "Open" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-600 uppercase tracking-widest">
                      {label}
                    </span>
                    <span className="text-slate-400 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Company card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-4">
                About the Company
              </p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-sm bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    {job?.company?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {job?.company?.industry}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                {job?.company?.description}
              </p>
              <div className="space-y-1.5 mb-4">
                {[
                  {
                    icon: <Globe className="h-3 w-3" />,
                    value: job?.company?.websiteUrl,
                  },
                  {
                    icon: <MapPin className="h-3 w-3" />,
                    value: job?.company?.location,
                  },
                  {
                    icon: <User className="h-3 w-3" />,
                    value:
                      job?.company?.employeeCount &&
                      `${job.company.employeeCount} employees`,
                  },
                  {
                    icon: <Calendar className="h-3 w-3" />,
                    value:
                      job?.company?.foundedYear &&
                      `Founded ${job.company.foundedYear}`,
                  },
                ]
                  .filter(({ value }) => value)
                  .map(({ icon, value }, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-slate-500"
                    >
                      <span className="text-slate-600">{icon}</span>
                      <span>{value}</span>
                    </div>
                  ))}
              </div>
              <Link
                to={`/companies/${job?.company?.slug}`}
                className="block w-full text-center text-xs font-medium py-2 border border-slate-700 text-slate-400 hover:border-emerald-500 hover:text-emerald-400 rounded-sm transition-colors"
              >
                View Company Profile
              </Link>
            </div>

            {/* Share */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-4">
                Share This Role
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  {
                    platform: "linkedin",
                    icon: <Linkedin className="h-3.5 w-3.5" />,
                  },
                  {
                    platform: "twitter",
                    icon: <Twitter className="h-3.5 w-3.5" />,
                  },
                  {
                    platform: "facebook",
                    icon: <Facebook className="h-3.5 w-3.5" />,
                  },
                  { platform: "copy", icon: <Link2 className="h-3.5 w-3.5" /> },
                ].map(({ platform, icon }) => (
                  <button
                    key={platform}
                    onClick={() => handleShare(platform)}
                    className="flex items-center justify-center py-2.5 border border-slate-700 text-slate-500 hover:border-emerald-500 hover:text-emerald-400 rounded-sm transition-colors"
                  >
                    {icon}
                  </button>
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
