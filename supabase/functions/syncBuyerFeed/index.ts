import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

// Expected CSV row structure (after parsing)
interface BuyerFeedRow {
  store_id: string
  product_id?: string
  style_number?: string
  upc_code?: string
  current_quantity: number
  minimum_threshold: number
  alert_type: 'low' | 'out_of_stock'
}

// Parse CSV content into rows
function parseCSV(csvContent: string): BuyerFeedRow[] {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim())
    const row: any = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    return {
      store_id: row.store_id || row['store id'] || '',
      product_id: row.product_id || row['product id'] || null,
      style_number: row.style_number || row['style number'] || row.sku || null,
      upc_code: row.upc_code || row['upc code'] || row.upc || null,
      current_quantity: parseInt(row.current_quantity || row['current quantity'] || row.quantity || '0', 10),
      minimum_threshold: parseInt(row.minimum_threshold || row['minimum threshold'] || row.min_qty || '0', 10),
      alert_type: (row.current_quantity || '0') === '0' ? 'out_of_stock' : 'low'
    } as BuyerFeedRow
  })
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

    // Get the CSV content from the request body
    const csvContent = await req.text()
    
    if (!csvContent || csvContent.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Empty CSV content provided' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse CSV data
    let rows: BuyerFeedRow[]
    try {
      rows = parseCSV(csvContent)
    } catch (parseError) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse CSV content',
          details: parseError instanceof Error ? parseError.message : 'Invalid CSV format'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid rows found in CSV' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const processedAlerts: any[] = []
    const errors: string[] = []

    // Process each row
    for (const row of rows) {
      try {
        // Validate required fields
        if (!row.store_id) {
          errors.push('Missing store_id for one or more rows')
          continue
        }

        // Find product by product_id, style_number, or UPC
        let product: any = null
        
        if (row.product_id) {
          const { data } = await supabase
            .from('products')
            .select('id')
            .eq('id', row.product_id)
            .single()
          product = data
        } else if (row.style_number) {
          const { data } = await supabase
            .from('products')
            .select('id')
            .eq('style_number', row.style_number)
            .single()
          product = data
        } else if (row.upc_code) {
          const { data } = await supabase
            .from('products')
            .select('id')
            .eq('upc_code', parseInt(row.upc_code, 10))
            .single()
          product = data
        }

        if (!product) {
          errors.push(`Product not found for store ${row.store_id}`)
          continue
        }

        // Check if we should create/update a stock alert
        const shouldAlert = row.current_quantity <= row.minimum_threshold

        if (shouldAlert) {
          // Upsert stock alert
          const { data, error } = await supabase
            .from('stock_alerts')
            .upsert({
              store_id: row.store_id,
              product_id: product.id,
              alert_type: row.alert_type,
              quantity: row.current_quantity,
              threshold: row.minimum_threshold,
              resolved_at: null, // Mark as unresolved
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'store_id,product_id,alert_type'
            })
            .select()

          if (error) {
            errors.push(`Failed to create alert for store ${row.store_id}, product ${product.id}: ${error.message}`)
          } else {
            processedAlerts.push(data?.[0])
          }
        } else {
          // If stock levels are now good, resolve any existing alerts
          const { error: resolveError } = await supabase
            .from('stock_alerts')
            .update({ 
              resolved_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('store_id', row.store_id)
            .eq('product_id', product.id)
            .is('resolved_at', null)

          if (resolveError) {
            console.warn('Failed to resolve alert:', resolveError.message)
          }
        }

      } catch (rowError) {
        errors.push(`Error processing row for store ${row.store_id}: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`)
      }
    }

    // Log sync results
    console.log('Buyer feed sync completed:', {
      totalRows: rows.length,
      processedAlerts: processedAlerts.length,
      errors: errors.length
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Buyer feed sync completed',
        summary: {
          totalRows: rows.length,
          processedAlerts: processedAlerts.length,
          errorCount: errors.length
        },
        errors: errors.length > 0 ? errors : undefined
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
    console.error('Buyer feed sync error:', error)
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