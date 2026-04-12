import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const { userId } = await auth()

  if (userId) {
    redirect('/ask')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F1EFE8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: 'Arial, Helvetica, sans-serif'
    }}>
      <div style={{ maxWidth: '560px', width: '100%' }}>

        <div style={{ marginBottom: '48px' }}>
          <p style={{ fontSize: '13px', fontWeight: '500', color: '#7F77DD', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Brief
          </p>
          <h1 style={{ fontSize: '40px', fontWeight: '500', color: '#171717', lineHeight: '1.2', marginBottom: '16px' }}>
            Your team's memory,<br />on demand.
          </h1>
          <p style={{ fontSize: '16px', color: '#888780', lineHeight: '1.7' }}>
            Brief answers new hire questions instantly using your team's actual docs and decisions — and learns from every gap it can't fill.
          </p>
        </div>

        <div style={{ marginBottom: '48px' }}>
          {[
            { dot: '#7F77DD', text: 'Upload docs once, answer questions forever' },
            { dot: '#1D9E75', text: 'Flags what it doesn\'t know and learns from human answers' },
            { dot: '#EF9F27', text: 'Built for small teams who don\'t have time to maintain a wiki' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.dot, flexShrink: 0, marginTop: '6px' }} />
              <p style={{ fontSize: '15px', color: '#3d3d3a', lineHeight: '1.6' }}>{item.text}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            href='/sign-up'
            style={{
              background: '#534AB7',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '500',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Get started free →
          </Link>
          <Link
            href='/sign-in'
            style={{
              color: '#888780',
              fontSize: '14px',
              textDecoration: 'none'
            }}
          >
            Sign in
          </Link>
        </div>

        <p style={{ marginTop: '48px', fontSize: '12px', color: '#B4B2A9' }}>
          Built with Next.js, pgvector, and OpenAI — RAG pipeline from scratch.
        </p>

      </div>
    </div>
  )
}