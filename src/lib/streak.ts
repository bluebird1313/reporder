interface StreakUser {
  email: string
  key: string
  fullName: string
}

interface StreakTask {
  key: string
  name: string
  assignedToSharingEntry: string
  status: 'COMPLETE' | 'INCOMPLETE'
  dueDate?: number
  notes?: string
  creationTimestamp: number
  lastUpdatedTimestamp: number
}

interface StreakContact {
  key: string
  emailAddresses: Array<{ email: string }>
  name: string
  lastContactedTimestamp?: number
  emailsOpenedCount?: number
}

interface StreakPipeline {
  key: string
  name: string
  stageOrder: string[]
  stages: Record<string, { name: string; key: string }>
}

interface StreakBox {
  key: string
  name: string
  notes?: string
  stageKey: string
  pipelineKey: string
  assignedToSharingEntries: string[]
  creationTimestamp: number
  lastUpdatedTimestamp: number
}

class StreakAPI {
  private apiKey: string
  private baseUrl = 'https://www.streak.com/api/v1'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_STREAK_API_KEY || ''
    
    if (!this.apiKey) {
      console.warn('Streak API key not found. CRM features will be limited.')
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Streak API key not configured')
    }

    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Basic ${btoa(this.apiKey + ':')}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Streak API error (${response.status}): ${errorText}`)
    }

    return response.json()
  }

  // User methods
  async getCurrentUser(): Promise<StreakUser> {
    return this.makeRequest<StreakUser>('/me')
  }

  // Pipeline methods
  async getPipelines(): Promise<StreakPipeline[]> {
    return this.makeRequest<StreakPipeline[]>('/pipelines')
  }

  async getPipeline(pipelineKey: string): Promise<StreakPipeline> {
    return this.makeRequest<StreakPipeline>(`/pipelines/${pipelineKey}`)
  }

  // Box (deal/opportunity) methods
  async getBoxes(pipelineKey: string): Promise<StreakBox[]> {
    return this.makeRequest<StreakBox[]>(`/pipelines/${pipelineKey}/boxes`)
  }

  async getBox(boxKey: string): Promise<StreakBox> {
    return this.makeRequest<StreakBox>(`/boxes/${boxKey}`)
  }

  async createBox(pipelineKey: string, name: string, notes?: string): Promise<StreakBox> {
    return this.makeRequest<StreakBox>(`/pipelines/${pipelineKey}/boxes`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        notes: notes || '',
      }),
    })
  }

  async updateBox(boxKey: string, updates: Partial<Pick<StreakBox, 'name' | 'notes' | 'stageKey'>>): Promise<StreakBox> {
    return this.makeRequest<StreakBox>(`/boxes/${boxKey}`, {
      method: 'POST',
      body: JSON.stringify(updates),
    })
  }

  // Task methods
  async getTasks(boxKey: string): Promise<StreakTask[]> {
    return this.makeRequest<StreakTask[]>(`/boxes/${boxKey}/tasks`)
  }

  async createTask(boxKey: string, name: string, assignedTo?: string, dueDate?: Date): Promise<StreakTask> {
    const taskData: any = {
      name,
      status: 'INCOMPLETE',
    }

    if (assignedTo) {
      taskData.assignedToSharingEntry = assignedTo
    }

    if (dueDate) {
      taskData.dueDate = dueDate.getTime()
    }

    return this.makeRequest<StreakTask>(`/boxes/${boxKey}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    })
  }

  async updateTask(boxKey: string, taskKey: string, updates: Partial<StreakTask>): Promise<StreakTask> {
    return this.makeRequest<StreakTask>(`/boxes/${boxKey}/tasks/${taskKey}`, {
      method: 'POST',
      body: JSON.stringify(updates),
    })
  }

  async completeTask(boxKey: string, taskKey: string): Promise<StreakTask> {
    return this.updateTask(boxKey, taskKey, { status: 'COMPLETE' })
  }

  // Contact methods
  async getContacts(): Promise<StreakContact[]> {
    return this.makeRequest<StreakContact[]>('/contacts')
  }

  async getContact(contactKey: string): Promise<StreakContact> {
    return this.makeRequest<StreakContact>(`/contacts/${contactKey}`)
  }

  async searchContacts(query: string): Promise<StreakContact[]> {
    return this.makeRequest<StreakContact[]>(`/contacts?q=${encodeURIComponent(query)}`)
  }

  // Utility methods for store-specific CRM operations
  async getStoreOpportunities(storeName: string, pipelineKey?: string): Promise<StreakBox[]> {
    try {
      let targetPipelineKey = pipelineKey

      if (!targetPipelineKey) {
        const pipelines = await this.getPipelines()
        const salesPipeline = pipelines.find(p => 
          p.name.toLowerCase().includes('sales') || 
          p.name.toLowerCase().includes('opportunity')
        )
        targetPipelineKey = salesPipeline?.key
      }

      if (!targetPipelineKey) {
        return []
      }

      const boxes = await this.getBoxes(targetPipelineKey)
      return boxes.filter(box => 
        box.name.toLowerCase().includes(storeName.toLowerCase())
      )
    } catch (error) {
      console.error('Error fetching store opportunities:', error)
      return []
    }
  }

  async getRecentTasks(limit = 10): Promise<Array<StreakTask & { boxName?: string }>> {
    try {
      const pipelines = await this.getPipelines()
      const allTasks: Array<StreakTask & { boxName?: string }> = []

      for (const pipeline of pipelines.slice(0, 3)) { // Limit to first 3 pipelines for performance
        const boxes = await this.getBoxes(pipeline.key)
        
        for (const box of boxes.slice(0, 10)) { // Limit boxes per pipeline
          try {
            const tasks = await this.getTasks(box.key)
            tasks.forEach(task => {
              allTasks.push({
                ...task,
                boxName: box.name
              })
            })
          } catch (error) {
            // Skip if can't fetch tasks for this box
            continue
          }
        }
      }

      return allTasks
        .sort((a, b) => b.lastUpdatedTimestamp - a.lastUpdatedTimestamp)
        .slice(0, limit)
    } catch (error) {
      console.error('Error fetching recent tasks:', error)
      return []
    }
  }

  // Check if API is properly configured
  isConfigured(): boolean {
    return !!this.apiKey
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch (error) {
      console.error('Streak API connection test failed:', error)
      return false
    }
  }
}

// Singleton instance
let streakAPI: StreakAPI | null = null

export function getStreakAPI(): StreakAPI {
  if (!streakAPI) {
    streakAPI = new StreakAPI()
  }
  return streakAPI
}

// Export types
export type {
  StreakUser,
  StreakTask,
  StreakContact,
  StreakPipeline,
  StreakBox,
}

// Export the API class for custom instances
export { StreakAPI } 