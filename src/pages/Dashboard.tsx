import { useState } from "react";

import { ApplicationForm } from "../components/ApplicationForm";
import { ApplicationNotesModal } from "../components/ApplicationNotesModal";
import { ApplicationsGrid } from "../components/ApplicationsGrid";
import { Modal } from "../components/ui/Modal";
import { SearchBar } from "../components/SearchBar";
import { StatsCards } from "../components/StatsCards";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { useApplications } from "../hooks/useApplications";
import type {
  Application,
  ApplicationFormValues,
} from "../types/application";

export default function Dashboard() {
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null);

  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

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
    isLoading,
    error,
  } = useApplications();

  async function handleSubmit(applicationData: ApplicationFormValues) {
    if (editingApplication) {
      await updateApplication({
        ...applicationData,
        id: editingApplication.id,
      });

      setEditingApplication(null);
      setIsFormOpen(false);
      return;
    }

    await addApplication(applicationData);
    setIsFormOpen(false);
  }

  function handleOpenCreateModal() {
    setEditingApplication(null);
    setIsFormOpen(true);
  }

  function handleEdit(application: Application) {
    setEditingApplication(application);
    setIsFormOpen(true);
  }

  function handleCloseModal() {
    setEditingApplication(null);
    setIsFormOpen(false);
  }

  function handleOpenNotes(application: Application) {
    setSelectedApplication(application);
  }

  function handleCloseNotes() {
    setSelectedApplication(null);
  }

  function handleClearSearch() {
    setSearchTerm("");
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
            onClick={handleOpenCreateModal}
            className="
              group inline-flex items-center justify-center gap-2 rounded-lg
              border border-indigo-400/20
              bg-[linear-gradient(135deg,rgba(99,102,241,0.22),rgba(59,130,246,0.18))]
              px-4 py-2.5 text-xs font-medium text-white
              shadow-[0_10px_30px_rgba(59,130,246,0.18)]
              transition-all duration-300
              hover:-translate-y-0.5
              hover:border-indigo-300/40
              hover:shadow-[0_16px_40px_rgba(99,102,241,0.28)]
              active:scale-[0.98]
              sm:gap-3 sm:rounded-2xl sm:px-5 sm:py-3 sm:text-sm
            "
          >
            <span
              className="
                flex h-7 w-7 items-center justify-center rounded-lg
                bg-white/10 text-base transition
                group-hover:bg-white/15
                sm:h-8 sm:w-8 sm:rounded-xl sm:text-lg
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

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
            {error}
          </div>
        ) : null}

        <div className="mt-6">
          <ApplicationsGrid
            applications={applications}
            onDelete={deleteApplication}
            onEdit={handleEdit}
            onOpenNotes={handleOpenNotes}
            onAddNew={handleOpenCreateModal}
            onClearSearch={handleClearSearch}
            isLoading={isLoading}
            searchTerm={searchTerm}
          />
        </div>
      </section>

      {isFormOpen && (
        <Modal
          title={
            editingApplication
              ? "Edit Application"
              : "Track New Opportunity"
          }
          description={
            editingApplication
              ? "Update your application details and progress."
              : "Capture and organize your latest job application."
          }
          onClose={handleCloseModal}
        >
          <ApplicationForm
            onSubmit={handleSubmit}
            initialValues={editingApplication || undefined}
            submitLabel={
              editingApplication
                ? "Save Changes"
                : "Add Application"
            }
            isLoading={isLoading}
          />
        </Modal>
      )}

      {selectedApplication ? (
        <ApplicationNotesModal
          application={selectedApplication}
          onClose={handleCloseNotes}
        />
      ) : null}
    </DashboardLayout>
  );
}
