import { redirect } from 'next/navigation'

export default function HomePage() {
  // TEMPORARILY BYPASS AUTH - Go directly to dashboard
  redirect('/dashboard')
} 