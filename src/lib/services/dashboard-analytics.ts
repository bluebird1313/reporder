/**
 * Dashboard Analytics Service
 * High-performance fetchers using materialized views and optimized queries
 */

import { createClient } from '@/lib/supabase/browser'

// Types for our analytics data
export interface DashboardSummary {
  total_revenue: number
  total_orders: number
  total_items_sold: number
  avg_order_value: number
  revenue_last_month: number
  orders_last_month: number
  revenue_current_month: number
  orders_current_month: number
  active_customers: number
}

export interface LastMonthRevenue {
  revenue_last_month: number
  orders_last_month: number
  items_last_month: number
}

export interface TopCustomer {
  customer_name: string
  customer_category: string | null
  total_orders: number
  total_revenue: number
  total_items: number
  avg_order_value: number
  last_order_date: string
}

export interface SalesRepPerformance {
  sales_rep_name: string
  total_orders: number
  total_revenue: number
  avg_order_value: number
  unique_customers: number
}

export interface RecentOrder {
  order_number: string
  customer_name: string
  order_date: string
  order_status: string | null
  order_revenue: number
  items_sold: number
}

/**
 * Fetch complete dashboard summary - all metrics in one query
 */
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('vw_dashboard_summary')
      .select('*')
      .single()

    if (error) {
      console.error('Error fetching dashboard summary:', error)
      throw error
    }

    return data || {
      total_revenue: 0,
      total_orders: 0,
      total_items_sold: 0,
      avg_order_value: 0,
      revenue_last_month: 0,
      orders_last_month: 0,
      revenue_current_month: 0,
      orders_current_month: 0,
      active_customers: 0
    }

  } catch (error) {
    console.error('Error in fetchDashboardSummary:', error)
    throw error
  }
}

/**
 * Fetch last month revenue specifically
 */
export async function fetchRevenueLastMonth(): Promise<LastMonthRevenue> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('vw_last_month_revenue')
      .select('*')
      .single()

    if (error) {
      console.error('Error fetching last month revenue:', error)
      throw error
    }

    const result = data || { revenue_last_month: 0, orders_last_month: 0, items_last_month: 0 }
    
    console.log('Last month revenue:', {
      revenue: result.revenue_last_month,
      orders: result.orders_last_month,
      items: result.items_last_month
    })

    return result

  } catch (error) {
    console.error('Error in fetchRevenueLastMonth:', error)
    throw error
  }
}

/**
 * Fetch top customers from materialized view
 */
export async function fetchTopCustomersMV(limit: number = 10): Promise<TopCustomer[]> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('vw_top_customers')
      .select('*')
      .limit(limit)

    if (error) {
      console.error('Error fetching top customers:', error)
      throw error
    }

    return data || []

  } catch (error) {
    console.error('Error in fetchTopCustomersMV:', error)
    throw error
  }
}

/**
 * Fetch sales rep performance
 */
export async function fetchSalesRepPerformance(limit: number = 10): Promise<SalesRepPerformance[]> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('vw_sales_rep_performance')
      .select('*')
      .limit(limit)

    if (error) {
      console.error('Error fetching sales rep performance:', error)
      throw error
    }

    return data || []

  } catch (error) {
    console.error('Error in fetchSalesRepPerformance:', error)
    throw error
  }
}

/**
 * Fetch recent orders
 */
export async function fetchRecentOrdersMV(limit: number = 20): Promise<RecentOrder[]> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('vw_recent_orders')
      .select('*')
      .limit(limit)

    if (error) {
      console.error('Error fetching recent orders:', error)
      throw error
    }

    return data || []

  } catch (error) {
    console.error('Error in fetchRecentOrdersMV:', error)
    throw error
  }
}

/**
 * Refresh the materialized view (call this when data changes)
 */
export async function refreshDashboardMV(): Promise<void> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase.rpc('refresh_materialized_view', {
      view_name: 'mv_dashboard'
    })

    if (error) {
      console.error('Error refreshing materialized view:', error)
      throw error
    }

    console.log('Materialized view refreshed successfully')

  } catch (error) {
    console.error('Error in refreshDashboardMV:', error)
    throw error
  }
}

/**
 * Get current month vs last month comparison
 */
export async function fetchMonthlyComparison(): Promise<{
  current_month: number
  last_month: number
  growth_percentage: number
}> {
  const supabase = createClient()
  
  try {
    // Get current month
    const { data: currentData, error: currentError } = await supabase
      .from('vw_current_month_revenue')
      .select('revenue_current_month')
      .single()

    if (currentError) throw currentError

    // Get last month
    const { data: lastData, error: lastError } = await supabase
      .from('vw_last_month_revenue')
      .select('revenue_last_month')
      .single()

    if (lastError) throw lastError

    const currentMonth = currentData?.revenue_current_month || 0
    const lastMonth = lastData?.revenue_last_month || 0
    
    const growthPercentage = lastMonth > 0 
      ? ((currentMonth - lastMonth) / lastMonth) * 100
      : currentMonth > 0 ? 100 : 0

    return {
      current_month: currentMonth,
      last_month: lastMonth,
      growth_percentage: Math.round(growthPercentage * 100) / 100
    }

  } catch (error) {
    console.error('Error in fetchMonthlyComparison:', error)
    throw error
  }
}

/**
 * Test all analytics functions
 */
export async function testAnalytics(): Promise<void> {
  console.log('🧪 Testing Analytics Functions...')
  
  try {
    const summary = await fetchDashboardSummary()
    console.log('✅ Dashboard Summary:', summary)

    const lastMonth = await fetchRevenueLastMonth()
    console.log('✅ Last Month Revenue:', lastMonth)

    const topCustomers = await fetchTopCustomersMV(5)
    console.log('✅ Top 5 Customers:', topCustomers)

    const recentOrders = await fetchRecentOrdersMV(5)
    console.log('✅ Recent Orders:', recentOrders)

    const comparison = await fetchMonthlyComparison()
    console.log('✅ Monthly Comparison:', comparison)

    console.log('🎉 All analytics functions working!')

  } catch (error) {
    console.error('❌ Analytics test failed:', error)
    throw error
  }
} 