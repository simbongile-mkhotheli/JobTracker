import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#070d1a] text-white">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6">
        <Header />

        <div className="mt-6">{children}</div>

        <Footer />
      </main>
    </div>
  );
}