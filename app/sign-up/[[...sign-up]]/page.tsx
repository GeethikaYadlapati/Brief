import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F1EFE8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <SignUp />
    </div>
  )
}