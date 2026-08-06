import { useMemo } from 'react'
import { AuthPanel } from './landing/AuthPanel'
import { Hero, QUOTES } from './landing/Hero'

export function Landing() {
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], [])

  return (
    <main className="mx-auto flex min-h-full max-w-5xl flex-col gap-8 p-8">
      <div className="flex flex-1 flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between">
        <Hero quote={quote} />
        <AuthPanel />
      </div>

      <footer className="pb-2 text-center text-xs text-fg-subtle">
        Born from an EPAM hallway chat between Duy Le and Khoa Nguyen — somehow the Christina Nguyen story turned into
        this. We regret nothing.
      </footer>
    </main>
  )
}
