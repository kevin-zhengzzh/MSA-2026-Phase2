import { useEffect } from 'react'
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useStore } from './store'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Store from './pages/Store'
import History from './pages/History'
import RecordHistory from './pages/RecordHistory'

function NavBar() {
  const { username, clearAuth } = useStore()
  return (
    <header className="text-white px-6 py-3 flex items-center justify-between shadow" style={{ backgroundColor: 'var(--primary)' }}>
      <span className="font-bold text-lg tracking-tight">HealthTrack</span>
      <nav className="flex gap-5 text-sm font-medium">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'underline' : 'opacity-80 hover:opacity-100'}>Home</NavLink>
        <NavLink to="/store" className={({ isActive }) => isActive ? 'underline' : 'opacity-80 hover:opacity-100'}>Store</NavLink>
      </nav>
      <button onClick={clearAuth} className="text-sm opacity-80 hover:opacity-100 cursor-pointer">
        Sign out ({username})
      </button>
    </header>
  )
}

function PrivateLayout() {
  const { token, user, setTheme } = useStore()
  const location = useLocation()

  // Hooks must be called before any conditional return
  useEffect(() => {
    if (user?.equippedTheme) setTheme(user.equippedTheme)
  }, [user?.equippedTheme])

  if (!token) return <Navigate to="/login" replace />

  const showSidebar = ['/', '/history', '/record-history'].includes(location.pathname)

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="flex">
        {showSidebar && <Sidebar />}
        <main className="flex-1 max-w-2xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/store" element={<Store />} />
            <Route path="/history" element={<History />} />
            <Route path="/record-history" element={<RecordHistory />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const token = useStore((s) => s.token)
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/*" element={<PrivateLayout />} />
      </Routes>
    </BrowserRouter>
  )
}
