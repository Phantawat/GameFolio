import { redirect } from 'next/navigation'
import { getPlayerProfile, getPlayerGameStats, getPlayerHighlights } from '@/lib/queries'
import { ProfileHeader } from './_components/ProfileHeader'
import { GameStats } from './_components/GameStats'
import { Hardware } from './_components/Hardware'
import { ProfileDetailsForm } from './_components/ProfileDetailsForm'
import { Experience } from './_components/Experience'
import { Vods } from './_components/Vods'

export default async function PlayerProfilePage() {
  // Both calls are wrapped in React cache() — deduplicated within this request.
  const profile = await getPlayerProfile()

  if (!profile) redirect('/dashboard')

  const stats = await getPlayerGameStats(profile.id)
  const highlights = await getPlayerHighlights(profile.id)

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
          <Hardware value={profile.hardware_details} />
        </div>

        {/* Right Column: About, Experience, VODs */}
        <div className="md:col-span-2 space-y-6">
          <ProfileDetailsForm gamertag={profile.gamertag} region={profile.region} bio={profile.bio} />
          <Experience value={profile.competitive_experience} />
          <Vods highlights={highlights} />
        </div>
      </div>
    </div>
  )
}
