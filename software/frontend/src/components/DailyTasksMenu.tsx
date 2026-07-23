import type { RewardStatus } from '../types'

function TaskRow({ label, task }: { label: string; task: { pointsEarned: number; claimed: boolean } | null }) {
  let status: string
  let color: string
  if (!task) {
    status = 'Not done yet'
    color = '#9ca3af'
  } else if (task.claimed) {
    status = 'Claimed'
    color = '#9ca3af'
  } else {
    status = `+${task.pointsEarned} pts ready`
    color = 'var(--primary-text)'
  }

  return (
    <li className="flex items-center justify-between">
      <span>{label}</span>
      <span className="font-medium" style={{ color }}>{status}</span>
    </li>
  )
}

export default function DailyTasksMenu({
  rewardStatus,
  onClaim,
}: {
  rewardStatus: RewardStatus | null
  onClaim: () => void
}) {
  const claimable =
    (!!rewardStatus?.checkIn && !rewardStatus.checkIn.claimed && rewardStatus.checkIn.pointsEarned > 0) ||
    (!!rewardStatus?.workout && !rewardStatus.workout.claimed && rewardStatus.workout.pointsEarned > 0)

  return (
    <div className="relative group">
      <div className="relative">
        <div
          className="flex items-center gap-2 rounded-full px-3 py-1.5 transition cursor-pointer hover:opacity-80"
          style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          <span className="text-sm font-medium">Daily Tasks</span>
        </div>
        {claimable && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </div>

      <div className="absolute right-0 top-full pt-2 hidden group-hover:block z-20">
        <div className="bg-white rounded-lg shadow-lg p-4 w-64 text-sm text-gray-700">
          <h3 className="font-semibold text-gray-800 mb-3">Daily Tasks</h3>
          <ul className="space-y-2 mb-4">
            <TaskRow label="Check-in" task={rewardStatus?.checkIn ?? null} />
            <TaskRow label="Workout" task={rewardStatus?.workout ?? null} />
          </ul>
          <button
            onClick={onClaim}
            disabled={!claimable}
            className="w-full text-sm font-semibold px-4 py-2 rounded-lg text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Claim Reward
          </button>
        </div>
      </div>
    </div>
  )
}
