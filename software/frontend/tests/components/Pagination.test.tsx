import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Pagination from '../../src/components/Pagination'

describe('Pagination', () => {
  it('disables Previous on the first page and Next on the last page', () => {
    render(<Pagination page={1} totalPages={3} onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()
  })

  it('calls onChange with page - 1 / page + 1 when clicking Previous/Next', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Pagination page={2} totalPages={3} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(onChange).toHaveBeenCalledWith(3)

    await user.click(screen.getByRole('button', { name: 'Previous' }))
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('clamps a typed page number above totalPages down to totalPages on blur', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Pagination page={1} totalPages={5} onChange={onChange} />)

    const input = screen.getByRole('spinbutton')
    await user.clear(input)
    await user.type(input, '99')
    await user.tab()

    expect(onChange).toHaveBeenCalledWith(5)
  })

  it('clamps a typed page number below 1 up to 1 on blur', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Pagination page={3} totalPages={5} onChange={onChange} />)

    const input = screen.getByRole('spinbutton')
    await user.clear(input)
    await user.type(input, '-4')
    await user.tab()

    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('reverts to the current page instead of calling onChange when the input is not a valid integer', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Pagination page={2} totalPages={5} onChange={onChange} />)

    const input = screen.getByRole('spinbutton')
    await user.clear(input)
    await user.type(input, '2.5')
    await user.tab()

    expect(onChange).not.toHaveBeenCalled()
    expect(input).toHaveValue(2)
  })

  it('renders page size options and calls onPageSizeChange when one is clicked', async () => {
    const user = userEvent.setup()
    const onPageSizeChange = vi.fn()
    render(
      <Pagination
        page={1}
        totalPages={2}
        onChange={vi.fn()}
        pageSize={10}
        pageSizeOptions={[5, 10, 20]}
        onPageSizeChange={onPageSizeChange}
      />
    )

    expect(screen.getByRole('button', { name: '10' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: '20' }))
    expect(onPageSizeChange).toHaveBeenCalledWith(20)
  })
})
