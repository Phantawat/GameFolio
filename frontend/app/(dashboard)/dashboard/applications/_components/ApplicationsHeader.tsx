import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Filter } from 'lucide-react'

export function ApplicationsHeader() {
  return (
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Application Tracker</h1>
          <p className="text-zinc-400 mt-2 max-w-2xl">
            Monitor and manage your active professional tryouts and team applications in one place.
          </p>
        </div>
        
        <div className="flex gap-3">
            <Button variant="outline" className="border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                <Filter className="w-4 h-4 mr-2" />
                Filter
            </Button>
            <Button className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-semibold shadow-lg shadow-orange-900/20">
                New Application
            </Button>
        </div>
      </div>
  )
}
