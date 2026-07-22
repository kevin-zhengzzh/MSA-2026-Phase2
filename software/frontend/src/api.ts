import type { AuthResponse, CheckIn, CheckInResult, Skin, User, WorkoutRecord, WorkoutSubmitResult } from './types'

const BASE = 'http://localhost:5000/api'

function authHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options?.headers ?? {}) },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err?.message ?? res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// Auth
export const register = (username: string, email: string, password: string) =>
  request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  })

export const login = (email: string, password: string) =>
  request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

// User
export const getMe = () => request<User>('/user/me')

// Check-in
function localDateStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const checkInToday = (note?: string) =>
  request<CheckInResult>(`/checkin?localDate=${localDateStr()}`, {
    method: 'POST',
    body: JSON.stringify(note ?? null),
  })

export const getTodayStatus = () =>
  request<{ checkedIn: boolean }>(`/checkin/today?localDate=${localDateStr()}`)

export const getCheckInHistory = () => request<CheckIn[]>('/checkin/history')

// Skins
export const getSkins = () => request<Skin[]>('/skin')

export const purchaseSkin = (id: number) =>
  request<{ message: string; remainingPoints: number }>(`/skin/${id}/purchase`, { method: 'POST' })

export const equipSkin = (id: number) =>
  request<{ theme: string }>(`/skin/${id}/equip`, { method: 'PUT' })

export const unequipSkin = () =>
  request<{ theme: string }>('/skin/equip', { method: 'DELETE' })

// Workout records
export const recordWorkout = (workoutType: string, calories: number) =>
  request<WorkoutSubmitResult>(`/workout?localDate=${localDateStr()}`, {
    method: 'POST',
    body: JSON.stringify({ workoutType, calories }),
  })

export const getWorkoutHistory = () => request<WorkoutRecord[]>('/workout')

export const getWorkoutTodayStatus = () =>
  request<{ recordedToday: boolean }>(`/workout/today?localDate=${localDateStr()}`)

export const updateWorkout = (id: number, workoutType: string, calories: number) =>
  request<WorkoutRecord>(`/workout/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ workoutType, calories }),
  })

export const deleteWorkout = (id: number) =>
  request<void>(`/workout/${id}`, { method: 'DELETE' })
