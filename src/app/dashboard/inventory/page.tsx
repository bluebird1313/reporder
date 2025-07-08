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
  fetchInventoryItems, 
  InventoryItem
} from '@/lib/services/dashboard'

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

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const loadInventoryItems = async () => {
      try {
        setLoading(true)
        // Use real Sendero products from database
        const { fetchSenderoProducts } = await import('@/lib/services/dashboard')
        const senderoProducts = await fetchSenderoProducts()
        
        // Transform Sendero products into inventory display format
        const inventoryData = senderoProducts.slice(0, 50).map((product, index) => ({
          id: index + 1,
          sku: product.style_number,
          name: product.display_name,
          category: product.product_type,
          totalStock: Math.floor(Math.random() * 500) + 50, // Simulated stock levels
          price: product.msrp / 100
        }))
        
        setInventoryItems(inventoryData)
      } catch (error) {
        console.error('Error loading inventory:', error)
        toast.error('Failed to load inventory data')
        // Fallback to mock data if database fails
        setInventoryItems(mockInventoryItems)
      } finally {
        setLoading(false)
      }
    }

    loadInventoryItems()
  }, [])

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

  const filteredInventory = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
                        placeholder="Search inventory..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Total Stock</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.totalStock}</TableCell>
                        <TableCell>${item.price}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.totalStock > 100 ? "default" : item.totalStock > 50 ? "secondary" : "destructive"
                            }
                          >
                            {item.totalStock > 100 ? "In Stock" : item.totalStock > 50 ? "Low Stock" : "Critical"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 