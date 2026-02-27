export default function PlayerDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Welcome to GameFolio
        </h1>
        <p className="text-zinc-400 mt-2">
          Your player journey starts here. Build your profile, add game stats, and find your next team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
            <h2 className="text-xl font-semibold mb-2 text-zinc-200">Stats</h2>
            <p className="text-zinc-500 text-sm">Track your performance across games.</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
            <h2 className="text-xl font-semibold mb-2 text-zinc-200">Applications</h2>
            <p className="text-zinc-500 text-sm">View status of your team applications.</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
            <h2 className="text-xl font-semibold mb-2 text-zinc-200">Tryouts</h2>
            <p className="text-zinc-500 text-sm">Find new opportunities.</p>
        </div>
      </div>
    </div>
  )
}
