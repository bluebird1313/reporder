import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If authenticated, go to dashboard
  if (user) {
    redirect('/dashboard')
  }

  // If not authenticated, go to sign-in
  redirect('/sign-in')
} 