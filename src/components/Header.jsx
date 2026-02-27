import { Briefcase, LogOut, Menu, User, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, isAuthenticated, logout, isJobSeeker, isCompany } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#0a0a0b]/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 flex h-14 items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-emerald-500 rounded-sm flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-black" />
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">
              NextHire
            </span>
          </Link>

          {isAuthenticated() && (
            <nav className="hidden md:flex items-center gap-1">
              {isJobSeeker() && (
                <>
                  {[
                    { to: "/", label: "Jobs" },
                    { to: "/user/dashboard", label: "Dashboard" },
                    { to: "/user/applied-jobs", label: "Applications" },
                  ].map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className={`px-3 py-1.5 rounded-sm text-xs font-medium tracking-wide transition-colors ${
                        isActivePath(to)
                          ? "text-emerald-400 bg-emerald-500/8"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </>
              )}
              {isCompany() && (
                <>
                  {[
                    { to: "/companies/dashboard", label: "Dashboard" },
                    { to: "/companies/jobs", label: "Manage Jobs" },
                    { to: "/companies/applicants", label: "Applicants" },
                  ].map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className={`px-3 py-1.5 rounded-sm text-xs font-medium tracking-wide transition-colors ${
                        isActivePath(to)
                          ? "text-emerald-400 bg-emerald-500/8"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {!isAuthenticated() && (
            <>
              {location.pathname === "/login" ? (
                <Link
                  to="/register"
                  className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Sign Up
                </Link>
              ) : location.pathname === "/register" ||
                location.pathname === "/register-company" ? (
                <Link
                  to="/login"
                  className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Sign In
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register-company"
                    className="text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-sm transition-colors"
                  >
                    Post a Job
                  </Link>
                </>
              )}
            </>
          )}

          {isAuthenticated() && (
            <>
              {/* Avatar dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2.5 p-1 rounded-sm hover:bg-slate-800 transition-colors">
                  <div className="h-7 w-7 rounded-sm bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-300 hidden md:inline">
                    {user?.name?.split(" ")[0] || "Account"}
                  </span>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-1 w-52 bg-slate-900 border border-slate-700 rounded-sm shadow-2xl shadow-black/60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 py-1">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {user?.email}
                    </p>
                  </div>

                  {isJobSeeker() && (
                    <>
                      <Link
                        to="/users/profile"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      >
                        <User className="h-3.5 w-3.5" /> View Profile
                      </Link>
                      <Link
                        to="/users/profile/edit"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      >
                        <User className="h-3.5 w-3.5" /> Edit Profile
                      </Link>
                    </>
                  )}
                  {isCompany() && (
                    <>
                      <Link
                        to="/companies/profile"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      >
                        <User className="h-3.5 w-3.5" /> Company Profile
                      </Link>
                      <Link
                        to="/companies/settings"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      >
                        <User className="h-3.5 w-3.5" /> Settings
                      </Link>
                      <Link
                        to="/jobs"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      >
                        <Briefcase className="h-3.5 w-3.5" /> Post a Job
                      </Link>
                    </>
                  )}
                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Logout
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-sm transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isAuthenticated() && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0a0a0b]">
          <nav className="max-w-7xl mx-auto px-6 py-4 space-y-1">
            {isJobSeeker() && (
              <>
                {[
                  { to: "/", label: "Jobs" },
                  { to: "/user/dashboard", label: "Dashboard" },
                  { to: "/user/applied-jobs", label: "Applications" },
                  { to: "/users/profile", label: "Profile" },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-sm text-sm transition-colors ${
                      isActivePath(to)
                        ? "text-emerald-400 bg-emerald-500/8"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </>
            )}
            {isCompany() && (
              <>
                {[
                  { to: "/companies/dashboard", label: "Dashboard" },
                  { to: "/companies/jobs", label: "Manage Jobs" },
                  { to: "/companies/applicants", label: "Applicants" },
                  { to: "/jobs", label: "Post a Job" },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-sm text-sm transition-colors ${
                      isActivePath(to)
                        ? "text-emerald-400 bg-emerald-500/8"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </>
            )}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 w-full"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
