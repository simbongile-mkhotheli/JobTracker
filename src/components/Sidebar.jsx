
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  Home,
  LayoutGrid,
  Menu,
  Settings,
  Sparkles,
  UserCircle2,
  X,
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", active: true },
  { icon: LayoutGrid, label: "Applications" },
  { icon: CalendarDays, label: "Calendar" },
  { icon: BarChart3, label: "Statistics" },
  { icon: Settings, label: "Settings" },
];

function NavItem({ icon: Icon, label, active = false }) {
  return (
    <button
      type="button"
      className={[
        "group flex w-full items-center gap-3 rounded-[14px] px-4 py-3 text-left transition-all duration-200",
        active
          ? "border border-cyan-400/20 bg-[linear-gradient(90deg,rgba(56,189,248,0.16),rgba(99,102,241,0.10))] text-white shadow-[0_10px_25px_rgba(0,0,0,0.18)]"
          : "border border-transparent text-slate-400 hover:border-white/8 hover:bg-white/5 hover:text-slate-100",
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      <span
        className={[
          "grid h-9 w-9 place-items-center rounded-[12px] border transition-colors",
          active
            ? "border-cyan-400/20 bg-white/10 text-cyan-300"
            : "border-white/8 bg-white/5 text-slate-400 group-hover:border-white/12 group-hover:text-slate-200",
        ].join(" ")}
      >
        <Icon size={18} strokeWidth={2} />
      </span>

      <span className="text-[15px] font-medium tracking-[-0.01em]">
        {label}
      </span>

      {active ? (
        <ChevronRight
          size={16}
          strokeWidth={2}
          className="ml-auto text-cyan-300/80"
        />
      ) : null}
    </button>
  );
}

export function Sidebar({ isOpen = true, onToggle = () => {} }) {
  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={onToggle}
        aria-label="Toggle menu"
        className="fixed left-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-lg sm:rounded-[10px] border border-white/10 bg-white/5 text-slate-300 transition duration-200 hover:bg-white/10 md:hidden"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed bottom-0 left-0 top-0 z-40 flex w-[286px] flex-col border-r border-white/10
          bg-[linear-gradient(180deg,#0c1324_0%,#0a1120_100%)] px-6 py-6 text-white
          shadow-[10px_0_30px_rgba(0,0,0,0.18)] transition-transform duration-300
          ease-out lg:static lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-[16px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.18),rgba(99,102,241,0.12))] shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
            <Sparkles size={22} strokeWidth={2.2} className="text-cyan-300" />
          </div>

          <div>
            <h2 className="text-[22px] font-semibold tracking-[-0.04em] text-white">
              JobTracker
            </h2>
            <p className="mt-0.5 text-[13px] text-slate-400">
              Track your applications
            </p>
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={item.active}
          />
        ))}
      </nav>

      <div className="mt-auto pt-6">
        <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 shadow-[0_16px_30px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-[16px] border border-white/10 bg-[linear-gradient(180deg,rgba(56,189,248,0.15),rgba(168,85,247,0.12))]">
              <UserCircle2 size={28} strokeWidth={1.8} className="text-slate-100" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium text-white">
                Your Profile
              </p>
              <p className="truncate text-[13px] text-slate-400">
                Keep moving forward
              </p>
            </div>
          </div>

          <button
            type="button"
            className="mt-4 inline-flex w-full items-center justify-center rounded-[14px] border border-cyan-400/20 bg-[linear-gradient(90deg,rgba(14,165,233,0.18),rgba(99,102,241,0.18))] px-4 py-3 text-[14px] font-medium text-white transition hover:brightness-110 active:scale-[0.99]"
          >
            View Statistics
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}