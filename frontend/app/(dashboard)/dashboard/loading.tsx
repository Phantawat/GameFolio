export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="rounded-xl border border-zinc-800 bg-[#140C0B] overflow-hidden">
        <div className="h-48 bg-zinc-800 animate-pulse" />
        <div className="px-8 pb-8 flex items-end -mt-16 gap-6">
          <div className="w-32 h-32 rounded-full bg-zinc-800 border-4 border-[#140C0B] animate-pulse" />
          <div className="space-y-2 pb-2 flex-1">
            <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="h-64 bg-[#140C0B] border border-zinc-800 rounded-xl animate-pulse" />
          <div className="h-48 bg-[#140C0B] border border-zinc-800 rounded-xl animate-pulse" />
        </div>
        <div className="md:col-span-2 space-y-6">
          <div className="h-32 bg-[#140C0B] border border-zinc-800 rounded-xl animate-pulse" />
          <div className="h-48 bg-[#140C0B] border border-zinc-800 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
