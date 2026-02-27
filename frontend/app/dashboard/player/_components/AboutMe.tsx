import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AboutMe() {
  return (
    <Card className="bg-[#140C0B] border-zinc-800 text-zinc-100">
        <CardHeader>
            <CardTitle className="text-lg font-bold text-white">About Me</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-zinc-400 leading-relaxed">
                Professional Entry Fragger with over 4 years of competitive experience in tactical shooters. 
                Known for explosive site entries and high-impact multi-kills. I've consistently maintained a top 
                500 Radiant ranking across multiple seasons and am looking to join a professional organization 
                competing in Tier 2/Challengers circuits. Highly communicative, coachable, and dedicated to a 
                rigorous daily practice routine.
            </p>
        </CardContent>
    </Card>
  )
}
