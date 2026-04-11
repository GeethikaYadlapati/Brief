'use client'

import { useEffect, useState } from 'react'

type Source = {
  id: string
  title: string
  type: string
  createdAt: string
  chunks: { id: string }[]
}

const typeColors: Record<string, { bg: string; color: string }> = {
  DOCUMENT: { bg: '#EEEDFE', color: '#3C3489' },
  SLACK_EXPORT: { bg: '#FAEEDA', color: '#633806' },
  MANUAL_QA: { bg: '#E1F5EE', color: '#085041' }
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState('DOCUMENT')
  const [uploading, setUploading] = useState(false)

  const fetchSources = () => {
    fetch('/api/source')
      .then(res => res.json())
      .then(data => {
        setSources(data.sources || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchSources() }, [])

  const handleUpload = async () => {
    if (!title.trim() || !content.trim()) return
    setUploading(true)

    await fetch('/api/source', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, type })
    })

    setTitle('')
    setContent('')
    fetchSources()
    setUploading(false)
  }

  if (loading) return <p style={{ padding: '24px', fontSize: '13px', color: '#888780' }}>Loading...</p>

  const totalChunks = sources.reduce((acc, s) => acc + s.chunks.length, 0)

  return (
    <div style={{ flex: 1 }}>
      <div style={{ borderBottom: '0.5px solid rgba(0,0,0,0.1)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '500', color: '#171717' }}>Knowledge sources</h2>
        <span style={{ fontSize: '11px', background: '#E1F5EE', color: '#085041', fontWeight: '500', padding: '3px 8px', borderRadius: '20px' }}>
          {sources.length} sources · {totalChunks} chunks
        </span>
      </div>

      <div style={{ padding: '20px 24px' }}>

        <div style={{ border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '16px', background: 'white' }}>
          <p style={{ fontSize: '13px', fontWeight: '500', color: '#171717', marginBottom: '12px' }}>Add a source</p>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title (e.g. Architecture decisions)"
            style={{ width: '100%', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: '8px', padding: '8px 10px', fontSize: '13px', color: '#171717', fontFamily: 'inherit', outline: 'none', marginBottom: '8px' }}
          />
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            style={{ width: '100%', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: '8px', padding: '8px 10px', fontSize: '13px', color: '#171717', fontFamily: 'inherit', outline: 'none', marginBottom: '8px', background: 'white' }}
          >
            <option value="DOCUMENT">Document</option>
            <option value="SLACK_EXPORT">Slack export</option>
            <option value="MANUAL_QA">Manual Q&A</option>
          </select>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Paste your content here..."
            style={{ width: '100%', border: '0.5px solid rgba(0,0,0,0.15)', borderRadius: '8px', padding: '8px 10px', fontSize: '13px', color: '#171717', fontFamily: 'inherit', outline: 'none', resize: 'none', height: '100px', marginBottom: '8px' }}
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{ background: '#534AB7', color: 'white', border: 'none', padding: '7px 16px', borderRadius: '8px', fontSize: '13px', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1, fontFamily: 'inherit', fontWeight: '500' }}
          >
            {uploading ? 'Processing...' : 'Add source'}
          </button>
        </div>

        {sources.length > 0 && (
          <>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#B4B2A9', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {sources.length} sources
            </p>
            {sources.map(source => {
              const colors = typeColors[source.type] || typeColors.DOCUMENT
              const initial = source.title.charAt(0).toUpperCase()
              return (
                <div key={source.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '8px', marginBottom: '8px', background: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: colors.bg, color: colors.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '500', flexShrink: 0 }}>
                      {initial}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: '#171717' }}>{source.title}</p>
                      <p style={{ fontSize: '12px', color: '#B4B2A9', marginTop: '2px' }}>
                        {source.type.replace('_', ' ').toLowerCase()} · {source.chunks.length} chunks · Added {new Date(source.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', background: '#E1F5EE', color: '#085041', fontWeight: '500', padding: '3px 8px', borderRadius: '20px' }}>
                    active
                  </span>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}