import { useEffect, useState } from 'react'
import { checkInToday, getMe, getTodayRewards, getTodayStatus, recordWorkout } from '../api'
import { useStore } from '../store'
import { WORKOUT_TYPES, type CheckInResult } from '../types'

export default function Dashboard() {
  const { user, setUser, checkedInToday, setCheckedInToday, setRewardStatus, pushToast, setStoreOpen } = useStore()
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null)

  const [showRecordModal, setShowRecordModal] = useState(false)
  const [workoutType, setWorkoutType] = useState<string>(WORKOUT_TYPES[0])
  const [calories, setCalories] = useState('')
  const [recording, setRecording] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [showPointsHint, setShowPointsHint] = useState(false)

  useEffect(() => {
    Promise.allSettled([
      getMe().then(setUser),
      getTodayStatus().then((r) => setCheckedInToday(r.checkedIn)),
    ]).then(() => setInitialLoading(false))
  }, [])

  function openRecordModal() {
    setWorkoutType(WORKOUT_TYPES[0])
    setCalories('')
    setShowRecordModal(true)
  }

  async function handleRecordSubmit(e: React.FormEvent) {
    e.preventDefault()
    const caloriesNum = Number(calories)
    if (!calories || caloriesNum <= 0) {
      pushToast('Enter a valid calorie amount.')
      return
    }
    setRecording(true)
    try {
      const result = await recordWorkout(workoutType, caloriesNum)
      getTodayRewards().then(setRewardStatus).catch(console.error)
      pushToast(
        result.pointsEarned > 0
          ? `Workout recorded! Claim your +${result.pointsEarned} pts in Daily Tasks.`
          : "Workout saved! (You've already recorded a workout today.)",
        'success'
      )
      setShowRecordModal(false)
    } catch (err: unknown) {
      pushToast(err instanceof Error ? err.message : 'Failed to save workout')
    } finally {
      setRecording(false)
    }
  }

  async function handleCheckIn() {
    setLoading(true)
    try {
      const result = await checkInToday()
      setLastResult(result)
      setCheckedInToday(true)
      getTodayRewards().then(setRewardStatus).catch(console.error)
    } catch (err: unknown) {
      pushToast(err instanceof Error ? err.message : 'Check-in failed')
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
          <StatCard label="Points" value={user.points} onInfoClick={() => setShowPointsHint(true)} />
          <StatCard label="Current streak" value={`${user.streak} day${user.streak !== 1 ? 's' : ''}`} />
        </div>
      )}

      {initialLoading ? (
        <div className="w-full bg-white rounded-2xl shadow p-8 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 animate-pulse" />
          <div className="h-6 w-56 rounded bg-gray-100 animate-pulse" />
          <div className="h-4 w-72 rounded bg-gray-100 animate-pulse" />
        </div>
      ) : (
        <>
          {/* Big check-in button */}
          <div className="w-full bg-white rounded-2xl shadow p-8 flex flex-col items-center gap-4">
            {checkedInToday ? (
              <>
                <div className="text-6xl">✅</div>
                <p className="text-xl font-semibold text-gray-700">You checked in today!</p>
                {lastResult && (
                  <p className="text-sm" style={{ color: 'var(--primary)' }}>
                    +{lastResult.pointsEarned} pts ready to claim in Daily Tasks · {lastResult.streak}-day streak
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
              </>
            )}
          </div>
        </>
      )}

      {/* Points hint modal */}
      {showPointsHint && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => setShowPointsHint(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">How points work</h2>
            <ul className="text-sm text-gray-500 space-y-2 list-disc list-inside">
              <li>10 base points per check-in</li>
              <li>+streak × 2 bonus (e.g. 5-day streak = +10 bonus)</li>
              <li>Recording a workout also earns +10 points — once per day only</li>
              <li>
                Spend points in the{' '}
                <button
                  onClick={() => { setShowPointsHint(false); setStoreOpen(true) }}
                  className="font-medium hover:underline cursor-pointer"
                  style={{ color: 'var(--primary)' }}
                >
                  Store
                </button>{' '}
                to unlock app skins
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Floating record button */}
      <button
        onClick={openRecordModal}
        className="fixed bottom-6 right-6 text-white font-bold px-5 py-3 rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer z-30"
        style={{ backgroundColor: 'var(--primary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
      >
        + Record
      </button>

      {/* Record workout modal */}
      {showRecordModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => setShowRecordModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Record workout</h2>
            <form onSubmit={handleRecordSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm text-gray-600">
                Workout type
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {WORKOUT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-600">
                Calories burned
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 300"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </label>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 font-semibold hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recording}
                  className="flex-1 text-white rounded-lg py-2 font-semibold transition disabled:opacity-60 cursor-pointer"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {recording ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, onInfoClick }: { label: string; value: string | number; onInfoClick?: () => void }) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)' }}>
      <div className="flex items-center gap-1.5">
        <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
        {onInfoClick && (
          <button
            onClick={onInfoClick}
            aria-label={`About ${label}`}
            className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold leading-none cursor-pointer opacity-70 hover:opacity-100"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
          >
            ?
          </button>
        )}
      </div>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}
