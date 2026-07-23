import { useStore } from '../store'

export default function ToastContainer() {
  const toasts = useStore((s) => s.toasts)
  const dismissToast = useStore((s) => s.dismissToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className="rounded-full px-4 py-2 text-sm font-medium shadow-lg cursor-pointer pointer-events-auto max-w-sm text-center"
          style={{
            animation: 'toast-in 0.2s ease-out',
            backgroundColor: t.type === 'success' ? 'var(--primary-light)' : '#fee2e2',
            color: t.type === 'success' ? 'var(--primary-text)' : '#b91c1c',
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
