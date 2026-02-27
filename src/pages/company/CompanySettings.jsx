import {
  Building2,
  Camera,
  ChevronRight,
  CreditCard,
  Phone,
  Save,
  Settings,
  Share2,
  Shield,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { companyAPI } from "../../services/api";
import { formatDate } from "../../utils/utils";

export default function CompanySettings() {
  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    companySize: "",
    companyType: "",
    website: "",
    founded: "",
    about: "",
    city: "",
    state: "",
    country: "",
    phone: "",
    hrEmail: "",
    supportEmail: "",
    linkedin: "",
    twitter: "",
    facebook: "",
    instagram: "",
    github: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [company, setCompany] = useState(null);

  const [companyStats, setCompanyStats] = useState(null);

  useEffect(() => {
    fetchCompanyProfile();
    fetchCompanyStats();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      const response = await companyAPI.getProfile();
      const company = response.data.data;

      setCompany(company);

      // Populate form with existing data
      setFormData({
        name: company.name || "",
        industry: company.industry || "",
        companySize: company.companySize || "",
        companyType: company.companyType || "",
        website: company.website || "",
        founded: company.founded || "",
        about: company.about || "",
        city: company.city || "",
        state: company.state || "",
        country: company.country || "",
        phone: company.phone || "",
        hrEmail: company.hrEmail || "",
        supportEmail: company.supportEmail || "",
        linkedin: company.socialLinks?.linkedin || "",
        twitter: company.socialLinks?.twitter || "",
        facebook: company.socialLinks?.facebook || "",
        instagram: company.socialLinks?.instagram || "",
        github: company.socialLinks?.github || "",
      });

      // Set logo preview if exists
      if (company.logo) {
        setLogoPreview(company.logo);
      }
    } catch (error) {
      console.error("Error fetching company profile:", error);
      toast.error("Failed to load company profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyStats = async () => {
    try {
      const response = await companyAPI.getDashboardStats();
      setCompanyStats(response.data.data);
    } catch (err) {
      console.error("Stats error:", err.response || err);
    }
  };

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle logo file upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogoFile(file);

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      if (logoFile) {
        payload.append("logo", logoFile);
      }

      await companyAPI.updateProfile(payload);

      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
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
              Loading settings…
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
          <div className="absolute top-0 left-0 w-[500px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-6">
              <a
                href="/companies/dashboard"
                className="hover:text-emerald-400 transition-colors"
              >
                Dashboard
              </a>
              <ChevronRight className="h-3 w-3" />
              <span className="text-slate-400">Settings</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="block w-8 h-px bg-emerald-400" />
              <span className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase">
                Company Settings
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-[0.95] tracking-tight text-white">
              Manage Your
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-emerald-400">Profile</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-emerald-400/10 -skew-x-3" />
              </span>
            </h1>
          </div>
        </section>

        {/* ── BODY ─────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* ── SIDEBAR NAV ──────────────────────────────── */}
            <aside className="lg:col-span-1 space-y-4">
              {/* Nav */}
              <div className="border border-slate-800 bg-slate-900/40 rounded-sm p-3">
                <nav className="space-y-0.5">
                  {[
                    {
                      href: "#company-info",
                      icon: Building2,
                      label: "Company Info",
                      active: true,
                    },
                    {
                      href: "#contact",
                      icon: Phone,
                      label: "Contact Details",
                      active: false,
                    },
                    {
                      href: "#social",
                      icon: Share2,
                      label: "Social Media",
                      active: false,
                    },
                    {
                      href: "#preferences",
                      icon: Settings,
                      label: "Preferences",
                      active: false,
                    },
                    {
                      href: "#billing",
                      icon: CreditCard,
                      label: "Billing",
                      active: false,
                    },
                    {
                      href: "#account",
                      icon: Shield,
                      label: "Account Security",
                      active: false,
                    },
                  ].map(({ href, icon: Icon, label, active }) => (
                    <a
                      key={href}
                      href={href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-medium transition-all duration-150 ${
                        active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "text-slate-500 hover:bg-slate-800 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Company card */}
              <div className="border border-slate-800 bg-slate-900/40 rounded-sm p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-sm bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
                    <Building2 className="h-6 w-6 text-slate-500" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-0.5">
                    {company?.name}
                  </p>
                  <span className="text-[10px] text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded-sm mb-5">
                    Premium
                  </span>
                  <div className="w-full space-y-3 border-t border-slate-800 pt-4">
                    {[
                      {
                        label: "Active Jobs",
                        value: companyStats?.activeJobs ?? 0,
                      },
                      {
                        label: "Total Applicants",
                        value: companyStats?.totalApplicants ?? 0,
                      },
                      {
                        label: "Member Since",
                        value: formatDate(company?.createdAt),
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between"
                      >
                        <span className="text-[10px] text-slate-600 uppercase tracking-widest">
                          {label}
                        </span>
                        <span className="text-xs font-semibold text-slate-300">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* ── SETTINGS CONTENT ─────────────────────────── */}
            <div className="lg:col-span-3 space-y-4">
              {/* ── Company Info ─────────────────────────── */}
              <div
                id="company-info"
                className="border border-slate-800 bg-slate-900/40 rounded-sm p-7"
              >
                <div className="flex items-center gap-3 mb-7">
                  <span className="block w-5 h-px bg-emerald-400" />
                  <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-white">
                    Company Information
                  </h2>
                </div>

                {/* Logo Upload */}
                <div className="mb-7 pb-7 border-b border-slate-800">
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">
                    Company Logo
                  </p>
                  <div className="flex items-center gap-6">
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 rounded-sm bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                        {logoPreview || company?.logo ? (
                          <img
                            src={logoPreview || company.logo}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="h-8 w-8 text-slate-600" />
                        )}
                      </div>
                      <label
                        htmlFor="logoUpload"
                        className="absolute -bottom-2 -right-2 w-7 h-7 rounded-sm bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Camera className="h-3.5 w-3.5 text-black" />
                      </label>
                      <input
                        type="file"
                        id="logoUpload"
                        onChange={handleLogoChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="logoUpload"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100 text-xs font-medium rounded-sm transition-colors cursor-pointer"
                      >
                        <Upload className="h-3.5 w-3.5" /> Upload Logo
                      </label>
                      <p className="text-[10px] text-slate-600 mt-2 leading-relaxed">
                        200×200px recommended · Max 2MB · JPG, PNG, SVG
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        id: "name",
                        label: "Company Name",
                        type: "text",
                        placeholder: "Enter company name",
                        required: true,
                      },
                      {
                        id: "industry",
                        label: "Industry",
                        type: "text",
                        placeholder: "e.g., Technology, Healthcare",
                        required: true,
                      },
                      {
                        id: "website",
                        label: "Website",
                        type: "url",
                        placeholder: "https://yourcompany.com",
                        required: true,
                      },
                      {
                        id: "founded",
                        label: "Founded Year",
                        type: "text",
                        placeholder: "e.g., 2020",
                        required: false,
                      },
                    ].map(({ id, label, type, placeholder, required }) => (
                      <div key={id}>
                        <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                          {label}
                          {required && (
                            <span className="text-red-400 ml-0.5">*</span>
                          )}
                        </label>
                        <input
                          type={type}
                          id={id}
                          name={id}
                          value={formData[id]}
                          onChange={handleChange}
                          placeholder={placeholder}
                          className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                        Company Size
                      </label>
                      <select
                        name="companySize"
                        value={formData.companySize}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-2.5 text-sm text-slate-200 outline-none transition-colors"
                      >
                        <option value="">Select size</option>
                        {[
                          "1-10",
                          "11-50",
                          "51-200",
                          "201-500",
                          "501-1000",
                          "1001-5000",
                          "5001-10000",
                          "10000+",
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s} employees
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                        Company Type
                      </label>
                      <select
                        name="companyType"
                        value={formData.companyType}
                        onChange={handleChange}
                        className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-2.5 text-sm text-slate-200 outline-none transition-colors"
                      >
                        <option value="">Select type</option>
                        {[
                          "Startup",
                          "Private Company",
                          "Public Company",
                          "Non-Profit",
                          "Government Agency",
                          "Educational Institution",
                          "Self-Employed",
                          "Partnership",
                        ].map((t) => (
                          <option
                            key={t}
                            value={t.toLowerCase().replace(" ", "-")}
                          >
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                      About Company
                      <span className="text-red-400 ml-0.5">*</span>
                    </label>
                    <textarea
                      id="about"
                      name="about"
                      rows={5}
                      value={formData.about}
                      onChange={handleChange}
                      placeholder="Tell us about your company…"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none resize-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: "city", label: "City", placeholder: "City" },
                      {
                        id: "state",
                        label: "State / Province",
                        placeholder: "State",
                      },
                      {
                        id: "country",
                        label: "Country",
                        placeholder: "Country",
                      },
                    ].map(({ id, label, placeholder }) => (
                      <div key={id}>
                        <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                          {label}
                        </label>
                        <input
                          type="text"
                          id={id}
                          name={id}
                          value={formData[id]}
                          onChange={handleChange}
                          placeholder={placeholder}
                          className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Contact ──────────────────────────────── */}
              <div
                id="contact"
                className="border border-slate-800 bg-slate-900/40 rounded-sm p-7"
              >
                <div className="flex items-center gap-3 mb-7">
                  <span className="block w-5 h-px bg-emerald-400" />
                  <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-white">
                    Contact Information
                  </h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                      Phone Number<span className="text-red-400 ml-0.5">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full md:w-1/2 bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        id: "hrEmail",
                        label: "HR Department Email",
                        placeholder: "hr@example.com",
                      },
                      {
                        id: "supportEmail",
                        label: "Information Email",
                        placeholder: "info@example.com",
                      },
                    ].map(({ id, label, placeholder }) => (
                      <div key={id}>
                        <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                          {label}
                        </label>
                        <input
                          type="email"
                          id={id}
                          name={id}
                          value={formData[id]}
                          onChange={handleChange}
                          placeholder={placeholder}
                          className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Social Media ─────────────────────────── */}
              <div
                id="social"
                className="border border-slate-800 bg-slate-900/40 rounded-sm p-7"
              >
                <div className="flex items-center gap-3 mb-7">
                  <span className="block w-5 h-px bg-emerald-400" />
                  <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-white">
                    Social Media Links
                  </h2>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      id: "linkedin",
                      label: "LinkedIn",
                      placeholder: "https://linkedin.com/company/yourcompany",
                    },
                    {
                      id: "twitter",
                      label: "Twitter / X",
                      placeholder: "https://twitter.com/yourcompany",
                    },
                    {
                      id: "facebook",
                      label: "Facebook",
                      placeholder: "https://facebook.com/yourcompany",
                    },
                    {
                      id: "instagram",
                      label: "Instagram",
                      placeholder: "https://instagram.com/yourcompany",
                    },
                    {
                      id: "github",
                      label: "GitHub",
                      placeholder: "https://github.com/yourcompany",
                    },
                  ].map(({ id, label, placeholder }) => (
                    <div key={id}>
                      <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                        {label}
                      </label>
                      <input
                        type="url"
                        id={id}
                        name={id}
                        value={formData[id]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Save ─────────────────────────────────── */}
              <div className="flex items-center justify-end pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-sm font-semibold rounded-sm transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
