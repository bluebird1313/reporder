import { createClient } from '@/lib/supabase/browser'
import { Store } from '@/lib/types'

export interface DashboardStore {
  id: string;
  name: string;
  location: string;
  totalItems: number;
  lowStockItems: number;
  outOfStock: number;
  inventoryHealth: number;
}

export interface InventoryItem {
  store_id: string;
  store_name: string;
  store_address: string | null;
  product_id: string;
  sku: string;
  product_name: string;
  brand: string | null;
  qty: number;
  min_qty: number;
  default_min_stock: number;
  created_at: string;
  updated_at: string;
}

export interface LowStockAlert {
  id: string
  product_name: string
  store_name: string
  current_stock: number
  minimum_stock: number
  sku: string
}

export interface SenderoProduct {
  id: string;
  external_id: string;
  upc_code: number;
  style_number: string;
  display_name: string;
  style_name: string;
  launch_season: string;
  base_color: string | null;
  marketing_color: string | null;
  product_type: string;
  msrp: number; // in cents
  wholesale_price: number;
  created_at: string;
  updated_at: string;
}

export interface ProductSummary {
  id: string;
  external_id: string;
  upc_code: number;
  style_number: string;
  display_name: string;
  product_type: string;
  base_color: string | null;
  marketing_color: string | null;
  launch_season: string;
  msrp_dollars: number;
  wholesale_price: number;
  markup_amount: number;
  markup_percentage: number;
}

// Sales Data Interfaces
export interface CustomerOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_category: string | null;
  po_number: string | null;
  sales_rep_name: string | null;
  transaction_rep_name: string | null;
  customer_manager_name: string | null;
  transaction_manager_name: string | null;
  order_type: string | null;
  order_status: string | null;
  nuorder_id: string | null;
  ship_country: string | null;
  ship_city: string | null;
  ship_state: string | null;
  order_date: string | null;
  ship_date: string | null;
  cancelled_date: string | null;
  total_amount: number | null;
  total_items: number | null;
  created_at: string;
  updated_at: string;
}

export interface OrderLineItem {
  id: string;
  order_number: string;
  style_number: string;
  gender: string | null;
  marketing_color: string | null;
  launch_season: string | null;
  subcategory: string | null;
  category: string | null;
  product_type: string | null;
  product_season: string | null;
  quantity: number;
  qty_pending: number;
  qty_billed: number;
  total_amount: number;
  amount_pending: number;
  amount_billed: number;
  unit_price: number;
  created_at: string;
  updated_at: string;
}

export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalItems: number;
  averageOrderValue: number;
  topCustomers: Array<{
    customer_name: string;
    total_amount: number;
    order_count: number;
  }>;
  topProducts: Array<{
    style_number: string;
    display_name: string;
    total_quantity: number;
    total_revenue: number;
  }>;
  salesByCategory: Array<{
    category: string;
    total_amount: number;
    total_quantity: number;
  }>;
  salesRepPerformance: Array<{
    sales_rep_name: string;
    total_amount: number;
    order_count: number;
  }>;
}

export async function fetchDashboardStores(): Promise<DashboardStore[]> {
  const supabase = createClient()
  
  try {
    const { data: stores, error } = await supabase
      .from('stores')
      .select(`
        id,
        name,
        address,
        store_products!inner(
          quantity,
          minimum_stock,
          products!inner(
            id,
            sku,
            brand
          )
        )
      `)

    if (error) {
      console.error('Error fetching stores:', error)
      throw error
    }

    if (!stores) return []

    return stores.map(store => {
      const totalItems = store.store_products.reduce((sum: number, sp: any) => sum + sp.quantity, 0)
      const lowStockItems = store.store_products.filter((sp: any) => sp.quantity <= sp.minimum_stock).length
      const outOfStock = store.store_products.filter((sp: any) => sp.quantity === 0).length
      
      // Calculate inventory health (percentage of items that are well-stocked)
      const wellStockedItems = store.store_products.filter((sp: any) => sp.quantity > sp.minimum_stock).length
      const inventoryHealth = store.store_products.length > 0 
        ? Math.round((wellStockedItems / store.store_products.length) * 100)
        : 100

      return {
        id: store.id,
        name: store.name,
        location: store.address,
        totalItems,
        lowStockItems,
        outOfStock,
        inventoryHealth
      }
    })

  } catch (error) {
    console.error('Error in fetchDashboardStores:', error)
    throw error
  }
}

export async function fetchStoreById(storeId: string): Promise<DashboardStore | null> {
  const supabase = createClient()
  
  try {
    const { data: store, error } = await supabase
      .from('stores')
      .select(`
        id,
        name,
        address,
        store_products!inner(
          quantity,
          minimum_stock,
          products!inner(
            id,
            sku,
            brand
          )
        )
      `)
      .eq('id', storeId)
      .single()

    if (error) {
      console.error('Error fetching store:', error)
      throw error
    }

    if (!store) return null

    const totalItems = store.store_products.reduce((sum: number, sp: any) => sum + sp.quantity, 0)
    const lowStockItems = store.store_products.filter((sp: any) => sp.quantity <= sp.minimum_stock).length
    const outOfStock = store.store_products.filter((sp: any) => sp.quantity === 0).length
    
    const wellStockedItems = store.store_products.filter((sp: any) => sp.quantity > sp.minimum_stock).length
    const inventoryHealth = store.store_products.length > 0 
      ? Math.round((wellStockedItems / store.store_products.length) * 100)
      : 100

    return {
      id: store.id,
      name: store.name,
      location: store.address,
      totalItems,
      lowStockItems,
      outOfStock,
      inventoryHealth
    }

  } catch (error) {
    console.error('Error in fetchStoreById:', error)
    throw error
  }
}

export async function fetchLowStockAlerts(): Promise<LowStockAlert[]> {
  const supabase = createClient()
  
  try {
    const { data: alerts, error } = await supabase
      .from('store_products')
      .select(`
        id,
        quantity,
        minimum_stock,
        products!inner(
          id,
          sku,
          brand
        ),
        stores!inner(
          id,
          name
        )
      `)
      .lte('quantity', supabase.rpc('minimum_stock'))
      .order('quantity', { ascending: true })

    if (error) {
      console.error('Error fetching low stock alerts:', error)
      throw error
    }

    if (!alerts) return []

         return alerts.map(alert => ({
       id: alert.id,
       product_name: `${(alert.products as any).brand} - ${(alert.products as any).sku}`,
       store_name: (alert.stores as any).name,
       current_stock: alert.quantity,
       minimum_stock: alert.minimum_stock,
       sku: (alert.products as any).sku
     }))

  } catch (error) {
    console.error('Error in fetchLowStockAlerts:', error)
    throw error
  }
}

export async function fetchInventoryItems(searchQuery?: string, storeId?: string): Promise<InventoryItem[]> {
  const supabase = createClient()
  
  try {
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
          name,
          address
        ),
        products!inner(
          sku,
          name,
          brand,
          default_min_stock
        )
      `)

    if (storeId) {
      query = query.eq('store_id', storeId)
    }

    if (searchQuery) {
      query = query.or(
        `products.name.ilike.%${searchQuery}%,products.sku.ilike.%${searchQuery}%,stores.name.ilike.%${searchQuery}%`
      )
    }

    const { data, error } = await query.order('stores.name', { ascending: true })

    if (error) {
      console.error('Error fetching inventory items:', error)
      throw error
    }

    const items: InventoryItem[] = data.map(item => {
      const store = (item.stores as any)
      const product = (item.products as any)
      
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
        updated_at: item.updated_at
      }
    })

    return items
  } catch (error) {
    console.error('Error in fetchInventoryItems:', error)
    throw error
  }
}

export async function fetchSenderoProducts(): Promise<SenderoProduct[]> {
  const supabase = createClient()
  
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('display_name', { ascending: true })

    if (error) {
      console.error('Error fetching Sendero products:', error)
      throw error
    }

    return products || []

  } catch (error) {
    console.error('Error in fetchSenderoProducts:', error)
    throw error
  }
}

export async function fetchProductSummary(): Promise<ProductSummary[]> {
  const supabase = createClient()
  
  try {
    const { data: products, error } = await supabase
      .from('product_summary')
      .select('*')
      .order('display_name', { ascending: true })

    if (error) {
      console.error('Error fetching product summary:', error)
      throw error
    }

    return products || []

  } catch (error) {
    console.error('Error in fetchProductSummary:', error)
    throw error
  }
}

export async function fetchProductsByType(productType: string): Promise<SenderoProduct[]> {
  const supabase = createClient()
  
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_type', productType)
      .order('display_name', { ascending: true })

    if (error) {
      console.error('Error fetching products by type:', error)
      throw error
    }

    return products || []

  } catch (error) {
    console.error('Error in fetchProductsByType:', error)
    throw error
  }
}

export async function fetchProductBySku(styleNumber: string): Promise<SenderoProduct | null> {
  const supabase = createClient()
  
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('style_number', styleNumber)
      .single()

    if (error) {
      console.error('Error fetching product by SKU:', error)
      throw error
    }

    return product

  } catch (error) {
    console.error('Error in fetchProductBySku:', error)
    throw error
  }
}

export async function getProductStats() {
  const supabase = createClient()
  
  try {
    // Get total count
    const { count: totalProducts } = await supabase
      .from('products')
      .select('id', { count: 'exact' })

    // Get product types count
    const { data: typeData } = await supabase
      .from('products')
      .select('product_type')

    const productTypes = typeData ? [...new Set(typeData.map(p => p.product_type))] : []

    // Get price range
    const { data: priceData } = await supabase
      .from('product_summary')
      .select('msrp_dollars, wholesale_price')
      .order('msrp_dollars', { ascending: false })

    const maxPrice = priceData?.[0]?.msrp_dollars || 0
    const minPrice = priceData?.[priceData.length - 1]?.msrp_dollars || 0
    const avgWholesale = priceData ? 
      priceData.reduce((sum, p) => sum + p.wholesale_price, 0) / priceData.length : 0

    return {
      totalProducts: totalProducts || 0,
      productTypes,
      priceRange: {
        min: minPrice,
        max: maxPrice,
        avgWholesale: Math.round(avgWholesale * 100) / 100
      }
    }

  } catch (error) {
    console.error('Error in getProductStats:', error)
    throw error
  }
} 

// Sales Data Service Functions
export async function fetchCustomerOrders(): Promise<CustomerOrder[]> {
  const supabase = createClient()
  
  try {
    const { data: orders, error } = await supabase
      .from('customer_orders')
      .select('*')
      .order('order_date', { ascending: false })

    if (error) {
      console.error('Error fetching customer orders:', error)
      throw error
    }

    return orders || []

  } catch (error) {
    console.error('Error in fetchCustomerOrders:', error)
    throw error
  }
}

export async function fetchOrderLineItems(orderNumber?: string): Promise<OrderLineItem[]> {
  const supabase = createClient()
  
  try {
    let query = supabase
      .from('order_line_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (orderNumber) {
      query = query.eq('order_number', orderNumber)
    }

    const { data: items, error } = await query

    if (error) {
      console.error('Error fetching order line items:', error)
      throw error
    }

    return items || []

  } catch (error) {
    console.error('Error in fetchOrderLineItems:', error)
    throw error
  }
}

export async function fetchSalesAnalytics(): Promise<SalesAnalytics> {
  const supabase = createClient()
  
  try {
    // Get total revenue from line items (the real source of revenue data)
    const { data: lineItemStats } = await supabase
      .from('order_line_items')
      .select('quantity, total_amount')

    const totalItems = lineItemStats?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
    const totalRevenue = lineItemStats?.reduce((sum, item) => sum + (item.total_amount || 0), 0) || 0

    // Get total orders count
    const { data: orderStats } = await supabase
      .from('customer_orders')
      .select('order_number')

    const totalOrders = orderStats?.length || 0

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Get top customers by joining orders with line items to get real revenue
    const { data: customerRevenueData } = await supabase
      .from('customer_orders')
      .select(`
        customer_name,
        order_number,
        order_line_items!inner(
          total_amount
        )
      `)

    const customerTotals = customerRevenueData?.reduce((acc: any, order) => {
      const customer = order.customer_name
      if (!acc[customer]) {
        acc[customer] = { total_amount: 0, order_count: 0 }
      }
      
      // Sum up all line items for this order
      const orderTotal = (order.order_line_items as any[]).reduce((sum, item) => 
        sum + (item.total_amount || 0), 0
      )
      
      acc[customer].total_amount += orderTotal
      acc[customer].order_count += 1
      return acc
    }, {}) || {}

    const topCustomers = Object.entries(customerTotals)
      .map(([customer_name, stats]: [string, any]) => ({
        customer_name,
        total_amount: stats.total_amount,
        order_count: stats.order_count
      }))
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 10)

    // Get top products
    const { data: productData } = await supabase
      .from('order_line_items')
      .select('style_number, quantity, total_amount')

    const productTotals = productData?.reduce((acc: any, item) => {
      const style = item.style_number
      if (!acc[style]) {
        acc[style] = { total_quantity: 0, total_revenue: 0 }
      }
      acc[style].total_quantity += item.quantity || 0
      acc[style].total_revenue += item.total_amount || 0
      return acc
    }, {}) || {}

    // Get product display names
    const { data: senderoProducts } = await supabase
      .from('products')
      .select('style_number, display_name')

    const topProducts = Object.entries(productTotals)
      .map(([style_number, stats]: [string, any]) => {
        const product = senderoProducts?.find(p => p.style_number === style_number)
        return {
          style_number,
          display_name: product?.display_name || style_number,
          total_quantity: stats.total_quantity,
          total_revenue: stats.total_revenue
        }
      })
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 10)

    // Get sales by category
    const { data: categoryData } = await supabase
      .from('order_line_items')
      .select('category, quantity, total_amount')

    const categoryTotals = categoryData?.reduce((acc: any, item) => {
      const category = item.category || 'Unknown'
      if (!acc[category]) {
        acc[category] = { total_amount: 0, total_quantity: 0 }
      }
      acc[category].total_amount += item.total_amount || 0
      acc[category].total_quantity += item.quantity || 0
      return acc
    }, {}) || {}

    const salesByCategory = Object.entries(categoryTotals)
      .map(([category, stats]: [string, any]) => ({
        category,
        total_amount: stats.total_amount,
        total_quantity: stats.total_quantity
      }))
      .sort((a, b) => b.total_amount - a.total_amount)

    // Get sales rep performance (using line items for revenue)
    const { data: repRevenueData } = await supabase
      .from('customer_orders')
      .select(`
        sales_rep_name,
        order_line_items!inner(
          total_amount
        )
      `)
      .not('sales_rep_name', 'is', null)

    const repTotals = repRevenueData?.reduce((acc: any, order) => {
      const rep = order.sales_rep_name
      if (!acc[rep]) {
        acc[rep] = { total_amount: 0, order_count: 0 }
      }
      
      // Sum up all line items for this order
      const orderTotal = (order.order_line_items as any[]).reduce((sum, item) => 
        sum + (item.total_amount || 0), 0
      )
      
      acc[rep].total_amount += orderTotal
      acc[rep].order_count += 1
      return acc
    }, {}) || {}

    const salesRepPerformance = Object.entries(repTotals)
      .map(([sales_rep_name, stats]: [string, any]) => ({
        sales_rep_name,
        total_amount: stats.total_amount,
        order_count: stats.order_count
      }))
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 10)

    return {
      totalRevenue,
      totalOrders,
      totalItems,
      averageOrderValue,
      topCustomers,
      topProducts,
      salesByCategory,
      salesRepPerformance
    }

  } catch (error) {
    console.error('Error in fetchSalesAnalytics:', error)
    throw error
  }
}

export async function fetchRecentOrders(limit: number = 10): Promise<CustomerOrder[]> {
  const supabase = createClient()
  
  try {
    const { data: orders, error } = await supabase
      .from('customer_orders')
      .select('*')
      .order('order_date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent orders:', error)
      throw error
    }

    return orders || []

  } catch (error) {
    console.error('Error in fetchRecentOrders:', error)
    throw error
  }
}

export async function fetchOrdersByCustomer(customerName: string): Promise<CustomerOrder[]> {
  const supabase = createClient()
  
  try {
    const { data: orders, error } = await supabase
      .from('customer_orders')
      .select('*')
      .ilike('customer_name', `%${customerName}%`)
      .order('order_date', { ascending: false })

    if (error) {
      console.error('Error fetching orders by customer:', error)
      throw error
    }

    return orders || []

  } catch (error) {
    console.error('Error in fetchOrdersByCustomer:', error)
    throw error
  }
} 