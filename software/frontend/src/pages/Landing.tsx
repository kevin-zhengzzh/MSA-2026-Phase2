import { Link } from 'react-router-dom'
import { useInView } from '../hooks/useInView'

const FEATURES = [
  {
    icon: '🔥',
    title: 'Daily Check-ins & Streaks',
    description: 'Check in every day to build a streak. Miss a day and it resets — so does your motivation to keep going.',
  },
  {
    icon: '🏋️',
    title: 'Workout Tracking',
    description: 'Log workouts by type and calories burned, and watch your weekly progress fill in on a live calorie chart.',
  },
  {
    icon: '🏆',
    title: 'Leaderboards',
    description: 'Compete on points, calories burned, today’s check-in time, or streak length — see exactly where you rank.',
  },
  {
    icon: '🎨',
    title: 'Unlockable Skins',
    description: 'Spend points on color themes in the Store, or earn the Dark skin free by keeping a 7-day streak alive.',
  },
]

const STEPS = [
  { step: '1', title: 'Check in daily', description: 'One tap logs your day and keeps your streak alive.' },
  { step: '2', title: 'Earn points', description: 'Check-ins and workouts both earn points, with bigger streaks paying bigger bonuses.' },
  { step: '3', title: 'Climb the board', description: 'Spend points on skins, or just chase the top of the leaderboard.' },
]

export default function Landing() {
  const [featuresRef, featuresInView] = useInView<HTMLDivElement>()
  const [stepsRef, stepsInView] = useInView<HTMLDivElement>()

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pt-14">
      <header className="fixed top-0 inset-x-0 z-40 h-14 flex items-center px-6 shadow bg-[var(--bg-surface)]">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-bold text-lg tracking-tight cursor-pointer"
          style={{ color: 'var(--primary)' }}
        >
          HealthTrack
        </button>
        <nav className="ml-auto flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium px-4 py-2 rounded-lg hover:bg-[var(--bg-inset)] transition text-[var(--text-secondary)]"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 text-center" style={{ backgroundColor: 'var(--primary-light)' }}>
        <p className="text-5xl mb-4">🏃</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold max-w-2xl mx-auto text-[var(--text-primary)]">
          Build habits that <span style={{ color: 'var(--primary)' }}>stick</span>.
        </h1>
        <p className="text-lg mt-4 max-w-xl mx-auto text-[var(--text-secondary)]">
          Check in daily, track your workouts, and compete with friends — HealthTrack turns fitness
          consistency into a game you actually want to keep playing.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/register"
            className="text-base font-semibold px-8 py-3 rounded-xl text-white shadow-lg transition-transform active:scale-95"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="text-base font-semibold px-8 py-3 rounded-xl border-2 transition bg-[var(--bg-surface)]"
            style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
          >
            I already have an account
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10 text-[var(--text-primary)]">
          Everything you need to stay consistent
        </h2>
        <div ref={featuresRef} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => {
            // Left column slides in from the left, right column from the right
            const fromLeft = i % 2 === 0
            return (
              <div
                key={f.title}
                className={`bg-[var(--bg-surface)] rounded-2xl shadow p-6 flex gap-4 transition-all duration-700 ease-out ${
                  featuresInView ? 'opacity-100 translate-x-0' : `opacity-0 ${fromLeft ? '-translate-x-12' : 'translate-x-12'}`
                }`}
              >
                <span className="text-3xl flex-shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-1">{f.title}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{f.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16" style={{ backgroundColor: 'var(--primary-light)' }}>
        <h2 className="text-2xl font-bold text-center mb-10 text-[var(--text-primary)]">How it works</h2>
        <div ref={stepsRef} className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {STEPS.map((s, i) => (
            <div
              key={s.step}
              className={`flex flex-col items-center text-center gap-2 transition-all duration-700 ease-out ${
                stepsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: stepsInView ? `${i * 200}ms` : '0ms' }}
            >
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {s.step}
              </span>
              <h3 className="font-semibold text-[var(--text-primary)]">{s.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Ready to start your streak?</h2>
        <p className="text-sm text-[var(--text-muted)] mt-2">It takes less than a minute to sign up.</p>
        <Link
          to="/register"
          className="inline-block mt-6 text-base font-semibold px-8 py-3 rounded-xl text-white shadow-lg transition-transform active:scale-95"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          Get Started Free
        </Link>
      </section>

      <footer className="px-6 py-6 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
        © {new Date().getFullYear()} HealthTrack
      </footer>
    </div>
  )
}
