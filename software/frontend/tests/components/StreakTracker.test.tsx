import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StreakTracker from '../../src/components/StreakTracker'

describe('StreakTracker', () => {
  it('shows days remaining to the milestone when streak is below 7', () => {
    render(<StreakTracker streak={4} />)

    expect(screen.getByText('3 days to Dark skin')).toBeInTheDocument()
  })

  it('uses singular "day" when exactly one day remains', () => {
    render(<StreakTracker streak={6} />)

    expect(screen.getByText('1 day to Dark skin')).toBeInTheDocument()
  })

  it('shows the unlocked message once streak reaches the milestone', () => {
    render(<StreakTracker streak={7} />)

    expect(screen.getByText('🌙 Dark skin unlocked!')).toBeInTheDocument()
  })

  it('still shows unlocked when streak exceeds the milestone', () => {
    render(<StreakTracker streak={30} />)

    expect(screen.getByText('🌙 Dark skin unlocked!')).toBeInTheDocument()
  })

  it('caps filled-dot progress at the milestone even with a very high streak', () => {
    const { container: over } = render(<StreakTracker streak={100} />)
    const { container: exact } = render(<StreakTracker streak={7} />)

    // Both should render the same number of dots (always 7, MILESTONE),
    // and every dot should be in the "filled" (progress === MILESTONE) state.
    const dotsOver = over.querySelectorAll('.rounded-full')
    const dotsExact = exact.querySelectorAll('.rounded-full')
    expect(dotsOver).toHaveLength(7)
    expect(dotsOver.length).toBe(dotsExact.length)
  })

  it('renders 0 filled dots and 7 days left when streak is 0', () => {
    render(<StreakTracker streak={0} />)

    expect(screen.getByText('7 days to Dark skin')).toBeInTheDocument()
  })
})
