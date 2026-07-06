import { useEffect, useState } from 'react'
import { equipSkin, getMe, getSkins, purchaseSkin, unequipSkin } from '../api'
import { useStore } from '../store'
import { THEME_COLORS, type Skin } from '../types'

export default function Store() {
  const { user, setUser, setTheme } = useStore()
  const [skins, setSkins] = useState<Skin[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getSkins().then(setSkins).catch(console.error)
    getMe().then(setUser).catch(console.error)
  }, [])

  async function handlePurchase(skin: Skin) {
    setMessage('')
    setError('')
    try {
      const res = await purchaseSkin(skin.id)
      setMessage(res.message)
      const [updatedSkins, updatedUser] = await Promise.all([getSkins(), getMe()])
      setSkins(updatedSkins)
      setUser(updatedUser)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Purchase failed')
    }
  }

  async function handleEquip(skin: Skin) {
    setMessage('')
    setError('')
    try {
      const res = await equipSkin(skin.id)
      setTheme(res.theme)
      setMessage(`${skin.name} equipped!`)
      const [updatedSkins, updatedUser] = await Promise.all([getSkins(), getMe()])
      setSkins(updatedSkins)
      setUser(updatedUser)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Equip failed')
    }
  }

  async function handleUnequip() {
    setMessage('')
    setError('')
    try {
      await unequipSkin()
      setTheme('default')
      setMessage('Switched back to default theme.')
      const [updatedSkins, updatedUser] = await Promise.all([getSkins(), getMe()])
      setSkins(updatedSkins)
      setUser(updatedUser)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to unequip')
    }
  }

  const isDefaultEquipped = user?.equippedSkinId == null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Skin Store</h1>
        {user && (
          <span className="text-sm font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)' }}>
            {user.points} pts
          </span>
        )}
      </div>

      {message && <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{message}</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Default skin card */}
      <SkinCard
        name="Forest (Default)"
        description="The classic green look. Always free."
        theme="default"
        pointCost={0}
        isOwned
        isEquipped={isDefaultEquipped}
        onEquip={handleUnequip}
      />

      {/* Purchasable skins */}
      {skins.map((skin) => (
        <SkinCard
          key={skin.id}
          name={skin.name}
          description={skin.description}
          theme={skin.theme}
          pointCost={skin.pointCost}
          isOwned={skin.isOwned}
          isEquipped={skin.isEquipped}
          onPurchase={skin.isOwned ? undefined : () => handlePurchase(skin)}
          onEquip={skin.isOwned && !skin.isEquipped ? () => handleEquip(skin) : undefined}
        />
      ))}
    </div>
  )
}

function SkinCard({
  name, description, theme, pointCost, isOwned, isEquipped, onPurchase, onEquip,
}: {
  name: string
  description: string
  theme: string
  pointCost: number
  isOwned: boolean
  isEquipped: boolean
  onPurchase?: () => void
  onEquip?: () => void
}) {
  const colors = THEME_COLORS[theme] ?? THEME_COLORS.default

  return (
    <div className={`bg-white rounded-2xl shadow p-5 flex items-center gap-5 ${isEquipped ? 'ring-2' : ''}`}
      style={isEquipped ? { ringColor: colors.primary } : {}}>
      {/* Color preview */}
      <div className="w-16 h-16 rounded-xl flex-shrink-0" style={{ backgroundColor: colors.primary }} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-800">{name}</h3>
          {isEquipped && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: colors.primary }}>
              Equipped
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        <p className="text-sm font-medium mt-1" style={{ color: colors.primary }}>
          {pointCost === 0 ? 'Free' : `${pointCost} pts`}
        </p>
      </div>

      <div className="flex-shrink-0">
        {isEquipped ? (
          <span className="text-sm text-gray-400">Active</span>
        ) : onEquip ? (
          <button
            onClick={onEquip}
            className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition cursor-pointer"
            style={{ backgroundColor: colors.primary }}
          >
            Equip
          </button>
        ) : onPurchase ? (
          <button
            onClick={onPurchase}
            className="text-sm font-semibold px-4 py-2 rounded-lg border-2 transition cursor-pointer"
            style={{ borderColor: colors.primary, color: colors.primary }}
          >
            Buy
          </button>
        ) : null}
      </div>
    </div>
  )
}
