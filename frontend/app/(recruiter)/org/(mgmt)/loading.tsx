export default function RecruiterLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 bg-[#140C0B] border border-zinc-800 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
