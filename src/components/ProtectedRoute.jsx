import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Protected route for authenticated users
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Protected route for job seekers only
export const JobSeekerRoute = ({ children }) => {
  const { isAuthenticated, isJobSeeker, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isJobSeeker()) {
    // If logged in but not a job seeker, redirect to appropriate dashboard
    return <Navigate to="/companies/dashboard" replace />;
  }

  return children;
};

// Protected route for companies only
export const CompanyRoute = ({ children }) => {
  const { isAuthenticated, isCompany, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isCompany()) {
    // If logged in but not a company, redirect to job seeker dashboard
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
};

// Public route that redirects to dashboard if already logged in
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isJobSeeker, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated()) {
    // Redirect to appropriate dashboard if already logged in
    return (
      <Navigate
        to={isJobSeeker() ? "/user/dashboard" : "/companies/dashboard"}
        replace
      />
    );
  }

  return children;
};
