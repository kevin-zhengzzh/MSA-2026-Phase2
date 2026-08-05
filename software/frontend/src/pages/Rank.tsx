import { useEffect, useState } from 'react'
import { assetUrl, getCaloriesLeaderboard, getCheckinTodayLeaderboard, getLeaderboard, getStreakLeaderboard } from '../api'
import BackToTopButton from '../components/BackToTopButton'
import PersonIcon from '../components/PersonIcon'
import Podium from '../components/Podium'
import RankSidebar, { type RankTab } from '../components/RankSidebar'
import StreakTracker from '../components/StreakTracker'
import { useStore } from '../store'
import { THEME_COLORS, type CaloriesLeaderboardEntry, type CheckinTodayLeaderboardEntry, type LeaderboardEntry, type StreakLeaderboardEntry } from '../types'

const MEDALS = ['🥇', '🥈', '🥉']

// Other users' default avatar is theme-independent — it shouldn't shift
// color just because the viewer equipped a different skin for themselves.
const DEFAULT_AVATAR_COLOR = THEME_COLORS.default.primary

export default function Rank() {
  const leaderboardRefreshKey = useStore((s) => s.leaderboardRefreshKey)
  const workoutRefreshKey = useStore((s) => s.workoutRefreshKey)
  const user = useStore((s) => s.user)
  const checkedInToday = useStore((s) => s.checkedInToday)
  // Same "not earned for today until you've checked in" rule as the
  // Dashboard's streak stat card — the backend only advances streak at
  // check-in time, so it still holds yesterday's value until then.
  const displayStreak = checkedInToday ? (user?.streak ?? 0) : 0
  const [tab, setTab] = useState<RankTab>('checkinTime')
  const [pointsEntries, setPointsEntries] = useState<LeaderboardEntry[]>([])
  const [streakEntries, setStreakEntries] = useState<StreakLeaderboardEntry[]>([])
  const [caloriesEntries, setCaloriesEntries] = useState<CaloriesLeaderboardEntry[]>([])
  const [checkinTimeEntries, setCheckinTimeEntries] = useState<CheckinTodayLeaderboardEntry[]>([])
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getLeaderboard().then(setPointsEntries),
      getStreakLeaderboard().then(setStreakEntries),
      getCaloriesLeaderboard().then(setCaloriesEntries),
      getCheckinTodayLeaderboard().then(setCheckinTimeEntries),
    ]).then(() => setInitialLoading(false))
  }, [leaderboardRefreshKey, workoutRefreshKey])

  // Normalize all four leaderboard shapes to a common { value } so the
  // list below doesn't need to branch on which tab is active.
  const entries = tab === 'points'
    ? pointsEntries.map((e) => ({ ...e, value: `${e.points} pts` }))
    : tab === 'streak'
    ? streakEntries.map((e) => ({ ...e, value: `${e.streak} day${e.streak > 1 ? 's' : ''}` }))
    : tab === 'calories'
    ? caloriesEntries.map((e) => ({ ...e, value: `${e.calories.toLocaleString()} kcal` }))
    : checkinTimeEntries.map((e) => ({
        ...e,
        value: new Date(e.checkedInAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      }))

  return (
    <div className="flex gap-10 items-start">
      <RankSidebar active={tab} onChange={setTab} />
      <BackToTopButton />

      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {initialLoading ? (
          <div className="bg-[var(--bg-surface)] rounded-2xl shadow p-5 flex flex-col gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-inset)] animate-pulse flex-shrink-0" />
                <div className="h-4 w-40 rounded bg-[var(--bg-inset)] animate-pulse" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-[var(--bg-surface)] rounded-2xl shadow p-8 text-center text-[var(--text-muted)]">
            <p className="text-4xl mb-3">🏆</p>
            <p>No rankings yet.</p>
          </div>
        ) : (
          <>
            <Podium key={tab} entries={entries.slice(0, 3)} />

            {entries.length > 3 && (
              <div key={`${tab}-list`} className="bg-[var(--bg-surface)] rounded-2xl shadow p-5">
                <ul className="divide-y divide-[var(--border-subtle)]">
                  {entries.slice(3).map((e) => (
                    <li
                      key={e.id}
                      className={`py-3 flex items-center gap-3 ${e.isMe ? 'rounded-lg px-2 -mx-2' : ''}`}
                      style={e.isMe ? { backgroundColor: 'var(--primary-light)' } : undefined}
                    >
                      <span className="w-8 text-center font-semibold text-[var(--text-muted)] flex-shrink-0">
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

                      <span className={`flex-1 min-w-0 truncate text-sm ${e.isMe ? 'font-semibold' : 'font-medium'} text-[var(--text-primary)]`}>
                        {e.username}
                        {e.isMe && <span className="ml-1.5 text-xs font-normal text-[var(--text-muted)]">(you)</span>}
                      </span>

                      <span className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--primary-text)' }}>
                        {e.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      <StreakTracker streak={displayStreak} />
    </div>
  )
}
