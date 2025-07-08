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