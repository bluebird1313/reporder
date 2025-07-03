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
  id: string;
  store: string;
  item: string;
  currentStock: number;
  minStock: number;
  severity: 'high' | 'medium' | 'low';
}

export async function fetchDashboardStores(): Promise<DashboardStore[]> {
  const supabase = createClient()
  
  try {
    // Get all stores with their inventory data
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .order('name')

    if (storesError) {
      console.error('Error fetching stores:', storesError)
      throw storesError
    }

    // Get inventory data for all stores
    const { data: inventory, error: inventoryError } = await supabase
      .from('store_products')
      .select(`
        store_id,
        qty,
        min_qty,
        stores!inner(name),
        products!inner(name)
      `)

    if (inventoryError) {
      console.error('Error fetching inventory:', inventoryError)
      throw inventoryError
    }

    // Calculate metrics for each store
    const dashboardStores: DashboardStore[] = stores.map(store => {
      const storeInventory = inventory.filter(item => item.store_id === store.id)
      
      const totalItems = storeInventory.reduce((sum, item) => sum + item.qty, 0)
      const lowStockItems = storeInventory.filter(item => item.qty <= item.min_qty && item.qty > 0).length
      const outOfStock = storeInventory.filter(item => item.qty === 0).length
      
      // Calculate inventory health (percentage of items that are adequately stocked)
      const adequateStock = storeInventory.filter(item => item.qty > item.min_qty).length
      const inventoryHealth = storeInventory.length > 0 
        ? Math.round((adequateStock / storeInventory.length) * 100)
        : 100

      return {
        id: store.id,
        name: store.name,
        location: store.address || 'No address',
        totalItems,
        lowStockItems,
        outOfStock,
        inventoryHealth
      }
    })

    return dashboardStores
  } catch (error) {
    console.error('Error in fetchDashboardStores:', error)
    throw error
  }
}

export async function fetchStoreById(storeId: string): Promise<DashboardStore | null> {
  const supabase = createClient()
  
  try {
    // Get store info
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single()

    if (storeError || !store) {
      console.error('Error fetching store:', storeError)
      return null
    }

    // Get inventory data for this store
    const { data: inventory, error: inventoryError } = await supabase
      .from('store_products')
      .select(`
        qty,
        min_qty,
        products!inner(name)
      `)
      .eq('store_id', storeId)

    if (inventoryError) {
      console.error('Error fetching store inventory:', inventoryError)
      throw inventoryError
    }

    // Calculate metrics
    const totalItems = inventory.reduce((sum, item) => sum + item.qty, 0)
    const lowStockItems = inventory.filter(item => item.qty <= item.min_qty && item.qty > 0).length
    const outOfStock = inventory.filter(item => item.qty === 0).length
    
    const adequateStock = inventory.filter(item => item.qty > item.min_qty).length
    const inventoryHealth = inventory.length > 0 
      ? Math.round((adequateStock / inventory.length) * 100)
      : 100

    return {
      id: store.id,
      name: store.name,
      location: store.address || 'No address',
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
    const { data, error } = await supabase
      .from('store_products')
      .select(`
        store_id,
        qty,
        min_qty,
        stores!inner(name),
        products!inner(name)
      `)
      .lt('qty', 'min_qty')
      .gt('qty', 0)
      .order('qty', { ascending: true })
      .limit(10)

    if (error) {
      console.error('Error fetching low stock alerts:', error)
      throw error
    }

    const alerts: LowStockAlert[] = data.map((item, index) => {
      const store = (item.stores as any)?.name || 'Unknown Store'
      const product = (item.products as any)?.name || 'Unknown Product'
      
      // Determine severity based on how far below min stock
      const stockRatio = item.qty / item.min_qty
      const severity = stockRatio <= 0.3 ? 'high' : stockRatio <= 0.6 ? 'medium' : 'low'

      return {
        id: `${item.store_id}-${index}`,
        store,
        item: product,
        currentStock: item.qty,
        minStock: item.min_qty,
        severity
      }
    })

    return alerts
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