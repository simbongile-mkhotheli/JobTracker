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

      <div className="mt-6">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setEditingApplication(null);
            setIsFormOpen(true);
          }}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          Add Application
        </button>
      </div>

      <section className="mt-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white">
            Recent Applications
          </h2>

          <p className="mt-1 text-slate-400">
            Track your latest job applications.
          </p>
        </div>

        <ApplicationsGrid
          applications={applications}
          onDelete={deleteApplication}
          onEdit={handleEdit}
        />
      </section>

  {isFormOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
    {/* Modal Container */}
    <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0c1730] shadow-2xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {editingApplication ? "Edit Application" : "New Application"}
          </h2>
          <p className="text-xs text-slate-400">
            {editingApplication
              ? "Update your application details"
              : "Add a new job application"}
          </p>
        </div>

        <button
          onClick={handleCloseModal}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10"
        >
          Close
        </button>
      </div>

      {/* Body */}
      <div className="p-6">
        <ApplicationForm
          onSubmit={handleSubmit}
          initialValues={editingApplication || undefined}
          submitLabel={
            editingApplication ? "Save Changes" : "Add Application"
          }
        />
      </div>
    </div>
  </div>
)}
    </DashboardLayout>
  );
}