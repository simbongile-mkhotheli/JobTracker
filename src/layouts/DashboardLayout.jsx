import { useState } from "react";

import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-[#070d1a] text-white">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      <main
        className="
          min-h-screen
          lg:ml-[286px]
        "
      >
        {/* Mobile top spacing */}
        <div className="h-12 md:h-0" />

        <div
          className="
            flex min-h-screen flex-col
            p-4 sm:p-5 md:p-6 lg:p-8
          "
        >
          <Header />

          <div className="mt-6 flex-1">
            {children}
          </div>

          <Footer />
        </div>
      </main>
    </div>
  );
}