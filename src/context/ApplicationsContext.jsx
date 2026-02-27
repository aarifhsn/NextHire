import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { jobsAPI } from "../services/api";
import { useAuth } from "./AuthContext";

const ApplicationsContext = createContext(null);

export const ApplicationsProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [applicationIds, setApplicationIds] = useState(new Map());
  const [loading, setLoading] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await jobsAPI.getAppliedJobs();

      const jobsSet = new Set();
      const appMap = new Map();

      const jobId = .job?.id || app.job?._id || app.jobId;

      if (jobId) {
        jobsSet.add(jobId);
        appMap.set(jobId, app.id);
      }

      setAppliedJobs(jobsSet);
      setApplicationIds(appMap);
    } catch (err) {
      console.error("Fetch applications failed", err);
    } finally {
      setLoading(false);
    }
  };

  const applyToJob = async (jobId, data = {}) => {
    try {
      await jobsAPI.applyToJob(jobId, data);
      await fetchApplications();
      toast.success("Applied successfully!");
    } catch (err) {
      toast.error("Failed to apply.");
      throw err;
    }
  };

  const withdrawApplication = async (jobId) => {
    const applicationId = applicationIds.get(jobId);
    if (!applicationId) return;

    try {
      await jobsAPI.withdrawApplication(applicationId);
      await fetchApplications();
      toast.success("Application withdrawn.");
    } catch (err) {
      toast.error("Failed to withdraw.");
      throw err;
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      fetchApplications();
    } else {
      setAppliedJobs(new Set());
      setApplicationIds(new Map());
    }
  }, [isAuthenticated]);

  return (
    <ApplicationsContext.Provider
      value={{
        appliedJobs,
        loading,
        applyToJob,
        withdrawApplication,
        refreshApplications: fetchApplications,
      }}
    >
      {children}
    </ApplicationsContext.Provider>
  );
};

export const useApplications = () => {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) {
    throw new Error("useApplications must be used inside ApplicationsProvider");
  }
  return ctx;
};
