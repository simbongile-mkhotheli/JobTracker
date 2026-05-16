import { ApplicationForm } from "./ApplicationForm";

export function ApplicationModal({
  isOpen,
  onClose,
  onSubmit,
  editingApplication,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-md sm:p-4">
      <div
        className="
          relative w-full max-w-2xl overflow-hidden
          rounded-2xl border border-white/10
          bg-[linear-gradient(180deg,#0f1930_0%,#0b1426_100%)]
          shadow-[0_30px_90px_rgba(0,0,0,0.45)]
          sm:rounded-[30px]
        "
      >
        <div
          className="
            absolute inset-0 opacity-90
            bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_38%)]
          "
        />

        <div className="relative z-10 flex items-start justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              {editingApplication
                ? "Edit Application"
                : "Track New Opportunity"}
            </h2>

            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              {editingApplication
                ? "Update your application details and progress."
                : "Capture and organize your latest job application."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              inline-flex h-11 w-11 shrink-0 items-center justify-center
              rounded-lg border border-white/10
              bg-white/5 text-slate-300
              transition-all duration-200
              hover:border-white/20
              hover:bg-white/10
              hover:text-white
              active:scale-95
              sm:rounded-xl
            "
          >
            ✕
          </button>
        </div>

        <div className="relative z-10 max-h-[70vh] overflow-y-auto p-4 sm:p-6">
          <ApplicationForm
            onSubmit={onSubmit}
            initialValues={editingApplication || undefined}
            submitLabel={
              editingApplication
                ? "Save Changes"
                : "Add Application"
            }
          />
        </div>
      </div>
    </div>
  );
}