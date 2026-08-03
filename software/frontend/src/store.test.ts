import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useStore } from './store'
import type { User } from './types'

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    username: 'alice',
    email: 'alice@example.com',
    points: 0,
    streak: 0,
    lastCheckIn: null,
    createdAt: '2026-01-01T00:00:00Z',
    equippedSkinId: null,
    equippedTheme: 'default',
    avatarUrl: null,
    weeklyCalorieGoal: 2000,
    ...overrides,
  }
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  useStore.getState().clearAuth()
  useStore.setState({ toasts: [] })
})

describe('setAuth', () => {
  it('persists token/userId/username to localStorage and updates state', () => {
    useStore.getState().setAuth('tok-123', 42, 'bob')

    expect(useStore.getState().token).toBe('tok-123')
    expect(useStore.getState().userId).toBe(42)
    expect(useStore.getState().username).toBe('bob')
    expect(localStorage.getItem('token')).toBe('tok-123')
    expect(localStorage.getItem('userId')).toBe('42')
    expect(localStorage.getItem('username')).toBe('bob')
  })
})

describe('clearAuth', () => {
  it('wipes auth/user state, resets theme to default, and clears localStorage', () => {
    useStore.getState().setAuth('tok-123', 42, 'bob')
    useStore.getState().setUser(makeUser())
    useStore.getState().setTheme('midnight')
    useStore.getState().setCheckedInToday(true)

    useStore.getState().clearAuth()

    const state = useStore.getState()
    expect(state.token).toBeNull()
    expect(state.userId).toBeNull()
    expect(state.username).toBeNull()
    expect(state.user).toBeNull()
    expect(state.cachedAvatarUrl).toBeNull()
    expect(state.checkedInToday).toBe(false)
    expect(state.activeTheme).toBe('default')
    expect(document.documentElement.getAttribute('data-theme')).toBe('default')
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('userId')).toBeNull()
    expect(localStorage.getItem('username')).toBeNull()
    expect(localStorage.getItem('avatarUrl')).toBeNull()
  })
})

describe('setUser', () => {
  it('caches a non-null avatarUrl in localStorage', () => {
    useStore.getState().setUser(makeUser({ avatarUrl: '/avatars/1.png' }))

    expect(useStore.getState().cachedAvatarUrl).toBe('/avatars/1.png')
    expect(localStorage.getItem('avatarUrl')).toBe('/avatars/1.png')
  })

  it('removes any cached avatarUrl when the user has none', () => {
    localStorage.setItem('avatarUrl', '/avatars/old.png')

    useStore.getState().setUser(makeUser({ avatarUrl: null }))

    expect(useStore.getState().cachedAvatarUrl).toBeNull()
    expect(localStorage.getItem('avatarUrl')).toBeNull()
  })
})

describe('setUsername', () => {
  it('updates both the top-level username and the nested user, and persists it', () => {
    useStore.getState().setUser(makeUser({ username: 'alice' }))

    useStore.getState().setUsername('alice2')

    expect(useStore.getState().username).toBe('alice2')
    expect(useStore.getState().user?.username).toBe('alice2')
    expect(localStorage.getItem('username')).toBe('alice2')
  })
})

describe('setTheme', () => {
  it('sets the data-theme attribute on <html> and updates state', () => {
    useStore.getState().setTheme('ocean')

    expect(useStore.getState().activeTheme).toBe('ocean')
    expect(document.documentElement.getAttribute('data-theme')).toBe('ocean')
  })
})

describe('toasts', () => {
  it('pushToast adds a toast and auto-dismisses it after 4s', () => {
    vi.useFakeTimers()
    try {
      useStore.getState().pushToast('Saved!', 'success')
      expect(useStore.getState().toasts).toHaveLength(1)
      expect(useStore.getState().toasts[0]).toMatchObject({ message: 'Saved!', type: 'success' })

      vi.advanceTimersByTime(4000)
      expect(useStore.getState().toasts).toHaveLength(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it('defaults to type "error" when none is given', () => {
    useStore.getState().pushToast('Something went wrong')
    expect(useStore.getState().toasts[0].type).toBe('error')
  })

  it('dismissToast removes only the matching toast', () => {
    useStore.getState().pushToast('first')
    useStore.getState().pushToast('second')
    const [first, second] = useStore.getState().toasts

    useStore.getState().dismissToast(first.id)

    const remaining = useStore.getState().toasts
    expect(remaining).toHaveLength(1)
    expect(remaining[0].id).toBe(second.id)
  })
})

describe('refresh counters', () => {
  it('bumpWorkoutRefresh and bumpLeaderboardRefresh increment independently', () => {
    useStore.getState().bumpWorkoutRefresh()
    useStore.getState().bumpWorkoutRefresh()
    useStore.getState().bumpLeaderboardRefresh()

    expect(useStore.getState().workoutRefreshKey).toBe(2)
    expect(useStore.getState().leaderboardRefreshKey).toBe(1)
  })
})
