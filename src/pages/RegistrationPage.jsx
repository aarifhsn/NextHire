import {
  Bell,
  Briefcase,
  Building2,
  Calendar,
  Eye,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    password: "",
    confirmPassword: "",
    terms: false,
    role: "USER",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (error) setError("");
  };

  const validateForm = () => {
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.terms) {
      setError("You must agree to the Terms of Service");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      // Prepare data for API
      const registrationData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        experience_level: formData.experience || undefined,
        role: formData.role,
      };

      console.log("Sending registration data:", registrationData);

      const response = await authAPI.register(registrationData);
      const { token, data } = response.data;

      // Login the user automatically
      login(data, token);

      // Redirect to user dashboard
      navigate("/user/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0a0a0b] font-body text-slate-200">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Page header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="block w-8 h-px bg-emerald-400" />
              <span className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase">
                New Account
              </span>
            </div>
            <h1 className="font-display text-5xl font-extrabold text-white leading-[0.95] tracking-tight">
              Start your
              <br />
              job search.
            </h1>
          </div>

          {/* Role toggle */}
          <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-sm mb-8 w-fit">
            <button className="flex items-center gap-2 px-5 py-2 bg-emerald-500 text-black text-xs font-semibold rounded-sm">
              <User className="h-3.5 w-3.5" /> Job Seeker
            </button>
            <Link
              to="/register-company"
              className="flex items-center gap-2 px-5 py-2 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
            >
              <Building2 className="h-3.5 w-3.5" /> Employer
            </Link>
          </div>

          {/* Form */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-sm p-8">
            <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-[0.2em] mb-6">
              Personal Details
            </p>

            {error && (
              <div className="mb-5 flex items-start gap-3 p-3.5 bg-red-500/8 border border-red-500/20 rounded-sm">
                <div className="w-0.5 self-stretch bg-red-500 rounded-full flex-shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    disabled={loading}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm pl-9 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    label: "Email",
                    name: "email",
                    type: "email",
                    placeholder: "you@example.com",
                    icon: <Mail className="h-3.5 w-3.5" />,
                  },
                  {
                    label: "Phone",
                    name: "phone",
                    type: "tel",
                    placeholder: "+1 (555) 000-0000",
                    icon: <Phone className="h-3.5 w-3.5" />,
                  },
                ].map(({ label, name, type, placeholder, icon }) => (
                  <div key={name} className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                      {label} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                        {icon}
                      </span>
                      <input
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        required
                        disabled={loading}
                        className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm pl-9 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Experience */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Experience Level
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm pl-9 pr-4 py-3 text-sm text-slate-200 outline-none transition-colors appearance-none"
                  >
                    <option value="">Select level</option>
                    <option value="entry">Entry Level (0–2 yrs)</option>
                    <option value="mid">Mid Level (3–5 yrs)</option>
                    <option value="senior">Senior (6–10 yrs)</option>
                    <option value="expert">Expert (10+ yrs)</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    label: "Password",
                    name: "password",
                    show: showPassword,
                    toggle: () => setShowPassword(!showPassword),
                  },
                  {
                    label: "Confirm Password",
                    name: "confirmPassword",
                    show: showConfirmPassword,
                    toggle: () => setShowConfirmPassword(!showConfirmPassword),
                  },
                ].map(({ label, name, show, toggle }) => (
                  <div key={name} className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                      {label} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                      <input
                        type={show ? "text" : "password"}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm pl-9 pr-10 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={toggle}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-600">
                Minimum 8 characters with letters and numbers.
              </p>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="mt-0.5 accent-emerald-500 w-3.5 h-3.5"
                />
                <span className="text-xs text-slate-500 leading-relaxed">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-sm font-semibold rounded-sm transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                {loading ? "Creating Account…" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Feature strips */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              {
                icon: <Briefcase className="h-4 w-4" />,
                title: "Thousands of Jobs",
                desc: "From top global companies",
              },
              {
                icon: <Bell className="h-4 w-4" />,
                title: "Job Alerts",
                desc: "Matched to your profile",
              },
              {
                icon: <ShieldCheck className="h-4 w-4" />,
                title: "Secure & Private",
                desc: "Industry-standard security",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-slate-900/40 border border-slate-800 rounded-sm p-4"
              >
                <div className="text-emerald-400 mb-2">{icon}</div>
                <p className="text-xs font-semibold text-slate-300 mb-1">
                  {title}
                </p>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
