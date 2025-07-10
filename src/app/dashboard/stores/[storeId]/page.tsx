"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/browser"
import { toast } from "sonner"
import {
  Building2,
  ArrowLeft,
  LogOut,
  UserCircle,
  Settings,
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Phone,
  MapPin,
  Mail,
  Package,
  Clock,
  BarChart3,
  Target,
  AlertCircle,
  CheckCircle2
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  fetchSimpleStoreDetails, 
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

export default function StoreDetailPage() {
  const [store, setStore] = useState<SimpleStoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const storeId = params.storeId as string

  useEffect(() => {
    const loadStoreDetails = async () => {
      try {
        setLoading(true)
        const storeData = await fetchSimpleStoreDetails(storeId)
        setStore(storeData)
      } catch (error) {
        console.error('Error loading store details:', error)
        toast.error('Failed to load store details')
      } finally {
        setLoading(false)
      }
    }

    if (storeId) {
      loadStoreDetails()
    }
  }, [storeId])

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

  const handleBackToStores = () => {
    router.push('/dashboard/stores')
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-96">
            <div className="text-lg">Loading store details...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!store) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-96">
            <div className="text-lg">Store not found</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
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
            <Button variant="ghost" size="sm" onClick={handleBackToStores}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Stores
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="font-semibold">{store.name}</h1>
              <p className="text-sm text-muted-foreground">{store.address}</p>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <Badge variant={getStatusBadgeVariant(store.status)} className="ml-2">
                {store.status}
              </Badge>
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
          {/* Store Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(store.total_revenue)}</div>
                <p className="text-xs text-muted-foreground">
                  Lifetime partnership value
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{store.total_orders.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {store.total_items_sold.toLocaleString()} items sold
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(store.avg_order_value)}</div>
                <p className="text-xs text-muted-foreground">
                  Per order average
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{store.health_score}%</div>
                  <Badge variant={getHealthBadgeVariant(store.health_score)} className="text-xs">
                    {getHealthLabel(store.health_score)}
                  </Badge>
                </div>
                <Progress value={store.health_score} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Store Information & Rep Details */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Store Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{store.name}</div>
                    <div className="text-sm text-muted-foreground">{store.address}</div>
                  </div>
                </div>
                {store.customer_match && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 mt-1 text-green-600" />
                    <div>
                      <div className="font-medium">Customer Match</div>
                      <div className="text-sm text-muted-foreground">{store.customer_match}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Last Order</div>
                    <div className="text-sm text-muted-foreground">{formatDate(store.last_order_date)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Partnership Since</div>
                    <div className="text-sm text-muted-foreground">{formatDate(store.created_at)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Sales Rep Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {store.primary_sales_rep ? (
                  <>
                    <div className="flex items-start gap-3">
                      <UserCircle className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{store.primary_sales_rep}</div>
                        <div className="text-sm text-muted-foreground">Primary Sales Representative</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Rep
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Rep
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <div>
                      <div>No assigned sales representative</div>
                      <div className="text-sm">Consider assigning a rep to this store</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{store.orders_last_30_days}</div>
                <p className="text-xs text-muted-foreground">
                  Orders • {formatCurrency(store.revenue_last_30_days)} revenue
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Last 90 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{store.orders_last_90_days}</div>
                <p className="text-xs text-muted-foreground">
                  Orders • {formatCurrency(store.revenue_last_90_days)} revenue
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Order Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {store.orders_last_90_days > 0 ? Math.round(90 / store.orders_last_90_days) : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Days between orders (avg)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Items for Rep */}
          <Card>
            <CardHeader>
              <CardTitle>Rep Action Items</CardTitle>
              <CardDescription>Recommended next steps for this store partnership</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {store.orders_last_30_days === 0 && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <div className="font-medium text-yellow-800">No recent orders</div>
                      <div className="text-sm text-yellow-700">Consider reaching out to check on inventory needs</div>
                    </div>
                  </div>
                )}
                {store.health_score < 60 && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="font-medium text-red-800">Low health score</div>
                      <div className="text-sm text-red-700">Schedule a meeting to discuss partnership improvement</div>
                    </div>
                  </div>
                )}
                {!store.primary_sales_rep && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-800">No assigned rep</div>
                      <div className="text-sm text-blue-700">Assign a sales representative to this store</div>
                    </div>
                  </div>
                )}
                {store.health_score >= 80 && store.orders_last_30_days > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-green-800">Excellent performance</div>
                      <div className="text-sm text-green-700">Consider expanding product lines or increasing order volume</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 