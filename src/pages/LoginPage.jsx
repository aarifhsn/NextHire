import { Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("=== LOGIN ATTEMPT ===");
    console.log("Email:", formData.email);
    console.log("Password length:", formData.password.length);

    try {
      let response;
      try {
        console.log("Trying USER login...");
        response = await authAPI.login({ ...formData, role: "USER" });
        console.log("USER login SUCCESS:", response.data);
      } catch (error) {
        console.log("USER login failed, trying COMPANY...");
        console.log("USER error:", error.response?.data);

        response = await authAPI.login({ ...formData, role: "COMPANY" });
        console.log("COMPANY login SUCCESS:", response.data);
      }

      console.log("Full response:", response.data);
      const { token, data } = response.data;
      console.log("Token:", token);
      console.log("User data:", data);

      login(data, token);

      if (data.role === "COMPANY") {
        navigate("/companies/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err) {
      console.error("=== LOGIN FAILED ===");
      console.error("Error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error message:", err.message);

      setError(
        err.response?.data?.message ||
          "Invalid email or password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] font-body text-slate-200">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-16 items-center min-h-[70vh]">
          {/* Left — branding */}
          <div className="hidden md:block">
            <div className="flex items-center gap-3 mb-10">
              <span className="block w-8 h-px bg-emerald-400" />
              <span className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase">
                Welcome Back
              </span>
            </div>
            <h1 className="font-display text-6xl font-extrabold text-white leading-[0.9] tracking-tight mb-6">
              Your next
              <br />
              <span className="text-emerald-400">role</span> awaits.
            </h1>
            <p className="text-slate-500 text-lg leading-relaxed max-w-sm">
              Sign in to continue your job search and manage your applications.
            </p>

            <div className="mt-12 space-y-3">
              {[
                "Apply to curated roles",
                "Track application status",
                "Connect with top companies",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-sm text-slate-400">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-sm p-8">
              <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-[0.2em] mb-6">
                Sign In
              </p>

              {error && (
                <div className="mb-5 flex items-start gap-3 p-3.5 bg-red-500/8 border border-red-500/20 rounded-sm">
                  <div className="w-0.5 self-stretch bg-red-500 rounded-full flex-shrink-0" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      disabled={loading}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm pl-9 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm pl-9 pr-10 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-sm font-semibold rounded-sm transition-colors mt-2"
                >
                  <LogIn className="h-4 w-4" />
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-600">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                  >
                    Sign up free
                  </Link>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-5">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-600" />
              <p className="text-xs text-slate-600">
                Protected with industry-standard encryption
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
