import Store from '../pages/Store'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'

export default function StoreModal({ onClose }: { onClose: () => void }) {
  useLockBodyScroll(true)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-page)] rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[85vh] overflow-y-auto p-6">
          <Store />
        </div>
      </div>
    </div>
  )
}
