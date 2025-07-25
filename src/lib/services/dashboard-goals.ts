import { createClient } from '@/lib/supabase/browser'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Type definitions for the new dashboard features
export interface RepGoal {
  id: string
  rep_id: string
  store_id: string
  store_name: string
  brand: string
  goal_type: 'AO' | 'Prebook'
  goal_amount: number
  goal_month: string
  created_at: string
  updated_at: string
}

export interface GoalProgress {
  id: string
  rep_id: string
  store_id: string
  store_name: string
  brand: string
  goal_type: 'AO' | 'Prebook'
  goal_amount: number
  goal_month: string
  actual_sales: number
  progress_percentage: number
}

export interface SalesMetric {
  id: string
  store_id: string
  brand: string
  date: string
  ao_sales: number
  prebook_sales: number
  total_units: number
  created_at: string
  updated_at: string
}

export interface StockAlert {
  id: string
  store_id: string
  store_name: string
  product_id: string
  product_name: string
  style_number: string
  alert_type: 'low' | 'out_of_stock'
  quantity: number
  threshold: number
  created_at: string
}

export interface HistoricalSales {
  id: string
  date: string
  store_id: string
  brand: string
  units: number
  revenue: number
  product_type?: string
  created_at: string
  updated_at: string
}

export interface ForecastData {
  date: string
  brand: string
  predicted_revenue: number
  predicted_units: number
  confidence_interval: [number, number]
}

// Goal Progress Service Functions
export async function fetchGoalProgress(repId: string, period: 'day' | 'week' | 'month' | 'ytd' = 'month'): Promise<GoalProgress[]> {
  const supabase = createClient()
  
  try {
    let dateFilter = new Date()
    switch (period) {
      case 'day':
        dateFilter.setDate(dateFilter.getDate() - 1)
        break
      case 'week':
        dateFilter.setDate(dateFilter.getDate() - 7)
        break
      case 'month':
        dateFilter.setMonth(dateFilter.getMonth() - 1)
        break
      case 'ytd':
        dateFilter = new Date(dateFilter.getFullYear(), 0, 1)
        break
    }

    const { data, error } = await supabase
      .from('goal_progress_view')
      .select('*')
      .eq('rep_id', repId)
      .gte('goal_month', dateFilter.toISOString().split('T')[0])
      .order('goal_month', { ascending: false })

    if (error) {
      console.error('Error fetching goal progress:', error)
      throw error
    }

    return data || []

  } catch (error) {
    console.error('Error in fetchGoalProgress:', error)
    throw error
  }
}

export async function fetchStockAlerts(storeId?: string): Promise<StockAlert[]> {
  const supabase = createClient()
  
  try {
    let query = supabase
      .from('active_stock_alerts_view')
      .select('*')
      .order('created_at', { ascending: false })

    if (storeId) {
      query = query.eq('store_id', storeId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching stock alerts:', error)
      throw error
    }

    return data || []

  } catch (error) {
    console.error('Error in fetchStockAlerts:', error)
    throw error
  }
}

export async function fetchSalesMetrics(storeId?: string, brand?: string, startDate?: string, endDate?: string): Promise<SalesMetric[]> {
  const supabase = createClient()
  
  try {
    let query = supabase
      .from('sales_metrics')
      .select('*')
      .order('date', { ascending: false })

    if (storeId) {
      query = query.eq('store_id', storeId)
    }

    if (brand) {
      query = query.eq('brand', brand)
    }

    if (startDate) {
      query = query.gte('date', startDate)
    }

    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching sales metrics:', error)
      throw error
    }

    return data || []

  } catch (error) {
    console.error('Error in fetchSalesMetrics:', error)
    throw error
  }
}

export async function fetchHistoricalSales(storeId?: string, brand?: string): Promise<HistoricalSales[]> {
  const supabase = createClient()
  
  try {
    let query = supabase
      .from('historical_sales')
      .select('*')
      .order('date', { ascending: false })
      .limit(100)

    if (storeId) {
      query = query.eq('store_id', storeId)
    }

    if (brand) {
      query = query.eq('brand', brand)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching historical sales:', error)
      throw error
    }

    return data || []

  } catch (error) {
    console.error('Error in fetchHistoricalSales:', error)
    throw error
  }
}

// Simple forecast calculation based on historical data
export async function generateForecast(storeId?: string, brand?: string): Promise<ForecastData[]> {
  try {
    const historicalData = await fetchHistoricalSales(storeId, brand)
    
    if (historicalData.length < 3) {
      return []
    }

    // Simple trend calculation for next 30 days
    const last30Days = historicalData.slice(0, 30)
    const avgRevenue = last30Days.reduce((sum, day) => sum + day.revenue, 0) / last30Days.length
    const avgUnits = last30Days.reduce((sum, day) => sum + day.units, 0) / last30Days.length

    // Calculate trend
    const trend = last30Days.length > 1 ? 
      (last30Days[0].revenue - last30Days[last30Days.length - 1].revenue) / last30Days.length : 0

    const forecastData: ForecastData[] = []
    const today = new Date()

    for (let i = 1; i <= 30; i++) {
      const forecastDate = new Date(today)
      forecastDate.setDate(today.getDate() + i)
      
      const predictedRevenue = avgRevenue + (trend * i)
      const confidence = Math.max(0.7, 1 - (i * 0.01)) // Decreasing confidence over time

      forecastData.push({
        date: forecastDate.toISOString().split('T')[0],
        brand: brand || 'All',
        predicted_revenue: Math.max(0, predictedRevenue),
        predicted_units: Math.max(0, avgUnits),
        confidence_interval: [
          Math.max(0, predictedRevenue * (1 - confidence)),
          predictedRevenue * (1 + confidence)
        ]
      })
    }

    return forecastData

  } catch (error) {
    console.error('Error in generateForecast:', error)
    throw error
  }
}

// Mutation functions
export async function createRepGoal(goal: Omit<RepGoal, 'id' | 'created_at' | 'updated_at' | 'store_name'>): Promise<RepGoal> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('rep_goals')
      .insert(goal)
      .select(`
        *,
        stores!inner(name)
      `)
      .single()

    if (error) {
      console.error('Error creating rep goal:', error)
      throw error
    }

    return {
      ...data,
      store_name: (data.stores as any).name
    }

  } catch (error) {
    console.error('Error in createRepGoal:', error)
    throw error
  }
}

export async function updateRepGoal(id: string, updates: Partial<RepGoal>): Promise<RepGoal> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('rep_goals')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        stores!inner(name)
      `)
      .single()

    if (error) {
      console.error('Error updating rep goal:', error)
      throw error
    }

    return {
      ...data,
      store_name: (data.stores as any).name
    }

  } catch (error) {
    console.error('Error in updateRepGoal:', error)
    throw error
  }
}

export async function resolveStockAlert(alertId: string): Promise<void> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('stock_alerts')
      .update({ 
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId)

    if (error) {
      console.error('Error resolving stock alert:', error)
      throw error
    }

  } catch (error) {
    console.error('Error in resolveStockAlert:', error)
    throw error
  }
}

// React Query Hooks
export function useGoalProgress(repId: string, period: 'day' | 'week' | 'month' | 'ytd' = 'month') {
  return useQuery({
    queryKey: ['goalProgress', repId, period],
    queryFn: () => fetchGoalProgress(repId, period),
    enabled: false, // TEMPORARILY DISABLED to prevent database calls
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on auth failures
  })
}

export function useStockAlerts(storeId?: string) {
  return useQuery({
    queryKey: ['stockAlerts', storeId],
    queryFn: () => fetchStockAlerts(storeId),
    enabled: false, // TEMPORARILY DISABLED to prevent database calls
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false, // Don't retry on auth failures
  })
}

export function useForecast(storeId?: string, brand?: string) {
  return useQuery({
    queryKey: ['forecast', storeId, brand],
    queryFn: () => generateForecast(storeId, brand),
    enabled: false, // TEMPORARILY DISABLED to prevent database calls
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: false, // Don't retry on auth failures
  })
}

export function useSalesMetrics(storeId?: string, brand?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['salesMetrics', storeId, brand, startDate, endDate],
    queryFn: () => fetchSalesMetrics(storeId, brand, startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useHistoricalSales(storeId?: string, brand?: string) {
  return useQuery({
    queryKey: ['historicalSales', storeId, brand],
    queryFn: () => fetchHistoricalSales(storeId, brand),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

// Mutation hooks
export function useCreateRepGoal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createRepGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goalProgress'] })
    },
  })
}

export function useUpdateRepGoal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<RepGoal> }) => 
      updateRepGoal(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goalProgress'] })
    },
  })
}

export function useResolveStockAlert() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: resolveStockAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockAlerts'] })
    },
  })
} 