import {
  ArrowUpDown,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Filter,
  MapPin,
  PauseCircle,
  PlayCircle,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";
import { companyAPI } from "../../services/api";
import { formatDate } from "../../utils/utils";

export default function ManageJobs() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [companyJob, setCompanyJob] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Selection states
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchRecentJobs();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [companyJob, searchQuery, statusFilter, sortOrder]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowStatusDropdown(false);
      setShowSortDropdown(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchRecentJobs = async () => {
    try {
      setLoading(true);
      const response = await companyAPI.getJobs({
        limit: 100,
        sort: "newest",
      });
      setCompanyJob(response.data.data || []);
    } catch (err) {
      console.error("Jobs error:", err.response || err);
      setError("Failed to load jobs");
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...companyJob];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.type.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((job) => job.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredJobs(filtered);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilter = (e, status) => {
    e.stopPropagation();
    setStatusFilter(status);
    setShowStatusDropdown(false);
  };

  const handleSort = (e, order) => {
    e.stopPropagation();
    setSortOrder(order);
    setShowSortDropdown(false);
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      await companyAPI.deleteJob(jobId);
      toast.success("Job deleted successfully!");
      fetchRecentJobs();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "Failed to delete job");
    }
  };

  const handleEditJob = (jobId) => {
    navigate(`/jobs/${jobId}/edit`);
  };

  // Checkbox selection handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(paginatedJobs.map((job) => job.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectJob = (jobId) => {
    if (selectedJobs.includes(jobId)) {
      setSelectedJobs(selectedJobs.filter((id) => id !== jobId));
    } else {
      setSelectedJobs([...selectedJobs, jobId]);
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedJobs.length === 0) {
      toast.warning("Please select jobs to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedJobs.length} job(s)?`,
      )
    )
      return;

    try {
      await Promise.all(
        selectedJobs.map((jobId) => companyAPI.deleteJob(jobId)),
      );
      toast.success(`${selectedJobs.length} job(s) deleted successfully!`);
      setSelectedJobs([]);
      setSelectAll(false);
      fetchRecentJobs();
    } catch (err) {
      console.error("Bulk delete error:", err);
      toast.error("Failed to delete some jobs");
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedJobs.length === 0) {
      toast.warning("Please select jobs to update");
      return;
    }

    try {
      await Promise.all(
        selectedJobs.map((jobId) =>
          companyAPI.updateJob(jobId, { status: newStatus }),
        ),
      );
      toast.success(`${selectedJobs.length} job(s) updated to ${newStatus}`);
      setSelectedJobs([]);
      setSelectAll(false);
      fetchRecentJobs();
    } catch (err) {
      console.error("Bulk update error:", err);
      toast.error("Failed to update some jobs");
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setSelectedJobs([]);
    setSelectAll(false);
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      Active: "badge-success",
      Closed: "badge-error",
      Archived: "badge-secondary",
    };
    return classes[status] || "badge-secondary";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] font-body text-slate-200">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="space-y-3 text-center">
            <div className="w-8 h-8 border border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-600 uppercase tracking-widest">
              Loading jobs…
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] font-body text-slate-200">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-red-400 text-sm">{error}</p>
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

          <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">
            <div className="flex items-center gap-2 text-xs text-slate-600 mb-6">
              <Link
                to="/companies/dashboard"
                className="hover:text-emerald-400 transition-colors"
              >
                Dashboard
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-slate-400">Manage Jobs</span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="block w-8 h-px bg-emerald-400" />
                  <span className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase">
                    Job Listings
                  </span>
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-[0.95] tracking-tight text-white">
                  Manage
                  <br />
                  <span className="relative inline-block">
                    <span className="relative z-10 text-emerald-400">
                      Your Jobs
                    </span>
                    <span className="absolute bottom-1 left-0 w-full h-3 bg-emerald-400/10 -skew-x-3" />
                  </span>
                </h1>
                <p className="text-slate-500 text-sm mt-3">
                  {filteredJobs.length}{" "}
                  {filteredJobs.length === 1 ? "job" : "jobs"} found
                </p>
              </div>
              <Link
                to="/companies/jobs/create"
                className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-sm transition-colors"
              >
                <Plus className="h-4 w-4" /> Create New Job
              </Link>
            </div>
          </div>
        </section>

        {/* ── FILTER BAR ──────────────────────────────────── */}
        <section className="sticky top-0 z-30 bg-[#0a0a0b]/95 backdrop-blur border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-sm focus-within:border-emerald-500 transition-colors flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 h-3.5 w-3.5 text-slate-500" />
              <input
                type="search"
                placeholder="Search by title, location, type…"
                value={searchQuery}
                onChange={handleSearch}
                className="bg-transparent pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 outline-none w-full"
              />
            </div>

            {/* Status dropdown */}
            <div className="dropdown relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowSortDropdown(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-medium transition-colors duration-150 ${
                  statusFilter !== "All"
                    ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                    : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300"
                }`}
              >
                <Filter className="h-3 w-3" />
                Status: {statusFilter}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-slate-900 border border-slate-700 rounded-sm shadow-2xl shadow-black/50 z-40 min-w-[150px] py-1">
                  {["All", "Active", "Closed", "Archived"].map((s) => (
                    <button
                      key={s}
                      onClick={(e) => handleStatusFilter(e, s)}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-slate-800 ${
                        statusFilter === s
                          ? "text-emerald-400"
                          : "text-slate-300"
                      }`}
                    >
                      {s === "All" ? "All Status" : s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="dropdown relative ml-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSortDropdown(!showSortDropdown);
                  setShowStatusDropdown(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-slate-700 text-slate-400 hover:border-slate-500 text-xs font-medium transition-colors"
              >
                <ArrowUpDown className="h-3 w-3" />
                {sortOrder === "newest" ? "Newest First" : "Oldest First"}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
              {showSortDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-slate-900 border border-slate-700 rounded-sm shadow-2xl shadow-black/50 z-40 min-w-[150px] py-1">
                  {[
                    ["newest", "Newest First"],
                    ["oldest", "Oldest First"],
                  ].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={(e) => handleSort(e, val)}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-slate-800 ${
                        sortOrder === val
                          ? "text-emerald-400"
                          : "text-slate-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── TABLE ────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          {/* Bulk actions */}
          {selectedJobs.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 mb-4 border border-emerald-500/20 bg-emerald-500/5 rounded-sm">
              <span className="text-xs text-emerald-400 font-medium">
                {selectedJobs.length}{" "}
                {selectedJobs.length === 1 ? "job" : "jobs"} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkStatusUpdate("Active")}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400 text-xs font-medium rounded-sm transition-colors"
                >
                  <PlayCircle className="h-3 w-3" /> Activate
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate("Closed")}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 text-slate-300 hover:border-slate-500 text-xs font-medium rounded-sm transition-colors"
                >
                  <PauseCircle className="h-3 w-3" /> Deactivate
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/30 text-red-400 hover:border-red-500/60 text-xs font-medium rounded-sm transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          )}

          <div className="border border-slate-800 rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60">
                    <th className="text-left py-3.5 px-5">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="accent-emerald-500 w-3.5 h-3.5"
                      />
                    </th>
                    {[
                      "Job Title",
                      "Status",
                      "Applicants",
                      "Posted",
                      "Expires",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`py-3.5 px-5 text-[10px] font-semibold uppercase tracking-widest text-slate-500 ${h === "Actions" ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedJobs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-20 text-center">
                        <Search className="h-7 w-7 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">
                          {searchQuery || statusFilter !== "All"
                            ? "No jobs match your filters."
                            : "No jobs yet. Create your first posting."}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedJobs.map((job) => {
                      const statusColor =
                        {
                          Active:
                            "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
                          Closed: "text-red-400 border-red-400/30 bg-red-400/5",
                          Archived:
                            "text-slate-400 border-slate-600 bg-slate-800",
                        }[job.status] ??
                        "text-slate-400 border-slate-600 bg-slate-800";

                      return (
                        <tr
                          key={job.id}
                          className="group hover:bg-slate-900/60 transition-colors"
                        >
                          <td className="py-4 px-5">
                            <input
                              type="checkbox"
                              checked={selectedJobs.includes(job.id)}
                              onChange={() => handleSelectJob(job.id)}
                              className="accent-emerald-500 w-3.5 h-3.5"
                            />
                          </td>
                          <td className="py-4 px-5">
                            <Link
                              to={`/jobs/${job.slug}`}
                              className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors"
                            >
                              {job.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-2.5 w-2.5" />
                                {job.location}
                              </span>
                              <span className="text-slate-800">·</span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="h-2.5 w-2.5" />
                                {job.type}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span
                              className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-1 border rounded-sm ${statusColor}`}
                            >
                              {job.status}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <span className="text-sm font-semibold text-white">
                              {job.applicants || 0}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-xs text-slate-500">
                            {formatDate(job.createdAt)}
                          </td>
                          <td className="py-4 px-5 text-xs text-slate-500">
                            {job.deadline ? (
                              formatDate(job.deadline)
                            ) : (
                              <span className="text-slate-700">—</span>
                            )}
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleEditJob(job.id)}
                                className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-slate-800 rounded-sm transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-sm transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredJobs.length > 0 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-800 bg-slate-900/40">
                <p className="text-xs text-slate-600">
                  Showing{" "}
                  <span className="text-slate-400 font-medium">
                    {indexOfFirstItem + 1}
                  </span>
                  –
                  <span className="text-slate-400 font-medium">
                    {Math.min(indexOfLastItem, filteredJobs.length)}
                  </span>{" "}
                  of{" "}
                  <span className="text-slate-400 font-medium">
                    {filteredJobs.length}
                  </span>
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-slate-700 text-slate-400 hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-sm transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-7 h-7 text-xs rounded-sm border transition-colors ${
                          currentPage === p
                            ? "bg-emerald-500 border-emerald-500 text-black font-semibold"
                            : "border-slate-700 text-slate-400 hover:border-slate-500"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 border border-slate-700 text-slate-400 hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-sm transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
