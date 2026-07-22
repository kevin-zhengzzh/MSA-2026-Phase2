import { useEffect, useState } from 'react'
import { getCheckInHistory } from '../api'
import type { CheckIn } from '../types'

// Bare "YYYY-MM-DD" strings parse as UTC midnight in JS; constructing from
// the parts instead keeps the calendar date stable regardless of local timezone.
function parseLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export default function History() {
  const [history, setHistory] = useState<CheckIn[]>([])

  useEffect(() => {
    getCheckInHistory().then(setHistory).catch(console.error)
  }, [])

  // Group check-ins by month for display
  const grouped = history.reduce<Record<string, CheckIn[]>>((acc, c) => {
    const month = c.date.slice(0, 7) // "2026-07"
    if (!acc[month]) acc[month] = []
    acc[month].push(c)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-800">Check-in History</h1>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>No check-ins yet. Head to the dashboard to start!</p>
        </div>
      ) : (
        Object.entries(grouped)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([month, entries]) => (
            <div key={month} className="bg-white rounded-2xl shadow p-5">
              <h2 className="font-semibold text-gray-600 text-sm uppercase tracking-wide mb-3">
                {parseLocalDate(`${month}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <ul className="divide-y divide-gray-100">
                {entries.map((c) => (
                  <li key={c.id} className="py-3 flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      ✓
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {parseLocalDate(c.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      {c.note && <p className="text-xs text-gray-400 mt-0.5">{c.note}</p>}
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-400 mt-3 text-right">
                {entries.length} check-in{entries.length !== 1 ? 's' : ''} this month
              </p>
            </div>
          ))
      )}
    </div>
  )
}
