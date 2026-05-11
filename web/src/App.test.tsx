import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { PlaceholderScreen } from './screens/PlaceholderScreen'

describe('AppShell + PlaceholderScreen', () => {
  it('renders sidebar + placeholder for /h1/today', () => {
    render(
      <MemoryRouter initialEntries={['/h1/today']}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route path=":hyp/:screen" element={<PlaceholderScreen />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Agent Work Memory')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Today', level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})
