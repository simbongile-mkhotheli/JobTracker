export function SkeletonCard() {
  return (
    <article className="relative overflow-hidden rounded-[18px] border border-[#243255] bg-[linear-gradient(180deg,#0f1930_0%,#0b1426_100%)] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
      <div className="animate-pulse space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-[12px] bg-white/10" />

          <div className="flex-1 space-y-3">
            <div className="h-4 w-2/3 rounded bg-white/10" />
            <div className="h-3 w-1/2 rounded bg-white/10" />
            <div className="h-5 w-20 rounded-full bg-white/10" />
          </div>
        </div>

        <div className="h-3 w-1/3 rounded bg-white/10" />

        <div className="flex justify-end gap-2">
          <div className="h-10 w-10 rounded-xl bg-white/10" />
          <div className="h-10 w-10 rounded-xl bg-white/10" />
        </div>
      </div>
    </article>
  );
}
