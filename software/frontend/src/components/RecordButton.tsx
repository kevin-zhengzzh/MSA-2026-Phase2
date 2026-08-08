import { useState } from 'react'
import { getTodayRewards, recordWorkout } from '../api'
import { useStore } from '../store'
import { WORKOUT_TYPES } from '../types'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'

// Floating "+ Record" button + modal, shared across Dashboard/Check-in
// History/Record History so a workout can be logged from any of them.
// Recording bumps workoutRefreshKey in the store so each page's own
// workout list (fetched independently) knows to refetch.
export default function RecordButton() {
  const { pushToast, setRewardStatus, bumpWorkoutRefresh } = useStore()
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [workoutType, setWorkoutType] = useState<string>(WORKOUT_TYPES[0])
  const [calories, setCalories] = useState('')
  const [recording, setRecording] = useState(false)
  useLockBodyScroll(showRecordModal)

  function openRecordModal() {
    setWorkoutType(WORKOUT_TYPES[0])
    setCalories('')
    setShowRecordModal(true)
  }

  async function handleRecordSubmit(e: React.FormEvent) {
    e.preventDefault()
    const caloriesNum = Number(calories)
    if (!calories || !Number.isInteger(caloriesNum) || caloriesNum <= 0 || caloriesNum > 10000) {
      pushToast('Enter a valid calorie amount (1–10000).')
      return
    }
    setRecording(true)
    try {
      const result = await recordWorkout(workoutType, caloriesNum)
      getTodayRewards().then(setRewardStatus).catch(console.error)
      bumpWorkoutRefresh()
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

  return (
    <>
      <button
        onClick={openRecordModal}
        aria-label="Record workout"
        title="Record workout"
        className="fixed bottom-6 right-4 sm:right-16 h-12 w-12 hover:w-36 flex items-center overflow-hidden text-white font-bold rounded-full shadow-lg transition-all duration-300 ease-out active:scale-95 cursor-pointer z-30"
        style={{ backgroundColor: 'var(--primary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
      >
        <span className="w-12 h-12 flex items-center justify-center flex-shrink-0 text-2xl leading-none">+</span>
        <span className="whitespace-nowrap pr-4">Record</span>
      </button>

      {showRecordModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => setShowRecordModal(false)}
        >
          <div
            className="bg-[var(--bg-surface)] rounded-2xl shadow-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Record workout</h2>
            <form onSubmit={handleRecordSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
                Workout type
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="border border-[var(--border-strong)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {WORKOUT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
                Calories burned
                <input
                  type="number"
                  min={1}
                  max={10000}
                  step={1}
                  placeholder="e.g. 300"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  onKeyDown={(e) => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault() }}
                  required
                  className="border border-[var(--border-strong)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </label>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="flex-1 border border-[var(--border-strong)] text-[var(--text-secondary)] rounded-lg py-2 font-semibold hover:bg-[var(--bg-inset)] transition cursor-pointer"
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
    </>
  )
}
