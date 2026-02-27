import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { jobsAPI } from "../services/api";

export const useJobApplication = () => {
  const { isAuthenticated } = useAuth();
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [applicationIds, setApplicationIds] = useState(new Map());
  const [loading, setLoading] = useState(true);

  // Fetch applied jobs
  const fetchAppliedJobs = useCallback(async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await jobsAPI.getAppliedJobs();
      const applications = response.data?.data || [];

      const jobIdSet = new Set();
      const jobToApplicationMap = new Map();

      applications.forEach((app) => {
        jobIdSet.add(app.job.id);
        jobToApplicationMap.set(app.job.id, app.id);
      });

      setAppliedJobs(jobIdSet);
      setApplicationIds(jobToApplicationMap);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initial fetch
  useEffect(() => {
    fetchAppliedJobs();
  }, [fetchAppliedJobs]);

  // Check if a job is applied
  const isJobApplied = useCallback(
    (jobId) => {
      return appliedJobs.has(jobId);
    },
    [appliedJobs]
  );

  // Apply to a job
  const applyToJob = useCallback(
    async (jobId, data) => {
      if (!isAuthenticated()) {
        toast.error("Please login to apply for jobs");
        return { success: false, error: "Not authenticated" };
      }

      try {
        const response = await jobsAPI.applyToJob(jobId, data);

        // Update local state
        setAppliedJobs((prev) => new Set([...prev, jobId]));

        // Store the application ID if returned from API
        const applicationId = response.data?.data?.id || response.data?.id;
        if (applicationId) {
          setApplicationIds((prev) => {
            const next = new Map(prev);
            next.set(jobId, applicationId);
            return next;
          });
        }

        toast.success("Application submitted successfully!");
        return { success: true, data: response.data };
      } catch (error) {
        console.error("Application error:", error);
        toast.error(
          error.response?.data?.message || "Failed to submit application"
        );
        return { success: false, error };
      }
    },
    [isAuthenticated]
  );

  // Withdraw application
  const withdrawApplication = useCallback(
    async (jobId) => {
      const applicationId = applicationIds.get(jobId);

      if (!applicationId) {
        toast.error("Application not found.");
        return { success: false, error: "Application not found" };
      }

      if (
        !window.confirm("Are you sure you want to withdraw this application?")
      ) {
        return { success: false, error: "Cancelled by user" };
      }

      try {
        await jobsAPI.withdrawApplication(applicationId);

        // Update local state
        setAppliedJobs((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });

        setApplicationIds((prev) => {
          const next = new Map(prev);
          next.delete(jobId);
          return next;
        });

        toast.success("Application withdrawn successfully!");
        return { success: true };
      } catch (error) {
        console.error("Withdraw error:", error);
        toast.error(
          error.response?.data?.message ||
            "Failed to withdraw application. Please try again."
        );
        return { success: false, error };
      }
    },
    [applicationIds]
  );

  return {
    appliedJobs,
    applicationIds,
    loading,
    isJobApplied,
    applyToJob,
    withdrawApplication,
    refreshApplications: fetchAppliedJobs,
  };
};
