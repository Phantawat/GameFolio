'use client'

import { useState } from 'react'
import { ApplicationsHeader } from './_components/ApplicationsHeader'
import { ApplicationsList, Application } from './_components/ApplicationsList'
import { StatsSidebar } from './_components/StatsSidebar'

export default function ApplicationsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const allApplications: Application[] = [
    {
      id: 1,
      orgName: 'Apex Vanguard',
      logo: 'https://ui.shadcn.com/avatars/01.png', 
      initial: 'AV',
      verified: true,
      role: 'Valorant VCT Roster - Sentinel',
      status: 'Under Review',
      statusColor: 'bg-amber-500/20 text-amber-500 border-amber-500/20',
      appliedDate: 'Applied on Oct 24, 2023',
    },
    {
      id: 2,
      orgName: 'Cloud9 Academy',
      logo: 'https://ui.shadcn.com/avatars/02.png',
      initial: 'C9',
      verified: true,
      role: 'League of Legends - Mid Lane',
      status: 'Accepted',
      statusColor: 'bg-green-500/20 text-green-500 border-green-500/20',
      appliedDate: 'Applied on Oct 20, 2023',
    },
    {
      id: 3,
      orgName: 'Team Liquid',
      logo: 'https://ui.shadcn.com/avatars/03.png',
      initial: 'TL',
      verified: false,
      role: 'Dota 2 - Position 4 Support',
      status: 'Declined',
      statusColor: 'bg-zinc-500/20 text-zinc-500 border-zinc-500/20',
      appliedDate: 'Applied on Oct 15, 2023',
    },
    {
      id: 4,
      orgName: 'G2 Esports',
      logo: 'https://ui.shadcn.com/avatars/05.png',
      initial: 'G2',
      verified: true,
      role: 'Rocket League - Substitute',
      status: 'Under Review',
      statusColor: 'bg-amber-500/20 text-amber-500 border-amber-500/20',
      appliedDate: 'Applied on Oct 12, 2023',
    },
    {
      id: 5,
      orgName: 'TSM Academy',
      logo: '', // No logo test
      initial: 'TSM',
      verified: true,
      role: 'Valorant Game Changers',
      status: 'Interview',
      statusColor: 'bg-blue-500/20 text-blue-500 border-blue-500/20',
      appliedDate: 'Applied on Oct 10, 2023',
    },
  ]

  const filteredApplications = allApplications.filter(app => {
    const matchesStatus = filterStatus === 'All' || app.status === filterStatus || (filterStatus === 'Active' && ['Under Review', 'Interview', 'Accepted'].includes(app.status))
    const matchesSearch = app.orgName.toLowerCase().includes(searchQuery.toLowerCase()) || app.role.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Stats calculation
  const totalApps = allApplications.length
  const activeApps = allApplications.filter(a => ['Under Review', 'Interview', 'Accepted'].includes(a.status)).length
  const acceptedApps = allApplications.filter(a => a.status === 'Accepted').length
  const responseRate = Math.round(((totalApps - allApplications.filter(a => a.status === 'Under Review').length) / totalApps) * 100) || 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ApplicationsHeader />

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
           <div className="lg:col-span-3">
                <ApplicationsList 
                    applications={filteredApplications} 
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
           </div>

           <div className="lg:col-span-1">
                <StatsSidebar 
                    responseRate={responseRate}
                    activeApps={activeApps}
                    acceptedApps={acceptedApps}
                />
           </div>
       </div>
    </div>
  )
}
