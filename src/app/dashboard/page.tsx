"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/browser"
import { toast } from "sonner"

import {
  AlertTriangle,
  Building2,
  Home,
  Package,
  Search,
  Settings,
  TrendingDown,
  TrendingUp,
  Users,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Star,
  TrendingUpIcon,
  LogOut,
  UserCircle,
  DollarSign,
  ShoppingCart,
  BarChart3,
  UserCheck,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  fetchSalesAnalytics,
  fetchRecentOrders,
  fetchCustomerOrders,
  SalesAnalytics,
  CustomerOrder
} from '@/lib/services/dashboard'
import { TopSellersSection } from '@/components/dashboard/TopSellersSection'

const navigationItems = [
  {
    title: "Overview",
    icon: Home,
    href: "/dashboard",
    isActive: true,
  },
  {
    title: "Stores",
    icon: Building2,
    href: "/dashboard/stores",
    isActive: false,
  },
  {
    title: "Inventory",
    icon: Package,
    href: "/dashboard/inventory",
    isActive: false,
  },
  {
    title: "Reports",
    icon: TrendingUp,
    href: "/dashboard/reports",
    isActive: false,
  },
  {
    title: "Users",
    icon: Users,
    href: "/dashboard/users",
    isActive: false,
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    isActive: false,
  },
]

function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">RO</span>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">RepOrder</span>
            <span className="truncate text-xs text-muted-foreground">Sales Dashboard</span>
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
                  <SidebarMenuButton asChild isActive={item.isActive}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground">System Online</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function SalesMetricsCards({ analytics }: { analytics: SalesAnalytics | null }) {
  if (!analytics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(analytics.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            From {analytics.totalOrders} orders
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {analytics.totalOrders.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Across all customers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {analytics.totalItems.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Total units sold
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(analytics.averageOrderValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Per order average
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function TopCustomersSection({ analytics }: { analytics: SalesAnalytics | null }) {
  if (!analytics?.topCustomers.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Top Customers
          </CardTitle>
          <CardDescription>Loading customer data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Top Customers
        </CardTitle>
        <CardDescription>Best customers by total revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analytics.topCustomers.slice(0, 5).map((customer, index) => (
              <TableRow key={customer.customer_name}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={index < 3 ? "default" : "secondary"} className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{customer.customer_name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{customer.order_count}</TableCell>
                <TableCell className="text-right font-medium text-green-600">
                  ${customer.total_amount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function RecentOrdersSection({ orders }: { orders: CustomerOrder[] }) {
  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'paid in full':
        return 'bg-green-100 text-green-800'
      case 'pending fulfillment':
        return 'bg-yellow-100 text-yellow-800'
      case 'open':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!orders.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Recent Orders
          </CardTitle>
          <CardDescription>Loading recent orders...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Recent Orders
        </CardTitle>
        <CardDescription>Latest customer orders</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.slice(0, 5).map((order) => (
              <TableRow key={order.order_number}>
                <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                <TableCell>{order.customer_name}</TableCell>
                <TableCell>{order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.order_status)}>
                    {order.order_status || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {order.total_amount ? `$${order.total_amount.toLocaleString()}` : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default function SalesDashboard() {
  const router = useRouter()
  const [analytics, setAnalytics] = React.useState<SalesAnalytics | null>(null)
  const [recentOrders, setRecentOrders] = React.useState<CustomerOrder[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [analyticsData, ordersData] = await Promise.all([
          fetchSalesAnalytics(),
          fetchRecentOrders(10)
        ])
        
        setAnalytics(analyticsData)
        setRecentOrders(ordersData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      toast.error('Error signing out: ' + error.message)
    } else {
      toast.success('Signed out successfully!')
      router.push('/sign-in')
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-border" />
            <h1 className="text-lg font-semibold">Sendero Sales Dashboard</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                <span>HG</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        
        <div className="flex-1 space-y-4 p-8 pt-6">
          {/* Sales Metrics Cards */}
          <SalesMetricsCards analytics={analytics} />
          
          {/* Top Sellers Section */}
          <TopSellersSection />
          
          {/* Two Column Layout for Additional Sections */}
          <div className="grid gap-4 md:grid-cols-2">
            <TopCustomersSection analytics={analytics} />
            <RecentOrdersSection orders={recentOrders} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 