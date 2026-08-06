import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'

export function Landing() {
  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center gap-6 p-8 text-center">
      <span className="text-4xl">🐍</span>
      <h1 className="text-2xl font-semibold">The Nest</h1>
      <p className="text-fg-muted">
        Chat and meet with people you already like. One space per group — no channels to learn.
      </p>
      <Link to="/sign-in">
        <Button>Get started</Button>
      </Link>
    </main>
  )
}
