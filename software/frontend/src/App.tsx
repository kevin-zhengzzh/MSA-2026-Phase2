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

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  )
}

function RankIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h2.5a1.5 1.5 0 0 1 1.5 1.5A3.5 3.5 0 0 1 17.5 10H17" />
      <path d="M7 5H4.5A1.5 1.5 0 0 0 3 6.5 3.5 3.5 0 0 0 6.5 10H7" />
    </svg>
  )
}

// The two top-level sections shown as a sliding-rail switcher in the header
const NAV_TABS = [
  { to: '/', label: 'Home', icon: HomeIcon, isActive: (p: string) => DASHBOARD_SECTION_PATHS.includes(p) },
  { to: '/rank', label: 'Rank', icon: RankIcon, isActive: (p: string) => p === '/rank' },
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
    <header className="fixed top-0 inset-x-0 z-40 h-14 bg-white border-b border-gray-200 shadow" style={{ color: 'var(--primary)' }}>
      {/* Same max-width + padding as the page body below, so the logo and
          right-side controls line up with the sidebar/content edges instead
          of the header's own independent inset. */}
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
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
                aria-label={tab.label}
                title={tab.label}
                className={`relative z-10 w-20 flex items-center justify-center px-3 py-1.5 rounded-full transition ${active ? '' : 'opacity-80 hover:opacity-100'}`}
                style={active ? { color: 'var(--primary-text)' } : undefined}
              >
                <tab.icon className="w-5 h-5" />
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
      <div className="pt-14">
        <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6 items-start">
          {showSidebar && <Sidebar />}
          {/* Content hugs the sidebar (no auto-margin) when one is showing —
              mx-auto only re-centers it on sidebar-less pages like Rank. */}
          <main className={`flex-1 min-w-0 ${showSidebar ? '' : 'mx-auto'} ${location.pathname === '/' ? 'max-w-5xl' : 'max-w-2xl'}`}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/history" element={<History />} />
              <Route path="/record-history" element={<RecordHistory />} />
              <Route path="/rank" element={<Rank />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
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
