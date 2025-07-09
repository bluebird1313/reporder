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

// Real Sendero channels based on their actual product categories
const channels = ["apparel", "headwear", "accessories"]

interface TopSellerItem {
  rank: number;
  style: string;
  channel: string;
  units: number;
  revenue: number;
}

export function TopSellersSection() {
  const [selectedChannel, setSelectedChannel] = useState<string>("all")
  const [isExpanded, setIsExpanded] = useState(true)
  const [salesData, setSalesData] = useState<SalesAnalytics | null>(null)
  const [topSellers, setTopSellers] = useState<TopSellerItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSalesData = async () => {
      try {
        setLoading(true)
        const analytics = await fetchSalesAnalytics()
        setSalesData(analytics)
        
        // Transform top products into top sellers format
        const sellers = analytics.topProducts.map((product, index) => ({
          rank: index + 1,
          style: product.display_name,
          channel: determineChannel(product.style_number),
          units: product.total_quantity,
          revenue: product.total_revenue
        }))
        
        setTopSellers(sellers)
      } catch (error) {
        console.error('Error loading sales data:', error)
        // Fallback to empty data
        setTopSellers([])
      } finally {
        setLoading(false)
      }
    }

    loadSalesData()
  }, [])

  // Helper function to determine channel based on style number patterns
  const determineChannel = (styleNumber: string): string => {
    if (styleNumber.includes('CH') || styleNumber.includes('SPCH')) return 'headwear'
    if (styleNumber.includes('AC') || styleNumber.includes('SPAC')) return 'accessories'
    return 'apparel'
  }

  const filteredTopSellers = selectedChannel === "all" 
    ? topSellers 
    : topSellers.filter(item => item.channel === selectedChannel)

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

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">Top Sellers</CardTitle>
            <CardDescription>Loading sales data...</CardDescription>
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
          <CardTitle className="text-base font-medium">Top Sellers</CardTitle>
          <CardDescription>
            Best-performing products by revenue
            {salesData && ` • ${salesData.totalOrders} total orders`}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="all">All Channels</option>
            {channels.map(channel => (
              <option key={channel} value={channel}>
                {channel.charAt(0).toUpperCase() + channel.slice(1)}
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
          {filteredTopSellers.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No sales data available for {selectedChannel === "all" ? "any channel" : selectedChannel}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTopSellers.slice(0, 10).map((item) => (
                  <TableRow key={item.rank}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {item.rank}
                        {item.rank <= 3 && (
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{item.style}</div>
                        <Badge variant="outline" className="text-xs">
                          {item.channel}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatUnits(item.units)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      <div className="flex items-center justify-end gap-1">
                        <TrendingUpIcon className="h-3 w-3 text-green-600" />
                        {formatRevenue(item.revenue)}
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