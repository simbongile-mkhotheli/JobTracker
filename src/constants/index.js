// Constants for application statuses
export const STATUS_OPTIONS = ["Applied", "Interview", "Offer", "Rejected"];

// Styling for each status
export const STATUS_STYLES = {
  Applied: "bg-sky-500/15 text-sky-300 border-sky-500/20",
  Interview: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  Rejected: "bg-rose-500/15 text-rose-300 border-rose-500/20",
  Offer: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
};

// Reusable input field styling
export const INPUT_STYLE =
  "w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-indigo-500";

// Gradient & background constants
export const GRADIENTS = {
  cardBase: "bg-[linear-gradient(180deg,#0f1930_0%,#0b1426_100%)]",
  cardGlow:
    "bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_38%)]",
  sidebarBase: "bg-[linear-gradient(180deg,#0c1324_0%,#0a1120_100%)]",
  buttonPrimary:
    "bg-[linear-gradient(135deg,rgba(99,102,241,0.22),rgba(59,130,246,0.18))]",
  logoGradient:
    "bg-[linear-gradient(180deg,rgba(34,211,238,0.18),rgba(99,102,241,0.12))]",
};

// Re-export application constants
export { INITIAL_APPLICATION } from "./application";
