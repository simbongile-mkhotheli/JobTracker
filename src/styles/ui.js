export const UI_STYLES = {
  card: `
    relative overflow-hidden
    rounded-[18px]
    border border-[#243255]
    bg-[linear-gradient(180deg,#0f1930_0%,#0b1426_100%)]
    shadow-[0_10px_30px_rgba(0,0,0,0.22)]
    transition-all duration-300 ease-out
    hover:-translate-y-1
    hover:border-[#4f63a7]
    hover:shadow-[0_22px_50px_rgba(0,0,0,0.32)]
  `,

  cardGlow: `
    pointer-events-none absolute inset-0
    bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_38%)]
    opacity-80 transition-opacity duration-300
    group-hover:opacity-100
  `,

  cardBorder: `
    pointer-events-none absolute inset-px
    rounded-[17px]
    border border-white/5
  `,

  iconButton: `
    grid h-10 w-10 sm:h-11 sm:w-11 place-items-center
    rounded-lg sm:rounded-[12px]
    border border-white/10
    bg-white/5 text-slate-300
    transition duration-200
  `,

  modalOverlay: `
    fixed inset-0 z-50 flex items-center justify-center
    bg-black/70 backdrop-blur-md
    p-3 sm:p-4
  `,

  modalContainer: `
    relative w-full max-w-2xl overflow-hidden
    rounded-2xl sm:rounded-[30px]
    border border-white/10
    bg-[linear-gradient(180deg,#0f1930_0%,#0b1426_100%)]
    shadow-[0_30px_90px_rgba(0,0,0,0.45)]
  `,
};
