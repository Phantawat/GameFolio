'use client'

import { useState } from 'react'
import { Building2, Gamepad2, Activity, Shield, Users, Clock3 } from 'lucide-react'
import { AdminOrgsTable, type OrgRow } from './AdminOrgsTable'
import { AdminTryoutsTable, type TryoutRow } from './AdminTryoutsTable'
import { AdminUsersTable, type AdminUserRow } from './AdminUsersTable'
import { cn } from '@/lib/utils'

interface AdminDashboardContentProps {
  stats: {
    totalUsers: number
    totalOrgs: number
    totalTryouts: number
    activeTryouts: number
    pendingApplications: number
  }
  users: AdminUserRow[]
  organizations: OrgRow[]
  tryouts: TryoutRow[]
}

type Tab = 'users' | 'organizations' | 'tryouts'

export function AdminDashboardContent({
  stats,
  users,
  organizations,
  tryouts,
}: AdminDashboardContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>('users')

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-[#FF5C00]" />
          <h1 className="text-3xl font-black text-white tracking-tight">Admin Dashboard</h1>
        </div>
        <p className="text-zinc-400 text-sm">Manage organizations, tryouts, and platform moderation.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="bg-[#140C0B] border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF5C00]/10 rounded-lg">
              <Users className="w-5 h-5 text-[#FF5C00]" />
            </div>
            <div>
              <p className="text-2xl font-black text-white font-mono">{stats.totalUsers}</p>
              <p className="text-zinc-500 text-xs uppercase tracking-wide font-medium">Users</p>
            </div>
          </div>
        </div>
        <div className="bg-[#140C0B] border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF5C00]/10 rounded-lg">
              <Building2 className="w-5 h-5 text-[#FF5C00]" />
            </div>
            <div>
              <p className="text-2xl font-black text-white font-mono">{stats.totalOrgs}</p>
              <p className="text-zinc-500 text-xs uppercase tracking-wide font-medium">Organizations</p>
            </div>
          </div>
        </div>
        <div className="bg-[#140C0B] border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF5C00]/10 rounded-lg">
              <Gamepad2 className="w-5 h-5 text-[#FF5C00]" />
            </div>
            <div>
              <p className="text-2xl font-black text-white font-mono">{stats.totalTryouts}</p>
              <p className="text-zinc-500 text-xs uppercase tracking-wide font-medium">Total Tryouts</p>
            </div>
          </div>
        </div>
        <div className="bg-[#140C0B] border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-black text-white font-mono">{stats.activeTryouts}</p>
              <p className="text-zinc-500 text-xs uppercase tracking-wide font-medium">Active Tryouts</p>
            </div>
          </div>
        </div>
        <div className="bg-[#140C0B] border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock3 className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-black text-white font-mono">{stats.pendingApplications}</p>
              <p className="text-zinc-500 text-xs uppercase tracking-wide font-medium">Pending Apps</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('users')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'users'
              ? 'text-[#FF5C00] border-[#FF5C00]'
              : 'text-zinc-400 border-transparent hover:text-zinc-200'
          )}
        >
          <Users className="w-4 h-4 inline mr-1.5" />
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('organizations')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'organizations'
              ? 'text-[#FF5C00] border-[#FF5C00]'
              : 'text-zinc-400 border-transparent hover:text-zinc-200'
          )}
        >
          <Building2 className="w-4 h-4 inline mr-1.5" />
          Organizations ({organizations.length})
        </button>
        <button
          onClick={() => setActiveTab('tryouts')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'tryouts'
              ? 'text-[#FF5C00] border-[#FF5C00]'
              : 'text-zinc-400 border-transparent hover:text-zinc-200'
          )}
        >
          <Gamepad2 className="w-4 h-4 inline mr-1.5" />
          Tryouts ({tryouts.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' ? (
        <AdminUsersTable users={users} />
      ) : activeTab === 'organizations' ? (
        <AdminOrgsTable organizations={organizations} />
      ) : (
        <AdminTryoutsTable tryouts={tryouts} />
      )}
    </div>
  )
}
