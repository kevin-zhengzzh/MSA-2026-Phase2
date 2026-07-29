export default function BackToTopButton() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      title="Back to top"
      className="fixed bottom-24 right-16 w-12 h-12 flex items-center justify-center text-white rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer z-30"
      style={{ backgroundColor: 'var(--primary)' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  )
}
