import { useEffect, useMemo, useState } from 'react'
import type { WorkoutRecord } from '../types'

type Period = 'week' | 'month' | 'year'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
]

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface Bucket {
  label: string
  fullLabel: string
  value: number
}

// WorkoutRecord.date is a plain "YYYY-MM-DD" — parse as local midnight so it
// buckets into the same calendar day the user recorded it under, regardless
// of the reader's UTC offset.
function parseLocalDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`)
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function niceCeil(value: number): number {
  if (value <= 0) return 100
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  const normalized = value / magnitude
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return step * magnitude
}

function buildBuckets(records: WorkoutRecord[], period: Period): Bucket[] {
  const today = startOfDay(new Date())

  if (period === 'week') {
    const days: Bucket[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (6 - i))
      return {
        label: WEEKDAY_LABELS[d.getDay()],
        fullLabel: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        value: 0,
      }
    })
    for (const r of records) {
      const diffDays = Math.round((today.getTime() - startOfDay(parseLocalDate(r.date)).getTime()) / 86400000)
      if (diffDays >= 0 && diffDays <= 6) days[6 - diffDays].value += r.calories
    }
    return days
  }

  if (period === 'month') {
    const year = today.getFullYear()
    const month = today.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const weekCount = Math.ceil(daysInMonth / 7)
    const weeks: Bucket[] = Array.from({ length: weekCount }, (_, i) => ({
      label: `W${i + 1}`,
      fullLabel: `Week ${i + 1}`,
      value: 0,
    }))
    for (const r of records) {
      const d = parseLocalDate(r.date)
      if (d.getFullYear() === year && d.getMonth() === month) {
        weeks[Math.min(weekCount - 1, Math.floor((d.getDate() - 1) / 7))].value += r.calories
      }
    }
    return weeks
  }

  const year = today.getFullYear()
  const months: Bucket[] = MONTH_LABELS.map((label) => ({ label, fullLabel: label, value: 0 }))
  for (const r of records) {
    const d = parseLocalDate(r.date)
    if (d.getFullYear() === year) months[d.getMonth()].value += r.calories
  }
  return months
}

const VB_WIDTH = 600
const VB_HEIGHT = 220
const PAD = { top: 28, right: 10, bottom: 26, left: 44 }

export default function CalorieBarChart({ records }: { records: WorkoutRecord[] }) {
  const [period, setPeriod] = useState<Period>('week')
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const buckets = useMemo(() => buildBuckets(records, period), [records, period])
  const maxValue = Math.max(0, ...buckets.map((b) => b.value))
  const niceMax = niceCeil(maxValue)

  // Bars grow up from the baseline on load, and replay the same grow-in
  // every time the Week/Month/Year scale changes — drop back to 0 first,
  // then animate up to the new values, instead of just morphing between them.
  const [grown, setGrown] = useState(false)
  useEffect(() => {
    setGrown(false)
    const t = setTimeout(() => setGrown(true), 30)
    return () => clearTimeout(t)
  }, [period])

  const plotWidth = VB_WIDTH - PAD.left - PAD.right
  const plotHeight = VB_HEIGHT - PAD.top - PAD.bottom
  const slot = plotWidth / Math.max(buckets.length, 1)
  const barWidth = Math.min(24, slot * 0.55)

  const yTicks = [0, 0.5, 1].map((f) => Math.round(niceMax * f))

  return (
    <div className="bg-[var(--bg-surface)] rounded-2xl shadow p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[var(--text-secondary)]">Calories burned</h2>
        <div className="relative flex text-xs font-medium bg-[var(--bg-inset)] rounded-full p-1">
          {/* Fixed width on both the sliding pill and the buttons — a
              percentage-width pill can't line up with auto/content-width
              buttons of different label lengths ("Week" vs "Month"), which
              overflowed the track on the last (widest) tab. */}
          <div
            className="absolute top-1 bottom-1 left-1 w-14 rounded-full transition-transform duration-200 ease-out"
            style={{
              backgroundColor: 'var(--primary-light)',
              transform: `translateX(${PERIODS.findIndex((p) => p.key === period) * 100}%)`,
            }}
          />
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`relative z-10 w-14 py-1 rounded-full transition cursor-pointer ${period === p.key ? '' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
              style={period === p.key ? { color: 'var(--primary-text)' } : undefined}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {maxValue === 0 ? (
        <div className="h-40 flex items-center justify-center text-sm text-[var(--text-muted)]">
          No workouts recorded {period === 'week' ? 'this week' : period === 'month' ? 'this month' : 'this year'} yet.
        </div>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`} className="w-full h-auto block" role="img" aria-label={`Calories burned per ${period === 'week' ? 'day' : period === 'month' ? 'week' : 'month'}`}>
            {yTicks.map((tick) => {
              const y = PAD.top + plotHeight - (tick / niceMax) * plotHeight
              return (
                <g key={tick}>
                  <line x1={PAD.left} x2={VB_WIDTH - PAD.right} y1={y} y2={y} stroke="var(--border)" strokeWidth={1} />
                  <text x={PAD.left - 8} y={y} textAnchor="end" dominantBaseline="middle" className="fill-[var(--text-muted)]" fontSize={11}>
                    {tick.toLocaleString()}
                  </text>
                </g>
              )
            })}

            {buckets.map((b, i) => {
              const x = PAD.left + i * slot + (slot - barWidth) / 2
              const h = grown ? (b.value / niceMax) * plotHeight : 0
              const y = PAD.top + plotHeight - h
              const isHovered = hoverIdx === i
              return (
                <g
                  key={i}
                  onPointerEnter={() => setHoverIdx(i)}
                  onPointerLeave={() => setHoverIdx((cur) => (cur === i ? null : cur))}
                  onFocus={() => setHoverIdx(i)}
                  onBlur={() => setHoverIdx((cur) => (cur === i ? null : cur))}
                  tabIndex={0}
                  className="cursor-pointer outline-none"
                >
                  {/* Transparent hit area, taller than the bar so short/zero bars stay hoverable */}
                  <rect x={x - 4} y={PAD.top} width={barWidth + 8} height={plotHeight} fill="transparent" />
                  {b.value > 0 && (
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={h}
                      rx={4}
                      fill="var(--primary)"
                      opacity={isHovered ? 1 : 0.85}
                      // No transition while collapsed — the reset to 0 snaps
                      // instantly so the grow-up (once `grown` flips back on)
                      // reads as a clean replay instead of a competing tween
                      // between the old and new heights.
                      className={grown ? 'transition-[height,y,opacity] duration-500 ease-out' : ''}
                    />
                  )}
                  <text x={x + barWidth / 2} y={VB_HEIGHT - 8} textAnchor="middle" className="fill-[var(--text-muted)]" fontSize={11}>
                    {b.label}
                  </text>
                </g>
              )
            })}
          </svg>

          {hoverIdx !== null && (
            <div
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap"
              style={{
                left: `${((PAD.left + hoverIdx * slot + slot / 2) / VB_WIDTH) * 100}%`,
                top: `${((PAD.top + plotHeight - (buckets[hoverIdx].value / niceMax) * plotHeight) / VB_HEIGHT) * 100}%`,
                marginTop: '-6px',
              }}
            >
              <span className="font-semibold">{buckets[hoverIdx].value.toLocaleString()} kcal</span>
              <span className="text-gray-300"> · {buckets[hoverIdx].fullLabel}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
