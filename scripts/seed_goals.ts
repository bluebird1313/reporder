#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Mock data generators
const brands = ['Sendero', 'Nike', 'Adidas', 'Puma', 'Under Armour']
const goalTypes = ['AO', 'Prebook'] as const

function getRandomAmount(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomDate(startDate: Date, endDate: Date): string {
  const start = startDate.getTime()
  const end = endDate.getTime()
  const randomTime = start + Math.random() * (end - start)
  return new Date(randomTime).toISOString().split('T')[0]
}

function getMonthStart(monthsBack: number = 0): string {
  const date = new Date()
  date.setMonth(date.getMonth() - monthsBack)
  date.setDate(1)
  return date.toISOString().split('T')[0]
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  try {
    // Get existing stores and create a mock rep user
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, name')
    
    if (storesError) {
      throw new Error(`Failed to fetch stores: ${storesError.message}`)
    }

    if (!stores || stores.length === 0) {
      console.log('No stores found. Creating sample stores...')
      
      const sampleStores = [
        { name: 'Downtown Flagship', address: '123 Main St, New York, NY' },
        { name: 'Mall Location', address: '456 Shopping Blvd, Los Angeles, CA' },
        { name: 'Outlet Store', address: '789 Outlet Dr, Chicago, IL' },
      ]

      const { data: newStores, error: createStoresError } = await supabase
        .from('stores')
        .insert(sampleStores)
        .select()

      if (createStoresError) {
        throw new Error(`Failed to create stores: ${createStoresError.message}`)
      }

      stores.push(...(newStores || []))
      console.log(`✅ Created ${newStores?.length} sample stores`)
    }

    // Create or get a mock rep user ID (in real app this would be from auth)
    const mockRepId = '00000000-0000-0000-0000-000000000001'

    // Seed rep goals for the last 6 months
    console.log('🎯 Seeding rep goals...')
    const goalInserts = []

    for (let monthBack = 0; monthBack < 6; monthBack++) {
      const goalMonth = getMonthStart(monthBack)
      
      for (const store of stores) {
        for (const brand of brands) {
          for (const goalType of goalTypes) {
            const baseAmount = goalType === 'AO' ? 50000 : 30000
            const variance = getRandomAmount(-10000, 15000)
            
            goalInserts.push({
              rep_id: mockRepId,
              store_id: store.id,
              brand,
              goal_type: goalType,
              goal_amount: baseAmount + variance,
              goal_month: goalMonth
            })
          }
        }
      }
    }

    const { error: goalsError } = await supabase
      .from('rep_goals')
      .upsert(goalInserts, { 
        onConflict: 'rep_id,store_id,brand,goal_type,goal_month',
        ignoreDuplicates: false 
      })

    if (goalsError) {
      throw new Error(`Failed to seed goals: ${goalsError.message}`)
    }

    console.log(`✅ Seeded ${goalInserts.length} rep goals`)

    // Seed sales metrics (daily data for the last 90 days)
    console.log('📊 Seeding sales metrics...')
    const metricsInserts = []
    const today = new Date()
    
    for (let dayBack = 0; dayBack < 90; dayBack++) {
      const date = new Date(today)
      date.setDate(date.getDate() - dayBack)
      const dateStr = date.toISOString().split('T')[0]
      
      for (const store of stores) {
        for (const brand of brands) {
          // Generate random but realistic sales data
          const aoSales = getRandomAmount(500, 3000)
          const prebookSales = getRandomAmount(300, 2000)
          const totalUnits = getRandomAmount(10, 50)
          
          metricsInserts.push({
            store_id: store.id,
            brand,
            date: dateStr,
            ao_sales: aoSales,
            prebook_sales: prebookSales,
            total_units: totalUnits
          })
        }
      }
    }

    const { error: metricsError } = await supabase
      .from('sales_metrics')
      .upsert(metricsInserts, { 
        onConflict: 'store_id,brand,date',
        ignoreDuplicates: false 
      })

    if (metricsError) {
      throw new Error(`Failed to seed sales metrics: ${metricsError.message}`)
    }

    console.log(`✅ Seeded ${metricsInserts.length} sales metrics records`)

    // Seed historical sales data (past 2 years)
    console.log('📈 Seeding historical sales...')
    const historicalInserts = []
    
    for (let dayBack = 90; dayBack < 730; dayBack += 7) { // Weekly data for older periods
      const date = new Date(today)
      date.setDate(date.getDate() - dayBack)
      const dateStr = date.toISOString().split('T')[0]
      
      for (const store of stores) {
        for (const brand of brands) {
          const units = getRandomAmount(50, 200)
          const revenue = getRandomAmount(2000, 8000)
          
          historicalInserts.push({
            date: dateStr,
            store_id: store.id,
            brand,
            units,
            revenue,
            product_type: 'Apparel' // Simplified for now
          })
        }
      }
    }

    const { error: historicalError } = await supabase
      .from('historical_sales')
      .upsert(historicalInserts, { 
        onConflict: 'date,store_id,brand,product_type',
        ignoreDuplicates: false 
      })

    if (historicalError) {
      throw new Error(`Failed to seed historical sales: ${historicalError.message}`)
    }

    console.log(`✅ Seeded ${historicalInserts.length} historical sales records`)

    // Seed some stock alerts
    console.log('⚠️ Seeding stock alerts...')
    
    // Get some products to create alerts for
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(20)

    if (productsError) {
      console.warn('Could not fetch products for stock alerts:', productsError.message)
    } else if (products && products.length > 0) {
      const alertInserts = []
      
      // Create some random stock alerts
      for (let i = 0; i < Math.min(10, products.length); i++) {
        const product = products[i]
        const store = stores[Math.floor(Math.random() * stores.length)]
        const alertType = Math.random() > 0.7 ? 'out_of_stock' : 'low'
        const quantity = alertType === 'out_of_stock' ? 0 : getRandomAmount(1, 5)
        const threshold = getRandomAmount(5, 15)
        
        alertInserts.push({
          store_id: store.id,
          product_id: product.id,
          alert_type: alertType,
          quantity,
          threshold,
          resolved_at: null // Keep as active alerts
        })
      }

      const { error: alertsError } = await supabase
        .from('stock_alerts')
        .upsert(alertInserts, { 
          onConflict: 'store_id,product_id,alert_type',
          ignoreDuplicates: false 
        })

      if (alertsError) {
        console.warn('Failed to seed stock alerts:', alertsError.message)
      } else {
        console.log(`✅ Seeded ${alertInserts.length} stock alerts`)
      }
    }

    console.log('\n🎉 Database seeding completed successfully!')
    console.log('\nSeeded data includes:')
    console.log(`- ${goalInserts.length} rep goals (6 months)`)
    console.log(`- ${metricsInserts.length} daily sales metrics (90 days)`)
    console.log(`- ${historicalInserts.length} historical sales records (2 years, weekly)`)
    console.log('- Sample stock alerts')
    console.log('\nYou can now view the dashboard with realistic data!')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding script failed:', error)
      process.exit(1)
    })
}

export { seedDatabase } 