'use client'

import { useEffect, useState } from 'react'

type Gap = {
    id: string
    createdAt: string
    question: {
      id: string
      content: string
      createdAt: string
      askedBy: {
        name: string | null
        email: string
      }
    }
    humanAnswer?: {
      content: string
    }
  }

export default function GapsPage() {
  const [gaps, setGaps] = useState<Gap[]>([])
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch('/api/gaps')
      .then(res => res.json())
      .then(data => {
        setGaps(data.gaps || [])
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (gapId: string) => {
    const content = answers[gapId]
    if (!content?.trim()) return

    setSubmitting(prev => ({ ...prev, [gapId]: true }))

    await fetch('/api/gaps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gapId, content })
    })

    setGaps(prev => prev.filter(g => g.id !== gapId))
    setSubmitting(prev => ({ ...prev, [gapId]: false }))
  }

  if (loading) return <p style={{ padding: '24px', fontSize: '13px', color: '#888780' }}>Loading...</p>

  return (
    <div style={{ flex: 1 }}>
      <div style={{ borderBottom: '0.5px solid rgba(0,0,0,0.1)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '500', color: '#171717' }}>Gaps to fill</h2>
        <span style={{ fontSize: '11px', background: '#FAEEDA', color: '#633806', fontWeight: '500', padding: '3px 8px', borderRadius: '20px' }}>
          {gaps.length} unanswered
        </span>
      </div>

      <div style={{ padding: '20px 24px' }}>
        <p style={{ fontSize: '13px', color: '#888780', marginBottom: '16px' }}>
          Brief couldn't answer these. A 2-minute response becomes a permanent answer for all future hires.
        </p>

        {gaps.length === 0 && (
          <p style={{ fontSize: '13px', color: '#888780' }}>No gaps right now. Brief answered everything!</p>
        )}

        {gaps.map(gap => (
          <div key={gap.id} style={{ border: '0.5px solid #FAC775', background: '#FAEEDA22', borderRadius: '12px', padding: '14px 16px', marginBottom: '10px' }}>
            <p style={{ fontSize: '13px', color: '#171717', marginBottom: '4px' }}>{gap.question.content}</p>
            <p style={{ fontSize: '12px', color: '#B4B2A9', marginBottom: '10px' }}>
                Asked by {gap.question.askedBy?.name || gap.question.askedBy?.email || 'someone'} · {new Date(gap.question.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <input
              value={answers[gap.id] || ''}
              onChange={e => setAnswers(prev => ({ ...prev, [gap.id]: e.target.value }))}
              placeholder="Type your answer here..."
              style={{
                width: '100%',
                border: '0.5px solid rgba(0,0,0,0.15)',
                borderRadius: '8px',
                padding: '8px 10px',
                fontSize: '13px',
                color: '#171717',
                background: 'white',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            />
            <button
              onClick={() => handleSubmit(gap.id)}
              disabled={submitting[gap.id]}
              style={{
                marginTop: '8px',
                background: '#EF9F27',
                color: '#412402',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: submitting[gap.id] ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontFamily: 'inherit',
                opacity: submitting[gap.id] ? 0.6 : 1
              }}
            >
              {submitting[gap.id] ? 'Saving...' : 'Answer + save to Brief'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}