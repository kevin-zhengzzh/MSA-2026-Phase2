import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CheckIn } from '../types'

const { getCheckInHistory } = vi.hoisted(() => ({ getCheckInHistory: vi.fn() }))
vi.mock('../api', () => ({ getCheckInHistory }))

// Imported after the mock so History picks up the mocked api module.
const { default: History } = await import('./History')

function makeCheckIns(dates: string[]): CheckIn[] {
  return dates.map((date, i) => ({ id: i + 1, date, note: null, createdAt: `${date}T08:00:00Z` }))
}

beforeEach(() => {
  getCheckInHistory.mockReset()
})

describe('History', () => {
  it('shows an empty state when there are no check-ins', async () => {
    getCheckInHistory.mockResolvedValue([])
    render(<History />)

    expect(await screen.findByText(/No check-ins yet/)).toBeInTheDocument()
  })

  it('groups check-ins by month and shows a per-month count', async () => {
    getCheckInHistory.mockResolvedValue(makeCheckIns(['2026-07-01', '2026-07-02', '2026-06-15']))
    render(<History />)

    expect(await screen.findByText('July 2026')).toBeInTheDocument()
    expect(screen.getByText('June 2026')).toBeInTheDocument()
    expect(screen.getByText('2 check-ins this month')).toBeInTheDocument()
    expect(screen.getByText('1 check-in this month')).toBeInTheDocument()
  })

  it('paginates at the default page size of 10 and advances via Next', async () => {
    const dates = Array.from({ length: 15 }, (_, i) => `2026-07-${String(i + 1).padStart(2, '0')}`)
    getCheckInHistory.mockResolvedValue(makeCheckIns(dates))
    const user = userEvent.setup()
    render(<History />)

    expect(await screen.findByText('10 check-ins this month')).toBeInTheDocument()
    expect(screen.getByRole('spinbutton')).toHaveValue(1)

    await user.click(screen.getByRole('button', { name: 'Next' }))

    await waitFor(() => expect(screen.getByText('5 check-ins this month')).toBeInTheDocument())
  })

  it('changing the page size resets back to page 1', async () => {
    const dates = Array.from({ length: 12 }, (_, i) => `2026-07-${String(i + 1).padStart(2, '0')}`)
    getCheckInHistory.mockResolvedValue(makeCheckIns(dates))
    const user = userEvent.setup()
    render(<History />)

    await screen.findByText('10 check-ins this month')
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await waitFor(() => expect(screen.getByText('2 check-ins this month')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: '5' }))

    await waitFor(() => expect(screen.getByText('5 check-ins this month')).toBeInTheDocument())
  })
})
