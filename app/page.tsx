import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const { userId } = await auth()

  if (userId) {
    redirect('/ask')
  }

  return (
    <>
      <style>{`
  @keyframes typing {
    from { width: 0 }
    to { width: 100% }
  }
  @keyframes typing2 {
    from { width: 0 }
    to { width: 100% }
  }
  @keyframes blink {
    0%, 100% { border-color: #534AB7 }
    50% { border-color: transparent }
  }
  @keyframes removeCursor {
    to { border-color: transparent }
  }
  .typing-line {
    overflow: hidden;
    white-space: nowrap;
    border-right: 2px solid #534AB7;
    animation: typing 1.5s steps(30) forwards, removeCursor 0s 1.5s forwards;
    width: 0;
  }
  .typing-line-2 {
    overflow: hidden;
    white-space: nowrap;
    border-right: 2px solid #534AB7;
    animation: typing2 1.5s steps(30) 1.6s forwards, blink 0.7s step-end 1.6s infinite;
    width: 0;
  }
`}</style>

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

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#534AB7',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>B</span>
            </div>
            <span style={{ fontSize: '20px', fontWeight: '500', color: '#171717' }}>Brief</span>
          </div>

          <h1 style={{ fontSize: '40px', fontWeight: '500', color: '#171717', lineHeight: '1.4', marginBottom: '16px' }}>
            <div className="typing-line">Your team's memory,</div>
            <div className="typing-line-2">on demand.</div>
          </h1>

          <p style={{ fontSize: '16px', color: '#888780', lineHeight: '1.7', marginBottom: '36px' }}>
            Brief answers new hire questions instantly using your team's actual docs and decisions and learns from every gap it can't fill.
          </p>

          <div style={{ marginBottom: '36px' }}>
            {[
              { dot: '#7F77DD', text: 'Upload docs once, answer questions forever' },
              { dot: '#1D9E75', text: "Flags what it doesn't know and learns from human answers" },
              { dot: '#EF9F27', text: "Built for small teams who don't have time to maintain a wiki" },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.dot, flexShrink: 0, marginTop: '6px' }} />
                <p style={{ fontSize: '15px', color: '#3d3d3a', lineHeight: '1.6', margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
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

          <p style={{ fontSize: '12px', color: '#B4B2A9' }}>
            Built with Next.js, pgvector, and OpenAI — RAG pipeline from scratch.
          </p>

        </div>
      </div>
    </>
  )
}