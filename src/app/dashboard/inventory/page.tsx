"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/browser"
import { toast } from "sonner"
import {
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  LogOut,
  UserCircle,
  Settings,
  Building2,
  TrendingUp,
  Users,
  Home,
  AlertTriangle,
  CheckCircle,
  Filter,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  fetchSenderoProducts,
  SenderoProduct,
} from '@/lib/services/dashboard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Navigation items
const navigationItems = [
  { title: "Overview", icon: Home, href: "/dashboard" },
  { title: "Stores", icon: Building2, href: "/dashboard/stores" },
  { title: "Inventory", icon: Package, href: "/dashboard/inventory" },
  { title: "Reports", icon: TrendingUp, href: "/dashboard/reports" },
  { title: "Users", icon: Users, href: "/dashboard/users" },
  { title: "Settings", icon: Settings, href: "/dashboard/settings" },
]

// Mock inventory data for display purposes (will be replaced with real data)
const mockInventoryItems = [
  { id: 1, sku: "SND-CAP-001", name: "Sendero Logo Baseball Cap", category: "Headwear", totalStock: 245, price: 24.99 },
  { id: 2, sku: "SND-TEE-001", name: "Sendero Performance T-Shirt", category: "Apparel", totalStock: 180, price: 19.99 },
  { id: 3, sku: "SND-HOD-001", name: "Sendero Hoodie - Navy", category: "Apparel", totalStock: 95, price: 49.99 },
  { id: 4, sku: "SND-HAT-001", name: "Sendero Trucker Hat", category: "Headwear", totalStock: 156, price: 22.99 },
  { id: 5, sku: "SND-LST-001", name: "Sendero Long Sleeve Tee", category: "Apparel", totalStock: 120, price: 29.99 },
  { id: 6, sku: "SND-JAK-001", name: "Sendero Windbreaker", category: "Outerwear", totalStock: 78, price: 69.99 },
  { id: 7, sku: "SND-SHT-001", name: "Sendero Polo Shirt", category: "Apparel", totalStock: 203, price: 34.99 },
  { id: 8, sku: "SND-BEA-001", name: "Sendero Beanie", category: "Headwear", totalStock: 167, price: 16.99 },
]

function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-slate-800 text-white">
            <span className="text-lg font-bold">RO</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">RepOrder</span>
            <span className="text-xs text-muted-foreground">Inventory System</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.href === "/dashboard/inventory"}>
                    <a href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            System Online
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

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
  const router = useRouter()
  const { toast } = useToast()

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

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        toast.error('Error signing out: ' + error.message)
      } else {
        toast.success('Signed out successfully!')
        router.push('/sign-in')
      }
    } catch {
      toast.error('An unexpected error occurred')
    }
  }

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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center gap-4">
            <h1 className="font-semibold">Inventory Management</h1>
            <div className="ml-auto flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                    <span className="text-xs font-medium">HG</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-lg">Loading inventory data...</div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Inventory Management</CardTitle>
                    <CardDescription>Manage all Sendero merchandise inventory</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search inventory (name, SKU, style, color)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
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
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 