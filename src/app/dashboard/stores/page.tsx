"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/browser"
import { toast } from "sonner"
import {
  Building2,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  LogOut,
  UserCircle,
  Settings,
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Phone,
  MapPin
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
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
  fetchSimpleStoresWithSales, 
  SimpleStoreData
} from '@/lib/services/stores-simple'

// Navigation items
const navigationItems = [
  { title: "Overview", icon: Building2, href: "/dashboard" },
  { title: "Stores", icon: Building2, href: "/dashboard/stores" },
  { title: "Inventory", icon: Building2, href: "/dashboard/inventory" },
  { title: "Reports", icon: Building2, href: "/dashboard/reports" },
  { title: "Users", icon: Building2, href: "/dashboard/users" },
  { title: "Settings", icon: Settings, href: "/dashboard/settings" },
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
                  <SidebarMenuButton asChild isActive={item.href === "/dashboard/stores"}>
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount)
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'Active': return 'default'
    case 'Inactive': return 'secondary'
    case 'New': return 'outline'
    default: return 'secondary'
  }
}

function getHealthBadgeVariant(score: number) {
  if (score >= 80) return 'default'
  if (score >= 60) return 'secondary'
  if (score >= 40) return 'destructive'
  return 'destructive'
}

function getHealthLabel(score: number) {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Poor'
}

export default function StoresPage() {
  const [stores, setStores] = useState<SimpleStoreData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoading(true)
        const storesData = await fetchSimpleStoresWithSales()
        setStores(storesData)
      } catch (error) {
        console.error('Error loading stores:', error)
        toast.error('Failed to load stores data')
      } finally {
        setLoading(false)
      }
    }

    loadStores()
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

  const handleViewStore = (storeId: string) => {
    router.push(`/dashboard/stores/${storeId}`)
  }

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.customer_match && store.customer_match.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (store.primary_sales_rep && store.primary_sales_rep.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Calculate summary stats
  const totalRevenue = stores.reduce((sum, store) => sum + store.total_revenue, 0)
  const activeStores = stores.filter(store => store.status === 'Active').length
  const totalOrders = stores.reduce((sum, store) => sum + store.total_orders, 0)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center gap-4">
            <h1 className="font-semibold">Store Management</h1>
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
        <div className="flex flex-1 flex-col gap-6 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-lg">Loading stores analytics...</div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stores.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {activeStores} active stores
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">
                      From all store partnerships
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Across all stores
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(totalOrders > 0 ? totalRevenue / totalOrders : 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Per order across stores
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Stores Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Store Performance Dashboard</CardTitle>
                      <CardDescription>Sales analytics and performance metrics for all store partnerships</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search stores, customers, reps..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 w-64"
                        />
                      </div>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Store
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Store Info</TableHead>
                        <TableHead>Sales Performance</TableHead>
                        <TableHead>Recent Activity</TableHead>
                        <TableHead>Sales Rep</TableHead>
                        <TableHead>Health Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStores.map((store) => (
                        <TableRow key={store.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <div>
                              <div className="font-medium">{store.name}</div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {store.address}
                              </div>
                              {store.customer_match && (
                                <div className="text-xs text-blue-600 mt-1">
                                  Matches: {store.customer_match}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{formatCurrency(store.total_revenue)}</div>
                              <div className="text-sm text-muted-foreground">
                                {store.total_orders} orders • {store.total_items_sold.toLocaleString()} items
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Avg: {formatCurrency(store.avg_order_value)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">
                                Last 30d: <span className="font-medium">{store.orders_last_30_days}</span> orders
                              </div>
                              <div className="text-sm">
                                Revenue: <span className="font-medium">{formatCurrency(store.revenue_last_30_days)}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Last order: {formatDate(store.last_order_date)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {store.primary_sales_rep ? (
                                <>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span className="text-sm font-medium">{store.primary_sales_rep}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">Primary Rep</div>
                                </>
                              ) : (
                                <div className="text-sm text-muted-foreground">No assigned rep</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Progress value={store.health_score} className="w-16" />
                                <span className="text-sm font-medium">{store.health_score}%</span>
                              </div>
                              <Badge variant={getHealthBadgeVariant(store.health_score)} className="text-xs">
                                {getHealthLabel(store.health_score)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(store.status)}>
                              {store.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewStore(store.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Phone className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 