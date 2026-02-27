import { Github, Twitter, Disc } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center">
                <span className="font-bold text-white">G</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                GameFolio
              </span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              The professional esports resume platform. Build your career with verified data.
            </p>
            <div className="flex space-x-6 mt-6">
              <Link href="#" className="text-zinc-500 hover:text-orange-500">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" aria-hidden="true" />
              </Link>
              <Link href="#" className="text-zinc-500 hover:text-orange-500">
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" aria-hidden="true" />
              </Link>
              <Link href="#" className="text-zinc-500 hover:text-orange-500">
                <span className="sr-only">Discord</span>
                <Disc className="h-6 w-6" aria-hidden="true" />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold leading-6 text-white">Product</h3>
            <ul role="list" className="mt-6 space-y-4">
              <li>
                <Link href="#" className="text-sm leading-6 text-zinc-400 hover:text-white">Features</Link>
              </li>
              <li>
                <Link href="#" className="text-sm leading-6 text-zinc-400 hover:text-white">Integrations</Link>
              </li>
              <li>
                <Link href="#" className="text-sm leading-6 text-zinc-400 hover:text-white">Pricing</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold leading-6 text-white">Resources</h3>
            <ul role="list" className="mt-6 space-y-4">
              <li>
                <Link href="#" className="text-sm leading-6 text-zinc-400 hover:text-white">Documentation</Link>
              </li>
              <li>
                <Link href="#" className="text-sm leading-6 text-zinc-400 hover:text-white">Guides</Link>
              </li>
              <li>
                <Link href="#" className="text-sm leading-6 text-zinc-400 hover:text-white">API</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold leading-6 text-white">Company</h3>
            <ul role="list" className="mt-6 space-y-4">
              <li>
                <Link href="#" className="text-sm leading-6 text-zinc-400 hover:text-white">About</Link>
              </li>
              <li>
                <Link href="#" className="text-sm leading-6 text-zinc-400 hover:text-white">Blog</Link>
              </li>
              <li>
                <Link href="#" className="text-sm leading-6 text-zinc-400 hover:text-white">Careers</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-zinc-900 pt-8 sm:mt-16 lg:mt-24">
          <p className="text-xs leading-5 text-zinc-500">
            &copy; {new Date().getFullYear()} GameFolio Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
