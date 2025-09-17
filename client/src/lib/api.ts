import { supabase } from './supabase'
import type { Database } from './supabase'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectApplication = Database['public']['Tables']['project_applications']['Row']
type ProjectAssignment = Database['public']['Tables']['project_assignments']['Row']
type Order = Database['public']['Tables']['orders']['Row']
type ChatThread = Database['public']['Tables']['chat_threads']['Row']
type ChatMessage = Database['public']['Tables']['chat_messages']['Row']

export interface ProjectWithDetails extends Project {
  creator: {
    id: string
    full_name: string
    email: string
    role: string
  }
  applications?: ProjectApplication[]
  assignment?: ProjectAssignment
}

export interface ApplicationWithDetails extends ProjectApplication {
  project: Project
  student: {
    id: string
    full_name: string
    email: string
    university?: string
    skills?: string[]
  }
}

// Projects API
export const projectsApi = {
  // Get all open projects for explore page
  async getOpenProjects(filters?: {
    search?: string
    category?: string
    minBudget?: number
    maxBudget?: number
    tags?: string[]
  }): Promise<ProjectWithDetails[]> {
    let query = supabase
      .from('projects')
      .select(`
        *,
        creator:users!projects_created_by_fkey(id, full_name, email, role)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters?.minBudget) {
      query = query.gte('budget', filters.minBudget)
    }

    if (filters?.maxBudget) {
      query = query.lte('budget', filters.maxBudget)
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching projects:', error)
      throw new Error('Failed to fetch projects')
    }

    return data || []
  },

  // Get project by ID with details
  async getProjectById(id: string): Promise<ProjectWithDetails | null> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        creator:users!projects_created_by_fkey(id, full_name, email, role),
        applications:project_applications(*),
        assignment:project_assignments(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
      return null
    }

    return data
  },

  // Create new project
  async createProject(projectData: {
    title: string
    description?: string
    cover_url?: string
    budget?: number
    tags?: string[]
    owner_role: 'student' | 'buyer'
  }): Promise<Project> {
    // Get user from localStorage (our custom auth system)
    const userStr = localStorage.getItem('collabotree_user')
    if (!userStr) throw new Error('Not authenticated')
    
    const user = JSON.parse(userStr)
    if (!user?.id) throw new Error('Invalid user data')

    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      throw new Error('Failed to create project')
    }

    return data
  },

  // Update project
  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      throw new Error('Failed to update project')
    }

    return data
  },

  // Get user's projects
  async getUserProjects(userId: string): Promise<ProjectWithDetails[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        creator:users!projects_created_by_fkey(id, full_name, email, role),
        applications:project_applications(*),
        assignment:project_assignments(*)
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user projects:', error)
      throw new Error('Failed to fetch user projects')
    }

    return data || []
  }
}

// Applications API
export const applicationsApi = {
  // Apply to project
  async applyToProject(projectId: string, applicationData: {
    cover_letter?: string
    bid_amount?: number
  }): Promise<ProjectApplication> {
    // Get user from localStorage (our custom auth system)
    const userStr = localStorage.getItem('collabotree_user')
    if (!userStr) throw new Error('Not authenticated')
    
    const user = JSON.parse(userStr)
    if (!user?.id || user.role !== 'student') {
      throw new Error('Only students can apply to projects')
    }

    // Check if user has already applied to this project
    const { data: existingApplication, error: checkError } = await supabase
      .from('project_applications')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('student_id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking existing application:', checkError)
      throw new Error('Failed to check existing application')
    }

    if (existingApplication) {
      throw new Error('You have already applied to this project')
    }

    const { data, error } = await supabase
      .from('project_applications')
      .insert({
        project_id: projectId,
        student_id: user.id,
        ...applicationData,
      })
      .select()
      .single()

    if (error) {
      console.error('Error applying to project:', error)
      throw new Error('Failed to apply to project')
    }

    return data
  },

  // Check if user has already applied to a project
  async hasUserAppliedToProject(projectId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('project_applications')
      .select('id')
      .eq('project_id', projectId)
      .eq('student_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking application status:', error)
      return false
    }

    return !!data
  },

  // Get applications for a project
  async getProjectApplications(projectId: string): Promise<ApplicationWithDetails[]> {
    const { data, error } = await supabase
      .from('project_applications')
      .select(`
        *,
        project:projects(*),
        student:students!project_applications_student_id_fkey(
          id,
          users!students_id_fkey(id, full_name, email),
          university,
          skills
        )
      `)
      .eq('project_id', projectId)
      .order('applied_at', { ascending: false })

    if (error) {
      console.error('Error fetching applications:', error)
      throw new Error('Failed to fetch applications')
    }

    return data || []
  },

  // Accept application
  async acceptApplication(applicationId: string): Promise<void> {
    // Get user from localStorage (our custom auth system)
    const userStr = localStorage.getItem('collabotree_user')
    if (!userStr) throw new Error('Not authenticated')
    
    const user = JSON.parse(userStr)
    if (!user?.id) throw new Error('Invalid user data')

    // Get application details
    const { data: application, error: appError } = await supabase
      .from('project_applications')
      .select(`
        *,
        project:projects(*)
      `)
      .eq('id', applicationId)
      .single()

    if (appError || !application) {
      throw new Error('Application not found')
    }

    // Check if user owns the project
    if (application.project.created_by !== user.id) {
      throw new Error('Not authorized to accept this application')
    }

    // Start transaction
    const { error: acceptError } = await supabase
      .from('project_applications')
      .update({ status: 'accepted' })
      .eq('id', applicationId)

    if (acceptError) throw new Error('Failed to accept application')

    // Reject other applications
    const { error: rejectError } = await supabase
      .from('project_applications')
      .update({ status: 'rejected' })
      .eq('project_id', application.project_id)
      .neq('id', applicationId)

    if (rejectError) throw new Error('Failed to reject other applications')

    // Create assignment
    const { error: assignError } = await supabase
      .from('project_assignments')
      .insert({
        project_id: application.project_id,
        student_id: application.student_id,
        buyer_id: user.id,
      })

    if (assignError) throw new Error('Failed to create assignment')

    // Update project status
    const { error: projectError } = await supabase
      .from('projects')
      .update({ status: 'in_progress' })
      .eq('id', application.project_id)

    if (projectError) throw new Error('Failed to update project status')
  },

  // Reject application
  async rejectApplication(applicationId: string): Promise<void> {
    // Get user from localStorage (our custom auth system)
    const userStr = localStorage.getItem('collabotree_user')
    if (!userStr) throw new Error('Not authenticated')
    
    const user = JSON.parse(userStr)
    if (!user?.id) throw new Error('Invalid user data')

    // Get application details
    const { data: application, error: appError } = await supabase
      .from('project_applications')
      .select(`
        *,
        project:projects(*)
      `)
      .eq('id', applicationId)
      .single()

    if (appError || !application) {
      throw new Error('Application not found')
    }

    // Check if user owns the project
    if (application.project.created_by !== user.id) {
      throw new Error('Not authorized to reject this application')
    }

    const { error } = await supabase
      .from('project_applications')
      .update({ status: 'rejected' })
      .eq('id', applicationId)

    if (error) {
      console.error('Error rejecting application:', error)
      throw new Error('Failed to reject application')
    }
  },

  // Get student's applications
  async getStudentApplications(studentId: string): Promise<ApplicationWithDetails[]> {
    const { data, error } = await supabase
      .from('project_applications')
      .select(`
        *,
        project:projects(*),
        student:students!project_applications_student_id_fkey(
          id,
          users!students_id_fkey(id, full_name, email),
          university,
          skills
        )
      `)
      .eq('student_id', studentId)
      .order('applied_at', { ascending: false })

    if (error) {
      console.error('Error fetching student applications:', error)
      throw new Error('Failed to fetch applications')
    }

    return data || []
  }
}

// Chat API
export const chatApi = {
  // Get or create chat thread
  async getOrCreateThread(projectId: string, buyerId: string, sellerId: string): Promise<ChatThread> {
    console.log('Getting or creating chat thread:', { projectId, buyerId, sellerId });
    
    const { data, error } = await supabase
      .from('chat_threads')
      .select('*')
      .eq('project_id', projectId)
      .eq('buyer_id', buyerId)
      .eq('seller_id', sellerId)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found error
      console.error('Error fetching thread:', error)
      throw new Error(`Failed to fetch chat thread: ${error.message}`)
    }

    if (data) {
      console.log('Found existing thread:', data);
      return data
    }

    console.log('Creating new chat thread...');
    // Create new thread
    const { data: newThread, error: createError } = await supabase
      .from('chat_threads')
      .insert({
        project_id: projectId,
        buyer_id: buyerId,
        seller_id: sellerId,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating thread:', createError)
      throw new Error(`Failed to create chat thread: ${createError.message}`)
    }

    console.log('Created new thread:', newThread);
    return newThread
  },

  // Send message
  async sendMessage(threadId: string, body: string): Promise<ChatMessage> {
    // Get user from localStorage (our custom auth system)
    const userStr = localStorage.getItem('collabotree_user')
    if (!userStr) throw new Error('Not authenticated')
    
    const user = JSON.parse(userStr)
    if (!user?.id) throw new Error('Invalid user data')

    console.log('Sending message:', { threadId, senderId: user.id, body });

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        thread_id: threadId,
        sender_id: user.id,
        body,
      })
      .select()
      .single()

    if (error) {
      console.error('Error sending message:', error)
      throw new Error(`Failed to send message: ${error.message}`)
    }

    console.log('Message sent successfully:', data);
    return data
  },

  // Get messages for thread
  async getMessages(threadId: string, limit = 50): Promise<ChatMessage[]> {
    console.log('Fetching messages for thread:', threadId);
    
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching messages:', error)
      throw new Error(`Failed to fetch messages: ${error.message}`)
    }

    console.log('Fetched messages:', data?.length || 0);
    return data || []
  },

  // Subscribe to new messages
  subscribeToMessages(threadId: string, callback: (message: ChatMessage) => void) {
    return supabase
      .channel(`messages:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          callback(payload.new as ChatMessage)
        }
      )
      .subscribe()
  }
}

// Orders API
export const ordersApi = {
  // Create order
  async createOrder(orderData: {
    project_id: string
    seller_id: string
    type: 'purchase' | 'hire'
    amount_cents: number
  }): Promise<Order> {
    // Get user from localStorage (our custom auth system)
    const userStr = localStorage.getItem('collabotree_user')
    if (!userStr) throw new Error('Not authenticated')
    
    const user = JSON.parse(userStr)
    if (!user?.id) throw new Error('Invalid user data')

    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...orderData,
        buyer_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating order:', error)
      throw new Error('Failed to create order')
    }

    return data
  },

  // Get user's orders
  async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        project:projects(
          id,
          title,
          description,
          budget,
          status,
          created_by,
          created_at
        ),
        seller:users!orders_seller_id_fkey(
          id,
          full_name,
          email,
          role
        ),
        buyer:users!orders_buyer_id_fkey(
          id,
          full_name,
          email,
          role
        )
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      throw new Error('Failed to fetch orders')
    }

    return data || []
  },

  // Get orders where user is the seller (for students to see buyer requests)
  async getSellerOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        project:projects(
          id,
          title,
          description,
          budget,
          status,
          created_by,
          created_at
        ),
        seller:users!orders_seller_id_fkey(
          id,
          full_name,
          email,
          role
        ),
        buyer:users!orders_buyer_id_fkey(
          id,
          full_name,
          email,
          role
        )
      `)
      .eq('seller_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching seller orders:', error)
      throw new Error('Failed to fetch seller orders')
    }

    return data || []
  },

  // Get single order with details
  async getOrder(orderId: string): Promise<Order & { project: any; seller: any; buyer: any }> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        project:projects(
          id,
          title,
          description,
          budget,
          status,
          created_by,
          created_at
        ),
        seller:users!orders_seller_id_fkey(
          id,
          full_name,
          email,
          role
        ),
        buyer:users!orders_buyer_id_fkey(
          id,
          full_name,
          email,
          role
        )
      `)
      .eq('id', orderId)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      throw new Error('Failed to fetch order')
    }

    return data
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: 'pending' | 'paid' | 'accepted' | 'cancelled' | 'refunded'): Promise<void> {
    // Get user from localStorage (our custom auth system)
    const userStr = localStorage.getItem('collabotree_user')
    if (!userStr) throw new Error('Not authenticated')
    
    const user = JSON.parse(userStr)
    if (!user?.id) throw new Error('Invalid user data')

    // Check if user owns the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('buyer_id, seller_id')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    if (order.buyer_id !== user.id && order.seller_id !== user.id) {
      throw new Error('Not authorized to update this order')
    }

    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        ...(status === 'paid' && { paid_at: new Date().toISOString() })
      })
      .eq('id', orderId)

    if (error) {
      console.error('Error updating order:', error)
      throw new Error('Failed to update order')
    }
  },

  // Cancel order
  async cancelOrder(orderId: string): Promise<void> {
    await this.updateOrderStatus(orderId, 'cancelled')
  },

  // Mark order as paid
  async markOrderPaid(orderId: string): Promise<void> {
    await this.updateOrderStatus(orderId, 'paid')
  },

  // Accept completed work
  async acceptOrder(orderId: string): Promise<void> {
    await this.updateOrderStatus(orderId, 'accepted')
  },

  // Request refund
  async requestRefund(orderId: string): Promise<void> {
    await this.updateOrderStatus(orderId, 'refunded')
  }
}
