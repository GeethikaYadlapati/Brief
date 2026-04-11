'use client'

import { useEffect, useState } from 'react'

type Stats = {
  totalQuestions: number
  answeredQuestions: number
  flaggedQuestions: number
  totalSources: number
  totalGaps: number
  resolvedGaps: number
}

type Activity = {
  id: string
  type: 'answered' | 'flagged' | 'resolved'
  text: string
  createdAt: string
  dotColor: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [activity, setActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setStats(data.stats)
        setActivity(data.activity || [])
        setLoading(false)
      })
  }, [])

  if (loading) return <p style={{ padding: '24px', fontSize: '13px', color: '#888780' }}>Loading...</p>
  if (!stats) return <p style={{ padding: '24px', fontSize: '13px', color: '#888780' }}>No data yet.</p>

  const answerRate = stats.totalQuestions > 0
    ? Math.round((stats.answeredQuestions / stats.totalQuestions) * 100)
    : 0

  return (
    <div style={{ flex: 1 }}>
      <div style={{ borderBottom: '0.5px solid rgba(0,0,0,0.1)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '500', color: '#171717' }}>Dashboard</h2>
        <span style={{ fontSize: '11px', background: '#FAECE7', color: '#712B13', fontWeight: '500', padding: '3px 8px', borderRadius: '20px' }}>
          {stats.totalQuestions} questions total
        </span>
      </div>

      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: '#F1EFE8', borderRadius: '8px', padding: '14px' }}>
            <p style={{ fontSize: '12px', color: '#888780', marginBottom: '4px' }}>Questions asked</p>
            <p style={{ fontSize: '22px', fontWeight: '500', color: '#171717' }}>{stats.totalQuestions}</p>
            <p style={{ fontSize: '11px', color: '#B4B2A9', marginTop: '2px' }}>total</p>
          </div>
          <div style={{ background: '#F1EFE8', borderRadius: '8px', padding: '14px' }}>
            <p style={{ fontSize: '12px', color: '#888780', marginBottom: '4px' }}>Auto-answered</p>
            <p style={{ fontSize: '22px', fontWeight: '500', color: '#171717' }}>{answerRate}%</p>
            <p style={{ fontSize: '11px', color: '#B4B2A9', marginTop: '2px' }}>{stats.answeredQuestions} of {stats.totalQuestions}</p>
          </div>
          <div style={{ background: '#F1EFE8', borderRadius: '8px', padding: '14px' }}>
            <p style={{ fontSize: '12px', color: '#888780', marginBottom: '4px' }}>Gaps resolved</p>
            <p style={{ fontSize: '22px', fontWeight: '500', color: '#171717' }}>{stats.resolvedGaps}</p>
            <p style={{ fontSize: '11px', color: '#B4B2A9', marginTop: '2px' }}>of {stats.totalGaps} total</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '10px', marginBottom: '20px' }}>
          <div style={{ border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '14px', background: 'white' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#B4B2A9', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>Questions</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#888780' }}>Answered</span>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#171717' }}>{stats.answeredQuestions}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#888780' }}>Flagged</span>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#BA7517' }}>{stats.flaggedQuestions}</span>
            </div>
          </div>
          <div style={{ border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '14px', background: 'white' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#B4B2A9', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>Knowledge</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#888780' }}>Sources</span>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#171717' }}>{stats.totalSources}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#888780' }}>Open gaps</span>
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#BA7517' }}>{stats.totalGaps - stats.resolvedGaps}</span>
            </div>
          </div>
        </div>

        {activity.length > 0 && (
          <>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#B4B2A9', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
              Recent activity
            </p>
            {activity.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 0', borderBottom: '0.5px solid rgba(0,0,0,0.1)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.dotColor, marginTop: '4px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '13px', color: '#888780', lineHeight: '1.5' }}>{item.text}</p>
                  <p style={{ fontSize: '11px', color: '#B4B2A9', marginTop: '2px' }}>
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}