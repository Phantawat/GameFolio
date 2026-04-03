export default function TryoutsLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[#140C0B] border border-zinc-800 rounded-xl overflow-hidden">
            <div className="h-1 bg-zinc-800" />
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-5 w-3/4 bg-zinc-800 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-5 w-20 bg-zinc-800 rounded-full animate-pulse" />
                <div className="h-5 w-16 bg-zinc-800 rounded-full animate-pulse" />
              </div>
              <div className="h-10 w-full bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
