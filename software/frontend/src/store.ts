import { create } from 'zustand'
import type { RewardStatus, Skin, User } from './types'

interface AppState {
  // Auth
  token: string | null
  userId: number | null
  username: string | null
  setAuth: (token: string, userId: number, username: string) => void
  setUsername: (username: string) => void
  clearAuth: () => void

  // User profile + gamification
  user: User | null
  setUser: (user: User) => void

  // Mirrors user.avatarUrl in localStorage so it's available on first
  // render, before getMe() resolves — avoids a flash back to the default icon
  cachedAvatarUrl: string | null

  // Active theme — applied as data-theme on <html>
  activeTheme: string
  setTheme: (theme: string) => void

  // Today's check-in state
  checkedInToday: boolean
  setCheckedInToday: (val: boolean) => void

  // Toast notifications — bubble up transiently instead of shifting page layout
  toasts: Toast[]
  pushToast: (message: string, type?: 'success' | 'error') => void
  dismissToast: (id: number) => void

  // Store is a modal (not a route), so any page can open it without prop drilling
  storeOpen: boolean
  setStoreOpen: (open: boolean) => void

  // Skins list, kept globally so "can afford a skin" can be shown as a
  // notification dot outside the Store itself (e.g. on the user menu)
  skins: Skin[]
  setSkins: (skins: Skin[]) => void

  // Today's check-in/workout reward claim status — global so the Daily
  // Tasks menu in the header can show it from any page
  rewardStatus: RewardStatus | null
  setRewardStatus: (status: RewardStatus | null) => void

  // Bumped whenever a workout is recorded from the floating Record button
  // (shared across pages) — pages with their own workout list watch this
  // to know when to refetch
  workoutRefreshKey: number
  bumpWorkoutRefresh: () => void

  // Bumped whenever rewards are claimed from the header's Daily Tasks menu
  // (visible on every page, including Rank) — since points change, the
  // leaderboard watches this to know when to refetch
  leaderboardRefreshKey: number
  bumpLeaderboardRefresh: () => void
}

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

export const useStore = create<AppState>((set) => ({
  token: localStorage.getItem('token'),
  userId: localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null,
  username: localStorage.getItem('username'),

  setAuth: (token, userId, username) => {
    localStorage.setItem('token', token)
    localStorage.setItem('userId', String(userId))
    localStorage.setItem('username', username)
    set({ token, userId, username })
  },

  setUsername: (username) => {
    localStorage.setItem('username', username)
    set((s) => ({ username, user: s.user ? { ...s.user, username } : s.user }))
  },

  clearAuth: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    localStorage.removeItem('avatarUrl')
    // Reset the actual DOM attribute too — activeTheme alone is just state,
    // and the equipped skin's colors would otherwise persist on the
    // login/landing pages after signing out.
    document.documentElement.setAttribute('data-theme', 'default')
    set({ token: null, userId: null, username: null, user: null, cachedAvatarUrl: null, checkedInToday: false, activeTheme: 'default' })
  },

  user: null,
  setUser: (user) => {
    if (user.avatarUrl) localStorage.setItem('avatarUrl', user.avatarUrl)
    else localStorage.removeItem('avatarUrl')
    set({ user, cachedAvatarUrl: user.avatarUrl })
  },

  cachedAvatarUrl: localStorage.getItem('avatarUrl'),

  activeTheme: 'default',
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme)
    set({ activeTheme: theme })
  },

  checkedInToday: false,
  setCheckedInToday: (val) => set({ checkedInToday: val }),

  toasts: [],
  pushToast: (message, type = 'error') => {
    const id = Date.now() + Math.random()
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  storeOpen: false,
  setStoreOpen: (open) => set({ storeOpen: open }),

  skins: [],
  setSkins: (skins) => set({ skins }),

  rewardStatus: null,
  setRewardStatus: (rewardStatus) => set({ rewardStatus }),

  workoutRefreshKey: 0,
  bumpWorkoutRefresh: () => set((s) => ({ workoutRefreshKey: s.workoutRefreshKey + 1 })),

  leaderboardRefreshKey: 0,
  bumpLeaderboardRefresh: () => set((s) => ({ leaderboardRefreshKey: s.leaderboardRefreshKey + 1 })),
}))
