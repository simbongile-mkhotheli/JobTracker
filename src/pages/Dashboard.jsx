// pages/Dashboard.jsx
import { useState } from "react";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ApplicationsGrid } from "../components/ApplicationsGrid";
import { ApplicationModal } from "../components/ApplicationModal";
import { SearchBar } from "../components/SearchBar";
import { StatsCards } from "../components/StatsCards";
import { useApplications } from "../hooks/useApplications";

export default function Dashboard() {
  const [editingApplication, setEditingApplication] = useState(null);

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

      <section className="mt-6 sm:mt-8">
        <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.03em] text-white sm:text-2xl">
              Recent Applications
            </h2>

            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              Track and manage your active job opportunities.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="
              group inline-flex items-center justify-center gap-2 sm:gap-3 rounded-lg sm:rounded-2xl
              border border-indigo-400/20
              bg-[linear-gradient(135deg,rgba(99,102,241,0.22),rgba(59,130,246,0.18))]
              px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-medium text-white
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
                flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl
                bg-white/10 text-base sm:text-lg transition
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

      <ApplicationModal
        isOpen={isFormOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingApplication={editingApplication}
      />
    </DashboardLayout>
  );
}
