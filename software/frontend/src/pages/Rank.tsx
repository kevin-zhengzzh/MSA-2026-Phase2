import { useEffect, useState } from 'react'
import { assetUrl, getLeaderboard } from '../api'
import PersonIcon from '../components/PersonIcon'
import { THEME_COLORS, type LeaderboardEntry } from '../types'

const MEDALS = ['🥇', '🥈', '🥉']

// Other users' default avatar is theme-independent — it shouldn't shift
// color just because the viewer equipped a different skin for themselves.
const DEFAULT_AVATAR_COLOR = THEME_COLORS.default.primary

export default function Rank() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    getLeaderboard().then(setEntries).catch(console.error).finally(() => setInitialLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-800">Leaderboard</h1>

      {initialLoading ? (
        <div className="bg-white rounded-2xl shadow p-5 flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
              <div className="h-4 w-40 rounded bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400">
          <p className="text-4xl mb-3">🏆</p>
          <p>No rankings yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow p-5">
          <ul className="divide-y divide-gray-100">
            {entries.map((e) => (
              <li
                key={e.id}
                className={`py-3 flex items-center gap-3 ${e.isMe ? 'rounded-lg px-2 -mx-2' : ''}`}
                style={e.isMe ? { backgroundColor: 'var(--primary-light)' } : undefined}
              >
                <span className="w-8 text-center font-semibold text-gray-500 flex-shrink-0">
                  {MEDALS[e.rank - 1] ?? e.rank}
                </span>

                {e.avatarUrl ? (
                  <img src={assetUrl(e.avatarUrl)} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: e.isMe ? 'var(--primary)' : DEFAULT_AVATAR_COLOR }}
                  >
                    <PersonIcon className="w-4 h-4 text-white" />
                  </span>
                )}

                <span className={`flex-1 min-w-0 truncate text-sm ${e.isMe ? 'font-semibold' : 'font-medium'} text-gray-800`}>
                  {e.username}
                  {e.isMe && <span className="ml-1.5 text-xs font-normal text-gray-500">(you)</span>}
                </span>

                <span className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--primary-text)' }}>
                  {e.points} pts
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
