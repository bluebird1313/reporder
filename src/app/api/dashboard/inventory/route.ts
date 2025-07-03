import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabaseClient'
import { 
  inventoryResponseSchema, 
  updateStoreProductSchema, 
  updateInventoryResponseSchema 
} from '@/lib/validations'

// GET /api/dashboard/inventory - Get inventory with joined store/product data
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    
    // Get search parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const store_id = searchParams.get('store_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query with joins
    let query = supabase
      .from('store_products')
      .select(`
        store_id,
        product_id,
        qty,
        min_qty,
        created_at,
        updated_at,
        stores!inner(
          id,
          name,
          address
        ),
        products!inner(
          id,
          sku,
          name,
          brand,
          default_min_stock
        )
      `)
      .range(offset, offset + limit - 1)

    // Apply filters
    if (store_id) {
      query = query.eq('store_id', store_id)
    }

    if (search) {
      query = query.or(
        `products.name.ilike.%${search}%,products.sku.ilike.%${search}%,stores.name.ilike.%${search}%`
      )
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch inventory' },
        { status: 500 }
      )
    }

    // Transform the data to match our schema
    const transformedData = data?.map(item => {
      const store = (item.stores as unknown) as { name: string; address?: string }
      const product = (item.products as unknown) as { 
        sku: string; 
        name: string; 
        brand?: string; 
        default_min_stock: number 
      }
      
      return {
        store_id: item.store_id,
        store_name: store.name,
        store_address: store.address,
        product_id: item.product_id,
        sku: product.sku,
        product_name: product.name,
        brand: product.brand,
        qty: item.qty,
        min_qty: item.min_qty,
        default_min_stock: product.default_min_stock,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }
    }) || []

    const response = inventoryResponseSchema.parse({
      success: true,
      data: transformedData,
      total: count || 0,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/dashboard/inventory - Update inventory quantities
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = updateStoreProductSchema.parse(body)
    
    const supabase = createServiceRoleClient()

    // Upsert the store_products record
    const { data, error } = await supabase
      .from('store_products')
      .upsert({
        store_id: validatedData.store_id,
        product_id: validatedData.product_id,
        qty: validatedData.qty,
        min_qty: validatedData.min_qty || 0,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update inventory' },
        { status: 500 }
      )
    }

    const response = updateInventoryResponseSchema.parse({
      success: true,
      message: 'Inventory updated successfully',
      data,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('API error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 