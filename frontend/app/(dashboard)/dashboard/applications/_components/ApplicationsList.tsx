'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, ExternalLink } from 'lucide-react'
import Link from 'next/link'

// Define the type for application data
export interface Application {
    id: string
    orgName: string
    logo: string
    initial: string
    verified: boolean
    role: string
    status: string
    statusColor: string
    appliedDate: string
}

interface ApplicationsListProps {
    applications: Application[]
    filterStatus: string
    setFilterStatus: (status: string) => void
    searchQuery: string
    setSearchQuery: (query: string) => void
    totalCount?: number
}

export function ApplicationsList({ 
    applications, 
    filterStatus, 
    setFilterStatus, 
    searchQuery, 
    setSearchQuery,
    totalCount = 0
}: ApplicationsListProps) {
    
    return (
        <div className="space-y-6">
            {/* Search & Tabs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800/50 w-full sm:w-auto overflow-x-auto">
                    {['All', 'Active', 'Accepted', 'Declined'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                                filterStatus === status 
                                ? 'bg-zinc-800 text-white shadow-sm' 
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input 
                        placeholder="Search applications..." 
                        className="pl-9 bg-zinc-900/50 border-zinc-800 text-zinc-200 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all placeholder:text-zinc-600"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Application List */}
            <div className="space-y-4">
                {applications.length > 0 ? (
                    applications.map((app) => (
                        <div key={app.id} className="bg-[#140C0B] border border-zinc-800 rounded-xl p-5 hover:border-zinc-600/50 hover:bg-zinc-900/10 transition-all group relative overflow-hidden cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 w-full">
                                <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden">
                                    <div className="relative shrink-0">
                                      <Avatar className="w-12 h-12 border border-zinc-800 rounded-lg shrink-0">
                                          <AvatarImage src={app.logo} alt={app.orgName} className="object-cover" />
                                          <AvatarFallback className="bg-zinc-800 text-zinc-400 font-bold rounded-lg text-xs">{app.initial}</AvatarFallback>
                                      </Avatar>
                                      {app.verified && <div className="absolute -bottom-1 -right-1 bg-blue-500 w-4 h-4 rounded-full border-2 border-[#140C0B] flex items-center justify-center text-[10px] text-white">✓</div>}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-white font-bold text-lg truncate leading-tight">{app.orgName}</h3>
                                            {app.verified && (
                                                <span className="bg-blue-500/10 text-blue-500 text-[10px] px-1.5 py-0.5 rounded border border-blue-500/20 font-medium">VERIFIED</span>
                                            )}
                                        </div>
                                        <p className="text-orange-500 font-medium text-sm truncate leading-tight">{app.role}</p>
                                        <p className="text-zinc-500 text-xs mt-1 truncate">{app.appliedDate}</p>
                                    </div>
                                </div>

                                <div className="flex flex-row sm:flex-col items-center sm:items-end w-full sm:w-auto justify-between sm:justify-center gap-3 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/50 sm:border-0 pl-16 sm:pl-0">
                                    <Badge variant="outline" className={`border-0 px-3 py-1 font-medium whitespace-nowrap ${app.statusColor}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-60`}></span>
                                        {app.status}
                                    </Badge>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 sm:static sm:block hidden">
                                        <Link href={`/dashboard/applications/${app.id}`}>
                                            <Button variant="ghost" size="sm" className="h-8 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800">
                                                Details <ExternalLink className="w-3 h-3 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : totalCount === 0 ? (
                    <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
                            <Search className="w-5 h-5 text-zinc-500" />
                        </div>
                        <h3 className="text-zinc-300 font-medium mb-1">No applications yet</h3>
                        <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                            You haven't applied to any tryouts. Browse active listings and find your next team.
                        </p>
                        <Link href="/dashboard/tryouts">
                            <Button className="mt-4 bg-[#FF5C00] hover:bg-orange-600 text-white font-bold">
                                Browse Tryouts
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
                            <Search className="w-5 h-5 text-zinc-500" />
                        </div>
                        <h3 className="text-zinc-300 font-medium mb-1">No results found</h3>
                        <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                            No applications match your current filters.
                        </p>
                        <Button variant="link" onClick={() => { setSearchQuery(''); setFilterStatus('All') }} className="mt-4 text-orange-500 font-medium">
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
