export type RankTab = 'points' | 'checkinTime' | 'calories' | 'streak'

const items: { tab: RankTab; label: string }[] = [
  { tab: 'checkinTime', label: 'Daily Check-in' },
  { tab: 'calories', label: 'Calories Burned' },
  { tab: 'streak', label: 'Streak Days' },
  { tab: 'points', label: 'Points' },
]

// Rank's own sidebar — distinct from the Dashboard-section Sidebar, since
// it switches ranking categories on this page rather than navigating routes.
export default function RankSidebar({ active, onChange }: { active: RankTab; onChange: (tab: RankTab) => void }) {
  // Same gutter-aware "hug left" offset as Sidebar.tsx — see comment there.
  return (
    <aside
      className="w-full lg:w-56 lg:shrink-0 lg:sticky lg:top-22 bg-[var(--bg-surface)] rounded-2xl shadow p-3 overflow-x-auto"
      style={{ transform: 'translateX(clamp(-50px, calc((1280px - 100vw) / 2), 0px))' }}
    >
      <nav className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
        {items.map(({ tab, label }) => (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer whitespace-nowrap ${
              active === tab ? '' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-inset)]'
            }`}
            style={active === tab ? { backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)' } : undefined}
          >
            {label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
