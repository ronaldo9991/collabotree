// Mock data for the application
export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
}

export interface MockProfile {
  id: string;
  authUserId: string;
  role: 'student' | 'buyer' | 'admin';
  fullName: string;
  email: string;
  university: string;
  avatarUrl?: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'manual_review';
}

export interface MockService {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  tags: string[];
  pricingCents: number;
  currency: string;
  deliveryDays: number;
  attachments?: string[];
  avgRating: string;
  ratingCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockServiceWithOwner extends MockService {
  owner: MockProfile;
}

// Mock users
export const mockUsers: MockUser[] = [
  {
    id: '1',
    firstName: 'Alex',
    lastName: 'Chen',
    email: 'alex.chen@university.edu',
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@university.edu',
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Wilson',
    email: 'mike.wilson@university.edu',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  }
];

// Mock profiles
export const mockProfiles: MockProfile[] = [
  {
    id: '1',
    authUserId: '1',
    role: 'student',
    fullName: 'Alex Chen',
    email: 'alex.chen@university.edu',
    university: 'Stanford University',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isVerified: true,
    verificationStatus: 'approved'
  },
  {
    id: '2',
    authUserId: '2',
    role: 'student',
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    university: 'MIT',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isVerified: true,
    verificationStatus: 'approved'
  },
  {
    id: '3',
    authUserId: '3',
    role: 'student',
    fullName: 'Mike Wilson',
    email: 'mike.wilson@university.edu',
    university: 'UC Berkeley',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isVerified: true,
    verificationStatus: 'approved'
  }
];

// Mock services
export const mockServices: MockService[] = [
  {
    id: '1',
    ownerId: '1',
    title: 'React Website Development',
    description: 'I will create a modern, responsive React website with TypeScript, Tailwind CSS, and best practices. Perfect for startups and small businesses looking for a professional web presence.',
    tags: ['Web Development', 'React', 'TypeScript', 'Tailwind CSS'],
    pricingCents: 50000, // $500
    currency: 'USD',
    deliveryDays: 7,
    avgRating: '4.9',
    ratingCount: 24,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    ownerId: '2',
    title: 'Mobile App UI/UX Design',
    description: 'Professional mobile app design with Figma prototypes, user research, and modern design principles. I specialize in iOS and Android app interfaces that users love.',
    tags: ['Design', 'UI/UX', 'Mobile', 'Figma'],
    pricingCents: 35000, // $350
    currency: 'USD',
    deliveryDays: 5,
    avgRating: '4.8',
    ratingCount: 18,
    isActive: true,
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-14T14:30:00Z'
  },
  {
    id: '3',
    ownerId: '3',
    title: 'Data Analysis & Visualization',
    description: 'Transform your data into actionable insights with Python, pandas, and beautiful visualizations using matplotlib and seaborn. Perfect for business intelligence and research.',
    tags: ['Data Analysis', 'Python', 'Visualization', 'Statistics'],
    pricingCents: 40000, // $400
    currency: 'USD',
    deliveryDays: 10,
    avgRating: '4.7',
    ratingCount: 15,
    isActive: true,
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z'
  },
  {
    id: '4',
    ownerId: '1',
    title: 'Full-Stack Web Application',
    description: 'Complete web application with React frontend, Node.js backend, and PostgreSQL database. Includes authentication, API design, and deployment setup.',
    tags: ['Full-Stack Development', 'React', 'Node.js', 'PostgreSQL'],
    pricingCents: 80000, // $800
    currency: 'USD',
    deliveryDays: 14,
    avgRating: '4.9',
    ratingCount: 12,
    isActive: true,
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-12T16:45:00Z'
  },
  {
    id: '5',
    ownerId: '2',
    title: 'Brand Identity & Logo Design',
    description: 'Complete brand identity package including logo design, color palette, typography, and brand guidelines. Perfect for new businesses and startups.',
    tags: ['Graphic Design', 'Branding', 'Logo Design', 'Adobe Creative Suite'],
    pricingCents: 25000, // $250
    currency: 'USD',
    deliveryDays: 3,
    avgRating: '4.8',
    ratingCount: 22,
    isActive: true,
    createdAt: '2024-01-11T11:20:00Z',
    updatedAt: '2024-01-11T11:20:00Z'
  },
  {
    id: '6',
    ownerId: '3',
    title: 'AI Chatbot Development',
    description: 'Intelligent chatbot using OpenAI API with custom training, natural language processing, and integration with your existing systems.',
    tags: ['AI & Machine Learning', 'Chatbot', 'OpenAI', 'Python'],
    pricingCents: 60000, // $600
    currency: 'USD',
    deliveryDays: 12,
    avgRating: '4.6',
    ratingCount: 8,
    isActive: true,
    createdAt: '2024-01-10T13:30:00Z',
    updatedAt: '2024-01-10T13:30:00Z'
  }
];

// Combine services with owners
export const mockServicesWithOwners: MockServiceWithOwner[] = mockServices.map(service => ({
  ...service,
  owner: mockProfiles.find(profile => profile.id === service.ownerId)!
}));

// Mock current user (for demo purposes)
export const mockCurrentUser: MockUser & { profile: MockProfile } = {
  ...mockUsers[0],
  profile: mockProfiles[0]
};
