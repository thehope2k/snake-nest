import { useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Field, Input } from '@/components/ui'
import { ApiError, useAuth } from '@/lib/auth'

type Mode = 'sign-in' | 'sign-up'

const MIN_PASSWORD_LENGTH = 8

export function AuthPanel() {
  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

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
    <div className="w-full max-w-sm shrink-0 rounded-xl border border-border bg-panel p-8 shadow-lg">
      <h2 className="text-xl font-semibold">{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h2>
      <p className="mt-1 text-sm text-fg-muted">
        {mode === 'sign-in' ? 'Sign in to get back to your Nests.' : 'Takes about ten seconds.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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

      <p className="mt-6 text-xs text-fg-subtle">
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
    </div>
  )
}
