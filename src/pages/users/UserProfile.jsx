import {
  Calendar,
  Camera,
  ChevronRight,
  Edit,
  FileText,
  MapPin,
  Upload,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../services/api";

export default function UserProfile() {
  const { user: currentUser } = useAuth();
  const { id } = useParams(); // For viewing other users' profiles
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalApplications: 0,
    inReview: 0,
    savedJobs: 0,
  });

  const isOwnProfile = !id || id === currentUser?.id?.toString();

  useEffect(() => {
    fetchProfile();
    if (isOwnProfile) {
      fetchStats();
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      let response;
      if (isOwnProfile) {
        response = await userAPI.getProfile();
        console.log(response);
      } else {
        response = await userAPI.getProfileById(id);
      }

      setProfile(response.data?.data || response.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch applied jobs to get count
      const appsResponse = await userAPI.getAppliedJobs();
      const applications = appsResponse.data?.data || appsResponse.data || [];

      // Calculate stats
      const totalApplications = Array.isArray(applications)
        ? applications.length
        : 0;
      const inReview = Array.isArray(applications)
        ? applications.filter(
            (app) => app.status === "pending" || app.status === "in-review",
          ).length
        : 0;

      setStats({
        totalApplications,
        inReview,
        savedJobs: 0, // You'll need to implement saved jobs API
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };
  return (
    <div className="min-h-screen bg-[#0a0a0b] font-body text-slate-200">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="space-y-3 w-full max-w-2xl">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-sm bg-slate-900 border border-slate-800 animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="border border-slate-800 rounded-sm p-16 text-center">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <Link
              to="/user/dashboard"
              className="text-xs font-semibold px-5 py-2.5 bg-emerald-500 text-black rounded-sm"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <>
            {/* Profile hero */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-7 mb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {profile?.profilePictureUrl ? (
                    <img
                      src={profile.profilePictureUrl}
                      alt={profile.name}
                      className="h-24 w-24 rounded-sm object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-sm bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <User className="h-10 w-10 text-slate-500" />
                    </div>
                  )}
                  {isOwnProfile && (
                    <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-emerald-500 rounded-sm flex items-center justify-center border-2 border-[#0a0a0b]">
                      <Camera className="h-3.5 w-3.5 text-black" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h1 className="font-display text-3xl font-bold text-white tracking-tight">
                        {profile?.name || "User"}
                      </h1>
                      <p className="text-slate-400 text-sm mt-1">
                        {profile?.title || "Job Seeker"}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {profile?.city && profile?.country
                            ? `${profile.city}, ${profile.country}`
                            : "Location not set"}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Since{" "}
                          {new Date(profile?.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", year: "numeric" },
                          )}
                        </span>
                      </div>
                    </div>
                    {isOwnProfile && (
                      <Link
                        to="/users/profile/edit"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold border border-slate-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 rounded-sm transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit Profile
                      </Link>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-8 mt-5 pt-5 border-t border-slate-800">
                    {[
                      { label: "Applications", value: stats.totalApplications },
                      { label: "In Review", value: stats.inReview },
                      { label: "Saved", value: stats.savedJobs },
                    ].map(({ label, value }) => (
                      <div key={label}>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main */}
              <div className="lg:col-span-2 space-y-4">
                {/* About */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-4">
                    About
                  </p>
                  {profile?.bio ? (
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {profile.bio}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-600 italic">
                      No bio added yet.
                    </p>
                  )}
                </div>

                {/* Skills */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-4">
                    Skills
                  </p>
                  {profile?.skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 italic">
                      No skills added yet.
                    </p>
                  )}
                </div>

                {/* Experience */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-5">
                    Work Experience
                  </p>
                  {profile?.experience?.length > 0 ? (
                    <div className="space-y-6">
                      {profile.experience.map((exp, i) => (
                        <div
                          key={i}
                          className="relative pl-6 border-l border-slate-800"
                        >
                          <div
                            className={`absolute -left-1.5 top-1 w-3 h-3 rounded-sm border-2 border-[#0a0a0b] ${i === 0 ? "bg-emerald-400" : "bg-slate-700"}`}
                          />
                          <h3 className="text-sm font-semibold text-slate-200">
                            {exp.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {exp.companyName} · {exp.employmentType}
                          </p>
                          <p className="text-[10px] text-slate-600 mt-1">
                            {new Date(exp.startDate).toLocaleDateString(
                              "en-US",
                              { month: "short", year: "numeric" },
                            )}
                            {" – "}
                            {exp.endDate
                              ? new Date(exp.endDate).toLocaleDateString(
                                  "en-US",
                                  { month: "short", year: "numeric" },
                                )
                              : "Present"}
                            {exp.location && ` · ${exp.location}`}
                          </p>
                          {exp.description && (
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 italic">
                      No experience added yet.
                    </p>
                  )}
                </div>

                {/* Education */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-5">
                    Education
                  </p>
                  {profile?.education?.length > 0 ? (
                    <div className="space-y-4">
                      {profile.education.map((edu, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-sm bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                            <svg
                              className="h-4 w-4 text-slate-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 14l9-5-9-5-9 5 9 5z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 14l6.16-3.422A12 12 0 0112 21.5a12 12 0 01-6.16-10.922L12 14z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-200">
                              {edu.degree}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {edu.school}
                            </p>
                            <p className="text-[10px] text-slate-600 mt-1">
                              {edu.startYear} – {edu.endYear || "Present"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 italic">
                      No education added yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Resume */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-4">
                    Resume
                  </p>
                  {profile?.resumeUrl ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-sm border border-slate-700">
                        <FileText className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-300 truncate">
                            {profile.resumeOriginalName || "Resume.pdf"}
                          </p>
                          <p className="text-[10px] text-slate-600 mt-0.5">
                            Updated{" "}
                            {new Date(
                              profile.resumeUploadDate,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={profile.resumeUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium border border-slate-700 text-slate-400 hover:border-emerald-500 hover:text-emerald-400 rounded-sm transition-colors"
                      >
                        Download Resume
                      </a>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-slate-600 mb-3">
                        No resume uploaded yet.
                      </p>
                      {isOwnProfile && (
                        <Link
                          to="/users/profile/edit"
                          className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 rounded-sm transition-colors"
                        >
                          <Upload className="h-3.5 w-3.5" /> Upload Resume
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Contact */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-4">
                    Contact
                  </p>
                  <div className="space-y-3">
                    {[
                      { show: profile?.email, label: profile?.email },
                      { show: profile?.phone, label: profile?.phone },
                      {
                        show: profile?.linkedinUrl,
                        label: "LinkedIn",
                        href: profile?.linkedinUrl,
                      },
                      {
                        show: profile?.githubUrl,
                        label: "GitHub",
                        href: profile?.githubUrl,
                      },
                      {
                        show: profile?.portfolioUrl,
                        label: "Portfolio",
                        href: profile?.portfolioUrl,
                      },
                    ]
                      .filter(({ show }) => show)
                      .map(({ label, href }, i) =>
                        href ? (
                          <a
                            key={i}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs text-emerald-400 hover:text-emerald-300 transition-colors truncate"
                          >
                            {label}
                          </a>
                        ) : (
                          <p
                            key={i}
                            className="text-xs text-slate-400 truncate"
                          >
                            {label}
                          </p>
                        ),
                      )}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-3">
                    Quick Links
                  </p>
                  <div className="space-y-1">
                    {[
                      { to: "/user/dashboard", label: "Dashboard" },
                      { to: "/user/applied-jobs", label: "My Applications" },
                      { to: "/saved-jobs", label: "Saved Jobs" },
                    ].map(({ to, label }) => (
                      <Link
                        key={to}
                        to={to}
                        className="flex items-center justify-between w-full px-3 py-2.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-sm transition-colors group"
                      >
                        {label}
                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
