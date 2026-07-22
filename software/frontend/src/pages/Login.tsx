import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api'
import { useStore } from '../store'
import AuthHeader from '../components/AuthHeader'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const setAuth = useStore((s) => s.setAuth)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const res = await login(email, password)
      setAuth(res.token, res.userId, res.username)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />
      <div className="flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Sign in</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="bg-green-600 text-white rounded-lg py-2 font-semibold hover:bg-green-700 transition"
            >
              Sign in
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-4 text-center">
            No account? <Link to="/register" className="text-green-600 hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
