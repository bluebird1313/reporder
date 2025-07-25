"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Package } from "lucide-react"
import { createClient } from "@/lib/supabase/browser"
import { toast } from "sonner"

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [showResendButton, setShowResendButton] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const supabase = createClient()
      
      // Validate email format before making request
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address')
        toast.error('Please enter a valid email address')
        return
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long')
        toast.error('Password must be at least 6 characters long')
        return
      }
      
      console.log('Attempting sign in with email:', formData.email.trim().toLowerCase())
      
      const { error, data } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      })

      console.log('Auth response:', { error, user: data?.user?.email, session: !!data?.session })

      if (error) {
        console.error('Auth error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
          cause: error.cause
        })
        
        // Provide more specific error messages and show resend button if needed
        let errorMessage = error.message
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Login failed. This could be due to: (1) Incorrect email/password, (2) Account not yet confirmed via email, or (3) Account does not exist. Please check your email for a confirmation link or try signing up again.'
          setShowResendButton(true) // Show resend button for potential confirmation issues
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in. Check your spam folder if you don\'t see the email.'
          setShowResendButton(true)
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a few minutes and try again.'
          setShowResendButton(false)
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email address. Please sign up first.'
          setShowResendButton(false)
        } else if (error.message.includes('signup_disabled')) {
          errorMessage = 'New user signups are currently disabled. Please contact support.'
          setShowResendButton(false)
        }
        
        setError(errorMessage)
        toast.error(errorMessage)
      } else if (data.user) {
        // Verify the user session was created properly
        const { data: session } = await supabase.auth.getSession()
        if (session?.session) {
          toast.success('Signed in successfully!')
          // Use window.location for a clean redirect that ensures middleware runs
          window.location.href = '/dashboard'
        } else {
          setError('Authentication failed. Please try again.')
          toast.error('Authentication failed. Please try again.')
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Connection error. Please check your internet connection and try again.')
      toast.error('Connection error. Please check your internet connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    // Hide resend button when user types
    if (showResendButton) {
      setShowResendButton(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address first')
      return
    }

    setIsResending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email.trim().toLowerCase(),
      })

      if (error) {
        console.error('Resend error:', error)
        toast.error('Failed to resend confirmation email: ' + error.message)
      } else {
        toast.success('Confirmation email sent! Please check your inbox and spam folder.')
        setShowResendButton(false)
      }
    } catch (err) {
      console.error('Resend unexpected error:', err)
      toast.error('Failed to resend confirmation email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl mb-4 shadow-lg">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RepOrder</h1>
          <p className="text-gray-600">Inventory Management System</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center text-gray-900">Welcome back</CardTitle>
            <CardDescription className="text-center text-gray-600">Sign in to your account to continue</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              {showResendButton && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  disabled={isResending}
                  onClick={handleResendConfirmation}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend Confirmation Email"
                  )}
                </Button>
              )}

              <div className="text-center text-sm text-gray-600">
                {"Don't have an account? "}
                <Link href="/sign-up" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 RepOrder. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
} 