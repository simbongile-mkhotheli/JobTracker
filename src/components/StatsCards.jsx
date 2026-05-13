const CARD_STYLES = [
  "from-sky-500/20 to-sky-500/5 border-sky-500/20",
  "from-amber-500/20 to-amber-500/5 border-amber-500/20",
  "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
  "from-rose-500/20 to-rose-500/5 border-rose-500/20",
];

export function StatsCards({ stats }) {
  const cards = [
    {
      label: "Total Applications",
      value: stats.total,
    },
    {
      label: "Interviews",
      value: stats.interviews,
    },
    {
      label: "Offers",
      value: stats.offers,
    },
    {
      label: "Rejected",
      value: stats.rejected,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <article
          key={card.label}
          className={`rounded-2xl border bg-gradient-to-br p-5 ${CARD_STYLES[index]}`}
        >
          <p className="text-sm text-slate-400">
            {card.label}
          </p>

          <h3 className="mt-3 text-3xl font-semibold text-white">
            {card.value}
          </h3>
        </article>
      ))}
    </section>
  );
}