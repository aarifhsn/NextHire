import { Send, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useJobApplication } from "../hooks/useJobApplication";

export default function JobApplicationButton({ job, className = "" }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { isJobApplied, applyToJob, withdrawApplication } = useJobApplication();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverMessage, setCoverMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!job || !job.id) {
    return null;
  }

  const handleApplyClick = () => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    setShowApplyModal(true);
  };

  const handleWithdraw = async () => {
    await withdrawApplication(job.id);
  };

  const closeApplyDialog = () => {
    setShowApplyModal(false);
    setCoverMessage("");
  };

  const submitApplication = async () => {
    if (!coverMessage.trim()) {
      // You can make this optional if needed
      // For now, just warn but don't block
    }

    setIsSubmitting(true);
    const result = await applyToJob(job.id, {
      coverLetter: coverMessage,
    });

    if (result.success) {
      closeApplyDialog();
    }
    setIsSubmitting(false);
  };

  // Applied state
  if (isJobApplied(job.id)) {
    return (
      <button
        onClick={handleWithdraw}
        className={`flex items-center gap-1.5 text-xs px-4 py-2 border border-red-500/30 text-red-400 hover:border-red-400 hover:bg-red-500/8 rounded-sm transition-colors font-medium ${className}`}
      >
        Withdraw
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleApplyClick}
        className={`text-xs font-semibold px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      >
        Apply Now
      </button>

      {showApplyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-sm w-full max-w-xl shadow-2xl shadow-black/60">
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-[0.15em] mb-1.5">
                    Application
                  </p>
                  <h2 className="font-display text-xl font-bold text-white tracking-tight">
                    {job.title}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {job.company?.name}
                  </p>
                </div>
                <button
                  onClick={closeApplyDialog}
                  className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-sm transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Resume note */}
              <div className="flex items-start gap-3 p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-sm">
                <div className="w-0.5 self-stretch bg-emerald-500 rounded-full flex-shrink-0" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your profile resume will be attached automatically. Keep it up
                  to date before applying.
                </p>
              </div>

              {/* Cover letter */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Cover Note
                  </label>
                  <span className="text-[10px] text-slate-600">
                    {coverMessage.length}/500
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={coverMessage}
                  onChange={(e) =>
                    setCoverMessage(e.target.value.slice(0, 500))
                  }
                  placeholder="Why are you the right fit for this role…"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 rounded-sm px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none resize-none transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1 border-t border-slate-800">
                <button
                  onClick={closeApplyDialog}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 rounded-sm text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitApplication}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold rounded-sm text-xs transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSubmitting ? "Sending…" : "Submit Application"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
