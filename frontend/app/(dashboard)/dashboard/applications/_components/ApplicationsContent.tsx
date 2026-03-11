'use client'

import { useState } from 'react'
import { ApplicationsHeader } from './ApplicationsHeader'
import { ApplicationsList, Application } from './ApplicationsList'
import { StatsSidebar } from './StatsSidebar'

interface ApplicationsContentProps {
  applications: Application[]
}

export function ApplicationsContent({ applications }: ApplicationsContentProps) {
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredApplications = applications.filter((app) => {
    const matchesStatus =
      filterStatus === 'All' ||
      app.status === filterStatus ||
      (filterStatus === 'Active' &&
        ['Under Review', 'Interview', 'Accepted'].includes(app.status))
    const matchesSearch =
      app.orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalApps = applications.length
  const activeApps = applications.filter((a) =>
    ['Under Review', 'Interview', 'Accepted'].includes(a.status)
  ).length
  const acceptedApps = applications.filter((a) => a.status === 'Accepted').length
  const responseRate =
    Math.round(
      ((totalApps - applications.filter((a) => a.status === 'Under Review').length) /
        (totalApps || 1)) *
        100
    ) || 0

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
            totalCount={applications.length}
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
