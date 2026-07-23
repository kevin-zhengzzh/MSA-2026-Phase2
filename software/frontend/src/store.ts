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

  clearAuth: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    localStorage.removeItem('avatarUrl')
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
}))
