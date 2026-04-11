'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const [gapCount, setGapCount] = useState(0)
  const isAdmin = user?.publicMetadata?.role === 'ADMIN'

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/gaps')
        .then(res => res.json())
        .then(data => setGapCount(data.gaps?.length || 0)) //removed gapCount from {navItem('/gaps', 'Gaps to fill', '#EF9F27')} it was in last place
    }
  }, [isAdmin])

  const navItem = (
    href: string,
    label: string,
    dotColor: string,
    badge?: number
  ) => {
    const active = pathname === href
    return (
      <Link
        href={href}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 16px',
          fontSize: '13px',
          color: active ? '#171717' : '#888780',
          fontWeight: active ? '500' : '400',
          borderRight: active ? '2px solid #534AB7' : '2px solid transparent',
          background: active ? 'white' : 'transparent',
          textDecoration: 'none',
          transition: 'background 0.1s'
        }}
      >
        <span style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: dotColor,
          flexShrink: 0
        }} />
        <span style={{ flex: 1 }}>{label}</span>
        {badge !== undefined && badge > 0 && (
          <span style={{
            fontSize: '11px',
            background: '#FAEEDA',
            color: '#633806',
            fontWeight: '500',
            padding: '3px 8px',
            borderRadius: '20px'
          }}>
            {badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <div style={{
      width: '220px',
      minWidth: '220px',
      minHeight: '100vh',
      background: '#F1EFE8',
      borderRight: '0.5px solid rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '16px'
    }}>
      <div style={{
        padding: '0 16px 16px',
        borderBottom: '0.5px solid rgba(0,0,0,0.1)',
        marginBottom: '8px'
      }}>
        <div style={{ fontSize: '16px', fontWeight: '500', color: '#171717' }}>Brief</div>
        <div style={{ fontSize: '12px', color: '#888780', marginTop: '2px' }}>
          {user?.firstName ? `${user.firstName}'s workspace` : 'My workspace'}
        </div>
      </div>

      <div style={{ fontSize: '11px', color: '#B4B2A9', padding: '12px 16px 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        New hire
      </div>
      {navItem('/ask', 'Ask a question', '#7F77DD')}
      {navItem('/questions', 'My questions', '#B4B2A9')}

      {isAdmin && (
        <>
          <div style={{ fontSize: '11px', color: '#B4B2A9', padding: '12px 16px 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Team
          </div>
          {navItem('/gaps', 'Gaps to fill', '#EF9F27')}
          {navItem('/sources', 'Knowledge sources', '#1D9E75')}
          {navItem('/dashboard', 'Dashboard', '#D85A30')}
        </>
      )}
    </div>
  )
}