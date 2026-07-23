import { assetUrl } from '../api'

function PersonIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.76-3.58-5-8-5Z" />
    </svg>
  )
}

export default function UserMenu({
  username,
  points,
  avatarUrl,
  hasAffordableSkin,
  onOpenStore,
  onOpenPoints,
  onAvatarUpload,
  onSignOut,
}: {
  username: string | null
  points: number | null
  avatarUrl: string | null
  hasAffordableSkin: boolean
  onOpenStore: () => void
  onOpenPoints: () => void
  onAvatarUpload: (file: File) => void
  onSignOut: () => void
}) {
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) onAvatarUpload(file)
  }

  return (
    <div className="relative group">
      <div
        className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 transition cursor-pointer hover:opacity-80"
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
          {hasAffordableSkin && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </div>
        {username && <span className="text-sm font-medium max-w-[10rem] truncate">{username}</span>}
      </div>

      <div className="absolute right-0 top-full pt-2 hidden group-hover:block z-20">
        <div className="bg-white rounded-lg shadow-lg py-3 w-52 text-sm text-gray-700">
          <div className="flex flex-col items-center gap-2 pb-3 mb-1 border-b border-gray-100 px-4">
            <div className="relative w-16 h-16 rounded-full flex-shrink-0 group/avatar">
              {avatarUrl ? (
                <img src={assetUrl(avatarUrl)} alt="" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <span className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                  <PersonIcon className="w-8 h-8 text-white" />
                </span>
              )}

              <label
                htmlFor="avatar-upload-input"
                aria-label="Change profile picture"
                className="absolute inset-0 rounded-full bg-black/50 hidden group-hover/avatar:flex items-center justify-center cursor-pointer"
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
            {username && <span className="font-medium text-gray-800 truncate max-w-full">{username}</span>}
          </div>

          <button
            onClick={onOpenStore}
            className="relative w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            Store
            {hasAffordableSkin && (
              <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-red-500" />
            )}
          </button>
          {points != null && (
            <button
              onClick={onOpenPoints}
              className="w-full px-4 py-2 flex items-center justify-between text-gray-500 border-t border-b border-gray-100 hover:bg-gray-100 cursor-pointer"
            >
              <span>Points</span>
              <span className="font-semibold" style={{ color: 'var(--primary-text)' }}>{points}</span>
            </button>
          )}
          <button
            onClick={onSignOut}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
