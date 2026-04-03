import { redirect } from 'next/navigation'
import { getPlayerProfile, getPlayerGameStats } from '@/lib/queries'
import { ProfileHeader } from './_components/ProfileHeader'
import { GameStats } from './_components/GameStats'
import { Hardware } from './_components/Hardware'
import { AboutMe } from './_components/AboutMe'
import { Experience } from './_components/Experience'
import { Vods } from './_components/Vods'

export default async function PlayerProfilePage() {
  // Both calls are wrapped in React cache() — deduplicated within this request.
  const profile = await getPlayerProfile()

  if (!profile) redirect('/dashboard')

  const stats = await getPlayerGameStats(profile.id)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <ProfileHeader
        gamertag={profile.gamertag}
        region={profile.region}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Stats & Hardware */}
        <div className="space-y-6">
          <GameStats stats={stats} />
          <Hardware />
        </div>

        {/* Right Column: About, Experience, VODs */}
        <div className="md:col-span-2 space-y-6">
          <AboutMe bio={profile.bio} />
          <Experience />
          <Vods />
        </div>
      </div>
    </div>
  )
}
