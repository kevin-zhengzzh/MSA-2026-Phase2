import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api'
import { useStore } from '../store'
import AuthHeader from '../components/AuthHeader'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const setAuth = useStore((s) => s.setAuth)
  const pushToast = useStore((s) => s.pushToast)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await register(username, email, password)
      setAuth(res.token, res.userId, res.username)
      navigate('/')
    } catch (err: unknown) {
      pushToast(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      <AuthHeader />
      <div className="flex items-center justify-center px-4 py-16">
        <div className="bg-[var(--bg-surface)] rounded-xl shadow p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Create account</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="border border-[var(--border-strong)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-[var(--border-strong)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="border border-[var(--border-strong)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
            <button
              type="submit"
              className="text-white rounded-lg py-2 font-semibold transition cursor-pointer"
              style={{ backgroundColor: 'var(--primary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
            >
              Register
            </button>
          </form>
          <p className="text-sm text-[var(--text-muted)] mt-4 text-center">
            Already have an account? <Link to="/login" className="hover:underline" style={{ color: 'var(--primary)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
