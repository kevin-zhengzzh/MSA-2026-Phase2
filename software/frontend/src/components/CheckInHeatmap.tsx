import { useEffect, useMemo, useRef, useState } from 'react'
import type { CheckIn, WorkoutRecord } from '../types'

const HOVER_DELAY = 250 // ms — only shows the tooltip once the pointer has settled on a cell, like GitHub's graph
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const DAY_HEADER_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
// Nav row (‹ month/year ›) lives outside the centered calendar block, pinned
// right below the header — its height isn't part of GRID_HEIGHT bookkeeping.
const TITLE_ROW_HEIGHT = 22
const DAY_HEADER_ROW_HEIGHT = 14
const LEGEND_CELL = 10
const GRID_GAP = 2
// A fixed pixel height for the day-cell grid itself, shared by both views —
// cells fill it via CSS grid `1fr` tracks instead of being fixed-size with a
// scrollbar, so the card's frame is identical between Month and Year by
// construction (no scrollbar to appear/disappear and nudge the height, which
// used to reflow the page under the sticky sidebar every time you toggled).
const GRID_HEIGHT = 108

type Period = 'month' | 'year'
const PERIODS: { key: Period; label: string }[] = [
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
]
const PERIOD_LABEL: Record<Period, string> = { month: 'this month', year: 'this year' }

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

// Dates from the API are plain "YYYY-MM-DD" — parse as local midnight.
function parseLocalDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`)
}

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function startOfWeekSunday(d: Date) {
  const s = startOfDay(d)
  s.setDate(s.getDate() - s.getDay())
  return s
}

function addDays(d: Date, n: number) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

function ordinal(n: number) {
  const v = n % 100
  if (v >= 11 && v <= 13) return `${n}th`
  switch (n % 10) {
    case 1: return `${n}st`
    case 2: return `${n}nd`
    case 3: return `${n}rd`
    default: return `${n}th`
  }
}

// Both periods share the same [week][day] data shape; only the CSS grid's
// auto-flow direction (set at render time) decides whether weeks read as
// columns (Year) or rows (Month).
function buildWeeks(period: Period, monthAnchor: Date, viewedYear: number): Date[][] {
  let gridStart: Date
  let gridEnd: Date

  if (period === 'month') {
    const firstOfMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1)
    gridStart = startOfWeekSunday(firstOfMonth)
    gridEnd = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0)
  } else {
    // Calendar-aligned Jan 1 - Dec 31 of the viewed year, not a rolling
    // 53-week window — lets a past year be browsed to in full, same as Month.
    gridStart = startOfWeekSunday(new Date(viewedYear, 0, 1))
    gridEnd = new Date(viewedYear, 11, 31)
  }

  const weeks: Date[][] = []
  let cursor = new Date(gridStart)
  while (cursor <= gridEnd) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor))
      cursor = addDays(cursor, 1)
    }
    weeks.push(week)
  }
  return weeks
}

// Depth encodes that day's total calories burned (summed across every
// workout logged that day) — not how many separate records were logged —
// bucketed relative to the busiest check-in day on record. A checked-in day
// with no calories logged still gets the lightest level as a baseline.
function levelForCalories(calories: number, maxCalories: number) {
  if (calories <= 0 || maxCalories <= 0) return 1
  const ratio = calories / maxCalories
  if (ratio > 0.75) return 4
  if (ratio > 0.5) return 3
  if (ratio > 0.2) return 2
  return 1
}

const LEVEL_COLORS = [
  'var(--bg-inset)',
  'color-mix(in srgb, var(--primary) 30%, white)',
  'color-mix(in srgb, var(--primary) 55%, white)',
  'color-mix(in srgb, var(--primary) 80%, white)',
  'var(--primary-hover)',
]

// Shared prev/next control for both Month and Year nav rows.
function NavArrow({
  direction,
  onClick,
  disabled,
  label,
}: {
  direction: 'prev' | 'next'
  onClick: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex items-center justify-center w-5 h-5 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-inset)] cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
        <path d={direction === 'prev' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
      </svg>
    </button>
  )
}

interface Hover {
  key: string
  valueLabel: string
  dateLabel: string
  x: number
  y: number
  below: boolean
}

// Hoisted to module scope — defining this inside CheckInHeatmap's render
// would recreate the function (and thus its component identity) on every
// render, so React would unmount/remount every cell — replaying the
// cell-in entrance animation — on any parent re-render, including the ones
// hovering a cell triggers (setHover). A stable reference here means React
// just updates props on the existing DOM nodes instead.
function Cell({
  day,
  index,
  level,
  today,
  showDate,
  onEnter,
  onLeave,
}: {
  day: Date
  index: number
  level: number
  today: Date
  // Month view's cells are big enough to carry their day-of-month number,
  // reading like an actual calendar — Year view's are too small for text.
  showDate?: boolean
  onEnter: (e: React.PointerEvent | React.FocusEvent, day: Date) => void
  onLeave: (day: Date) => void
}) {
  const isFuture = day > today
  if (isFuture && !showDate) return <div />

  // Levels 3-4 use a dark enough green that muted gray text loses contrast —
  // switch to white past that point instead of tuning per-level manually.
  const textColor = isFuture ? 'var(--text-muted)' : level >= 3 ? '#fff' : 'var(--text-secondary)'

  return (
    <div
      className={`rounded-[3px] min-w-[3px] min-h-[3px] cell-in ${isFuture ? '' : 'cursor-pointer'} ${
        showDate ? 'flex items-center justify-center text-[9px] font-medium leading-none' : ''
      }`}
      style={{
        backgroundColor: isFuture ? 'var(--bg-page)' : LEVEL_COLORS[level],
        border: isFuture ? '1px dashed var(--border-subtle)' : undefined,
        color: textColor,
        animationDelay: `${Math.min(index * 2, 300)}ms`,
      }}
      onPointerEnter={isFuture ? undefined : (e) => onEnter(e, day)}
      onPointerLeave={isFuture ? undefined : () => onLeave(day)}
      onFocus={isFuture ? undefined : (e) => onEnter(e, day)}
      onBlur={isFuture ? undefined : () => onLeave(day)}
      tabIndex={isFuture ? undefined : 0}
    >
      {showDate ? day.getDate() : null}
    </div>
  )
}

export default function CheckInHeatmap({ checkIns, records }: { checkIns: CheckIn[]; records: WorkoutRecord[] }) {
  const [period, setPeriod] = useState<Period>('year')
  const [hover, setHover] = useState<Hover | null>(null)
  const today = useMemo(() => startOfDay(new Date()), [])

  // Which month Month-view is showing — 0 is the current month, negative
  // goes back. Independent of `today` (which stays the real date, still used
  // to blank out not-yet-happened days within whichever month is shown).
  const [monthOffset, setMonthOffset] = useState(0)
  const viewedMonthAnchor = useMemo(
    () => new Date(today.getFullYear(), today.getMonth() + monthOffset, 1),
    [today, monthOffset]
  )
  const isCurrentMonth = monthOffset === 0

  // Same idea as monthOffset, one calendar year at a time instead of a month.
  const [yearOffset, setYearOffset] = useState(0)
  const viewedYear = today.getFullYear() + yearOffset
  const isCurrentYear = yearOffset === 0

  const weeks = useMemo(
    () => buildWeeks(period, viewedMonthAnchor, viewedYear),
    [period, viewedMonthAnchor, viewedYear]
  )
  const cells = useMemo(() => weeks.flat(), [weeks])

  const { levelByDate, caloriesByDate, countInRange } = useMemo(() => {
    const checkedKeys = new Set(checkIns.map((c) => c.date))

    const caloriesByDate = new Map<string, number>()
    for (const r of records) caloriesByDate.set(r.date, (caloriesByDate.get(r.date) ?? 0) + r.calories)

    const maxCalories = Math.max(0, ...[...checkedKeys].map((k) => caloriesByDate.get(k) ?? 0))

    const levelByDate = new Map<string, number>()
    for (const key of checkedKeys) levelByDate.set(key, levelForCalories(caloriesByDate.get(key) ?? 0, maxCalories))

    // Both views' grids pad out to full calendar weeks, spilling a few days
    // into the adjacent month/year on either end — count only check-ins
    // actually inside the viewed month/year, not those padding days, so
    // browsing elsewhere doesn't double-count a shared edge week.
    const countInRange = period === 'month'
      ? checkIns.filter((c) => {
          const d = parseLocalDate(c.date)
          return d.getFullYear() === viewedMonthAnchor.getFullYear() && d.getMonth() === viewedMonthAnchor.getMonth()
        }).length
      : checkIns.filter((c) => parseLocalDate(c.date).getFullYear() === viewedYear).length

    return { levelByDate, caloriesByDate, countInRange }
  }, [checkIns, records, weeks, period, viewedMonthAnchor, viewedYear])

  const monthLabels = useMemo(() => {
    if (period !== 'year') return []
    const labels: { colIndex: number; label: string }[] = []
    let lastMonth = -1
    weeks.forEach((week, colIndex) => {
      const reference = week.find((d) => d.getDate() === 1) ?? week[0]
      if (reference.getMonth() !== lastMonth) {
        labels.push({ colIndex, label: reference.toLocaleDateString('en-US', { month: 'short' }) })
        lastMonth = reference.getMonth()
      }
    })
    return labels
  }, [period, weeks])

  const cardRef = useRef<HTMLDivElement>(null)
  const hoverTimerRef = useRef<number | null>(null)

  // Cancel any pending "show" so a fast sweep across many cells never queues
  // up a stale tooltip that pops in after the pointer has already moved on.
  function clearHoverTimer() {
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }
  useEffect(() => clearHoverTimer, [])

  // Scrolling (mouse wheel, page scroll) doesn't move the pointer relative
  // to the page, so the browser never fires pointerleave on the hovered
  // cell — without this, the tooltip would stay frozen at its old screen
  // position (now floating over whatever scrolled underneath it) until the
  // mouse was physically moved, unlike moving the pointer away which clears
  // it immediately.
  useEffect(() => {
    function handleScroll() {
      clearHoverTimer()
      setHover(null)
    }
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true })
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [])

  function tooltipFor(day: Date) {
    const key = toKey(day)
    const level = levelByDate.get(key) ?? 0
    const calories = caloriesByDate.get(key) ?? 0
    const dateLabel = `${day.toLocaleDateString('en-US', { month: 'long' })} ${ordinal(day.getDate())}`
    // Bold value + dimmed date joined by " · " — same two-tier hierarchy as
    // the calorie bar chart's tooltip, instead of one flat sentence.
    const valueLabel = level > 0 ? `${calories.toLocaleString()} kcal` : 'No check-in'
    return { key, level, valueLabel, dateLabel }
  }

  // Tooltip is rendered fixed-position (viewport coordinates), computed from
  // the hovered cell's live bounding rect, and clamped/anchored to the card.
  // It only appears after HOVER_DELAY, like GitHub's own contribution graph —
  // a fast sweep across many tiny cells fires enter/leave on each one far
  // quicker than a tooltip could usefully render, so showing instantly just
  // produces flicker (or, worse, a stale one that never got a matching leave
  // event before the pointer moved on). Delaying means only a cell the
  // pointer actually settles on ever shows anything.
  function handleEnter(e: React.PointerEvent | React.FocusEvent, day: Date) {
    const { key, valueLabel, dateLabel } = tooltipFor(day)
    const rect = e.currentTarget.getBoundingClientRect()
    const cardRect = cardRef.current?.getBoundingClientRect()
    const below = cardRect ? rect.top - cardRect.top < 70 : rect.top < 70

    clearHoverTimer()
    // Always centered exactly on the hovered cell — bubble and arrow move as
    // one unit (single shared transform), so the arrow can never drift onto
    // a neighboring cell.
    const nextHover: Hover = { key, valueLabel, dateLabel, x: rect.left + rect.width / 2, y: below ? rect.bottom : rect.top, below }
    hoverTimerRef.current = window.setTimeout(() => {
      hoverTimerRef.current = null
      setHover(nextHover)
    }, HOVER_DELAY)
  }
  function handleLeave(key: string) {
    clearHoverTimer()
    setHover((cur) => (cur?.key === key ? null : cur))
  }

  return (
    <div ref={cardRef} className="bg-[var(--bg-surface)] rounded-2xl shadow p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[var(--text-secondary)]">
          <span className="font-bold" style={{ color: 'var(--primary)' }}>{countInRange}</span> check-in{countInRange !== 1 ? 's' : ''}{' '}
          {period === 'month'
            ? isCurrentMonth
              ? 'this month'
              : `in ${viewedMonthAnchor.toLocaleDateString('en-US', { month: 'long' })}`
            : isCurrentYear
            ? PERIOD_LABEL[period]
            : `in ${viewedYear}`}
        </h2>
        <div className="relative flex text-xs font-medium bg-[var(--bg-inset)] rounded-full p-1">
          {/* Fixed width on both the sliding pill and the buttons — a
              percentage-width pill can't line up with auto/content-width
              buttons of different label lengths, which overflowed the
              track on the "Year" tab. */}
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

      {/* Nav row is pinned right below the header — independent of the
          centered block beneath it, so paging months/years never shifts
          its position. */}
      <div className="flex items-center justify-between mb-2" style={{ height: TITLE_ROW_HEIGHT }}>
        {period === 'month' ? (
          <>
            <NavArrow direction="prev" onClick={() => setMonthOffset((o) => o - 1)} label="Previous month" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              {viewedMonthAnchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <NavArrow
              direction="next"
              onClick={() => setMonthOffset((o) => Math.min(0, o + 1))}
              disabled={isCurrentMonth}
              label="Next month"
            />
          </>
        ) : (
          <>
            <NavArrow direction="prev" onClick={() => setYearOffset((o) => o - 1)} label="Previous year" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">{viewedYear}</span>
            <NavArrow
              direction="next"
              onClick={() => setYearOffset((o) => Math.min(0, o + 1))}
              disabled={isCurrentYear}
              label="Next year"
            />
          </>
        )}
      </div>

      {/* Centers the calendar block in whatever extra height the row-aligned
          card frame has, instead of leaving it glued to the top with dead
          space below. */}
      <div className="flex-1 flex flex-col justify-center">
      {period === 'year' ? (
        <div className="flex gap-2">
          <div className="flex-shrink-0">
            <div style={{ height: DAY_HEADER_ROW_HEIGHT }} />
            <div className="flex flex-col" style={{ height: GRID_HEIGHT }}>
              {DAY_LABELS.map((label, i) => (
                <div key={i} className="flex-1 flex items-center text-[10px] text-[var(--text-muted)] leading-none">
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="relative text-[10px] text-[var(--text-muted)]" style={{ height: DAY_HEADER_ROW_HEIGHT }}>
              {monthLabels.map((m) => (
                <span
                  key={m.colIndex}
                  className="absolute leading-none"
                  style={{ left: `${(m.colIndex / weeks.length) * 100}%` }}
                >
                  {m.label}
                </span>
              ))}
            </div>
            <div
              key={period}
              className="grid"
              style={{
                height: GRID_HEIGHT,
                gap: GRID_GAP,
                gridTemplateRows: 'repeat(7, 1fr)',
                gridAutoFlow: 'column',
                gridAutoColumns: '1fr',
              }}
            >
              {cells.map((day, i) => (
                <Cell
                  key={i}
                  day={day}
                  index={i}
                  level={levelByDate.get(toKey(day)) ?? 0}
                  today={today}
                  onEnter={handleEnter}
                  onLeave={(d) => handleLeave(toKey(d))}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Transposed from the year grid: each week is a horizontal row (days
        // run left-to-right) and weeks stack vertically, which reads better
        // than several skinny columns for a single month's span.
        <div>
          <div className="grid" style={{ gap: GRID_GAP, height: DAY_HEADER_ROW_HEIGHT, gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {DAY_HEADER_LABELS.map((label, i) => (
              <div key={i} className="text-[10px] text-[var(--text-muted)] text-center leading-none">
                {label}
              </div>
            ))}
          </div>
          <div
            key={period}
            className="grid"
            style={{
              height: GRID_HEIGHT,
              gap: GRID_GAP,
              gridTemplateColumns: 'repeat(7, 1fr)',
              gridTemplateRows: 'repeat(6, 1fr)',
              gridAutoFlow: 'row',
            }}
          >
            {cells.map((day, i) => (
              <Cell
                key={i}
                day={day}
                index={i}
                level={levelByDate.get(toKey(day)) ?? 0}
                today={today}
                showDate
                onEnter={handleEnter}
                onLeave={(d) => handleLeave(toKey(d))}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-1.5 mt-3 text-[11px] text-[var(--text-muted)]">
        <span>Less</span>
        {LEVEL_COLORS.map((color, i) => (
          <span key={i} className="rounded-[2px]" style={{ width: LEGEND_CELL, height: LEGEND_CELL, backgroundColor: color }} />
        ))}
        <span>More</span>
      </div>
      </div>

      {hover && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: hover.x,
            top: hover.y,
            transform: `translate(-50%, ${hover.below ? '8px' : 'calc(-100% - 8px)'})`,
          }}
        >
          <div className="relative bg-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap">
            <span className="font-semibold">{hover.valueLabel}</span>
            <span className="text-gray-300"> · {hover.dateLabel}</span>
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 ${hover.below ? 'bottom-full -mb-1' : 'top-full -mt-1'}`}
            />
          </div>
        </div>
      )}
    </div>
  )
}
