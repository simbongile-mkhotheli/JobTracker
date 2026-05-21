import { Briefcase, CalendarCheck, Trophy, XCircle } from "lucide-react";

import { UI_STYLES } from "../styles/ui";

const cards = [
  {
    key: "total",
    label: "Total Applications",
    icon: Briefcase,
    valueClass: "text-sky-300",
    borderClass: "border-sky-500/25",
    badgeClass:
      "bg-[linear-gradient(180deg,rgba(56,189,248,0.18),rgba(56,189,248,0.08))] text-sky-300 border-sky-400/20",
    trendClass: "text-sky-300",
  },
  {
    key: "interviews",
    label: "Interviews",
    icon: CalendarCheck,
    valueClass: "text-emerald-300",
    borderClass: "border-emerald-500/25",
    badgeClass:
      "bg-[linear-gradient(180deg,rgba(52,211,153,0.18),rgba(52,211,153,0.08))] text-emerald-300 border-emerald-400/20",
    trendClass: "text-emerald-300",
  },
  {
    key: "offers",
    label: "Offers",
    icon: Trophy,
    valueClass: "text-amber-300",
    borderClass: "border-amber-500/25",
    badgeClass:
      "bg-[linear-gradient(180deg,rgba(251,191,36,0.18),rgba(251,191,36,0.08))] text-amber-300 border-amber-400/20",
    trendClass: "text-amber-300",
  },
  {
    key: "rejected",
    label: "Rejections",
    icon: XCircle,
    valueClass: "text-rose-300",
    borderClass: "border-rose-500/25",
    badgeClass:
      "bg-[linear-gradient(180deg,rgba(251,113,133,0.18),rgba(251,113,133,0.08))] text-rose-300 border-rose-400/20",
    trendClass: "text-rose-300",
  },
];

export function StatsCards({ stats = {}, trend = {} }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = stats[card.key] ?? 0;

        const change = trend[card.key]?.change ?? null;

        const changeLabel = trend[card.key]?.label ?? "from last month";

        return (
          <article
            key={card.key}
            className={`${UI_STYLES.card} rounded-lg sm:rounded-[18px] p-3 sm:p-5 border ${card.borderClass}`}
          >
            <div className={UI_STYLES.cardGlow} />

            <div className={UI_STYLES.cardBorder} />

            <div className="relative z-10 flex items-start gap-3">
              <div
                className={[
                  "flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-[14px] border",
                  "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
                  "transition duration-300 group-hover:scale-[1.03]",
                  card.badgeClass,
                ].join(" ")}
              >
                <Icon
                  size={18}
                  strokeWidth={2}
                  className="sm:h-[22px] sm:w-[22px]"
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs sm:text-[15px] font-medium leading-5 sm:leading-6 text-slate-300">
                  {card.label}
                </p>

                <p
                  className={[
                    "mt-0.5 sm:mt-1 text-2xl sm:text-[38px] font-semibold leading-none tracking-[-0.05em]",
                    card.valueClass,
                  ].join(" ")}
                >
                  {value}
                </p>

                {change ? (
                  <div className="mt-2 sm:mt-3 flex items-center gap-1 text-xs sm:text-[14px] leading-none">
                    <span className={card.trendClass}>↗ {change}</span>

                    <span className="text-slate-500">{changeLabel}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
