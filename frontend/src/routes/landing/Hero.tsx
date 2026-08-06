import { PILLARS } from './pillars'

const QUOTES = [
  'Where friendships are tested one Doghouse at a time.',
  'Group chat energy, minus the 2am notification spam.',
  'Talk trash. Mean it lovingly. Get muted for it.',
  'The only meeting app that lets you bench a friend for comedic effect.',
]

export function Hero({ quote }: { quote: string }) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-10">
      <div>
        <span className="text-6xl">🐍</span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">The Nest</h1>
        <p className="mt-3 max-w-md text-lg text-fg-muted">{quote}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {PILLARS.map(({ name, blurb, icon: Icon, emoji }) => (
          <div key={name} className="rounded-lg border border-border bg-panel p-4 shadow-sm">
            <div className="flex items-center gap-2 text-fg">
              {Icon ? <Icon size={20} className="text-accent" /> : <span className="text-xl">{emoji}</span>}
              <span className="font-medium">{name}</span>
            </div>
            <p className="mt-2 text-sm text-fg-muted">{blurb}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export { QUOTES }
