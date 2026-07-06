import { useEffect, useState } from 'react'
import { checkInToday, getMe, getTodayStatus } from '../api'
import { useStore } from '../store'
import type { CheckInResult } from '../types'

export default function Dashboard() {
  const { user, setUser, checkedInToday, setCheckedInToday } = useStore()
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getMe().then(setUser).catch(console.error)
    getTodayStatus().then((r) => setCheckedInToday(r.checkedIn)).catch(console.error)
  }, [])

  async function handleCheckIn() {
    setLoading(true)
    setError('')
    try {
      const result = await checkInToday()
      setLastResult(result)
      setCheckedInToday(true)
      // Refresh user stats
      const updated = await getMe()
      setUser(updated)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Check-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <h1 className="text-3xl font-bold text-gray-800 self-start">Dashboard</h1>

      {/* Stats row */}
      {user && (
        <div className="w-full grid grid-cols-2 gap-4">
          <StatCard label="Points" value={user.points} />
          <StatCard label="Current streak" value={`${user.streak} day${user.streak !== 1 ? 's' : ''}`} />
        </div>
      )}

      {/* Big check-in button */}
      <div className="w-full bg-white rounded-2xl shadow p-8 flex flex-col items-center gap-4">
        {checkedInToday ? (
          <>
            <div className="text-6xl">✅</div>
            <p className="text-xl font-semibold text-gray-700">You checked in today!</p>
            {lastResult && (
              <p className="text-sm" style={{ color: 'var(--primary)' }}>
                +{lastResult.pointsEarned} points earned · {lastResult.streak}-day streak
              </p>
            )}
            <p className="text-gray-400 text-sm">Come back tomorrow to keep your streak going.</p>
          </>
        ) : (
          <>
            <div className="text-6xl">🏃</div>
            <p className="text-xl font-semibold text-gray-700">Did you exercise today?</p>
            <p className="text-gray-400 text-sm">Hit the button to log your workout and earn points.</p>
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="mt-2 text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-lg transition-transform active:scale-95 disabled:opacity-60 cursor-pointer"
              style={{ backgroundColor: 'var(--primary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
            >
              {loading ? 'Checking in…' : '✓ Check In'}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </>
        )}
      </div>

      {/* Points info */}
      <div className="w-full bg-white rounded-2xl shadow p-5">
        <h2 className="font-semibold text-gray-700 mb-2">How points work</h2>
        <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
          <li>10 base points per check-in</li>
          <li>+streak × 2 bonus (e.g. 5-day streak = +10 bonus)</li>
          <li>Spend points in the Store to unlock app skins</li>
        </ul>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)' }}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}
