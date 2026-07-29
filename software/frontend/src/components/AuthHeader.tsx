import { Link } from 'react-router-dom'

export default function AuthHeader() {
  return (
    <header className="text-white px-6 py-3 shadow" style={{ backgroundColor: 'var(--primary)' }}>
      <Link to="/" className="font-bold text-lg tracking-tight">HealthTrack</Link>
    </header>
  )
}
