import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useStore } from './store'
import { getMe, uploadAvatar } from './api'
import Sidebar from './components/Sidebar'
import UserMenu from './components/UserMenu'
import StoreModal from './components/StoreModal'
import PointsHistoryModal from './components/PointsHistoryModal'
import ToastContainer from './components/ToastContainer'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import History from './pages/History'
import RecordHistory from './pages/RecordHistory'

// Home / Check-in History / Record History share the sidebar and are
// treated as one "Dashboard" section in the header nav's active state
const DASHBOARD_SECTION_PATHS = ['/', '/history', '/record-history']

function NavBar({ onOpenStore, onOpenPoints }: { onOpenStore: () => void; onOpenPoints: () => void }) {
  const { username, user, cachedAvatarUrl, setUser, clearAuth } = useStore()
  const location = useLocation()
  const inDashboardSection = DASHBOARD_SECTION_PATHS.includes(location.pathname)

  async function handleAvatarUpload(file: File) {
    await uploadAvatar(file)
    setUser(await getMe())
  }

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow" style={{ color: 'var(--primary)' }}>
      <span className="font-bold text-lg tracking-tight">HealthTrack</span>
      <nav className="flex gap-5 text-sm font-medium">
        <Link
          to="/"
          className={`px-3 py-1 rounded-full transition ${inDashboardSection ? '' : 'opacity-80 hover:opacity-100'}`}
          style={inDashboardSection ? { backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)' } : undefined}
        >
          Home
        </Link>
      </nav>
      <UserMenu
        username={username}
        points={user?.points ?? null}
        avatarUrl={user?.avatarUrl ?? cachedAvatarUrl}
        onOpenStore={onOpenStore}
        onOpenPoints={onOpenPoints}
        onAvatarUpload={handleAvatarUpload}
        onSignOut={clearAuth}
      />
    </header>
  )
}

function PrivateLayout() {
  const { token, user, setUser, setTheme } = useStore()
  const location = useLocation()
  const [storeOpen, setStoreOpen] = useState(false)
  const [pointsOpen, setPointsOpen] = useState(false)

  // Hooks must be called before any conditional return
  useEffect(() => {
    if (token) getMe().then(setUser).catch(console.error)
  }, [token])

  useEffect(() => {
    if (user?.equippedTheme) setTheme(user.equippedTheme)
  }, [user?.equippedTheme])

  if (!token) return <Navigate to="/login" replace />

  const showSidebar = DASHBOARD_SECTION_PATHS.includes(location.pathname)

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar onOpenStore={() => setStoreOpen(true)} onOpenPoints={() => setPointsOpen(true)} />
      <div className="flex pt-14">
        {showSidebar && <Sidebar />}
        <main className={`flex-1 h-[calc(100vh-3.5rem)] overflow-y-auto ${showSidebar ? 'ml-56' : ''}`}>
          <div className="max-w-2xl mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/history" element={<History />} />
              <Route path="/record-history" element={<RecordHistory />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
      {storeOpen && <StoreModal onClose={() => setStoreOpen(false)} />}
      {pointsOpen && <PointsHistoryModal onClose={() => setPointsOpen(false)} />}
    </div>
  )
}

export default function App() {
  const token = useStore((s) => s.token)
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/*" element={<PrivateLayout />} />
      </Routes>
    </BrowserRouter>
  )
}
