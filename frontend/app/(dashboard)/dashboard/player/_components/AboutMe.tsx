import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AboutMeProps {
  bio?: string | null
}

export function AboutMe({ bio }: AboutMeProps) {
  return (
    <Card className="bg-[#140C0B] border-zinc-800 text-zinc-100 h-full shadow-sm">
        <CardHeader>
            <CardTitle className="text-lg font-bold text-white">About Me</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-zinc-400 leading-relaxed">
                {bio || "No bio provided yet."}
            </p>
        </CardContent>
    </Card>
  )
}
