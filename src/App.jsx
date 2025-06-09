import { useState, useEffect } from 'react'
import { Folder, FileImage, ArrowLeft } from 'lucide-react'
import './App.css'

function FileBrowser() {
  const [path, setPath] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch(`/api/list?prefix=${encodeURIComponent(path)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then((data) => {
        setItems(data.items || [])
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [path])

  function openFolder(folder) {
    setPath(path ? path + folder + '/' : folder + '/')
  }
  function goUp() {
    if (!path) return
    const parts = path.split('/').filter(Boolean)
    parts.pop()
    setPath(parts.length ? parts.join('/') + '/' : '')
  }
  function openImage(key) {
    setPreview(key)
  }
  function closePreview() {
    setPreview(null)
  }

  return (
    <div>
      <h2>R2 File Browser</h2>
      <div style={{ textAlign: 'left', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ marginBottom: 8 }}>
          {path && (
            <button onClick={goUp} aria-label="Go up" style={{ marginRight: 8 }}>
              <ArrowLeft size={18} /> Up
            </button>
          )}
          <span style={{ color: '#888' }}>{'/' + path}</span>
        </div>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {items.map((item) => (
            <li key={item.key} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              {item.type === 'folder' ? (
                <>
                  <Folder size={18} style={{ marginRight: 6 }} />
                  <button style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer' }} onClick={() => openFolder(item.name)}>
                    {item.name}
                  </button>
                </>
              ) : (
                <>
                  <FileImage size={18} style={{ marginRight: 6 }} />
                  <button style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer' }} onClick={() => openImage(item.key)}>
                    {item.name}
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
        {preview && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={closePreview}>
            <img src={`/api/image?key=${encodeURIComponent(preview)}`} alt={preview} style={{ maxWidth: '90vw', maxHeight: '90vh', background: '#fff', padding: 8, borderRadius: 8 }} />
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  return <FileBrowser />
}

export default App
