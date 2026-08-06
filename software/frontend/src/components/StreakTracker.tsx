const MILESTONE = 7

// A vertical line-and-dots tracker for the current check-in streak, shown
// on the right of the Rank page. Filled dots count up to the 7-day
// milestone that unlocks the Dark skin (see CheckInController.GrantStreakRewardSkin).
export default function StreakTracker({ streak }: { streak: number }) {
  const progress = Math.min(streak, MILESTONE)
  const unlocked = streak >= MILESTONE
  const daysLeft = MILESTONE - progress

  return (
    <aside className="w-full lg:w-48 lg:shrink-0 lg:sticky lg:top-22 bg-[var(--bg-surface)] rounded-2xl shadow p-4">
      <h2 className="font-semibold text-[var(--text-secondary)] text-sm mb-1">Streak Progress</h2>
      <p className="text-xs text-[var(--text-muted)] mb-4">
        {unlocked ? '🌙 Dark skin unlocked!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} to Dark skin`}
      </p>

      {/* Row on mobile (dots progress left-to-right), column on lg+ (top-to-bottom) */}
      <div className="flex lg:flex-col items-center justify-center lg:justify-start overflow-x-auto">
        {Array.from({ length: MILESTONE }).map((_, i) => {
          const day = i + 1
          const filled = day <= progress
          const isMilestone = day === MILESTONE
          return (
            <div key={day} className="flex lg:flex-col items-center flex-shrink-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors duration-300"
                style={{
                  backgroundColor: filled ? 'var(--primary)' : 'var(--bg-inset)',
                  color: filled ? '#fff' : 'var(--text-muted)',
                }}
              >
                {isMilestone ? '🌙' : day}
              </div>
              {!isMilestone && (
                <div
                  className="h-0.5 w-4 lg:h-4 lg:w-0.5 transition-colors duration-300"
                  style={{ backgroundColor: day < progress ? 'var(--primary)' : 'var(--border)' }}
                />
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
