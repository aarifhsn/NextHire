import {
  Briefcase,
  Building,
  Building2,
  Calendar,
  ChartLine,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  Shield,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";

export default function RegistrationCompanyPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
    industry: "",
    companySize: "",
    foundedYear: "",
    location: "",
    description: "",
    password: "",
    confirmPassword: "",
    terms: false,
    verified: false,
    updates: false,
    role: "COMPANY",
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Company name is required");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Email is invalid");
      return false;
    }

    if (!formData.website.trim()) {
      setError("Website is required");
      return false;
    } else if (!/^https?:\/\/.+/.test(formData.website)) {
      setError("Website must start with http:// or https://");
      return false;
    }

    if (!formData.industry) {
      setError("Industry is required");
      return false;
    }

    if (!formData.location.trim()) {
      setError("Location is required");
      return false;
    }

    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    } else if (formData.description.trim().length < 100) {
      setError("Description must be at least 100 characters");
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    } else if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password)) {
      setError("Password must contain letters and numbers");
      return false;
    }

    if (!formData.confirmPassword) {
      setError("Please confirm your password");
      return false;
    } else if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (!formData.terms) {
      setError("You must agree to the terms");
      return false;
    }

    if (!formData.verified) {
      setError("You must confirm you are authorized");
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
      const registrationData = {
        name: formData.name,
        email: formData.email,
        website: formData.website,
        industry: formData.industry,
        company_size: formData.companySize || undefined,
        founded_year: formData.foundedYear || undefined,
        location: formData.location,
        description: formData.description,
        password: formData.password,
        role: "COMPANY",
      };

      const response = await authAPI.register(registrationData);
      const { token, data } = response.data;

      login(data, token);
      navigate("/companies/dashboard");
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
        <div className="grid lg:grid-cols-5 gap-16 items-start">
          {/* ── LEFT: Branding + benefits ───────────────── */}
          <div className="hidden lg:block lg:col-span-2 lg:sticky lg:top-24">
            <div className="flex items-center gap-3 mb-8">
              <span className="block w-8 h-px bg-emerald-400" />
              <span className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase">
                For Employers
              </span>
            </div>

            <h1 className="font-display text-5xl font-extrabold text-white leading-[0.95] tracking-tight mb-6">
              Hire people
              <br />
              worth
              <br />
              <span className="text-emerald-400">hiring.</span>
            </h1>

            <p className="text-slate-500 text-sm leading-relaxed mb-10 max-w-xs">
              Register your company and start reaching engineers and designers
              who actually care about their work.
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: <Users className="h-4 w-4" />,
                  title: "Access Top Talent",
                  desc: "Thousands of qualified candidates actively looking for their next role.",
                },
                {
                  icon: <Briefcase className="h-4 w-4" />,
                  title: "Easy Job Posting",
                  desc: "Post a role in minutes with our streamlined interface.",
                },
                {
                  icon: <ChartLine className="h-4 w-4" />,
                  title: "Smart Analytics",
                  desc: "Track applications and optimize your pipeline with real data.",
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 p-4 bg-slate-900/40 border border-slate-800 rounded-sm"
                >
                  <div className="w-8 h-8 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200 mb-0.5">
                      {title}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Form ─────────────────────────────── */}
          <div className="lg:col-span-3">
            {/* Role toggle */}
            <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-sm mb-8 w-fit">
              <Link
                to="/register"
                className="flex items-center gap-2 px-5 py-2 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
              >
                <User className="h-3.5 w-3.5" /> Job Seeker
              </Link>
              <button className="flex items-center gap-2 px-5 py-2 bg-emerald-500 text-black text-xs font-semibold rounded-sm">
                <Building2 className="h-3.5 w-3.5" /> Employer
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-3 p-3.5 bg-red-500/8 border border-red-500/20 rounded-sm">
                <div className="w-0.5 self-stretch bg-red-500 rounded-full flex-shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ── Company Information ── */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <Building className="h-4 w-4 text-emerald-400" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                    Company Information
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                      Company Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="TechCorp Solutions"
                        required
                        disabled={loading}
                        className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm pl-9 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                      Company Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="hiring@company.com"
                        required
                        disabled={loading}
                        className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm pl-9 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Website + Industry */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        Website <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="https://company.com"
                          required
                          disabled={loading}
                          className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm pl-9 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        Industry <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                        <select
                          name="industry"
                          value={formData.industry}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm pl-9 pr-4 py-3 text-sm text-slate-200 outline-none transition-colors appearance-none"
                        >
                          <option value="">Select industry</option>
                          {[
                            ["technology", "Technology"],
                            ["finance", "Finance & Banking"],
                            ["healthcare", "Healthcare"],
                            ["education", "Education"],
                            ["retail", "Retail & E-commerce"],
                            ["manufacturing", "Manufacturing"],
                            ["consulting", "Consulting"],
                            ["marketing", "Marketing & Advertising"],
                            ["other", "Other"],
                          ].map(([val, label]) => (
                            <option key={val} value={val}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Company Size + Founded Year */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        Company Size
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                        <select
                          name="companySize"
                          value={formData.companySize}
                          onChange={handleChange}
                          disabled={loading}
                          className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm pl-9 pr-4 py-3 text-sm text-slate-200 outline-none transition-colors appearance-none"
                        >
                          <option value="">Select size</option>
                          {[
                            "1-10",
                            "11-50",
                            "51-200",
                            "201-500",
                            "501-1000",
                            "1000+",
                          ].map((s) => (
                            <option key={s} value={s}>
                              {s} employees
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        Founded Year
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                        <input
                          type="number"
                          name="foundedYear"
                          value={formData.foundedYear}
                          onChange={handleChange}
                          placeholder="2010"
                          min="1800"
                          max="2025"
                          disabled={loading}
                          className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm pl-9 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                      Headquarters <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="San Francisco, CA"
                      required
                      disabled={loading}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        Company Description{" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <span
                        className={`text-[10px] ${formData.description.length < 100 ? "text-slate-600" : "text-emerald-400"}`}
                      >
                        {formData.description.length}/100 min
                      </span>
                    </div>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tell us about your company, mission, and what makes it a great place to work…"
                      required
                      disabled={loading}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none resize-none transition-colors"
                    />
                    <p className="text-[10px] text-slate-600">
                      Minimum 100 characters · Displayed on your public company
                      profile.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Account Security ── */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                    Account Security
                  </p>
                </div>

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
                      toggle: () =>
                        setShowConfirmPassword(!showConfirmPassword),
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
                          {show ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-600 mt-3">
                  Minimum 8 characters with letters and numbers.
                </p>
              </div>

              {/* ── Agreements ── */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6 space-y-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-1">
                  Agreements
                </p>

                {[
                  {
                    name: "terms",
                    checked: formData.terms,
                    required: true,
                    label: (
                      <>
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
                      </>
                    ),
                  },
                  {
                    name: "verified",
                    checked: formData.verified,
                    required: true,
                    label:
                      "I confirm I am an authorized representative of this company with the right to register on its behalf.",
                  },
                  {
                    name: "updates",
                    checked: formData.updates,
                    required: false,
                    label:
                      "Send me product updates, hiring tips, and promotional offers via email.",
                  },
                ].map(({ name, checked, required, label }) => (
                  <label
                    key={name}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      name={name}
                      checked={checked}
                      onChange={handleChange}
                      required={required}
                      className="mt-0.5 accent-emerald-500 w-3.5 h-3.5 flex-shrink-0"
                    />
                    <span className="text-xs text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">
                      {label}
                      {required && (
                        <span className="text-red-400 ml-0.5">*</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-sm font-semibold rounded-sm transition-colors"
              >
                <Building2 className="h-4 w-4" />
                {loading ? "Creating Account…" : "Register Company"}
              </button>

              <p className="text-center text-xs text-slate-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
