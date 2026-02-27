import { Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import Applicants from "./pages/company/Applicants";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyProfile from "./pages/company/CompanyProfile";
import CreateJob from "./pages/company/CreateJob";
import ManageJobs from "./pages/company/ManageJobs";
import HomePage from "./pages/HomePage";
import JobDetails from "./pages/JobDetails";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import RegistrationCompanyPage from "./pages/RegistrationCompanyPage";
import RegistrationPage from "./pages/RegistrationPage";
import EditProfile from "./pages/users/EditProfile";
import UserDashboard from "./pages/users/UserDashboard";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CompanySettings from "./pages/company/CompanySettings";
import EditJob from "./pages/company/EditJob";
import AppliedJobs from "./pages/users/AppliedJobs";
import UserProfile from "./pages/users/UserProfile";

function App() {
  return (
    <>
      <ToastContainer />
      <AuthProvider>
        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<JobDetails />} path="/jobs/:id" />
          <Route element={<ProfilePage />} path="/me" />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<RegistrationPage />} path="/register" />

          <Route element={<UserProfile />} path="/users/profile" />
          <Route element={<UserProfile />} path="/users/profile/:userId" />
          <Route element={<EditProfile />} path="/users/profile/edit" />

          <Route element={<AppliedJobs />} path="/user/applied-jobs" />
          <Route element={<UserDashboard />} path="/user/dashboard" />
          <Route
            element={<RegistrationCompanyPage />}
            path="/register-company"
          />
          <Route element={<NotFoundPage />} path="*" />

          <Route element={<CompanyProfile />} path="/companies/:slug" />
          <Route element={<CompanyDashboard />} path="/companies/dashboard" />

          <Route element={<CompanySettings />} path="/companies/settings" />
          <Route element={<CreateJob />} path="/jobs" />
          <Route element={<EditJob />} path="/jobs/:id/edit" />
          <Route element={<ManageJobs />} path="/companies/jobs" />
          <Route element={<Applicants />} path="/companies/applicants" />
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
