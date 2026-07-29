import { assetUrl } from '../api'
import PersonIcon from './PersonIcon'
import { THEME_COLORS } from '../types'

// Other users' default avatar is theme-independent — it shouldn't shift
// color just because the viewer equipped a different skin for themselves.
const DEFAULT_AVATAR_COLOR = THEME_COLORS.default.primary

const MEDALS = ['🥇', '🥈', '🥉']

// Display order left-to-right (2nd, 1st, 3rd), as indices into the
// rank-1/2/3 entries array passed in
const DISPLAY_ORDER = [1, 0, 2]
const PLATFORM_HEIGHTS = ['h-16', 'h-24', 'h-12']
const AVATAR_SIZES = ['w-14 h-14', 'w-16 h-16', 'w-14 h-14']

export interface PodiumEntry {
  id: number
  username: string
  avatarUrl: string | null
  isMe: boolean
  value: string
}

export default function Podium({ entries }: { entries: PodiumEntry[] }) {
  if (entries.length === 0) return null

  return (
    <div className="bg-[var(--bg-surface)] rounded-2xl shadow p-6 flex items-end justify-center gap-4">
      {DISPLAY_ORDER.map((rankIdx, i) => {
        const e = entries[rankIdx]
        if (!e) return <div key={i} className="flex-1 max-w-[160px]" />
        return (
          <div key={e.id} className="flex flex-col items-center flex-1 max-w-[160px]">
            {e.avatarUrl ? (
              <img
                src={assetUrl(e.avatarUrl)}
                alt=""
                className={`${AVATAR_SIZES[i]} rounded-full object-cover mb-2 flex-shrink-0`}
              />
            ) : (
              <span
                className={`${AVATAR_SIZES[i]} rounded-full flex items-center justify-center mb-2 flex-shrink-0`}
                style={{ backgroundColor: e.isMe ? 'var(--primary)' : DEFAULT_AVATAR_COLOR }}
              >
                <PersonIcon className="w-1/2 h-1/2 text-white" />
              </span>
            )}
            <span className="text-2xl leading-none mb-1">{MEDALS[rankIdx]}</span>
            <p className={`text-sm text-center truncate max-w-full ${e.isMe ? 'font-bold' : 'font-semibold'} text-[var(--text-primary)]`}>
              {e.username}
              {e.isMe && <span className="ml-1 text-xs font-normal text-[var(--text-muted)]">(you)</span>}
            </p>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--primary-text)' }}>
              {e.value}
            </p>
            <div
              className={`w-full ${PLATFORM_HEIGHTS[i]} rounded-t-lg`}
              style={{ backgroundColor: 'var(--primary-light)' }}
            />
          </div>
        )
      })}
    </div>
  )
}
