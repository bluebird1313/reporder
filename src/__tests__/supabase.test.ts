/**
 * Unit test for Supabase configuration
 */

describe('Supabase Configuration', () => {
  it('should have NEXT_PUBLIC_SUPABASE_URL defined', () => {
    // This test ensures that the Supabase URL environment variable is properly configured
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(typeof process.env.NEXT_PUBLIC_SUPABASE_URL).toBe('string')
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).not.toBe('')
  })

  it('should have NEXT_PUBLIC_SUPABASE_ANON_KEY defined', () => {
    // This test ensures that the Supabase anon key environment variable is properly configured
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined()
    expect(typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('string')
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).not.toBe('')
  })

  it('should have valid Supabase URL format', () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (url) {
      expect(url).toMatch(/^https:\/\/.*\.supabase\.co$/)
    }
  })
}) 