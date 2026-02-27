import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mouse, Keyboard } from 'lucide-react'

export function Hardware() {
  return (
    <Card className="bg-[#140C0B] border-zinc-800 text-zinc-100">
        <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Hardware</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <Mouse className="w-4 h-4 text-zinc-500" />
                      <span className="text-sm font-medium">Mouse</span>
                  </div>
                  <span className="text-sm text-zinc-400">Logitech G Pro X Superlight</span>
            </div>
            <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <Keyboard className="w-4 h-4 text-zinc-500" />
                      <span className="text-sm font-medium">Keyboard</span>
                  </div>
                  <span className="text-sm text-zinc-400">Wooting 60HE</span>
            </div>
        </CardContent>
    </Card>
  )
}
