export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-2">
        <div className="h-8 w-56 bg-zinc-800 rounded animate-pulse" />
        <div className="h-4 w-72 bg-zinc-800 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-[#140C0B] border border-zinc-800 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="h-10 w-64 bg-zinc-800 rounded animate-pulse" />
      <div className="h-96 bg-[#140C0B] border border-zinc-800 rounded-xl animate-pulse" />
    </div>
  )
}
