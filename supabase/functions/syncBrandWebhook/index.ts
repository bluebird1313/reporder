import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

// Expected webhook payload structure
interface BrandWebhookPayload {
  store_id: string
  brand: string
  date: string // YYYY-MM-DD format
  ao_sales?: number
  prebook_sales?: number
  total_units?: number
}

Deno.serve(async (req: Request) => {
  // Handle CORS for preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Verify the request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse the request body
    const payload: BrandWebhookPayload = await req.json()

    // Validate required fields
    if (!payload.store_id || !payload.brand || !payload.date) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: store_id, brand, date' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(payload.date)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid date format. Expected YYYY-MM-DD' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client with service role key for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify store exists
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('id', payload.store_id)
      .single()

    if (storeError || !store) {
      return new Response(
        JSON.stringify({ 
          error: `Store not found: ${payload.store_id}` 
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Upsert sales metrics data
    const { data, error } = await supabase
      .from('sales_metrics')
      .upsert({
        store_id: payload.store_id,
        brand: payload.brand,
        date: payload.date,
        ao_sales: payload.ao_sales || 0,
        prebook_sales: payload.prebook_sales || 0,
        total_units: payload.total_units || 0,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'store_id,brand,date'
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update sales metrics',
          details: error.message 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Log successful sync
    console.log('Brand webhook sync successful:', {
      store_id: payload.store_id,
      brand: payload.brand,
      date: payload.date,
      recordId: data?.[0]?.id
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sales metrics updated successfully',
        data: data?.[0]
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}) 