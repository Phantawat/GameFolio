export default function ApplicationsLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-2">
        <div className="h-8 w-56 bg-zinc-800 rounded animate-pulse" />
        <div className="h-4 w-40 bg-zinc-800 rounded animate-pulse" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-zinc-800 rounded-md animate-pulse" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-[#140C0B] border border-zinc-800 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
