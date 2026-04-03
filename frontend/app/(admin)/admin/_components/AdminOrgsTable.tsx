'use client'

import { useState, useMemo } from 'react'
import { Building2, Search, Users, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'

export type OrgRow = {
  id: string
  name: string
  region: string | null
  memberCount: number
  ownerUserId: string | null
  createdAt: string
}

interface AdminOrgsTableProps {
  organizations: OrgRow[]
}

export function AdminOrgsTable({ organizations }: AdminOrgsTableProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return organizations
    const q = search.toLowerCase()
    return organizations.filter(
      (org) =>
        org.name.toLowerCase().includes(q) ||
        (org.region ?? '').toLowerCase().includes(q)
    )
  }, [organizations, search])

  if (organizations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Building2 className="w-10 h-10 text-zinc-700 mb-3" />
        <h3 className="text-lg font-bold text-zinc-300">No organizations yet</h3>
        <p className="text-zinc-500 text-sm mt-1">Organizations will appear here once created.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          placeholder="Search organizations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:ring-[#FF5C00]/30 focus:border-[#FF5C00]/50"
        />
      </div>

      <div className="bg-[#140C0B] border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3">Organization</th>
              <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3">Region</th>
              <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3">Members</th>
              <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((org) => (
              <tr key={org.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-black text-zinc-400">
                      {org.name.charAt(0)}
                    </div>
                    <span className="text-white font-medium text-sm">{org.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  {org.region ? (
                    <div className="flex items-center gap-1 text-zinc-400 text-sm">
                      <MapPin className="w-3 h-3" />
                      {org.region}
                    </div>
                  ) : (
                    <span className="text-zinc-600 text-sm">—</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 text-zinc-300 text-sm">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    {org.memberCount}
                  </div>
                </td>
                <td className="px-5 py-4 text-zinc-500 text-sm">
                  {new Date(org.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-8 text-zinc-500 text-sm">
            No organizations match your search.
          </div>
        )}
      </div>
    </div>
  )
}
