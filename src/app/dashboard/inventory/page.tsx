"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Package, AlertTriangle, CheckCircle, Filter } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { fetchSenderoProducts, SenderoProduct } from '@/lib/services/dashboard'

interface InventoryItem {
  id: number
  sku: string
  name: string
  category: string
  totalStock: number
  price: number
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
  style_name?: string
  launch_season?: string
  base_color?: string | null
  marketing_color?: string | null
}

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Generate realistic stock levels and status
  const getStockInfo = (index: number) => {
    const stockLevel = Math.floor(Math.random() * 600) + 10
    let status: 'in-stock' | 'low-stock' | 'out-of-stock' = 'in-stock'
    
    if (stockLevel < 50) status = 'low-stock'
    if (stockLevel < 20) status = 'out-of-stock'
    
    return { stockLevel, status }
  }

  useEffect(() => {
    const loadInventoryItems = async () => {
      try {
        setLoading(true)
        // Fetch ALL Sendero products from Supabase
        const senderoProducts = await fetchSenderoProducts()
        
        // Transform ALL Sendero products into inventory display format
        const inventoryData: InventoryItem[] = senderoProducts.map((product, index) => {
          const { stockLevel, status } = getStockInfo(index)
          
          return {
            id: index + 1,
            sku: product.style_number,
            name: product.display_name,
            category: product.product_type,
            totalStock: stockLevel,
            price: product.msrp / 100,
            status,
            style_name: product.style_name,
            launch_season: product.launch_season,
            base_color: product.base_color,
            marketing_color: product.marketing_color
          }
        })
        
        setInventoryItems(inventoryData)
        setFilteredItems(inventoryData)
        
        console.log(`Loaded ${inventoryData.length} Sendero products from database`)
      } catch (error) {
        console.error('Error loading inventory:', error)
        console.error('Failed to load inventory data from Supabase')
      } finally {
        setLoading(false)
      }
    }

    loadInventoryItems()
  }, [])

  // Filter and search functionality
  useEffect(() => {
    let filtered = inventoryItems

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.style_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.marketing_color?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => 
        item.category.toLowerCase() === categoryFilter.toLowerCase()
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    setFilteredItems(filtered)
  }, [searchTerm, categoryFilter, statusFilter, inventoryItems])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />In Stock</Badge>
      case 'low-stock':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Low Stock</Badge>
      case 'out-of-stock':
        return <Badge variant="destructive"><Package className="w-3 h-3 mr-1" />Out of Stock</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getUniqueCategories = () => {
    const categories = [...new Set(inventoryItems.map(item => item.category))]
    return categories.sort()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground mt-1">Loading Sendero merchandise inventory...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all Sendero merchandise inventory ({inventoryItems.length.toLocaleString()} products)
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search inventory (name, SKU, style, color)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{inventoryItems.length.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Stock</p>
                <p className="text-2xl font-bold text-green-600">
                  {inventoryItems.filter(item => item.status === 'in-stock').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {inventoryItems.filter(item => item.status === 'low-stock').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{getUniqueCategories().length}</p>
              </div>
              <Filter className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            Showing {filteredItems.length} of {inventoryItems.length} products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Style</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Season</TableHead>
                  <TableHead className="text-right">Total Stock</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{item.style_name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {item.marketing_color || item.base_color || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{item.launch_season || '-'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {item.totalStock.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${item.price.toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No inventory items found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}