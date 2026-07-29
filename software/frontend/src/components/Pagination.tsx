import { useEffect, useState } from 'react'

export default function Pagination({
  page,
  totalPages,
  onChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (size: number) => void
}) {
  const [input, setInput] = useState(String(page))

  useEffect(() => {
    setInput(String(page))
  }, [page])

  function commit() {
    const val = Number(input)
    if (Number.isInteger(val)) {
      onChange(Math.min(totalPages, Math.max(1, val)))
    } else {
      setInput(String(page))
    }
  }

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {pageSizeOptions && onPageSizeChange && (
        <div className="text-sm text-[var(--text-muted)] flex items-center gap-1.5">
          Show
          <div className="flex rounded-lg border border-[var(--border-strong)] overflow-hidden">
            {pageSizeOptions.map((size, i) => (
              <button
                key={size}
                type="button"
                onClick={() => onPageSizeChange(size)}
                aria-pressed={pageSize === size}
                className={`px-2.5 py-1 text-sm font-medium cursor-pointer transition ${
                  i > 0 ? 'border-l border-[var(--border-strong)]' : ''
                } ${
                  pageSize === size
                    ? 'text-white'
                    : 'text-[var(--text-secondary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-inset)]'
                }`}
                style={pageSize === size ? { backgroundColor: 'var(--primary)' } : undefined}
              >
                {size}
              </button>
            ))}
          </div>
          per page
        </div>
      )}
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="text-sm font-medium px-3 py-1.5 rounded-lg border border-[var(--border-strong)] text-[var(--text-secondary)] hover:bg-[var(--bg-inset)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        Previous
      </button>
      <span className="text-sm text-[var(--text-muted)] flex items-center gap-1.5">
        Page
        <input
          type="number"
          min={1}
          max={totalPages}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
          className="w-12 text-center border border-[var(--border-strong)] rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        of {totalPages}
      </span>
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="text-sm font-medium px-3 py-1.5 rounded-lg border border-[var(--border-strong)] text-[var(--text-secondary)] hover:bg-[var(--bg-inset)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        Next
      </button>
    </div>
  )
}
