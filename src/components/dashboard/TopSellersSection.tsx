'use client'

import * as React from "react"
import { useState, useEffect } from "react"
import {
  ChevronDown,
  ChevronRight,
  Star,
  TrendingUpIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  fetchSalesAnalytics, 
  SalesAnalytics
} from '@/lib/services/dashboard'

// Customer categories for filtering
const customerTypes = ["all", "retail", "wholesale", "boutique"]

interface TopCustomerItem {
  rank: number;
  customerName: string;
  orderCount: number;
  totalUnits: number;
  totalRevenue: number;
  category: string;
}

export function TopSellersSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isExpanded, setIsExpanded] = useState(true)
  const [salesData, setSalesData] = useState<SalesAnalytics | null>(null)
  const [topCustomers, setTopCustomers] = useState<TopCustomerItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSalesData = async () => {
      try {
        setLoading(true)
        const analytics = await fetchSalesAnalytics()
        setSalesData(analytics)
        
        // Transform top customers into display format
        const customers = analytics.topCustomers.map((customer, index) => ({
          rank: index + 1,
          customerName: customer.customer_name,
          orderCount: customer.order_count,
          totalUnits: 0, // We'll calculate this from the detailed data
          totalRevenue: customer.total_amount,
          category: determineCustomerCategory(customer.customer_name)
        }))
        
        setTopCustomers(customers)
      } catch (error) {
        console.error('Error loading sales data:', error)
        setTopCustomers([])
      } finally {
        setLoading(false)
      }
    }

    loadSalesData()
  }, [])

  // Helper function to determine customer category based on name patterns
  const determineCustomerCategory = (customerName: string): string => {
    const name = customerName.toLowerCase()
    if (name.includes('rei') || name.includes('whole earth') || name.includes('store') || name.includes('shop')) {
      return 'retail'
    }
    if (name.includes('boutique') || name.includes('mercantile') || name.includes('haberdashery')) {
      return 'boutique'
    }
    if (name.includes('inc') || name.includes('llc') || name.includes('enterprises')) {
      return 'wholesale'
    }
    return 'retail'
  }

  const filteredCustomers = selectedCategory === "all" 
    ? topCustomers 
    : topCustomers.filter(customer => customer.category === selectedCategory)

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatUnits = (units: number) => {
    return new Intl.NumberFormat('en-US').format(units)
  }

  const shortenCustomerName = (name: string) => {
    // Shorten long company names for better display
    if (name.length > 40) {
      const parts = name.split(' ')
      if (parts.length > 1) {
        // Take first few meaningful words
        const shortened = parts.slice(0, 3).join(' ')
        return shortened + (parts.length > 3 ? '...' : '')
      }
    }
    return name
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">Top Customers</CardTitle>
            <CardDescription>Loading customer data...</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">Top Customers</CardTitle>
          <CardDescription>
            Best customers by total revenue
            {salesData && ` • ${salesData.totalOrders} total orders`}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="all">All Types</option>
            {customerTypes.slice(1).map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          {filteredCustomers.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No customer data available for {selectedCategory === "all" ? "any category" : selectedCategory}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Customer/Company</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.slice(0, 10).map((customer) => (
                  <TableRow key={customer.rank}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {customer.rank}
                        {customer.rank <= 3 && (
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm" title={customer.customerName}>
                          {shortenCustomerName(customer.customerName)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {customer.category}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {customer.orderCount}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUpIcon className="h-3 w-3 text-green-600" />
                        {formatRevenue(customer.totalRevenue)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      )}
    </Card>
  )
} 