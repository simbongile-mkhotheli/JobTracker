// pages/Dashboard.jsx
import { useState } from "react";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ApplicationsGrid } from "../components/ApplicationsGrid";
import { ApplicationForm } from "../components/ApplicationForm";
import { SearchBar } from "../components/SearchBar";
import { StatsCards } from "../components/StatsCards";
import { useApplications } from "../hooks/useApplications";

export default function Dashboard() {
  const [editingApplication, setEditingApplication] =
    useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    applications,
    addApplication,
    deleteApplication,
    updateApplication,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    stats,
  } = useApplications();

  function handleSubmit(applicationData) {
    if (editingApplication) {
      updateApplication({
        ...applicationData,
        id: editingApplication.id,
      });

      setEditingApplication(null);
      setIsFormOpen(false);

      return;
    }

    addApplication(applicationData);
    setIsFormOpen(false);
  }

  function handleEdit(application) {
    setEditingApplication(application);
    setIsFormOpen(true);
  }

  function handleCloseModal() {
    setEditingApplication(null);
    setIsFormOpen(false);
  }

  return (
    <DashboardLayout>
      <StatsCards stats={stats} />

      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
              Recent Applications
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Track and manage your active job opportunities.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="
              group inline-flex items-center gap-3 rounded-2xl
              border border-indigo-400/20
              bg-[linear-gradient(135deg,rgba(99,102,241,0.22),rgba(59,130,246,0.18))]
              px-5 py-3 text-sm font-medium text-white
              shadow-[0_10px_30px_rgba(59,130,246,0.18)]
              transition-all duration-300
              hover:-translate-y-0.5
              hover:border-indigo-300/40
              hover:shadow-[0_16px_40px_rgba(99,102,241,0.28)]
              active:scale-[0.98]
            "
          >
            <span
              className="
                flex h-8 w-8 items-center justify-center rounded-xl
                bg-white/10 text-lg transition
                group-hover:bg-white/15
              "
            >
              +
            </span>

            <span>Track New Role</span>
          </button>
        </div>

        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <div className="mt-6">
          <ApplicationsGrid
            applications={applications}
            onDelete={deleteApplication}
            onEdit={handleEdit}
          />
        </div>
      </section>

      
    {isFormOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
    <div className="relative w-full max-w-3xl overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,#0f1930_0%,#0b1426_100%)] shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_38%)] opacity-90" />

      <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-6 py-5">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {editingApplication
              ? "Edit Application"
              : "Track New Opportunity"}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {editingApplication
              ? "Update your application details and progress."
              : "Capture and organize your latest job application."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCloseModal}
          className="
            inline-flex h-11 w-11 items-center justify-center
            rounded-2xl border border-white/10
            bg-white/5 text-slate-300
            transition-all duration-200
            hover:border-white/20
            hover:bg-white/10
            hover:text-white
            active:scale-95
          "
        >
          ✕
        </button>
      </div>

      <div className="relative z-10 max-h-[80vh] overflow-y-auto p-6">
        <ApplicationForm
          onSubmit={handleSubmit}
          initialValues={editingApplication || undefined}
          submitLabel={
            editingApplication
              ? "Save Changes"
              : "Add Application"
          }
          title=""
          description=""
        />
      </div>
    </div>
  </div>
)}
    </DashboardLayout>
  );
}