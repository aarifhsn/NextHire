import { Camera, ChevronRight, FileText, Upload, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../services/api";

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    bio: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    experienceLevel: "",
  });

  // Skills state
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  // Experience state
  const [experience, setExperience] = useState([]);

  // Education state
  const [education, setEducation] = useState([]);

  // File uploads
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      const profileData = response.data?.data || response.data;

      setProfile(profileData);

      // Populate form data
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        title: profileData.title || "",
        city: profileData.city || "",
        state: profileData.state || "",
        country: profileData.country || "",
        zipCode: profileData.zipCode || "",
        bio: profileData.bio || "",
        linkedinUrl: profileData.linkedinUrl || "",
        githubUrl: profileData.githubUrl || "",
        portfolioUrl: profileData.portfolioUrl || "",
        experienceLevel: profileData.experienceLevel || "",
      });

      // Set skills
      setSkills(profileData.skills || []);

      // Set experience
      setExperience(profileData.experience || []);

      // Set education
      setEducation(profileData.education || []);

      // Set profile picture preview
      if (profileData.profilePictureUrl) {
        setProfilePicturePreview(profileData.profilePictureUrl);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setProfilePicture(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview(null);
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) {
      toast.error("Please enter a skill");
      return;
    }

    if (skills.includes(skillInput.trim())) {
      toast.error("Skill already added");
      return;
    }

    setSkills((prev) => [...prev, skillInput.trim()]);
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((skill) => skill !== skillToRemove));
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleAddExperience = () => {
    const newExperience = {
      id: Date.now(), // temporary ID
      title: "",
      companyName: "",
      employmentType: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      currentlyWorking: false,
    };
    setExperience((prev) => [...prev, newExperience]);
  };

  const handleExperienceChange = (id, field, value) => {
    setExperience((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    );
  };

  const handleRemoveExperience = (id) => {
    setExperience((prev) => prev.filter((exp) => exp.id !== id));
  };

  const handleAddEducation = () => {
    const newEducation = {
      id: Date.now(), // temporary ID
      school: "",
      degree: "",
      fieldOfStudy: "",
      startYear: "",
      endYear: "",
    };
    setEducation((prev) => [...prev, newEducation]);
  };

  const handleEducationChange = (id, field, value) => {
    setEducation((prev) =>
      prev.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    );
  };

  const handleRemoveEducation = (id) => {
    setEducation((prev) => prev.filter((edu) => edu.id !== id));
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload PDF, DOC, or DOCX file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resume size should be less than 5MB");
      return;
    }

    setResumeFile(file);
    toast.success("Resume selected: " + file.name);
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Validate required fields
      if (!formData.name || !formData.email) {
        toast.error("Name and email are required");
        return;
      }

      // Prepare form data
      const updateData = {
        ...formData,
        skills,
        experience: experience.map((exp) => ({
          title: exp.title,
          companyName: exp.companyName,
          employmentType: exp.employmentType,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description,
        })),
        education: education.map((edu) => ({
          school: edu.school,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startYear: edu.startYear,
          endYear: edu.endYear,
        })),
      };

      // Update profile
      await userAPI.updateProfile(updateData);

      // Upload profile picture if changed
      if (profilePicture) {
        await userAPI.uploadProfilePicture(profilePicture);
      }

      // Upload resume if changed
      if (resumeFile) {
        await userAPI.uploadResume(resumeFile);
      }

      // Update auth context
      if (updateUser) {
        updateUser({ ...user, ...updateData });
      }

      toast.success("Profile updated successfully!");
      navigate("/users/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ──────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] font-body text-slate-200">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-16">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-sm bg-slate-900 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Main return ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0b] font-body text-slate-200">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[10px] text-slate-600 mb-4 uppercase tracking-widest">
            <Link
              to="/user/dashboard"
              className="hover:text-slate-400 transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link
              to="/users/profile"
              className="hover:text-slate-400 transition-colors"
            >
              Profile
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-500">Edit</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold text-white tracking-tight">
                Edit Profile
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Update your information and preferences
              </p>
            </div>
            <Link
              to="/users/profile"
              className="flex items-center gap-2 px-4 py-2 border border-slate-700 text-slate-400 hover:border-slate-500 text-xs font-medium rounded-sm transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </Link>
          </div>
        </div>

        {/* ── Helper to render section wrapper ── */}
        {/* (inline below each section) */}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Profile Photo */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-5">
              Profile Photo
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative flex-shrink-0">
                <div className="h-24 w-24 rounded-sm bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-slate-600" />
                  )}
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-emerald-500 rounded-sm flex items-center justify-center border-2 border-[#0a0a0b]">
                  <Camera className="h-3.5 w-3.5 text-black" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300 mb-1">
                  Upload Photo
                </p>
                <p className="text-xs text-slate-600 mb-3">
                  JPG, PNG or GIF · Max 5MB
                </p>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold rounded-sm cursor-pointer transition-colors">
                    <Upload className="h-3.5 w-3.5" /> Upload
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveProfilePicture}
                    disabled={!profilePicturePreview}
                    className="flex items-center gap-1.5 px-4 py-2 border border-slate-700 text-slate-400 hover:border-red-500/40 hover:text-red-400 text-xs font-medium rounded-sm disabled:opacity-30 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-5">
              Basic Information
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: "Name",
                  name: "name",
                  type: "text",
                  placeholder: "John Doe",
                  required: true,
                },
                {
                  label: "Email",
                  name: "email",
                  type: "email",
                  placeholder: "you@example.com",
                  required: true,
                },
                {
                  label: "Phone",
                  name: "phone",
                  type: "tel",
                  placeholder: "+1 (555) 000-0000",
                  required: true,
                },
                {
                  label: "Professional Title",
                  name: "title",
                  type: "text",
                  placeholder: "Full Stack Developer",
                },
              ].map(({ label, name, type, placeholder, required }) => (
                <div key={name} className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    {label}
                    {required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    required={required}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-5">
              Location
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "City", name: "city", placeholder: "San Francisco" },
                {
                  label: "State / Province",
                  name: "state",
                  placeholder: "California",
                },
                {
                  label: "Country",
                  name: "country",
                  placeholder: "United States",
                },
                { label: "Zip Code", name: "zipCode", placeholder: "94103" },
              ].map(({ label, name, placeholder }) => (
                <div key={name} className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    {label}
                  </label>
                  <input
                    type="text"
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* About / Bio */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-5">
              Professional Summary
            </p>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={5}
              placeholder="Write a brief summary about yourself…"
              className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none resize-none transition-colors"
            />
          </div>

          {/* Skills */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-5">
              Skills
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={handleSkillKeyPress}
                placeholder="Type a skill and press Enter…"
                className="flex-1 bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold rounded-sm transition-colors"
              >
                Add
              </button>
            </div>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-600 italic">
                No skills added yet.
              </p>
            )}
          </div>

          {/* Experience */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                Work Experience
              </p>
              <button
                type="button"
                onClick={handleAddExperience}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 text-slate-400 hover:border-emerald-500 hover:text-emerald-400 text-xs font-medium rounded-sm transition-colors"
              >
                + Add
              </button>
            </div>
            <div className="space-y-4">
              {experience.length > 0 ? (
                experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 border border-slate-700 rounded-sm bg-slate-800/30 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="absolute top-3 right-3 text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        {
                          label: "Job Title",
                          field: "title",
                          placeholder: "Senior Developer",
                        },
                        {
                          label: "Company",
                          field: "companyName",
                          placeholder: "Company Inc.",
                        },
                        {
                          label: "Location",
                          field: "location",
                          placeholder: "City, Country",
                        },
                        {
                          label: "Start Date",
                          field: "startDate",
                          type: "month",
                        },
                        { label: "End Date", field: "endDate", type: "month" },
                      ].map(({ label, field, placeholder, type }) => (
                        <div key={field} className="space-y-1">
                          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                            {label}
                          </label>
                          <input
                            type={type || "text"}
                            placeholder={placeholder}
                            value={exp[field]}
                            onChange={(e) =>
                              handleExperienceChange(
                                exp.id,
                                field,
                                e.target.value,
                              )
                            }
                            disabled={
                              field === "endDate" && exp.currentlyWorking
                            }
                            className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-3 py-2 text-xs text-slate-200 placeholder-slate-600 outline-none transition-colors disabled:opacity-40"
                          />
                        </div>
                      ))}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                          Type
                        </label>
                        <select
                          value={exp.employmentType}
                          onChange={(e) =>
                            handleExperienceChange(
                              exp.id,
                              "employmentType",
                              e.target.value,
                            )
                          }
                          className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-3 py-2 text-xs text-slate-200 outline-none transition-colors"
                        >
                          <option value="">Select type</option>
                          {[
                            "full-time",
                            "part-time",
                            "contract",
                            "freelance",
                            "internship",
                          ].map((t) => (
                            <option key={t} value={t} className="capitalize">
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Describe your role and achievements…"
                          value={exp.description}
                          onChange={(e) =>
                            handleExperienceChange(
                              exp.id,
                              "description",
                              e.target.value,
                            )
                          }
                          className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-3 py-2 text-xs text-slate-200 placeholder-slate-600 outline-none resize-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-600 italic text-center py-4">
                  No experience added yet.
                </p>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                Education
              </p>
              <button
                type="button"
                onClick={handleAddEducation}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 text-slate-400 hover:border-emerald-500 hover:text-emerald-400 text-xs font-medium rounded-sm transition-colors"
              >
                + Add
              </button>
            </div>
            <div className="space-y-4">
              {education.length > 0 ? (
                education.map((edu) => (
                  <div
                    key={edu.id}
                    className="p-4 border border-slate-700 rounded-sm bg-slate-800/30 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(edu.id)}
                      className="absolute top-3 right-3 text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        {
                          label: "Institution",
                          field: "school",
                          placeholder: "University name",
                        },
                        {
                          label: "Degree",
                          field: "degree",
                          placeholder: "Bachelor of Science",
                        },
                        {
                          label: "Field of Study",
                          field: "fieldOfStudy",
                          placeholder: "Computer Science",
                        },
                        {
                          label: "Start Year",
                          field: "startYear",
                          placeholder: "2020",
                        },
                        {
                          label: "End Year",
                          field: "endYear",
                          placeholder: "2024",
                        },
                      ].map(({ label, field, placeholder }) => (
                        <div key={field} className="space-y-1">
                          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                            {label}
                          </label>
                          <input
                            type="text"
                            placeholder={placeholder}
                            value={edu[field]}
                            onChange={(e) =>
                              handleEducationChange(
                                edu.id,
                                field,
                                e.target.value,
                              )
                            }
                            className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-3 py-2 text-xs text-slate-200 placeholder-slate-600 outline-none transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-600 italic text-center py-4">
                  No education added yet.
                </p>
              )}
            </div>
          </div>

          {/* Resume */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-5">
              Resume / CV
            </p>
            {(profile?.resumeUrl || resumeFile) && (
              <div className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-sm mb-3">
                <FileText className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-300 truncate">
                    {resumeFile
                      ? resumeFile.name
                      : profile.resumeOriginalName || "Resume.pdf"}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {resumeFile
                      ? `${(resumeFile.size / 1024).toFixed(1)} KB`
                      : profile.resumeSize || ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveResume}
                  className="text-slate-600 hover:text-red-400 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <label className="flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-slate-700 hover:border-emerald-500 text-slate-500 hover:text-emerald-400 text-xs font-medium rounded-sm cursor-pointer transition-colors">
              <Upload className="h-3.5 w-3.5" />
              {profile?.resumeUrl ? "Replace Resume" : "Upload Resume"}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeChange}
              />
            </label>
            <p className="text-[10px] text-slate-600 mt-2">
              PDF, DOC, or DOCX · Max 5MB
            </p>
          </div>

          {/* Social Links */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-sm p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-5">
              Social Profiles
            </p>
            <div className="space-y-3">
              {[
                {
                  label: "LinkedIn",
                  name: "linkedinUrl",
                  placeholder: "https://linkedin.com/in/username",
                },
                {
                  label: "GitHub",
                  name: "githubUrl",
                  placeholder: "https://github.com/username",
                },
                {
                  label: "Portfolio",
                  name: "portfolioUrl",
                  placeholder: "https://yourwebsite.com",
                },
              ].map(({ label, name, placeholder }) => (
                <div key={name} className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    {label}
                  </label>
                  <input
                    type="url"
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-8">
            <Link
              to="/users/profile"
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-700 text-slate-400 hover:border-slate-500 text-sm font-medium rounded-sm transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-sm font-semibold rounded-sm transition-colors"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
