import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useStore } from './store'
import { claimRewards, getMe, getSkins, getTodayRewards, uploadAvatar } from './api'
import Sidebar from './components/Sidebar'
import UserMenu from './components/UserMenu'
import DailyTasksMenu from './components/DailyTasksMenu'
import StoreModal from './components/StoreModal'
import PointsHistoryModal from './components/PointsHistoryModal'
import ToastContainer from './components/ToastContainer'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import History from './pages/History'
import RecordHistory from './pages/RecordHistory'
import Rank from './pages/Rank'

// Home / Check-in History / Record History share the sidebar and are
// treated as one "Dashboard" section in the header nav's active state
const DASHBOARD_SECTION_PATHS = ['/', '/history', '/record-history']

// The two top-level sections shown as a sliding-rail switcher in the header
const NAV_TABS = [
  { to: '/', label: 'Home', isActive: (p: string) => DASHBOARD_SECTION_PATHS.includes(p) },
  { to: '/rank', label: 'Rank', isActive: (p: string) => p === '/rank' },
]

function NavBar({ onOpenStore, onOpenPoints }: { onOpenStore: () => void; onOpenPoints: () => void }) {
  const { username, user, cachedAvatarUrl, skins, rewardStatus, setUser, setRewardStatus, pushToast, clearAuth } = useStore()
  const location = useLocation()
  const activeTabIndex = NAV_TABS.findIndex((t) => t.isActive(location.pathname))
  const hasAffordableSkin = !!user && skins.some((s) => !s.isOwned && s.pointCost <= user.points)

  async function handleAvatarUpload(file: File) {
    await uploadAvatar(file)
    setUser(await getMe())
  }

  async function handleClaim() {
    try {
      const res = await claimRewards()
      pushToast(`+${res.claimedPoints} points claimed!`, 'success')
      const [updatedUser, updatedRewards] = await Promise.all([getMe(), getTodayRewards()])
      setUser(updatedUser)
      setRewardStatus(updatedRewards)
    } catch (err: unknown) {
      pushToast(err instanceof Error ? err.message : 'Nothing to claim right now.')
    }
  }

  return (
    <header className="fixed top-0 inset-x-0 z-40 h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow" style={{ color: 'var(--primary)' }}>
      <span className="font-bold text-lg tracking-tight">HealthTrack</span>
      <nav className="relative flex text-sm font-medium bg-gray-100 rounded-full p-1">
        <div
          className="absolute top-1 bottom-1 left-1 w-20 rounded-full transition-transform duration-200 ease-out"
          style={{
            backgroundColor: 'var(--primary-light)',
            transform: `translateX(${Math.max(activeTabIndex, 0) * 100}%)`,
            opacity: activeTabIndex === -1 ? 0 : 1,
          }}
        />
        {NAV_TABS.map((tab) => {
          const active = tab.isActive(location.pathname)
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`relative z-10 w-20 text-center px-3 py-1 rounded-full transition ${active ? '' : 'opacity-80 hover:opacity-100'}`}
              style={active ? { color: 'var(--primary-text)' } : undefined}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
      <div className="flex items-center gap-3">
        <DailyTasksMenu rewardStatus={rewardStatus} onClaim={handleClaim} />
        <UserMenu
          username={username}
          points={user?.points ?? null}
          avatarUrl={user?.avatarUrl ?? cachedAvatarUrl}
          hasAffordableSkin={hasAffordableSkin}
          onOpenStore={onOpenStore}
          onOpenPoints={onOpenPoints}
          onAvatarUpload={handleAvatarUpload}
          onSignOut={clearAuth}
        />
      </div>
    </header>
  )
}

function PrivateLayout() {
  const { token, user, setUser, setTheme, storeOpen, setStoreOpen, setSkins, setRewardStatus } = useStore()
  const location = useLocation()
  const [pointsOpen, setPointsOpen] = useState(false)

  // Hooks must be called before any conditional return
  useEffect(() => {
    if (token) {
      getMe().then(setUser).catch(console.error)
      getSkins().then(setSkins).catch(console.error)
      getTodayRewards().then(setRewardStatus).catch(console.error)
    }
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
              <Route path="/rank" element={<Rank />} />
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
