import { DashboardLayout } from "../layouts/DashboardLayout";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">Applications Overview</h2>

        <p className="mt-2 text-slate-400">
          Dashboard functionality will be implemented in upcoming iterations.
        </p>
      </section>
    </DashboardLayout>
  );
}