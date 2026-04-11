'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

type Question = {
  id: string
  content: string
  status: string
  createdAt: string
  answer?: {
    content: string
    citations: {
      chunk: {
        source: {
          title: string
          createdAt: string
        }
      }
    }[]
  }
  gap?: {
    humanAnswer?: {
      content: string
      answeredBy: {
        name: string | null
        email: string
      }
    }
    resolvedAt?: string
  }
}

export default function AskPage() {
  const { user } = useUser()
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [flagged, setFlagged] = useState(false)
  const [newAnswer, setNewAnswer] = useState('')
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([])

  const dayOfOnboarding = user?.createdAt
    ? Math.ceil((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 1

  const fetchQuestions = () => {
    fetch('/api/questions')
      .then(res => res.json())
      .then(data => setRecentQuestions((data.questions || []).slice(0, 3)))
  }

  useEffect(() => { fetchQuestions() }, [])

  const handleAsk = async () => {
    if (!question.trim()) return
    setLoading(true)
    setNewAnswer('')
    setFlagged(false)

    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    })

    const data = await res.json()
    if (data.flagged) setFlagged(true)
    else setNewAnswer(data.answer)

    setQuestion('')
    fetchQuestions()
    setLoading(false)
  }

  return (
    <div style={{ flex: 1 }}>
      <div style={{ borderBottom: '0.5px solid rgba(0,0,0,0.1)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '500', color: '#171717' }}>Ask a question</h2>
        <span style={{ fontSize: '11px', background: '#EEEDFE', color: '#3C3489', fontWeight: '500', padding: '3px 8px', borderRadius: '20px' }}>
          Day {dayOfOnboarding} of onboarding
        </span>
      </div>

      <div style={{ padding: '20px 24px' }}>
        <div style={{ background: '#F1EFE8', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="What do you want to understand about how we work?"
            style={{
              width: '100%',
              background: 'white',
              border: '0.5px solid rgba(0,0,0,0.2)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '14px',
              color: '#171717',
              resize: 'none',
              height: '68px',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
          <button
            onClick={handleAsk}
            disabled={loading}
            style={{
              marginTop: '8px',
              background: '#F1EFE8',
              color: '#5F5E5A',
              border: '0.5px solid rgba(0,0,0,0.15)',
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontFamily: 'inherit',
              fontWeight: '500'
            }}
          >
            {loading ? 'Thinking...' : 'Ask Brief'}
          </button>
        </div>

        {flagged && (
          <div style={{ border: '0.5px solid #FAC775', background: '#FAEEDA44', borderRadius: '12px', padding: '14px 16px', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#BA7517' }}>Brief couldn't find a confident answer</p>
            <p style={{ fontSize: '13px', color: '#BA7517', marginTop: '4px' }}>Your question has been flagged for the team.</p>
          </div>
        )}

        {newAnswer && (
          <div style={{ border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '14px 16px', marginBottom: '12px', background: 'white' }}>
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#B4B2A9', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Answer</p>
            <p style={{ fontSize: '13px', color: '#3d3d3a', lineHeight: '1.6' }}>{newAnswer}</p>
          </div>
        )}

        {recentQuestions.length > 0 && (
          <>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#B4B2A9', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Recent answers
            </p>
            {recentQuestions.map(q => (
              <div key={q.id} style={{ border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '14px 16px', marginBottom: '12px', background: 'white' }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#171717', marginBottom: '8px' }}>{q.content}</p>

                {q.status === 'ANSWERED' && q.answer && (
  <>
    <p style={{ fontSize: '13px', color: '#888780', lineHeight: '1.6' }}>{q.answer.content}</p>
    <div style={{ marginTop: '8px', fontSize: '11px', color: '#534AB7', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
    {(q.answer.citations || []).slice(0, 2).map((c, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#534AB7', display: 'inline-block' }} />
          {c.chunk.source.title}
        </span>
      ))}
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#534AB7', display: 'inline-block' }} />
        {new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </span>
    </div>
  </>
)}

                {q.status === 'FLAGGED' && (
                  <>
                    <p style={{ fontSize: '13px', color: '#BA7517' }}>Brief couldn't find a confident answer. Flagged for the team.</p>
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#BA7517', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#BA7517', display: 'inline-block' }} />
                      Awaiting team response
                    </div>
                  </>
                )}

{q.status === 'RESOLVED' && q.gap?.humanAnswer && (
  <>
    <p style={{ fontSize: '13px', color: '#888780', lineHeight: '1.6' }}>
      {q.gap.humanAnswer.content}
    </p>
    <div style={{ marginTop: '8px', fontSize: '11px', color: '#534AB7', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#534AB7', display: 'inline-block' }} />
      Answered by {q.gap.humanAnswer.answeredBy?.name || q.gap.humanAnswer.answeredBy?.email || 'team'}
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#534AB7', display: 'inline-block', marginLeft: '4px' }} />
      {q.gap.resolvedAt
        ? new Date(q.gap.resolvedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
    </div>
  </>
)}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}