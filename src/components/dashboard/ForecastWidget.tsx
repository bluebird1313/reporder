"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts"
import { TrendingUp, Calendar, DollarSign, BarChart3 } from "lucide-react"
import { ForecastData } from "@/lib/services/dashboard-goals"

interface ForecastWidgetProps {
  data: ForecastData[]
  isLoading?: boolean
  selectedBrand?: string
  onBrandChange?: (brand: string) => void
  className?: string
}

export function ForecastWidget({ 
  data, 
  isLoading, 
  selectedBrand, 
  onBrandChange, 
  className 
}: ForecastWidgetProps) {
  const [viewMode, setViewMode] = React.useState<'revenue' | 'units'>('revenue')
  const [isMobile, setIsMobile] = React.useState(false)

  // Check for mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Transform data for chart display
  const chartData = React.useMemo(() => {
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      fullDate: item.date,
      revenue: item.predicted_revenue,
      units: item.predicted_units,
      confidenceHigh: item.confidence_interval[1],
      confidenceLow: item.confidence_interval[0]
    }))
  }, [data])

  // Calculate summary stats
  const totalPredictedRevenue = data.reduce((sum, item) => sum + item.predicted_revenue, 0)
  const totalPredictedUnits = data.reduce((sum, item) => sum + item.predicted_units, 0)
  const avgDailyRevenue = data.length > 0 ? totalPredictedRevenue / data.length : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatUnits = (value: number) => {
    return Math.round(value).toLocaleString()
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-sm">{label}</p>
          <div className="space-y-1 mt-2">
            <p className="text-blue-600 text-sm">
              Revenue: {formatCurrency(data.revenue)}
            </p>
            <p className="text-green-600 text-sm">
              Units: {formatUnits(data.units)}
            </p>
            <p className="text-gray-500 text-xs">
              Range: {formatCurrency(data.confidenceLow)} - {formatCurrency(data.confidenceHigh)}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Sales Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Sales Forecast
          </CardTitle>
          <CardDescription>
            Insufficient historical data for forecasting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Need more historical sales data to generate forecasts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const ChartComponent = isMobile ? AreaChart : LineChart

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Sales Forecast
            </CardTitle>
            <CardDescription className="mt-1">
              30-day revenue and units prediction for {selectedBrand || 'All Brands'}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value: 'revenue' | 'units') => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="units">Units</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Total Predicted
            </p>
            <p className="font-semibold text-lg text-blue-600" aria-live="polite">
              {viewMode === 'revenue' 
                ? formatCurrency(totalPredictedRevenue)
                : formatUnits(totalPredictedUnits) + ' units'
              }
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Daily Average
            </p>
            <p className="font-semibold text-lg text-green-600" aria-live="polite">
              {viewMode === 'revenue' 
                ? formatCurrency(avgDailyRevenue)
                : formatUnits(totalPredictedUnits / data.length) + ' units'
              }
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Forecast Period
            </p>
            <Badge variant="outline" className="flex items-center gap-1 w-fit">
              <Calendar className="h-3 w-3" />
              {data.length} days
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-80 w-full" role="img" aria-label={`${viewMode} forecast chart`}>
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                className="text-xs"
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tickFormatter={viewMode === 'revenue' ? formatCurrency : formatUnits}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {isMobile ? (
                <>
                  <Area
                    type="monotone"
                    dataKey={viewMode}
                    stroke={viewMode === 'revenue' ? '#3b82f6' : '#10b981'}
                    fill={viewMode === 'revenue' ? '#3b82f6' : '#10b981'}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="confidenceHigh"
                    stroke="transparent"
                    fill="#94a3b8"
                    fillOpacity={0.1}
                  />
                </>
              ) : (
                <>
                  <Line
                    type="monotone"
                    dataKey={viewMode}
                    stroke={viewMode === 'revenue' ? '#3b82f6' : '#10b981'}
                    strokeWidth={3}
                    dot={{ fill: viewMode === 'revenue' ? '#3b82f6' : '#10b981', r: 4 }}
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="confidenceHigh"
                    stroke="#94a3b8"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="confidenceLow"
                    stroke="#94a3b8"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </>
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </div>

        {/* Confidence Interval Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-0.5 ${viewMode === 'revenue' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
            <span>Predicted {viewMode}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-gray-400 opacity-60" style={{ borderTop: '1px dashed' }}></div>
            <span>Confidence Range</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 