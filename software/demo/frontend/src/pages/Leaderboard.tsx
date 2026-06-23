import { useEffect, useState } from 'react'
import { getScores, createScore, deleteScore } from '../api'
import type { ScoreEntry } from '../types'

export default function Leaderboard() {
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [name, setName] = useState('')
  const [points, setPoints] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setScores(await getScores())
    } catch {
      setError('Could not reach the backend. Is it running on port 5000?')
    }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    const score = parseInt(points)
    if (!name.trim() || isNaN(score)) return
    await createScore(name.trim(), score)
    setName('')
    setPoints('')
    load()
  }

  const handleDelete = async (id: number) => {
    await deleteScore(id)
    load()
  }

  return (
    <div>
      <h2>Leaderboard</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          placeholder="Player name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          placeholder="Score"
          type="number"
          value={points}
          onChange={e => setPoints(e.target.value)}
          style={{ width: 80 }}
        />
        <button onClick={handleAdd}>Add</button>
      </div>

      {scores.length === 0 && !error && <p>No scores yet. Add one above!</p>}

      <ol>
        {scores.map((s, i) => (
          <li key={s.id} style={{ marginBottom: 8 }}>
            <strong>#{i + 1}</strong> {s.playerName} — {s.score} pts
            <button
              onClick={() => handleDelete(s.id)}
              style={{ marginLeft: 12, fontSize: 12 }}
            >
              Remove
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
