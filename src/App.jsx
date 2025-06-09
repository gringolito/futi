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
      <h2>Futi 2.0 - Reservas</h2>
      <div style={{ textAlign: 'left', maxWidth: 800, margin: '0 auto' }}>
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
        {/* Folders */}
        <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
          {items.filter(i => i.type === 'folder').map((item) => (
            <li key={item.key} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <Folder size={18} style={{ marginRight: 6 }} />
              <button style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer' }} onClick={() => openFolder(item.name)}>
                {item.name}
              </button>
            </li>
          ))}
        </ul>
        {/* Images as thumbnails grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
        }}>
          {items.filter(i => i.type === 'file').map((item) => (
            <div key={item.key} style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => openImage(item.key)}>
              <div style={{ position: 'relative', width: '100%', paddingBottom: '66%', background: '#f3f3f3', borderRadius: 8, overflow: 'hidden', marginBottom: 6 }}>
                <img
                  src={`/api/image?key=${encodeURIComponent(item.key)}`}
                  alt={item.name}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  loading="lazy"
                />
              </div>
              <div style={{ fontSize: 14, color: '#333', wordBreak: 'break-all' }}>
                <FileImage size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                {item.name}
              </div>
            </div>
          ))}
        </div>
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
