import { NavLink } from 'react-router-dom'
import BackToTopButton from './BackToTopButton'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/history', label: 'Check-in History', end: false },
  { to: '/record-history', label: 'Record History', end: false },
]

export default function Sidebar() {
  return (
    <>
      {/* The "hug left edge" offset scales with how much gutter actually
          exists outside the max-w-7xl (1280px) container instead of jumping
          at a fixed breakpoint — clamp(0, gutter, 50px) eases in smoothly as
          the window widens past 1280px and never exceeds the real gutter. */}
      <aside
        className="w-full lg:w-56 lg:shrink-0 lg:sticky lg:top-22 bg-[var(--bg-surface)] rounded-2xl shadow p-3 overflow-x-auto"
        style={{ transform: 'translateX(clamp(-50px, calc((1280px - 100vw) / 2), 0px))' }}
      >
        <nav className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  isActive ? '' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-inset)]'
                }`
              }
              style={({ isActive }) => (isActive ? { backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)' } : undefined)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <BackToTopButton />
    </>
  )
}
