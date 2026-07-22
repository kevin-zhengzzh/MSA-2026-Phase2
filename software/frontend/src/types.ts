export interface User {
  id: number
  username: string
  email: string
  points: number
  streak: number
  lastCheckIn: string | null
  createdAt: string
  equippedSkinId: number | null
  equippedTheme: string
}

export interface CheckIn {
  id: number
  date: string
  note: string | null
  createdAt: string
}

export const WORKOUT_TYPES = ['Running', 'Cycling', 'Swimming', 'Gym', 'Yoga', 'Other'] as const

export interface WorkoutRecord {
  id: number
  workoutType: string
  calories: number
  createdAt: string
}

export interface WorkoutSubmitResult extends WorkoutRecord {
  pointsEarned: number
  totalPoints: number
}

export interface CheckInResult {
  id: number
  date: string
  pointsEarned: number
  totalPoints: number
  streak: number
}

export interface Skin {
  id: number
  name: string
  description: string
  pointCost: number
  theme: string
  isOwned: boolean
  isEquipped: boolean
}

export interface AuthResponse {
  token: string
  userId: number
  username: string
}

// Maps theme name → preview hex color
export const THEME_COLORS: Record<string, { primary: string; light: string }> = {
  default:  { primary: '#16a34a', light: '#dcfce7' },
  ocean:    { primary: '#2563eb', light: '#dbeafe' },
  sunset:   { primary: '#ea580c', light: '#ffedd5' },
  midnight: { primary: '#7c3aed', light: '#ede9fe' },
  cherry:   { primary: '#db2777', light: '#fce7f3' },
}
