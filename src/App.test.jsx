import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App.jsx'

// Mock fetch for frontend
beforeAll(() => {
  global.fetch = (url) => {
    if (url.startsWith('/api/list')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          items: [
            { type: 'folder', name: 'photos', key: 'photos/' },
            { type: 'file', name: 'cat.jpg', key: 'cat.jpg' },
          ],
        }),
      })
    }
    if (url.startsWith('/api/image')) {
      return Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        blob: () => Promise.resolve(new Blob()),
      })
    }
    return Promise.reject(new Error('Unknown endpoint'))
  }
})

describe('App (FileBrowser)', () => {
  it('renders folders and files', async () => {
    render(<App />)
    expect(screen.getByText('R2 File Browser')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('photos')).toBeInTheDocument()
      expect(screen.getByText('cat.jpg')).toBeInTheDocument()
    })
  })

  it('opens image preview on click', async () => {
    render(<App />)
    await waitFor(() => screen.getByText('cat.jpg'))
    fireEvent.click(screen.getByText('cat.jpg'))
    await waitFor(() => {
      expect(document.querySelector('img[alt="cat.jpg"]')).toBeInTheDocument()
    })
  })
})
