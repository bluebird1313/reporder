'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface LowStockItem {
  id: number
  item: string
  store: string
  currentStock: number
  minStock: number
  severity: 'high' | 'medium'
}

interface LowStockAlertProps {
  alerts: LowStockItem[]
  onNotifyBuyer?: (item: LowStockItem) => void
  className?: string
}

export function LowStockAlert({ alerts, onNotifyBuyer, className }: LowStockAlertProps) {
  const handleNotifyBuyer = (alert: LowStockItem) => {
    if (onNotifyBuyer) {
      onNotifyBuyer(alert)
    } else {
      console.log(`Notifying buyer for ${alert.item} at ${alert.store}`)
    }
  }

  if (alerts.length === 0) {
    return (
      <div className={`text-center py-4 text-muted-foreground ${className}`}>
        <AlertTriangle className="mx-auto h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">No low stock alerts at this time</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          className={alert.severity === "high" ? "border-red-200" : "border-yellow-200"}
        >
          <div className="flex items-start justify-between w-full">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <div className="flex-1">
                <AlertTitle className="text-sm">{alert.item}</AlertTitle>
                <AlertDescription className="text-xs">
                  <div className="mt-1">
                    <div className="font-medium">{alert.store}</div>
                    <div className="text-muted-foreground">
                      Current: {alert.currentStock} | Min: {alert.minStock}
                    </div>
                  </div>
                </AlertDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-2 h-8 px-3 text-xs bg-transparent"
              onClick={() => handleNotifyBuyer(alert)}
            >
              Notify Buyer
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  )
} 