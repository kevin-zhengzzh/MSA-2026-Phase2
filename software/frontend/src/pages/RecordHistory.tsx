import { useEffect, useState } from 'react'
import { deleteWorkout, getWorkoutHistory, updateWorkout } from '../api'
import { WORKOUT_TYPES, type WorkoutRecord } from '../types'

export default function RecordHistory() {
  const [history, setHistory] = useState<WorkoutRecord[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editType, setEditType] = useState<string>(WORKOUT_TYPES[0])
  const [editCalories, setEditCalories] = useState('')
  const [editError, setEditError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    getWorkoutHistory().then(setHistory).catch(console.error)
  }, [])

  function startEdit(w: WorkoutRecord) {
    setEditingId(w.id)
    setEditType(w.workoutType)
    setEditCalories(String(w.calories))
    setEditError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError('')
  }

  async function saveEdit(id: number) {
    setEditError('')
    const caloriesNum = Number(editCalories)
    if (!editCalories || caloriesNum <= 0) {
      setEditError('Enter a valid calorie amount.')
      return
    }
    setSaving(true)
    try {
      const updated = await updateWorkout(id, editType, caloriesNum)
      setHistory((h) => h.map((w) => (w.id === id ? updated : w)))
      setEditingId(null)
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  function cancelDelete() {
    setConfirmDeleteId(null)
    setDeleteError('')
  }

  async function confirmDelete(id: number) {
    setDeleteError('')
    setDeletingId(id)
    try {
      await deleteWorkout(id)
      setHistory((h) => h.filter((w) => w.id !== id))
      setConfirmDeleteId(null)
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete record')
    } finally {
      setDeletingId(null)
    }
  }

  // Group workout records by month for display
  const grouped = history.reduce<Record<string, WorkoutRecord[]>>((acc, w) => {
    const d = new Date(w.createdAt)
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!acc[month]) acc[month] = []
    acc[month].push(w)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-800">Record History</h1>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
          <p className="text-4xl mb-3">🏋️</p>
          <p>No workout records yet. Log one from the dashboard!</p>
        </div>
      ) : (
        Object.entries(grouped)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([month, entries]) => (
            <div key={month} className="bg-white rounded-2xl shadow p-5">
              <h2 className="font-semibold text-gray-600 text-sm uppercase tracking-wide mb-3">
                {new Date(`${month}-01T00:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <ul className="divide-y divide-gray-100">
                {entries.map((w) => (
                  <li key={w.id} className="py-3 flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      🏋️
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(w.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {' · '}{w.workoutType}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{w.calories} kcal</p>
                    </div>
                    <button
                      onClick={() => startEdit(w)}
                      aria-label="Edit"
                      title="Edit"
                      className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(w.id)}
                      disabled={deletingId === w.id}
                      aria-label="Delete"
                      title="Delete"
                      className="text-red-400 hover:text-red-600 cursor-pointer disabled:opacity-60 p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M3 6h18" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-400 mt-3 text-right">
                {entries.length} record{entries.length !== 1 ? 's' : ''} this month
              </p>
            </div>
          ))
      )}

      {editingId !== null && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={cancelEdit}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Edit workout</h2>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm text-gray-600">
                Workout type
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
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
                  value={editCalories}
                  onChange={(e) => setEditCalories(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </label>
              {editError && <p className="text-red-500 text-sm">{editError}</p>}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 font-semibold hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => saveEdit(editingId)}
                  disabled={saving}
                  className="flex-1 text-white rounded-lg py-2 font-semibold transition disabled:opacity-60 cursor-pointer"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={cancelDelete}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-2">Delete workout?</h2>
            <p className="text-sm text-gray-500 mb-4">This can't be undone.</p>
            {deleteError && <p className="text-red-500 text-sm mb-4">{deleteError}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 font-semibold hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="flex-1 bg-red-500 text-white rounded-lg py-2 font-semibold hover:bg-red-600 transition disabled:opacity-60 cursor-pointer"
              >
                {deletingId === confirmDeleteId ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
