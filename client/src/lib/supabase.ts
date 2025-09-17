import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Use configured values or fallback to demo
const url = supabaseUrl && supabaseUrl !== 'your_supabase_project_url' 
  ? supabaseUrl 
  : 'https://demo.supabase.co'

const key = supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key'
  ? supabaseAnonKey 
  : 'demo-key-for-development'

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_id: string
          full_name: string
          email: string
          role: 'student' | 'buyer' | 'admin'
          created_at: string
        }
        Insert: {
          id?: string
          auth_id: string
          full_name: string
          email: string
          role: 'student' | 'buyer' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          auth_id?: string
          full_name?: string
          email?: string
          role?: 'student' | 'buyer' | 'admin'
          created_at?: string
        }
      }
      students: {
        Row: {
          id: string
          university: string | null
          skills: string[] | null
          verified: boolean
          id_card_url: string | null
        }
        Insert: {
          id: string
          university?: string | null
          skills?: string[] | null
          verified?: boolean
          id_card_url?: string | null
        }
        Update: {
          id?: string
          university?: string | null
          skills?: string[] | null
          verified?: boolean
          id_card_url?: string | null
        }
      }
      buyers: {
        Row: {
          id: string
          company_name: string | null
          industry: string | null
          budget_range: string | null
        }
        Insert: {
          id: string
          company_name?: string | null
          industry?: string | null
          budget_range?: string | null
        }
        Update: {
          id?: string
          company_name?: string | null
          industry?: string | null
          budget_range?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          cover_url: string | null
          created_by: string | null
          owner_role: 'student' | 'buyer'
          budget: number | null
          status: 'open' | 'in_progress' | 'completed' | 'archived'
          tags: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          cover_url?: string | null
          created_by?: string | null
          owner_role: 'student' | 'buyer'
          budget?: number | null
          status?: 'open' | 'in_progress' | 'completed' | 'archived'
          tags?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          cover_url?: string | null
          created_by?: string | null
          owner_role?: 'student' | 'buyer'
          budget?: number | null
          status?: 'open' | 'in_progress' | 'completed' | 'archived'
          tags?: string[] | null
          created_at?: string
        }
      }
      project_applications: {
        Row: {
          id: string
          project_id: string
          student_id: string
          cover_letter: string | null
          bid_amount: number | null
          status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          applied_at: string
        }
        Insert: {
          id?: string
          project_id: string
          student_id: string
          cover_letter?: string | null
          bid_amount?: number | null
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          applied_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          student_id?: string
          cover_letter?: string | null
          bid_amount?: number | null
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          applied_at?: string
        }
      }
      project_assignments: {
        Row: {
          id: string
          project_id: string
          student_id: string | null
          buyer_id: string | null
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          student_id?: string | null
          buyer_id?: string | null
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          student_id?: string | null
          buyer_id?: string | null
          started_at?: string
          completed_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          project_id: string
          buyer_id: string
          seller_id: string
          type: 'purchase' | 'hire'
          status: 'pending' | 'paid' | 'accepted' | 'cancelled' | 'refunded'
          amount_cents: number
          created_at: string
          paid_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          buyer_id: string
          seller_id: string
          type: 'purchase' | 'hire'
          status?: 'pending' | 'paid' | 'accepted' | 'cancelled' | 'refunded'
          amount_cents: number
          created_at?: string
          paid_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          buyer_id?: string
          seller_id?: string
          type?: 'purchase' | 'hire'
          status?: 'pending' | 'paid' | 'accepted' | 'cancelled' | 'refunded'
          amount_cents?: number
          created_at?: string
          paid_at?: string | null
        }
      }
      chat_threads: {
        Row: {
          id: string
          project_id: string
          buyer_id: string
          seller_id: string
          last_msg_at: string | null
          msg_count: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          buyer_id: string
          seller_id: string
          last_msg_at?: string | null
          msg_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          buyer_id?: string
          seller_id?: string
          last_msg_at?: string | null
          msg_count?: number
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: number
          thread_id: string
          sender_id: string
          body: string
          created_at: string
        }
        Insert: {
          id?: number
          thread_id: string
          sender_id: string
          body: string
          created_at?: string
        }
        Update: {
          id?: number
          thread_id?: string
          sender_id?: string
          body?: string
          created_at?: string
        }
      }
      chat_read_receipts: {
        Row: {
          thread_id: string
          user_id: string
          last_read_at: string
        }
        Insert: {
          thread_id: string
          user_id: string
          last_read_at: string
        }
        Update: {
          thread_id?: string
          user_id?: string
          last_read_at?: string
        }
      }
      admin_actions: {
        Row: {
          id: string
          admin_id: string | null
          action: string
          target_user: string | null
          target_project: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id?: string | null
          action: string
          target_user?: string | null
          target_project?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string | null
          action?: string
          target_user?: string | null
          target_project?: string | null
          created_at?: string
        }
      }
    }
  }
}
