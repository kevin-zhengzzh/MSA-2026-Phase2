import { useEffect, useMemo, useState } from 'react'
import { deleteWorkout, getWorkoutHistory, updateWorkout } from '../api'
import Pagination from '../components/Pagination'
import { useStore } from '../store'
import { WORKOUT_TYPES, type WorkoutRecord } from '../types'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'

const PAGE_SIZE_OPTIONS = [5, 10, 20]

// Case-insensitive substring match, falling back to an in-order subsequence
// match (e.g. "cyc" or "ccyl" both still find "Cycling") for typo tolerance
function fuzzyMatch(query: string, target: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  const t = target.toLowerCase()
  if (t.includes(q)) return true
  let qi = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++
  }
  return qi === q.length
}

// WorkoutRecord.date is a plain "YYYY-MM-DD" — parse as local midnight so it
// displays as the same calendar day the user recorded it under.
function parseLocalDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`)
}

export default function RecordHistory() {
  const pushToast = useStore((s) => s.pushToast)
  const workoutRefreshKey = useStore((s) => s.workoutRefreshKey)
  const [history, setHistory] = useState<WorkoutRecord[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editType, setEditType] = useState<string>(WORKOUT_TYPES[0])
  const [editCalories, setEditCalories] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  useLockBodyScroll(editingId !== null || confirmDeleteId !== null)

  useEffect(() => {
    getWorkoutHistory().then(setHistory).catch(console.error).finally(() => setInitialLoading(false))
  }, [])

  // A workout recorded from the shared floating Record button (which can be
  // opened from any page) doesn't touch this page's local state directly.
  useEffect(() => {
    if (workoutRefreshKey === 0) return
    getWorkoutHistory().then(setHistory).catch(console.error)
  }, [workoutRefreshKey])

  const filtered = useMemo(
    () => history.filter((w) => fuzzyMatch(search, w.workoutType)),
    [history, search]
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => {
    setPage(1)
  }, [search])

  function changePageSize(size: number) {
    setPageSize(size)
    setPage(1)
  }

  function startEdit(w: WorkoutRecord) {
    setEditingId(w.id)
    setEditType(w.workoutType)
    setEditCalories(String(w.calories))
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(id: number) {
    const caloriesNum = Number(editCalories)
    if (!editCalories || !Number.isInteger(caloriesNum) || caloriesNum <= 0 || caloriesNum > 10000) {
      pushToast('Enter a valid calorie amount (1–10000).')
      return
    }
    setSaving(true)
    try {
      const updated = await updateWorkout(id, editType, caloriesNum)
      setHistory((h) => h.map((w) => (w.id === id ? updated : w)))
      setEditingId(null)
    } catch (err: unknown) {
      pushToast(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  function cancelDelete() {
    setConfirmDeleteId(null)
  }

  async function confirmDelete(id: number) {
    setDeletingId(id)
    try {
      await deleteWorkout(id)
      setHistory((h) => h.filter((w) => w.id !== id))
      setConfirmDeleteId(null)
    } catch (err: unknown) {
      pushToast(err instanceof Error ? err.message : 'Failed to delete record')
    } finally {
      setDeletingId(null)
    }
  }

  // Group the current page's workout records by month, then by day within
  // each month, so each day's records sit together in their own frame.
  const grouped = pageItems.reduce<Record<string, WorkoutRecord[]>>((acc, w) => {
    const month = w.date.slice(0, 7)
    if (!acc[month]) acc[month] = []
    acc[month].push(w)
    return acc
  }, {})

  function groupByDay(entries: WorkoutRecord[]) {
    const byDay = entries.reduce<Record<string, WorkoutRecord[]>>((acc, w) => {
      if (!acc[w.date]) acc[w.date] = []
      acc[w.date].push(w)
      return acc
    }, {})
    return Object.entries(byDay).sort(([a], [b]) => b.localeCompare(a))
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-[var(--text-primary)]">Record History</h1>

      {!initialLoading && history.length > 0 && (
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by workout type…"
          className="w-full border border-[var(--border-strong)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-[var(--bg-surface)]"
        />
      )}

      {initialLoading ? (
        <div className="bg-[var(--bg-surface)] rounded-2xl shadow p-5 flex flex-col gap-3">
          <div className="h-4 w-32 rounded bg-[var(--bg-inset)] animate-pulse" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <div className="w-8 h-8 rounded-full bg-[var(--bg-inset)] animate-pulse flex-shrink-0" />
              <div className="h-4 w-40 rounded bg-[var(--bg-inset)] animate-pulse" />
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="bg-[var(--bg-surface)] rounded-2xl shadow p-8 text-center text-[var(--text-muted)]">
          <p className="text-4xl mb-3">🏋️</p>
          <p>No workout records yet. Log one from the dashboard!</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--bg-surface)] rounded-2xl shadow p-8 text-center text-[var(--text-muted)]">
          <p className="text-4xl mb-3">🔍</p>
          <p>No records match "{search}".</p>
        </div>
      ) : (
        Object.entries(grouped)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([month, entries]) => (
            <div key={month} className="bg-[var(--bg-surface)] rounded-2xl shadow p-5">
              <h2 className="font-semibold text-[var(--text-secondary)] text-sm uppercase tracking-wide mb-3">
                {new Date(`${month}-01T00:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex flex-col gap-3">
                {groupByDay(entries).map(([date, dayEntries]) => (
                  <div key={date} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inset)] p-3">
                    <div className="flex items-center justify-between mb-1.5 px-1">
                      <p className="text-xs font-semibold text-[var(--text-muted)]">
                        {parseLocalDate(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {dayEntries.reduce((sum, w) => sum + w.calories, 0)} kcal total
                      </p>
                    </div>
                    <ul className="divide-y divide-[var(--border-subtle)]">
                      {dayEntries.map((w) => (
                        <li key={w.id} className="py-2.5 flex items-center gap-3">
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{ backgroundColor: 'var(--primary)' }}
                          >
                            🏋️
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[var(--text-primary)]">{w.workoutType}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">{w.calories} kcal</p>
                          </div>
                          <button
                            onClick={() => startEdit(w)}
                            aria-label="Edit"
                            title="Edit"
                            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer p-1"
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
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-3 text-right">
                {entries.length} record{entries.length !== 1 ? 's' : ''} this month
              </p>
            </div>
          ))
      )}

      {!initialLoading && filtered.length > 0 && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onChange={setPage}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={changePageSize}
        />
      )}

      {editingId !== null && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={cancelEdit}
        >
          <div
            className="bg-[var(--bg-surface)] rounded-2xl shadow-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Edit workout</h2>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
                Workout type
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
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
                  value={editCalories}
                  onChange={(e) => setEditCalories(e.target.value)}
                  onKeyDown={(e) => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault() }}
                  className="border border-[var(--border-strong)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </label>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 border border-[var(--border-strong)] text-[var(--text-secondary)] rounded-lg py-2 font-semibold hover:bg-[var(--bg-inset)] transition cursor-pointer"
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
            className="bg-[var(--bg-surface)] rounded-2xl shadow-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Delete workout?</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">This can't be undone.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                className="flex-1 border border-[var(--border-strong)] text-[var(--text-secondary)] rounded-lg py-2 font-semibold hover:bg-[var(--bg-inset)] transition cursor-pointer"
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
