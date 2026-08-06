import { useMemo, useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Field, Input } from '@/components/ui'
import { ApiError, useAuth } from '@/lib/auth'

const QUOTES = [
  'Where friendships are tested one Doghouse at a time.',
  'Group chat energy, minus the 2am notification spam.',
  'Talk trash. Mean it lovingly. Get muted for it.',
  'The only meeting app that lets you bench a friend for comedic effect.',
]

type Mode = 'sign-in' | 'sign-up'

const MIN_PASSWORD_LENGTH = 8

export function Landing() {
  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], [])

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setConfirmPassword('')
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setError(null)

    if (mode === 'sign-up') {
      if (password.length < MIN_PASSWORD_LENGTH) {
        setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords don\u2019t match')
        return
      }
    }

    setSubmitting(true)
    try {
      if (mode === 'sign-in') {
        await signIn(email, password)
      } else {
        await signUp(email, password, displayName)
      }
      navigate('/nests')
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-full max-w-sm flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <span className="text-4xl">🐍</span>
        <h1 className="mt-2 text-2xl font-semibold">The Nest</h1>
        <p className="mt-2 text-sm text-fg-muted">{quote}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        {mode === 'sign-up' && (
          <Field label="Your name">
            <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Hope" autoFocus />
          </Field>
        )}
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="hope@example.com"
            autoFocus={mode === 'sign-in'}
          />
        </Field>
        <Field label="Password">
          <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
        </Field>
        {mode === 'sign-up' && (
          <Field label="Retype password">
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="••••••••"
            />
          </Field>
        )}

        {error && <p className="text-xs text-doghouse">{error}</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? 'One sec...' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
        </Button>
      </form>

      <p className="text-xs text-fg-subtle">
        {mode === 'sign-in' ? (
          <>
            New here?{' '}
            <button onClick={() => switchMode('sign-up')} className="text-accent hover:underline">
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button onClick={() => switchMode('sign-in')} className="text-accent hover:underline">
              Sign in
            </button>
          </>
        )}
      </p>
    </main>
  )
}
