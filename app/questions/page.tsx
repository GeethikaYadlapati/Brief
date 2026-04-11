'use client'

import { useEffect, useState } from 'react'

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

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/questions')
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions || [])
        setLoading(false)
      })
  }, [])

  const answered = questions.filter(q => q.status === 'ANSWERED').length
  const flagged = questions.filter(q => q.status === 'FLAGGED').length

  if (loading) return <p style={{ padding: '24px', fontSize: '13px', color: '#888780' }}>Loading...</p>

  return (
    <div style={{ flex: 1 }}>
      <div style={{ borderBottom: '0.5px solid rgba(0,0,0,0.1)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '500', color: '#171717' }}>My questions</h2>
        <span style={{ fontSize: '11px', background: '#EEEDFE', color: '#3C3489', fontWeight: '500', padding: '3px 8px', borderRadius: '20px' }}>
          {questions.length} asked · {answered} answered · {flagged} flagged
        </span>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {questions.length === 0 && (
          <p style={{ fontSize: '13px', color: '#888780' }}>No questions yet. Go ask something!</p>
        )}

        {questions.map(q => (
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
      </div>
    </div>
  )
}