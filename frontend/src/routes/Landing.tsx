import { useMemo, useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Field, Input } from '@/components/ui'
import { useAuth } from '@/lib/mock-auth'

const QUOTES = [
  'Where friendships are tested one Doghouse at a time.',
  'Group chat energy, minus the 2am notification spam.',
  'Talk trash. Mean it lovingly. Get muted for it.',
  'The only meeting app that lets you bench a friend for comedic effect.',
]

type Mode = 'sign-in' | 'sign-up'

export function Landing() {
  const [mode, setMode] = useState<Mode>('sign-in')
  const [name, setName] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], [])

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    signIn(trimmed)
    navigate('/nests')
  }

  return (
    <main className="mx-auto flex min-h-full max-w-sm flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <span className="text-4xl">🐍</span>
        <h1 className="mt-2 text-2xl font-semibold">The Nest</h1>
        <p className="mt-2 text-sm text-fg-muted">{quote}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <Field label={mode === 'sign-in' ? 'Your name' : 'Pick a name'}>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Hope" autoFocus />
        </Field>
        <Button type="submit">{mode === 'sign-in' ? 'Sign in' : 'Create account'}</Button>
      </form>

      <p className="text-xs text-fg-subtle">
        {mode === 'sign-in' ? (
          <>
            New here?{' '}
            <button onClick={() => setMode('sign-up')} className="text-accent hover:underline">
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button onClick={() => setMode('sign-in')} className="text-accent hover:underline">
              Sign in
            </button>
          </>
        )}
      </p>
    </main>
  )
}
