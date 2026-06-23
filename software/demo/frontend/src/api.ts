import type { ScoreEntry } from './types'

const BASE = 'http://localhost:5000/api/scores'

export async function getScores(): Promise<ScoreEntry[]> {
  const res = await fetch(BASE)
  if (!res.ok) throw new Error('Failed to fetch scores')
  return res.json()
}

export async function createScore(playerName: string, score: number): Promise<ScoreEntry> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName, score }),
  })
  if (!res.ok) throw new Error('Failed to create score')
  return res.json()
}

export async function deleteScore(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete score')
}
