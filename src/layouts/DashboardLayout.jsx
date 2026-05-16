import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#070d1a] text-white md:flex-row">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className="flex-1 overflow-y-auto md:pt-0">
        {/* Top padding for mobile to accommodate fixed menu button */}
        <div className="h-12 md:h-0" />

        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          <Header />

          <div className="mt-6">{children}</div>

          <Footer />
        </div>
      </main>
    </div>
  );
}