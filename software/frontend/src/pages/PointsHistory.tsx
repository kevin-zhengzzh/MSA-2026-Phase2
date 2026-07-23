import { useEffect, useState } from 'react'
import { getPointHistory } from '../api'
import type { PointTransaction } from '../types'

export default function PointsHistory() {
  const [history, setHistory] = useState<PointTransaction[]>([])

  useEffect(() => {
    getPointHistory().then(setHistory).catch(console.error)
  }, [])

  // Group transactions by month for display
  const grouped = history.reduce<Record<string, PointTransaction[]>>((acc, t) => {
    const month = t.createdAt.slice(0, 7) // "2026-07"
    if (!acc[month]) acc[month] = []
    acc[month].push(t)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-800">Points History</h1>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
          <p className="text-4xl mb-3">✨</p>
          <p>No point activity yet. Check in or record a workout to start earning!</p>
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
                {entries.map((t) => (
                  <li key={t.id} className="py-3 flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: t.amount >= 0 ? 'var(--primary)' : '#dc2626' }}
                    >
                      {t.amount >= 0 ? '+' : '−'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{t.reason}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(t.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span
                      className="text-sm font-semibold flex-shrink-0"
                      style={{ color: t.amount >= 0 ? 'var(--primary-text)' : '#dc2626' }}
                    >
                      {t.amount >= 0 ? '+' : ''}{t.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))
      )}
    </div>
  )
}
