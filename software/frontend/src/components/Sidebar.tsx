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
      <aside className="w-56 shrink-0 sticky top-22 -translate-x-[50px] bg-[var(--bg-surface)] rounded-2xl shadow p-3">
        <nav className="flex flex-col gap-1">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition ${
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
