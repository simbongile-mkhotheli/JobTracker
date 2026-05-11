import { DashboardLayout } from "../layouts/DashboardLayout";
import { ApplicationsGrid } from "../components/ApplicationsGrid";
import { ApplicationForm } from "../components/ApplicationForm";
import { useApplications } from "../hooks/useApplications";

export default function Dashboard() {
  const {
    applications,
    addApplication,
    deleteApplication,
  } = useApplications();

  return (
    <DashboardLayout>
      <ApplicationForm onSubmit={addApplication} />

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
        />
      </section>
    </DashboardLayout>
  );
}