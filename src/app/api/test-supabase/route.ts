import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    
    // Log environment variables (safely)
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET')
    
    const supabase = await createClient()
    
    // Test basic connection
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .limit(1)

    if (storesError) {
      console.error('Stores query error:', storesError)
      return NextResponse.json({ 
        success: false, 
        error: storesError.message,
        details: storesError 
      })
    }

    // Test inventory query
    const { data: inventory, error: inventoryError } = await supabase
      .from('store_products')
      .select(`
        store_id,
        qty,
        min_qty,
        stores!inner(name),
        products!inner(name)
      `)
      .limit(1)

    if (inventoryError) {
      console.error('Inventory query error:', inventoryError)
      return NextResponse.json({ 
        success: false, 
        error: inventoryError.message,
        details: inventoryError 
      })
    }

    return NextResponse.json({ 
      success: true, 
      stores_count: stores?.length || 0,
      inventory_count: inventory?.length || 0,
      sample_store: stores?.[0],
      sample_inventory: inventory?.[0]
    })
  } catch (error) {
    console.error('API test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
  }
} 