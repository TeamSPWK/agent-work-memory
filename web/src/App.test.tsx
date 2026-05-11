import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders bootstrap heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Agent Work Memory', level: 1 })).toBeInTheDocument()
  })
})
