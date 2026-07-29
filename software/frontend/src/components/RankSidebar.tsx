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
  return (
    <aside className="w-56 shrink-0 sticky top-22 -translate-x-[50px] bg-[var(--bg-surface)] rounded-2xl shadow p-3">
      <nav className="flex flex-col gap-1">
        {items.map(({ tab, label }) => (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
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
