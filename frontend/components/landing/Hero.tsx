import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

export function Hero() {
  return (
    <div className="relative isolate pt-14 flex justify-center items-center min-bg-screen bg-zinc-950 px-4">
      {/* Background gradient effect */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff6b2b] to-[#fc4e0d] opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="mx-auto max-w-7xl pt-24 sm:pt-32 lg:pt-40 flex flex-col items-center text-center">
        {/* Trusted Badge */}
        <div className="mb-8 flex justify-center">
          <Badge variant="outline" className="rounded-full px-4 py-1.5 text-zinc-400 bg-zinc-900/50 backdrop-blur-sm border-zinc-700 hover:bg-zinc-800 transition-colors cursor-default">
            <span className="w-2 h-2 rounded-full bg-orange-500 mr-2 animate-pulse" />
            Trusted by 500+ Scouting Agencies
          </Badge>
        </div>

        {/* Hero Text */}
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl max-w-4xl leading-tight">
          Your Esports Career <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
            Starts Here.
          </span>
        </h1>
        
        <p className="mt-6 text-lg leading-8 text-zinc-400 max-w-2xl">
          The professional network for competitive gamers. Build your resume, showcase your verified stats, and get recruited by top organizations.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button size="lg" className="rounded-full bg-orange-600 px-8 py-6 text-base font-semibold text-white shadow-md hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">
            Find a Team &rarr;
          </Button>
          <Button variant="outline" size="lg" className="rounded-full border-zinc-700 bg-zinc-900/50 px-8 py-6 text-base font-semibold text-white hover:bg-zinc-800 hover:text-white">
            Recruit Talent
          </Button>
        </div>

        {/* Hero Image Mockup */}
        <div className="mt-16 flow-root sm:mt-24 w-full">
          <div className="-m-2 rounded-xl bg-zinc-900/5 p-2 ring-1 ring-inset ring-zinc-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
            <div className="relative rounded-lg bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden aspect-[16/9] flex items-center justify-center group">
               {/* This is a CSS-based placeholder for the dashboard screenshot */}
               <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 opacity-50" />
               
               {/* Mock UI Elements */}
               <div className="relative w-[90%] h-[85%] bg-zinc-950 rounded border border-zinc-800 p-4 space-y-4 shadow-inner">
                  {/* Mock Header */}
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                     <div className="w-32 h-6 bg-zinc-800 rounded animate-pulse" />
                     <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-800" />
                        <div className="w-24 h-8 bg-zinc-800 rounded" />
                     </div>
                  </div>
                  {/* Mock Content */}
                  <div className="grid grid-cols-3 gap-4 h-full">
                     <div className="col-span-1 bg-zinc-900 rounded p-4 border border-zinc-800 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-orange-500/20 mx-auto" />
                        <div className="h-4 bg-zinc-800 rounded w-3/4 mx-auto" />
                        <div className="h-3 bg-zinc-800 rounded w-1/2 mx-auto" />
                        <div className="h-20 bg-zinc-800/50 rounded mt-4" />
                     </div>
                     <div className="col-span-2 space-y-3">
                        <div className="h-32 bg-zinc-900 rounded border border-zinc-800" />
                        <div className="h-32 bg-zinc-900 rounded border border-zinc-800" />
                     </div>
                  </div>
                  
                  {/* Overlay Text */}
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                     <p className="text-zinc-400 font-mono text-sm">Dashboard Preview</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-10 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
      </div>
    </div>
  )
}
