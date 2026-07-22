import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/history', label: 'Check-in History', end: false },
  { to: '/record-history', label: 'Record History', end: false },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 min-h-[calc(100vh-56px)] py-6 px-3">
      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
            style={({ isActive }) => (isActive ? { backgroundColor: 'var(--primary)' } : undefined)}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
