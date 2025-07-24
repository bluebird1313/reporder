"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertTriangle, 
  XCircle, 
  Package, 
  Store, 
  CheckCircle,
  RefreshCw 
} from "lucide-react"
import { StockAlert } from "@/lib/services/dashboard-goals"
import { useResolveStockAlert } from "@/lib/services/dashboard-goals"
import { toast } from "sonner"

interface LowStockAlertProps {
  alerts: StockAlert[]
  isLoading?: boolean
  onRefresh?: () => void
  className?: string
}

export function LowStockAlert({ alerts, isLoading, onRefresh, className }: LowStockAlertProps) {
  const resolveAlert = useResolveStockAlert()

  const handleResolveAlert = async (alertId: string, productName: string) => {
    try {
      await resolveAlert.mutateAsync(alertId)
      toast.success(`Resolved alert for ${productName}`)
    } catch (error) {
      toast.error('Failed to resolve alert')
    }
  }

  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'out_of_stock':
        return <XCircle className="h-3 w-3" />
      case 'low':
        return <AlertTriangle className="h-3 w-3" />
      default:
        return <Package className="h-3 w-3" />
    }
  }

  const priorityAlerts = React.useMemo(() => {
    return alerts.sort((a, b) => {
      // Out of stock alerts first
      if (a.alert_type === 'out_of_stock' && b.alert_type !== 'out_of_stock') return -1
      if (b.alert_type === 'out_of_stock' && a.alert_type !== 'out_of_stock') return 1
      
      // Then by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [alerts])

  const outOfStockCount = alerts.filter(alert => alert.alert_type === 'out_of_stock').length
  const lowStockCount = alerts.filter(alert => alert.alert_type === 'low').length

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Stock Alerts
            </CardTitle>
            <div className="animate-spin">
              <RefreshCw className="h-4 w-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Stock Alerts
            </CardTitle>
            <CardDescription className="mt-1">
              {alerts.length === 0 ? 'All stock levels are healthy' : 
               `${outOfStockCount} out of stock, ${lowStockCount} low stock`}
            </CardDescription>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          )}
        </div>
        
        {alerts.length > 0 && (
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-muted-foreground">
                {outOfStockCount} Out of Stock
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-muted-foreground">
                {lowStockCount} Low Stock
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {alerts.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              No stock alerts at this time. All inventory levels are within normal ranges.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {priorityAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-3 ${getAlertColor(alert.alert_type)} transition-all hover:shadow-sm`}
                role="alert"
                aria-label={`${alert.alert_type === 'out_of_stock' ? 'Out of stock' : 'Low stock'} alert for ${alert.product_name}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`${getAlertColor(alert.alert_type)} flex items-center gap-1 text-xs px-2 py-1`}
                      >
                        {getAlertIcon(alert.alert_type)}
                        {alert.alert_type === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        SKU: {alert.style_number}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm leading-tight">
                        {alert.product_name}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Store className="h-3 w-3" />
                          {alert.store_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          Current: {alert.quantity} | Min: {alert.threshold}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-auto px-2 py-1 text-xs hover:bg-white/50"
                    onClick={() => handleResolveAlert(alert.id, alert.product_name)}
                    disabled={resolveAlert.isPending}
                    aria-label={`Resolve alert for ${alert.product_name}`}
                  >
                    {resolveAlert.isPending ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCircle className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {alerts.length > 6 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Showing {Math.min(6, alerts.length)} of {alerts.length} alerts
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 