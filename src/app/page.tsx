import { redirect } from 'next/navigation'

export default function HomePage() {
  // For now, redirect to dashboard - later we'll add auth check
  redirect('/dashboard')
} 