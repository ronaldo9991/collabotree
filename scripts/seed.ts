import { createClient } from '@supabase/supabase-js'

// This script seeds the database with initial data
// Run with: npx tsx scripts/seed.ts

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your_supabase_url'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_service_role_key'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  try {
    // Create test users
    const { data: authUsers, error: authError } = await supabase.auth.admin.createUser({
      email: 'student@test.com',
      password: 'password123',
      email_confirm: true,
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return
    }

    const { data: authUser2, error: authError2 } = await supabase.auth.admin.createUser({
      email: 'buyer@test.com',
      password: 'password123',
      email_confirm: true,
    })

    if (authError2) {
      console.error('Error creating auth user 2:', authError2)
      return
    }

    // Create user profiles
    const { data: user1, error: userError1 } = await supabase
      .from('users')
      .insert({
        auth_id: authUsers.user.id,
        full_name: 'Sarah Chen',
        email: 'student@test.com',
        role: 'student',
      })
      .select()
      .single()

    if (userError1) {
      console.error('Error creating user 1:', userError1)
      return
    }

    const { data: user2, error: userError2 } = await supabase
      .from('users')
      .insert({
        auth_id: authUser2.user.id,
        full_name: 'John Smith',
        email: 'buyer@test.com',
        role: 'buyer',
      })
      .select()
      .single()

    if (userError2) {
      console.error('Error creating user 2:', userError2)
      return
    }

    // Create student profile
    const { error: studentError } = await supabase
      .from('students')
      .insert({
        id: user1.id,
        university: 'Stanford University',
        skills: ['React', 'Node.js', 'TypeScript', 'UI/UX Design'],
        verified: true,
      })

    if (studentError) {
      console.error('Error creating student profile:', studentError)
      return
    }

    // Create buyer profile
    const { error: buyerError } = await supabase
      .from('buyers')
      .insert({
        id: user2.id,
        company_name: 'TechCorp Inc.',
        industry: 'Technology',
        budget_range: '$1000-$5000',
      })

    if (buyerError) {
      console.error('Error creating buyer profile:', buyerError)
      return
    }

    // Create sample projects
    const projects = [
      {
        title: 'E-commerce Website with React & Node.js',
        description: 'Complete e-commerce platform with payment integration, admin dashboard, and user authentication. Built with modern tech stack including React, Node.js, and MongoDB.',
        budget: 1200,
        owner_role: 'student' as const,
        created_by: user1.id,
        tags: ['React', 'Node.js', 'MongoDB', 'Payment Gateway'],
        cover_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&w=400&h=250&fit=crop',
      },
      {
        title: 'Mobile App UI/UX Design & Prototype',
        description: 'Professional mobile app design with user research, wireframes, high-fidelity mockups, and interactive prototype. Includes user testing and design system.',
        budget: 800,
        owner_role: 'student' as const,
        created_by: user1.id,
        tags: ['Figma', 'Prototyping', 'User Research', 'UI/UX'],
        cover_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&w=400&h=250&fit=crop',
      },
      {
        title: 'Brand Identity & Logo Design Package',
        description: 'Complete brand identity including logo design, color palette, typography, business cards, and brand guidelines. Perfect for startups and small businesses.',
        budget: 650,
        owner_role: 'student' as const,
        created_by: user1.id,
        tags: ['Logo Design', 'Branding', 'Adobe Creative', 'Identity'],
        cover_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&w=400&h=250&fit=crop',
      },
      {
        title: 'Research Paper & Data Analysis',
        description: 'Comprehensive research and data analysis for academic or business purposes. Includes statistical analysis, visualization, and detailed reporting with citations.',
        budget: 450,
        owner_role: 'student' as const,
        created_by: user1.id,
        tags: ['Research', 'Data Analysis', 'Statistics', 'Academic'],
        cover_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&w=400&h=250&fit=crop',
      },
      {
        title: 'Business Strategy & Market Analysis',
        description: 'Professional business strategy development with market research, competitive analysis, financial projections, and presentation materials for investors.',
        budget: 950,
        owner_role: 'buyer' as const,
        created_by: user2.id,
        tags: ['Strategy', 'Market Research', 'Business Plan', 'Analysis'],
        cover_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&w=400&h=250&fit=crop',
      },
    ]

    const { data: createdProjects, error: projectsError } = await supabase
      .from('projects')
      .insert(projects)
      .select()

    if (projectsError) {
      console.error('Error creating projects:', projectsError)
      return
    }

    console.log('✅ Successfully seeded database!')
    console.log('📊 Created:')
    console.log(`  - 2 users (student: ${user1.id}, buyer: ${user2.id})`)
    console.log(`  - 1 student profile`)
    console.log(`  - 1 buyer profile`)
    console.log(`  - ${createdProjects?.length || 0} projects`)
    console.log('')
    console.log('🔑 Test credentials:')
    console.log('  Student: student@test.com / password123')
    console.log('  Buyer: buyer@test.com / password123')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  }
}

seedDatabase()
