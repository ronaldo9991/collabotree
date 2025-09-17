import { supabase } from './supabase';

// Create test users for development
export const createTestUsers = async () => {
  try {
    // Create test student
    const { data: student, error: studentError } = await supabase
      .from('users')
      .upsert({
        auth_id: crypto.randomUUID(),
        full_name: 'Alex Johnson',
        email: 'student@test.com',
        role: 'student',
      }, { onConflict: 'email' })
      .select()
      .single();

    if (!studentError && student) {
      // Create student profile
      await supabase
        .from('students')
        .upsert({
          id: student.id,
          university: 'Stanford University',
          skills: ['Web Development', 'React', 'JavaScript'],
          verified: true,
        }, { onConflict: 'id' });
    }

    // Create test buyer
    const { data: buyer, error: buyerError } = await supabase
      .from('users')
      .upsert({
        auth_id: crypto.randomUUID(),
        full_name: 'Sarah Smith',
        email: 'buyer@test.com',
        role: 'buyer',
      }, { onConflict: 'email' })
      .select()
      .single();

    if (!buyerError && buyer) {
      // Create buyer profile
      await supabase
        .from('buyers')
        .upsert({
          id: buyer.id,
          company_name: 'Tech Corp',
          industry: 'Technology',
          budget_range: '$1000-$5000',
        }, { onConflict: 'id' });
    }

    console.log('Test users created successfully');
    return { student, buyer };
  } catch (error) {
    console.error('Error creating test users:', error);
    return null;
  }
};

// Create sample projects for testing
export const createSampleProjects = async () => {
  try {
    // Get a student user to assign as creator
    const { data: students } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'student')
      .limit(1);

    if (!students || students.length === 0) {
      console.log('No student users found for creating sample projects');
      return;
    }

    const studentId = students[0].id;

    const sampleProjects = [
      {
        title: "Modern E-commerce Website",
        description: "Create a fully responsive e-commerce website with React, Node.js, and MongoDB. Includes user authentication, payment integration, and admin dashboard.",
        budget: 800,
        tags: ["Web Development", "React", "Node.js", "MongoDB"],
        owner_role: "student",
        status: "open",
        created_by: studentId,
      },
      {
        title: "Mobile App UI/UX Design",
        description: "Design a beautiful and intuitive mobile app interface for a fitness tracking application. Includes wireframes, mockups, and design system.",
        budget: 450,
        tags: ["UI/UX Design", "Mobile Design", "Figma", "Prototyping"],
        owner_role: "student",
        status: "open",
        created_by: studentId,
      },
      {
        title: "Data Analysis Dashboard",
        description: "Build an interactive dashboard using Python, Pandas, and Plotly to visualize sales data and generate insights for business decisions.",
        budget: 600,
        tags: ["Data Analysis", "Python", "Pandas", "Visualization"],
        owner_role: "student",
        status: "open",
        created_by: studentId,
      },
      {
        title: "AI Chatbot Development",
        description: "Develop an intelligent chatbot using OpenAI API and Python. Includes natural language processing, conversation flow, and integration with web platforms.",
        budget: 750,
        tags: ["AI/ML", "Python", "OpenAI", "NLP"],
        owner_role: "student",
        status: "open",
        created_by: studentId,
      },
      {
        title: "Brand Identity Package",
        description: "Complete brand identity design including logo, business cards, letterhead, and brand guidelines. Perfect for startups and small businesses.",
        budget: 350,
        tags: ["Graphic Design", "Branding", "Logo Design", "Adobe Creative Suite"],
        owner_role: "student",
        status: "open",
        created_by: studentId,
      }
    ];

    // Add projects one by one
    for (const project of sampleProjects) {
      const { error } = await supabase
        .from('projects')
        .upsert(project, { onConflict: 'title' });

      if (error) {
        console.error(`Error adding project "${project.title}":`, error);
      } else {
        console.log(`✅ Added project: ${project.title}`);
      }
    }

    console.log('Sample projects created successfully!');
  } catch (error) {
    console.error('Error creating sample projects:', error);
  }
};

// Quick login function for testing
export const quickLogin = async (userType: 'student' | 'buyer' | 'admin') => {
  try {
    let email = '';
    let fullName = '';
    
    switch (userType) {
      case 'student':
        email = 'student@test.com';
        fullName = 'Alex Johnson';
        break;
      case 'buyer':
        email = 'buyer@test.com';
        fullName = 'Sarah Smith';
        break;
      case 'admin':
        email = 'admin@collabotree.com';
        fullName = 'Platform Administrator';
        break;
    }

    // Find or create user
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      // Create user if doesn't exist
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          auth_id: crypto.randomUUID(),
          full_name: fullName,
          email,
          role: userType,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }
      user = newUser;

      // Create role-specific profile
      if (userType === 'student') {
        await supabase
          .from('students')
          .insert({
            id: user.id,
            university: 'Stanford University',
            skills: ['Web Development', 'React', 'JavaScript'],
            verified: true,
          });
      } else if (userType === 'buyer') {
        await supabase
          .from('buyers')
          .insert({
            id: user.id,
            company_name: 'Tech Corp',
            industry: 'Technology',
            budget_range: '$1000-$5000',
          });
      }
    }

    // Get role-specific profile data
    let profile = null;
    if (user.role === 'student') {
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('id', user.id)
        .single();
      profile = student;
    } else if (user.role === 'buyer') {
      const { data: buyer } = await supabase
        .from('buyers')
        .select('*')
        .eq('id', user.id)
        .single();
      profile = buyer;
    }

    // Create complete user object with profile
    const completeUser = {
      ...user,
      ...(user.role === 'student' && profile ? { student: profile } : {}),
      ...(user.role === 'buyer' && profile ? { buyer: profile } : {}),
    };

    // Store in localStorage
    localStorage.setItem('collabotree_user', JSON.stringify(completeUser));
    return completeUser;
  } catch (error) {
    console.error('Error in quick login:', error);
    return null;
  }
};
