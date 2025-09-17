import { supabase } from './supabase'
import type { Database } from './supabase'

type User = Database['public']['Tables']['users']['Row']
type Student = Database['public']['Tables']['students']['Row']
type Buyer = Database['public']['Tables']['buyers']['Row']

export interface AuthUser extends User {
  student?: Student
  buyer?: Buyer
}

export interface AuthError {
  message: string
  status?: number
}

// Auth helper functions
export const auth = {
  // Get current user with profile data (development mode)
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // For development, we'll store the current user in localStorage
      const storedUser = localStorage.getItem('collabotree_user')
      if (!storedUser) return null

      const user = JSON.parse(storedUser)
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  // Sign up new user
  async signUp(email: string, password: string, userData: {
    fullName: string
    role: 'student' | 'buyer'
    university?: string
    skills?: string[]
    companyName?: string
    industry?: string
  }): Promise<{ user: AuthUser; error: AuthError | null }> {
    try {
      // For development, create user profile directly without Supabase auth
      // This bypasses email confirmation entirely
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          auth_id: crypto.randomUUID(), // Generate proper UUID for development
          full_name: userData.fullName,
          email,
          role: userData.role,
        })
        .select()
        .single()

      if (userError) {
        return { user: null as any, error: { message: userError.message } }
      }

      // Create role-specific profile
      if (userData.role === 'student') {
        const { error: studentError } = await supabase
          .from('students')
          .insert({
            id: user.id,
            university: userData.university || null,
            skills: userData.skills || null,
          })

        if (studentError) {
          console.error('Error creating student profile:', studentError)
        }
      } else if (userData.role === 'buyer') {
        const { error: buyerError } = await supabase
          .from('buyers')
          .insert({
            id: user.id,
            company_name: userData.companyName || null,
            industry: userData.industry || null,
          })

        if (buyerError) {
          console.error('Error creating buyer profile:', buyerError)
        }
      }

      // Store user in localStorage for development
      localStorage.setItem('collabotree_user', JSON.stringify(user))
      
      return { user, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { user: null as any, error: { message: 'An unexpected error occurred' } }
    }
  },

  // Sign in user (development mode - bypass Supabase auth)
  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      // Special handling for admin login
      if (email === 'admin@collabotree.com' && password === 'Admin123!@#') {
        // Check if admin user exists
        const { data: existingAdmin } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .eq('role', 'admin')
          .single()

        let adminUser = existingAdmin;

        // Create admin user if doesn't exist
        if (!existingAdmin) {
          const { data: newAdmin, error: adminError } = await supabase
            .from('users')
            .insert({
              auth_id: crypto.randomUUID(),
              full_name: 'Platform Administrator',
              email: 'admin@collabotree.com',
              role: 'admin',
            })
            .select()
            .single()

          if (adminError) {
            console.error('Error creating admin user:', adminError);
            return { user: null, error: { message: 'Failed to create admin user' } }
          }
          adminUser = newAdmin;
        }

        // Store admin user in localStorage
        localStorage.setItem('collabotree_user', JSON.stringify(adminUser))
        return { user: adminUser, error: null }
      }

      // For development, just find the user by email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !user) {
        return { user: null, error: { message: 'Invalid email or password' } }
      }

      // Get role-specific profile
      let profile = null
      if (user.role === 'student') {
        const { data: student } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .single()
        profile = student
      } else if (user.role === 'buyer') {
        const { data: buyer } = await supabase
          .from('buyers')
          .select('*')
          .eq('id', user.id)
          .single()
        profile = buyer
      }

      const authUser = {
        ...user,
        ...(user.role === 'student' && profile ? { student: profile } : {}),
        ...(user.role === 'buyer' && profile ? { buyer: profile } : {}),
      }

      // Store user in localStorage for development
      localStorage.setItem('collabotree_user', JSON.stringify(authUser))
      
      return { user: authUser, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { user: null, error: { message: 'An unexpected error occurred' } }
    }
  },

  // Sign out user (development mode)
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      // Clear user from localStorage
      localStorage.removeItem('collabotree_user')
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: { message: 'An unexpected error occurred' } }
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        return { user: null, error: { message: error.message } }
      }

      return { user: data, error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      return { user: null, error: { message: 'An unexpected error occurred' } }
    }
  },

  // Update student profile
  async updateStudentProfile(studentId: string, updates: Partial<Student>): Promise<{ student: Student | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', studentId)
        .select()
        .single()

      if (error) {
        return { user: null, error: { message: error.message } }
      }

      return { student: data, error: null }
    } catch (error) {
      console.error('Update student profile error:', error)
      return { student: null, error: { message: 'An unexpected error occurred' } }
    }
  },

  // Update buyer profile
  async updateBuyerProfile(buyerId: string, updates: Partial<Buyer>): Promise<{ buyer: Buyer | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase
        .from('buyers')
        .update(updates)
        .eq('id', buyerId)
        .select()
        .single()

      if (error) {
        return { buyer: null, error: { message: error.message } }
      }

      return { buyer: data, error: null }
    } catch (error) {
      console.error('Update buyer profile error:', error)
      return { buyer: null, error: { message: 'An unexpected error occurred' } }
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  }
}
