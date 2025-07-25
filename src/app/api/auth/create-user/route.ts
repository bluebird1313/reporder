import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This is a temporary admin endpoint to create a test user
// Remove this in production and use proper user management
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, role = 'rep' } = body

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create user with admin privileges (using service role)
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      user_metadata: {
        full_name: fullName,
        role: role,
      },
      email_confirm: true, // Skip email confirmation for testing
    })

    if (error) {
      console.error('Admin create user error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.log('User created successfully:', {
      userId: data.user?.id,
      email: data.user?.email,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        metadata: data.user?.user_metadata,
      },
    })
  } catch (error) {
    console.error('Create user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// List users for debugging
export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error('List users error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    const users = data.users.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at,
      metadata: user.user_metadata,
    }))

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
    })
  } catch (error) {
    console.error('List users API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}