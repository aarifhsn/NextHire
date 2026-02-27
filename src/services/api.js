import axios from "axios";

// Base API URL - Update this with your backend URL from .env
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth API calls
export const authAPI = {
  // Register
  register: (data) => api.post("/auth/register", data),

  // Login
  login: (credentials) => api.post("/auth/login", credentials),

  // Get current user
  getCurrentUser: () => api.get("/auth/me"),
};

// Jobs API calls
export const jobsAPI = {
  // Get all jobs with pagination
  getJobs: (params) => api.get("/jobs", { params }),

  // Get single job
  getJob: (id) => api.get(`/jobs/${id}`),

  // Search jobs
  searchJobs: (query, params) => api.get(`/jobs/search?q=${query}`, { params }),

  // Apply to job
  applyToJob: (jobId, data) =>
    api.post(`/applications/jobs/${jobId}/apply`, data),

  getAppliedJobs: () => api.get("/applications/my-applications"),

  // Withdraw application
  withdrawApplication: (jobId) => api.delete(`/applications/${jobId}`),

  // Get recommended jobs
  getRecommendedJobs: () => api.get("/jobs/recommendations"),
};

// User/Job Seeker API calls
export const userAPI = {
  // Get user profile
  getProfile: () => api.get("/users/profile"),

  getProfileById: (userId) => api.get(`/users/${userId}`),

  // Update user profile
  updateProfile: (data) => api.put("/users/profile", data),

  // Get applied jobs
  getAppliedJobs: (params) =>
    api.get("/applications/my-applications", { params }),

  // Upload Resume
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    return api.post("/users/resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Upload profile picture
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append("profilePicture", file);
    return api.post("/users/profile-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// Company API calls
export const companyAPI = {
  // Get company profile
  getProfile: () => api.get("/companies/profile"),

  // Update company profile
  updateProfile: (data) => api.put("/companies/profile", data),

  getCompanyBySlug: (slug) => api.get(`/companies/${slug}`),
  getCompanyJobs: (slug) => api.get(`/companies/jobs`),

  // Create job
  createJob: (data) => api.post("/jobs", data),

  // Get company jobs
  getJobs: (params) => api.get("/companies/jobs", { params }),

  // Update job
  updateJob: (jobId, data) => api.put(`/jobs/${jobId}`, data),

  // Delete job
  deleteJob: (jobId) => api.delete(`/jobs/${jobId}`),

  // Get applicants
  getApplicants: (params) => api.get("/companies/applicants", { params }),

  // Get dashboard stats
  getDashboardStats: () => api.get("/companies/dashboard/stats"),

  // Get applicants for a specific job
  getApplicantsForJob: (jobId, params) =>
    api.get(`/applications/jobs/${jobId}/applicants`, { params }),

  // Update application status - FIXED
  updateApplicationStatus: (applicationId, status) =>
    api.patch(`/applications/${applicationId}/status`, { status }),

  // Save/bookmark a job
  saveJob: (jobId) => api.post(`/jobs/${jobId}/save`),

  // Unsave/unbookmark a job
  unsaveJob: (jobId) => api.delete(`/jobs/${jobId}/save`),

  // Get saved jobs
  getSavedJobs: () => api.get("/jobs/saved"),

  // Check if job is saved
  checkIfSaved: (jobId) => api.get(`/jobs/${jobId}/is-saved`),
};

export default api;
