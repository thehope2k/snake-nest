import { useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Field, Input } from '@/components/ui'
import { useAuth } from '@/lib/mock-auth'

export function SignIn() {
  const [name, setName] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    signIn(trimmed)
    navigate('/nests')
  }

  return (
    <main className="mx-auto flex min-h-full max-w-sm flex-col justify-center gap-6 p-8">
      <div className="text-center">
        <span className="text-3xl">🐍</span>
        <h1 className="mt-2 text-lg font-semibold">Sign in to The Nest</h1>
        <p className="text-sm text-fg-subtle">No password yet — just tell us who you are.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Your name">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="TheHope" autoFocus />
        </Field>
        <Button type="submit">Continue</Button>
      </form>
    </main>
  )
}
