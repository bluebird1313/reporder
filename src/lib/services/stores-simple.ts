/**
 * Simplified Stores Service with Sales Analytics
 */

import { createClient } from '@/lib/supabase/browser'

export interface SimpleStoreData {
  id: string
  name: string
  address: string
  customer_match?: string
  total_orders: number
  total_revenue: number
  total_items_sold: number
  avg_order_value: number
  last_order_date: string | null
  orders_last_30_days: number
  revenue_last_30_days: number
  orders_last_90_days: number
  revenue_last_90_days: number
  status: 'Active' | 'Inactive' | 'New'
  health_score: number
  primary_sales_rep?: string
  created_at: string
  updated_at: string
}

/**
 * Fetch all stores with basic sales analytics
 */
export async function fetchSimpleStoresWithSales(): Promise<SimpleStoreData[]> {
  const supabase = createClient()
  
  try {
    // Get basic stores
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .order('name')

    if (storesError) throw storesError

    // For each store, try to match with customer sales data
    const storesWithSales = await Promise.all(
      stores.map(async (store) => {
        try {
          // Try to match store name with customer orders
          const { data: orderData } = await supabase
            .from('customer_orders')
            .select(`
              id,
              customer_name,
              order_date,
              sales_rep_name,
              order_line_items!inner(
                total_amount,
                quantity
              )
            `)
            .or(`customer_name.ilike.%${store.name}%,customer_name.ilike.%${store.name.split(' ')[0]}%`)

          if (!orderData || orderData.length === 0) {
            return {
              id: store.id,
              name: store.name,
              address: store.address,
              customer_match: undefined,
              total_orders: 0,
              total_revenue: 0,
              total_items_sold: 0,
              avg_order_value: 0,
              last_order_date: null,
              orders_last_30_days: 0,
              revenue_last_30_days: 0,
              orders_last_90_days: 0,
              revenue_last_90_days: 0,
              status: 'New' as const,
              health_score: 50,
              primary_sales_rep: undefined,
              created_at: store.created_at,
              updated_at: store.updated_at
            }
          }

          // Calculate metrics
          const now = new Date()
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

          let totalRevenue = 0
          let totalItems = 0
          let revenueL30 = 0
          let ordersL30 = 0
          let revenueL90 = 0
          let ordersL90 = 0
          let lastOrderDate: string | null = null
          const salesReps = new Map<string, number>()

          orderData.forEach(order => {
            const orderDate = new Date(order.order_date)
            const orderRevenue = (order.order_line_items as any[]).reduce((sum, item) => 
              sum + (parseFloat(item.total_amount) || 0), 0
            )
            const orderItems = (order.order_line_items as any[]).reduce((sum, item) => 
              sum + (parseInt(item.quantity) || 0), 0
            )

            totalRevenue += orderRevenue
            totalItems += orderItems

            if (orderDate >= thirtyDaysAgo) {
              revenueL30 += orderRevenue
              ordersL30++
            }

            if (orderDate >= ninetyDaysAgo) {
              revenueL90 += orderRevenue
              ordersL90++
            }

            if (!lastOrderDate || orderDate.toISOString() > lastOrderDate) {
              lastOrderDate = orderDate.toISOString()
            }

            if (order.sales_rep_name) {
              salesReps.set(order.sales_rep_name, (salesReps.get(order.sales_rep_name) || 0) + orderRevenue)
            }
          })

          const primaryRep = salesReps.size > 0 ? 
            [...salesReps.entries()].sort((a, b) => b[1] - a[1])[0][0] : undefined

          const status: 'Active' | 'Inactive' | 'New' = lastOrderDate ?
            (new Date(lastOrderDate) >= ninetyDaysAgo ? 'Active' : 'Inactive') : 'New'

          const healthScore = calculateSimpleHealthScore({
            total_revenue: totalRevenue,
            orders_last_30_days: ordersL30,
            orders_last_90_days: ordersL90,
            last_order_date: lastOrderDate
          })

          return {
            id: store.id,
            name: store.name,
            address: store.address,
            customer_match: orderData[0]?.customer_name || undefined,
            total_orders: orderData.length,
            total_revenue: totalRevenue,
            total_items_sold: totalItems,
            avg_order_value: orderData.length > 0 ? totalRevenue / orderData.length : 0,
            last_order_date: lastOrderDate,
            orders_last_30_days: ordersL30,
            revenue_last_30_days: revenueL30,
            orders_last_90_days: ordersL90,
            revenue_last_90_days: revenueL90,
            status,
            health_score: healthScore,
            primary_sales_rep: primaryRep,
            created_at: store.created_at,
            updated_at: store.updated_at
          }

        } catch (error) {
          console.error(`Error processing store ${store.name}:`, error)
          return {
            id: store.id,
            name: store.name,
            address: store.address,
            customer_match: undefined,
            total_orders: 0,
            total_revenue: 0,
            total_items_sold: 0,
            avg_order_value: 0,
            last_order_date: null,
            orders_last_30_days: 0,
            revenue_last_30_days: 0,
            orders_last_90_days: 0,
            revenue_last_90_days: 0,
            status: 'New' as const,
            health_score: 50,
            primary_sales_rep: undefined,
            created_at: store.created_at,
            updated_at: store.updated_at
          }
        }
      })
    )

    return storesWithSales

  } catch (error) {
    console.error('Error fetching stores with sales:', error)
    throw error
  }
}

/**
 * Calculate health score based on sales performance
 */
function calculateSimpleHealthScore(data: {
  total_revenue: number
  orders_last_30_days: number
  orders_last_90_days: number
  last_order_date: string | null
}): number {
  let score = 50 // Base score

  // Revenue contribution (max 30 points)
  if (data.total_revenue > 100000) score += 30
  else if (data.total_revenue > 50000) score += 20
  else if (data.total_revenue > 10000) score += 10

  // Recent activity (max 30 points)
  if (data.orders_last_30_days > 5) score += 30
  else if (data.orders_last_30_days > 2) score += 20
  else if (data.orders_last_30_days > 0) score += 10

  // Consistency (max 20 points)
  if (data.orders_last_90_days > 10) score += 20
  else if (data.orders_last_90_days > 5) score += 15
  else if (data.orders_last_90_days > 0) score += 10

  // Recency penalty
  if (data.last_order_date) {
    const daysSinceLastOrder = (Date.now() - new Date(data.last_order_date).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceLastOrder > 90) score -= 20
    else if (daysSinceLastOrder > 60) score -= 10
    else if (daysSinceLastOrder > 30) score -= 5
  } else {
    score -= 30
  }

  return Math.max(0, Math.min(100, score))
}

/**
 * Get basic store details
 */
export async function fetchSimpleStoreDetails(storeId: string): Promise<SimpleStoreData | null> {
  const supabase = createClient()
  
  try {
    const { data: store, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single()

    if (error || !store) {
      return null
    }

    const stores = await fetchSimpleStoresWithSales()
    return stores.find(s => s.id === storeId) || null

  } catch (error) {
    console.error('Error fetching store details:', error)
    return null
  }
} 