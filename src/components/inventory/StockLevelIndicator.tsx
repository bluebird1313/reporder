'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, Package, TrendingDown } from 'lucide-react'

interface StockLevelIndicatorProps {
  currentStock: number
  minThreshold: number
  maxStock?: number
  showProgress?: boolean
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StockLevelIndicator({
  currentStock,
  minThreshold,
  maxStock,
  showProgress = false,
  showIcon = true,
  size = 'md',
  className = ''
}: StockLevelIndicatorProps) {
  const getStockStatus = () => {
    if (currentStock === 0) {
      return {
        status: 'Out of Stock',
        variant: 'destructive' as const,
        color: 'text-red-600',
        icon: TrendingDown,
        percentage: 0
      }
    }
    if (currentStock <= minThreshold) {
      return {
        status: 'Low Stock',
        variant: 'secondary' as const,
        color: 'text-yellow-600',
        icon: AlertTriangle,
        percentage: maxStock ? (currentStock / maxStock) * 100 : 25
      }
    }
    return {
      status: 'In Stock',
      variant: 'default' as const,
      color: 'text-green-600',
      icon: Package,
      percentage: maxStock ? (currentStock / maxStock) * 100 : 75
    }
  }

  const stockInfo = getStockStatus()
  const Icon = stockInfo.icon

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && (
        <Icon className={`${iconSizes[size]} ${stockInfo.color}`} />
      )}
      
      <div className="flex flex-col gap-1">
        <Badge variant={stockInfo.variant} className={sizeClasses[size]}>
          {stockInfo.status}
        </Badge>
        
        {showProgress && maxStock && (
          <div className="flex items-center gap-2">
            <Progress 
              value={stockInfo.percentage} 
              className="w-16 h-2"
            />
            <span className={`${sizeClasses[size]} text-muted-foreground`}>
              {Math.round(stockInfo.percentage)}%
            </span>
          </div>
        )}
      </div>
      
      <div className={`${sizeClasses[size]} text-muted-foreground ml-auto`}>
        {currentStock.toLocaleString()}
      </div>
    </div>
  )
}

// Additional utility component for quick stock overview
export function StockSummary({
  items
}: {
  items: Array<{
    name: string
    currentStock: number
    minThreshold: number
    maxStock?: number
  }>
}) {
  const outOfStock = items.filter(item => item.currentStock === 0).length
  const lowStock = items.filter(item => item.currentStock > 0 && item.currentStock <= item.minThreshold).length
  const inStock = items.filter(item => item.currentStock > item.minThreshold).length

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{inStock}</div>
        <div className="text-sm text-muted-foreground">In Stock</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">{lowStock}</div>
        <div className="text-sm text-muted-foreground">Low Stock</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">{outOfStock}</div>
        <div className="text-sm text-muted-foreground">Out of Stock</div>
      </div>
    </div>
  )
} 