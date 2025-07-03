import { z } from 'zod'

// Store schemas
export const storeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Store name is required'),
  address: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const createStoreSchema = storeSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
})

// Product schemas
export const productSchema = z.object({
  id: z.string().uuid(),
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Product name is required'),
  brand: z.string().optional(),
  default_min_stock: z.number().int().min(0).default(0),
  created_at: z.string(),
  updated_at: z.string(),
})

export const createProductSchema = productSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
})

// Store product schemas
export const storeProductSchema = z.object({
  store_id: z.string().uuid(),
  product_id: z.string().uuid(),
  qty: z.number().int().min(0).default(0),
  min_qty: z.number().int().min(0).default(0),
  created_at: z.string(),
  updated_at: z.string(),
})

export const updateStoreProductSchema = z.object({
  store_id: z.string().uuid(),
  product_id: z.string().uuid(),
  qty: z.number().int().min(0),
  min_qty: z.number().int().min(0).optional(),
})

// Inventory view schema (joined data)
export const inventoryItemSchema = z.object({
  store_id: z.string().uuid(),
  store_name: z.string(),
  store_address: z.string().optional(),
  product_id: z.string().uuid(),
  sku: z.string(),
  product_name: z.string(),
  brand: z.string().optional(),
  qty: z.number().int(),
  min_qty: z.number().int(),
  default_min_stock: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
})

// API response schemas
export const inventoryResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(inventoryItemSchema),
  total: z.number().int(),
})

export const updateInventoryResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: storeProductSchema.optional(),
})

// Export types
export type Store = z.infer<typeof storeSchema>
export type CreateStore = z.infer<typeof createStoreSchema>
export type Product = z.infer<typeof productSchema>
export type CreateProduct = z.infer<typeof createProductSchema>
export type StoreProduct = z.infer<typeof storeProductSchema>
export type UpdateStoreProduct = z.infer<typeof updateStoreProductSchema>
export type InventoryItem = z.infer<typeof inventoryItemSchema>
export type InventoryResponse = z.infer<typeof inventoryResponseSchema>
export type UpdateInventoryResponse = z.infer<typeof updateInventoryResponseSchema> 