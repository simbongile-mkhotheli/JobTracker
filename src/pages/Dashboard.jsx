import { useState } from "react";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ApplicationsGrid } from "../components/ApplicationsGrid";
import { ApplicationForm } from "../components/ApplicationForm";
import { useApplications } from "../hooks/useApplications";

export default function Dashboard() {
  const { applications, addApplication, deleteApplication, updateApplication } =
    useApplications();

  const [editingApplication, setEditingApplication] = useState(null);

  function handleSubmit(applicationData) {
    if (editingApplication) {
      updateApplication({
        ...applicationData,
        id: editingApplication.id,
      });

      setEditingApplication(null);

      return;
    }

    addApplication(applicationData);
  }

  return (
    <DashboardLayout>
      <ApplicationForm
        onSubmit={handleSubmit}
        initialValues={editingApplication || undefined}
        submitLabel={editingApplication ? "Save Changes" : "Add Application"}
      />

      <section>
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
          onEdit={setEditingApplication}
        />
      </section>
    </DashboardLayout>
  );
}
