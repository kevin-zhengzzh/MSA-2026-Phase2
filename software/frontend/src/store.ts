import { create } from 'zustand'
import type { User } from './types'

interface AppState {
  // Auth
  token: string | null
  userId: number | null
  username: string | null
  setAuth: (token: string, userId: number, username: string) => void
  clearAuth: () => void

  // User profile + gamification
  user: User | null
  setUser: (user: User) => void

  // Active theme — applied as data-theme on <html>
  activeTheme: string
  setTheme: (theme: string) => void

  // Today's check-in state
  checkedInToday: boolean
  setCheckedInToday: (val: boolean) => void
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

  clearAuth: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    set({ token: null, userId: null, username: null, user: null, checkedInToday: false, activeTheme: 'default' })
  },

  user: null,
  setUser: (user) => set({ user }),

  activeTheme: 'default',
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme)
    set({ activeTheme: theme })
  },

  checkedInToday: false,
  setCheckedInToday: (val) => set({ checkedInToday: val }),
}))
