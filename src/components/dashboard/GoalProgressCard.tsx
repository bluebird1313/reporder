"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Target, AlertCircle } from "lucide-react"
import { GoalProgress } from "@/lib/services/dashboard-goals"

interface GoalProgressCardProps {
  goal: GoalProgress
  onClick?: () => void
  className?: string
}

export function GoalProgressCard({ goal, onClick, className }: GoalProgressCardProps) {
  // Calculate status based on progress percentage
  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return "text-green-600 bg-green-50 border-green-200"
    if (percentage >= 75) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    if (percentage >= 50) return "text-orange-600 bg-orange-50 border-orange-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500"
    if (percentage >= 75) return "bg-yellow-500"
    if (percentage >= 50) return "bg-orange-500"
    return "bg-red-500"
  }

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 100) return <TrendingUp className="h-4 w-4" />
    if (percentage >= 50) return <Target className="h-4 w-4" />
    return <AlertCircle className="h-4 w-4" />
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatMonth = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const isOverdue = new Date(goal.goal_month) < new Date() && goal.progress_percentage < 100

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      aria-label={`Goal progress for ${goal.brand} ${goal.goal_type} in ${goal.store_name}: ${goal.progress_percentage}% complete`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              {goal.brand} - {goal.goal_type}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {goal.store_name} • {formatMonth(goal.goal_month)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${getStatusColor(goal.progress_percentage)} flex items-center gap-1 px-2 py-1`}
            >
              {getStatusIcon(goal.progress_percentage)}
              {goal.progress_percentage.toFixed(1)}%
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {formatCurrency(goal.actual_sales)} / {formatCurrency(goal.goal_amount)}
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={Math.min(goal.progress_percentage, 100)} 
              className="h-3"
              aria-label={`Progress: ${goal.progress_percentage}%`}
            />
            <div 
              className={`absolute top-0 left-0 h-3 rounded-full transition-all ${getProgressColor(goal.progress_percentage)}`}
              style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Actual Sales
            </p>
            <p className="font-semibold text-lg" aria-live="polite">
              {formatCurrency(goal.actual_sales)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Remaining
            </p>
            <p className="font-semibold text-lg" aria-live="polite">
              {formatCurrency(Math.max(0, goal.goal_amount - goal.actual_sales))}
            </p>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className={`rounded-lg p-3 border ${getStatusColor(goal.progress_percentage)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(goal.progress_percentage)}
              <span className="font-medium text-sm">
                {goal.progress_percentage >= 100 ? 'Goal Achieved!' :
                 goal.progress_percentage >= 75 ? 'On Track' :
                 goal.progress_percentage >= 50 ? 'Needs Attention' :
                 'At Risk'}
              </span>
            </div>
            {goal.progress_percentage > 100 && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                +{(goal.progress_percentage - 100).toFixed(1)}% over goal
              </Badge>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-sm hover:bg-muted/50"
          onClick={(e) => {
            e.stopPropagation()
            onClick?.()
          }}
        >
          View Breakdown →
        </Button>
      </CardContent>
    </Card>
  )
} 