import { useState } from 'react'
import { assetUrl } from '../api'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import PersonIcon from './PersonIcon'

export default function UserMenu({
  username,
  points,
  avatarUrl,
  hasStoreNotification,
  onOpenStore,
  onOpenPoints,
  onAvatarUpload,
  onUpdateUsername,
  onSignOut,
}: {
  username: string | null
  points: number | null
  avatarUrl: string | null
  hasStoreNotification: boolean
  onOpenStore: () => void
  onOpenPoints: () => void
  onAvatarUpload: (file: File) => void
  onUpdateUsername: (username: string) => Promise<void>
  onSignOut: () => void
}) {
  const [open, setOpen] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [confirmingSignOut, setConfirmingSignOut] = useState(false)
  useLockBodyScroll(confirmingSignOut)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) onAvatarUpload(file)
  }

  function startEditName() {
    setDraftName(username ?? '')
    setEditingName(true)
  }

  function cancelEditName() {
    setEditingName(false)
  }

  async function saveEditName(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = draftName.trim()
    if (!trimmed || trimmed === username) {
      setEditingName(false)
      return
    }
    setSavingName(true)
    try {
      await onUpdateUsername(trimmed)
      setEditingName(false)
    } catch {
      // Error is surfaced via toast (see App.tsx) — keep the form open so
      // the user can adjust and retry.
    } finally {
      setSavingName(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full pl-1 pr-1 sm:pr-3 py-1 transition cursor-pointer hover:opacity-80"
        style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)' }}
      >
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            <img src={assetUrl(avatarUrl)} alt="" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
              <PersonIcon className="w-4 h-4 text-white" />
            </span>
          )}
          {hasStoreNotification && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-[var(--bg-surface)]" />
          )}
        </div>
        {username && <span className="hidden sm:inline text-sm font-medium max-w-[10rem] truncate">{username}</span>}
      </button>

      {open && (
      <>
      {/* Full-screen invisible backdrop — tapping anywhere outside the panel
          closes it, since touch devices have no hover-out event. */}
      <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
      {/* Right-aligned to the trigger pill, same as DailyTasksMenu. */}
      <div className="absolute right-0 top-full pt-2 z-20">
        <div className="bg-[var(--bg-surface)] rounded-lg shadow-lg py-3 w-52 text-sm text-[var(--text-secondary)]">
          <div className="flex flex-col items-center gap-2 pb-3 mb-1 border-b border-[var(--border-subtle)] px-4">
            <div className="relative w-16 h-16 rounded-full flex-shrink-0">
              {avatarUrl ? (
                <img src={assetUrl(avatarUrl)} alt="" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <span className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                  <PersonIcon className="w-8 h-8 text-white" />
                </span>
              )}

              {/* Always visible (not hover-only) — touch devices have no
                  hover state to reveal this tap target. */}
              <label
                htmlFor="avatar-upload-input"
                aria-label="Change profile picture"
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </label>
              <input
                id="avatar-upload-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {editingName ? (
              <form onSubmit={saveEditName} className="flex flex-col items-center gap-1.5 w-full">
                <input
                  autoFocus
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Escape') cancelEditName() }}
                  maxLength={30}
                  className="w-full border border-[var(--border-strong)] rounded px-2 py-1 text-sm text-center bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={cancelEditName}
                    className="text-xs px-2 py-1 rounded hover:bg-[var(--bg-inset)] cursor-pointer text-[var(--text-muted)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingName}
                    className="text-xs px-2 py-1 rounded font-semibold text-white cursor-pointer disabled:opacity-60"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    {savingName ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </form>
            ) : (
              username && (
                <span className="flex items-center gap-1.5">
                  <span className="font-medium text-[var(--text-primary)] truncate max-w-[8rem]">{username}</span>
                  <button
                    onClick={startEditName}
                    aria-label="Edit username"
                    title="Edit username"
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer p-0.5 flex-shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                  </button>
                </span>
              )
            )}
          </div>

          <button
            onClick={() => { onOpenStore(); setOpen(false) }}
            className="relative w-full text-left px-4 py-2 hover:bg-[var(--bg-inset)] cursor-pointer"
          >
            Store
            {hasStoreNotification && (
              <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-red-500" />
            )}
          </button>
          {points != null && (
            <button
              onClick={() => { onOpenPoints(); setOpen(false) }}
              className="w-full px-4 py-2 flex items-center justify-between text-[var(--text-muted)] border-t border-b border-[var(--border-subtle)] hover:bg-[var(--bg-inset)] cursor-pointer"
            >
              <span>Points</span>
              <span className="font-semibold" style={{ color: 'var(--primary-text)' }}>{points}</span>
            </button>
          )}
          <button
            onClick={() => setConfirmingSignOut(true)}
            className="w-full text-left px-4 py-2 hover:bg-[var(--bg-inset)] cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>
      </>
      )}

      {confirmingSignOut && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => setConfirmingSignOut(false)}
        >
          <div
            className="bg-[var(--bg-surface)] rounded-2xl shadow-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Sign out?</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">You'll need to log in again to get back to your dashboard.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmingSignOut(false)}
                className="flex-1 border border-[var(--border-strong)] text-[var(--text-secondary)] rounded-lg py-2 font-semibold hover:bg-[var(--bg-inset)] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSignOut}
                className="flex-1 bg-red-500 text-white rounded-lg py-2 font-semibold hover:bg-red-600 transition cursor-pointer"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
