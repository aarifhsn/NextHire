import { ChevronRight, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { companyAPI, jobsAPI } from "../../services/api";

export default function EditJob() {
  const { id } = useParams(); // Get job ID from URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    workMode: "",
    category: "",
    experienceLevel: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    salaryPeriod: "yearly",
    description: "",
    requirements: "",
    benefits: "",
    skills: [],
    vacancies: 1,
    deadline: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingJob, setFetchingJob] = useState(true);
  const [error, setError] = useState("");

  // Fetch job details on component mount
  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setFetchingJob(true);
      const response = await jobsAPI.getJob(id);
      const job = response.data.data;

      // Format the deadline date for input field (YYYY-MM-DD)
      const formattedDeadline = job.deadline
        ? new Date(job.deadline).toISOString().split("T")[0]
        : "";

      // Populate form with existing job data
      setFormData({
        title: job.title || "",
        type: job.type || "",
        workMode: job.workMode || "",
        category: job.category || "",
        experienceLevel: job.experienceLevel || "",
        location: job.location || "",
        salaryMin: job.salaryMin || "",
        salaryMax: job.salaryMax || "",
        salaryPeriod: job.salaryPeriod || "yearly",
        description: job.description || "",
        requirements: job.requirements || "",
        benefits: job.benefits || "",
        skills: job.skills || [],
        vacancies: job.vacancies || 1,
        deadline: formattedDeadline,
      });
    } catch (err) {
      console.error("Error fetching job:", err);
      toast.error("Failed to load job details");
      setError("Failed to load job details");
      navigate("/companies/jobs");
    } finally {
      setFetchingJob(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;

    if (formData.skills.includes(skillInput.trim())) {
      toast.warning("Skill already added");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, skillInput.trim()],
    }));
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.skills.length === 0) {
      toast.warning("Please add at least one skill");
      return;
    }

    if (
      formData.salaryMin &&
      formData.salaryMax &&
      parseInt(formData.salaryMin) > parseInt(formData.salaryMax)
    ) {
      toast.error("Minimum salary cannot be greater than maximum salary");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Prepare data for backend
      const jobData = {
        title: formData.title,
        type: formData.type,
        location: formData.location,
        description: formData.description,
        requirements: formData.requirements,
        benefits: formData.benefits,
        skills: formData.skills,
        experienceLevel: formData.experienceLevel,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        vacancies: parseInt(formData.vacancies),
        deadline: formData.deadline,
        workMode: formData.workMode,
        category: formData.category,
        salaryPeriod: formData.salaryPeriod,
      };

      await companyAPI.updateJob(id, jobData);

      toast.success("Job updated successfully!");
      navigate("/companies/jobs");
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Failed to update job");
      toast.error(err.response?.data?.message || "Failed to update job");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching job
  if (fetchingJob) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] font-body text-slate-200">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="space-y-3 text-center">
            <div className="w-8 h-8 border border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-600 uppercase tracking-widest">
              Loading job details…
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
          <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto px-6 py-14 md:py-20">
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-6">
              <button
                onClick={() => navigate("/companies/dashboard")}
                className="hover:text-emerald-400 transition-colors"
              >
                Dashboard
              </button>
              <ChevronRight className="h-3 w-3" />
              <button
                onClick={() => navigate("/companies/jobs")}
                className="hover:text-emerald-400 transition-colors"
              >
                Manage Jobs
              </button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-slate-400">Edit Job</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="block w-8 h-px bg-emerald-400" />
                  <span className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase">
                    Edit Listing
                  </span>
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-[0.95] tracking-tight text-white">
                  Edit This
                  <br />
                  <span className="relative inline-block">
                    <span className="relative z-10 text-emerald-400">
                      Job Post
                    </span>
                    <span className="absolute bottom-1 left-0 w-full h-3 bg-emerald-400/10 -skew-x-3" />
                  </span>
                </h1>
              </div>
              <button
                type="button"
                onClick={() => navigate("/companies/jobs")}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 text-xs font-medium rounded-sm transition-colors mt-1"
              >
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
            </div>
          </div>
        </section>

        {/* ── FORM ─────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          {error && (
            <div className="border border-red-400/20 bg-red-400/5 rounded-sm px-5 py-4 mb-6">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── Basic Information ───────────────────────── */}
            <div className="border border-slate-800 bg-slate-900/40 rounded-sm p-7">
              <div className="flex items-center gap-3 mb-7">
                <span className="block w-5 h-px bg-emerald-400" />
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-white">
                  Basic Information
                </h2>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                    Job Title<span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Senior Full Stack Developer"
                    required
                    className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      name: "type",
                      label: "Job Type",
                      required: true,
                      options: [
                        ["Full-time", "Full-time"],
                        ["Part-time", "Part-time"],
                        ["Contract", "Contract"],
                        ["Freelance", "Freelance"],
                        ["Internship", "Internship"],
                      ],
                    },
                    {
                      name: "workMode",
                      label: "Work Mode",
                      required: true,
                      options: [
                        ["on-site", "On-site"],
                        ["remote", "Remote"],
                        ["hybrid", "Hybrid"],
                      ],
                    },
                    {
                      name: "category",
                      label: "Category",
                      required: true,
                      options: [
                        ["engineering", "Engineering"],
                        ["design", "Design"],
                        ["product", "Product"],
                        ["marketing", "Marketing"],
                        ["sales", "Sales"],
                        ["hr", "Human Resources"],
                        ["finance", "Finance"],
                        ["other", "Other"],
                      ],
                    },
                    {
                      name: "experienceLevel",
                      label: "Experience Level",
                      required: true,
                      options: [
                        ["entry", "Entry Level (0-2 yrs)"],
                        ["mid", "Mid Level (2-5 yrs)"],
                        ["senior", "Senior Level (5-10 yrs)"],
                        ["lead", "Lead (10+ yrs)"],
                      ],
                    },
                  ].map(({ name, label, required, options }) => (
                    <div key={name}>
                      <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                        {label}
                        {required && (
                          <span className="text-red-400 ml-0.5">*</span>
                        )}
                      </label>
                      <select
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        required={required}
                        className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-2.5 text-sm text-slate-200 outline-none transition-colors"
                      >
                        <option value="">Select {label.toLowerCase()}</option>
                        {options.map(([val, display]) => (
                          <option key={val} value={val}>
                            {display}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Location & Compensation ─────────────────── */}
            <div className="border border-slate-800 bg-slate-900/40 rounded-sm p-7">
              <div className="flex items-center gap-3 mb-7">
                <span className="block w-5 h-px bg-emerald-400" />
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-white">
                  Location & Compensation
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                    Location<span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. San Francisco, CA"
                    required
                    className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
                {[
                  {
                    name: "salaryMin",
                    label: "Min Salary ($)",
                    placeholder: "e.g. 100000",
                  },
                  {
                    name: "salaryMax",
                    label: "Max Salary ($)",
                    placeholder: "e.g. 150000",
                  },
                ].map(({ name, label, placeholder }) => (
                  <div key={name}>
                    <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                      {label}
                    </label>
                    <input
                      type="number"
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                    Salary Period
                  </label>
                  <select
                    name="salaryPeriod"
                    value={formData.salaryPeriod}
                    onChange={handleChange}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-2.5 text-sm text-slate-200 outline-none transition-colors"
                  >
                    <option value="yearly">Yearly</option>
                    <option value="monthly">Monthly</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── Job Description ─────────────────────────── */}
            <div className="border border-slate-800 bg-slate-900/40 rounded-sm p-7">
              <div className="flex items-center gap-3 mb-7">
                <span className="block w-5 h-px bg-emerald-400" />
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-white">
                  Job Description
                </h2>
              </div>
              <div className="space-y-5">
                {[
                  {
                    name: "description",
                    label: "Description",
                    required: true,
                    rows: 7,
                    placeholder:
                      "Describe the role, responsibilities, and what makes this opportunity exciting…",
                    hint: "Provide a detailed description of the role and responsibilities.",
                  },
                  {
                    name: "requirements",
                    label: "Requirements & Qualifications",
                    required: false,
                    rows: 5,
                    placeholder:
                      "List the required skills, qualifications, and experience…",
                  },
                  {
                    name: "benefits",
                    label: "Benefits & Perks",
                    required: false,
                    rows: 4,
                    placeholder:
                      "Describe the benefits, perks, and what makes your company great…",
                  },
                ].map(({ name, label, required, rows, placeholder, hint }) => (
                  <div key={name}>
                    <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                      {label}
                      {required && (
                        <span className="text-red-400 ml-0.5">*</span>
                      )}
                    </label>
                    <textarea
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      rows={rows}
                      placeholder={placeholder}
                      required={required}
                      className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none resize-none transition-colors"
                    />
                    {hint && (
                      <p className="text-[10px] text-slate-600 mt-1.5">
                        {hint}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Required Skills ─────────────────────────── */}
            <div className="border border-slate-800 bg-slate-900/40 rounded-sm p-7">
              <div className="flex items-center gap-3 mb-7">
                <span className="block w-5 h-px bg-emerald-400" />
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-white">
                  Required Skills
                </h2>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                    Add Skills<span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddSkill())
                      }
                      placeholder="Type a skill and press Add…"
                      className="flex-1 bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold rounded-sm transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1.5">
                    Press Enter or click Add to insert a skill.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-3">
                    Added Skills
                  </label>
                  {formData.skills.length === 0 ? (
                    <p className="text-xs text-slate-600 border border-dashed border-slate-800 rounded-sm py-4 text-center">
                      No skills added yet
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {formData.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-sm"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Application Settings ────────────────────── */}
            <div className="border border-slate-800 bg-slate-900/40 rounded-sm p-7">
              <div className="flex items-center gap-3 mb-7">
                <span className="block w-5 h-px bg-emerald-400" />
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-white">
                  Application Settings
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                    Number of Vacancies
                  </label>
                  <input
                    type="number"
                    name="vacancies"
                    value={formData.vacancies}
                    onChange={handleChange}
                    min="1"
                    placeholder="e.g. 2"
                    className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                    Application Deadline
                    <span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-2.5 text-sm text-slate-200 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* ── Actions ─────────────────────────────────── */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/companies/jobs")}
                className="px-5 py-3 border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 text-xs font-medium rounded-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-sm font-semibold rounded-sm transition-colors"
              >
                <Save className="h-4 w-4" />
                {loading ? "Updating…" : "Update Job"}
              </button>
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}
