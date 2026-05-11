import { DashboardLayout } from "../layouts/DashboardLayout";
import { ApplicationsGrid } from "../components/ApplicationsGrid";
import { mockApplications } from "../data/mockApplications";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white">
            Recent Applications
          </h2>

          <p className="mt-1 text-slate-400">
            Track your latest job applications.
          </p>
        </div>

        <ApplicationsGrid applications={mockApplications} />
      </section>
    </DashboardLayout>
  );
}