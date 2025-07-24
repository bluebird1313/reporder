"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Mail,
  Plus,
  Phone,
  User,
  AlertCircle,
  RefreshCw,
  Building2
} from "lucide-react"
import { 
  getStreakAPI, 
  StreakTask, 
  StreakBox, 
  StreakContact 
} from "@/lib/streak"
import { toast } from "sonner"

interface StoreCRMPaneProps {
  storeId: string
  storeName: string
  className?: string
}

interface CRMData {
  lastContact?: Date
  emailsOpened: number
  nextTask?: StreakTask & { boxName?: string }
  recentTasks: Array<StreakTask & { boxName?: string }>
  opportunities: StreakBox[]
  contact?: StreakContact
}

export function StoreCRMPane({ storeId, storeName, className }: StoreCRMPaneProps) {
  const [crmData, setCrmData] = React.useState<CRMData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isConfigured, setIsConfigured] = React.useState(false)
  const [newTaskOpen, setNewTaskOpen] = React.useState(false)
  const [newTaskName, setNewTaskName] = React.useState("")
  const [newTaskNotes, setNewTaskNotes] = React.useState("")
  const [isCreatingTask, setIsCreatingTask] = React.useState(false)

  const streakAPI = getStreakAPI()

  React.useEffect(() => {
    loadCRMData()
  }, [storeId, storeName])

  const loadCRMData = async () => {
    setIsLoading(true)
    try {
      const configured = streakAPI.isConfigured()
      setIsConfigured(configured)

      if (!configured) {
        setIsLoading(false)
        return
      }

      // Test connection
      const connected = await streakAPI.testConnection()
      if (!connected) {
        toast.error('Unable to connect to Streak CRM')
        setIsLoading(false)
        return
      }

      // Fetch CRM data in parallel
      const [opportunities, recentTasks, contacts] = await Promise.all([
        streakAPI.getStoreOpportunities(storeName),
        streakAPI.getRecentTasks(20),
        streakAPI.searchContacts(storeName).catch(() => [])
      ])

      // Filter tasks related to this store
      const storeTasks = recentTasks.filter(task => 
        task.name.toLowerCase().includes(storeName.toLowerCase()) ||
        task.boxName?.toLowerCase().includes(storeName.toLowerCase())
      )

      // Find primary contact
      const primaryContact = contacts.find(contact => 
        contact.name.toLowerCase().includes(storeName.toLowerCase())
      )

      // Find next upcoming task
      const incompleteTasks = storeTasks.filter(task => task.status === 'INCOMPLETE')
      const nextTask = incompleteTasks.sort((a, b) => {
        if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate
        if (a.dueDate) return -1
        if (b.dueDate) return 1
        return a.creationTimestamp - b.creationTimestamp
      })[0]

      setCrmData({
        lastContact: primaryContact?.lastContactedTimestamp 
          ? new Date(primaryContact.lastContactedTimestamp)
          : undefined,
        emailsOpened: primaryContact?.emailsOpenedCount || 0,
        nextTask,
        recentTasks: storeTasks.slice(0, 5),
        opportunities,
        contact: primaryContact
      })

    } catch (error) {
      console.error('Error loading CRM data:', error)
      toast.error('Failed to load CRM data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async () => {
    if (!newTaskName.trim() || !crmData?.opportunities[0]) return

    setIsCreatingTask(true)
    try {
      const opportunity = crmData.opportunities[0]
      await streakAPI.createTask(
        opportunity.key, 
        newTaskName.trim(),
        undefined, // No specific assignee
        undefined  // No due date for now
      )

      toast.success('Task created successfully')
      setNewTaskName("")
      setNewTaskNotes("")
      setNewTaskOpen(false)
      
      // Reload CRM data
      loadCRMData()
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
    } finally {
      setIsCreatingTask(false)
    }
  }

  const handleCompleteTask = async (task: StreakTask & { boxName?: string }) => {
    try {
      // Find the box key - we'll need to get it from opportunities or make an assumption
      const opportunity = crmData?.opportunities.find(opp => 
        opp.name.toLowerCase().includes(storeName.toLowerCase())
      )
      
      if (opportunity) {
        await streakAPI.completeTask(opportunity.key, task.key)
        toast.success('Task marked as complete')
        loadCRMData()
      }
    } catch (error) {
      console.error('Error completing task:', error)
      toast.error('Failed to complete task')
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-600" />
            Store CRM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isConfigured) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-600" />
            Store CRM
          </CardTitle>
          <CardDescription>Streak CRM integration for {storeName}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Streak API key not configured. Add your API key to environment variables to enable CRM features.
            </AlertDescription>
          </Alert>
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
              <Building2 className="h-5 w-5 text-purple-600" />
              Store CRM
            </CardTitle>
            <CardDescription>Streak CRM data for {storeName}</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadCRMData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            {crmData?.opportunities && crmData.opportunities.length > 0 && (
              <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-1">
                    <Plus className="h-3 w-3" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                      Add a new task for {storeName}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="task-name">Task Name</Label>
                      <Input
                        id="task-name"
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        placeholder="e.g., Follow up on Q4 orders"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="task-notes">Notes (Optional)</Label>
                      <Textarea
                        id="task-notes"
                        value={newTaskNotes}
                        onChange={(e) => setNewTaskNotes(e.target.value)}
                        placeholder="Additional details..."
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setNewTaskOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateTask}
                      disabled={!newTaskName.trim() || isCreatingTask}
                    >
                      {isCreatingTask ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Create Task
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Contact Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Last Contact
            </p>
            <p className="font-medium">
              {crmData?.lastContact ? (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatRelativeTime(crmData.lastContact)}
                </span>
              ) : (
                <span className="text-muted-foreground">No recent contact</span>
              )}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Emails Opened
            </p>
            <p className="font-medium flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {crmData?.emailsOpened || 0}
            </p>
          </div>
        </div>

        {/* Next Task */}
        {crmData?.nextTask ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Next Task</p>
            <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{crmData.nextTask.name}</p>
                  {crmData.nextTask.dueDate && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Due {formatDate(new Date(crmData.nextTask.dueDate))}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCompleteTask(crmData.nextTask!)}
                  className="ml-2"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium">Next Task</p>
            <div className="border rounded-lg p-3 bg-muted/50">
              <p className="text-sm text-muted-foreground">No upcoming tasks</p>
            </div>
          </div>
        )}

        {/* Recent Tasks */}
        {crmData?.recentTasks && crmData.recentTasks.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Recent Tasks</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {crmData.recentTasks.map((task) => (
                <div key={task.key} className="flex items-center gap-3 text-sm p-2 rounded border">
                  <div className="flex-shrink-0">
                    {task.status === 'COMPLETE' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{task.name}</p>
                    {task.boxName && (
                      <p className="text-xs text-muted-foreground">{task.boxName}</p>
                    )}
                  </div>
                  <Badge variant={task.status === 'COMPLETE' ? 'default' : 'secondary'}>
                    {task.status === 'COMPLETE' ? 'Done' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opportunities */}
        {crmData?.opportunities && crmData.opportunities.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Opportunities</p>
            <div className="space-y-2">
              {crmData.opportunities.slice(0, 3).map((opportunity) => (
                <div key={opportunity.key} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{opportunity.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Updated {formatRelativeTime(new Date(opportunity.lastUpdatedTimestamp))}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={`https://streak.com/box/${opportunity.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No CRM Data */}
        {!crmData?.contact && !crmData?.opportunities?.length && !crmData?.recentTasks?.length && (
          <Alert>
            <User className="h-4 w-4" />
            <AlertDescription>
              No CRM data found for {storeName}. Check your Streak pipeline or create a new opportunity.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
} 