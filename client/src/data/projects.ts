import { LucideIcon, Code, Smartphone, PaintBucket, FileText, BarChart3, Bot, Sparkles, TrendingUp, Shield, Zap } from "lucide-react";

export interface ProjectData {
  id: number;
  title: string;
  description: string;
  price: string;
  priceCents: number;
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryDays: number;
  student: {
    name: string;
    university: string;
    major: string;
    avatar: string;
    verified: boolean;
  };
  category: string;
  icon: LucideIcon;
  tags: string[];
  image: string;
}

// Service interface for Marketplace compatibility
export interface Service {
  id: string;
  title: string;
  description: string;
  tags: string[];
  pricingCents: number;
  deliveryDays: number;
  avgRating: string;
  ratingCount: number;
  isActive: boolean;
  owner: {
    id: string;
    fullName: string;
    university: string;
    avatarUrl?: string;
    isVerified: boolean;
  };
}

export const topProjects: ProjectData[] = [
  {
    id: 1,
    title: "E-commerce Website with React & Node.js",
    description: "Complete e-commerce platform with payment integration, admin dashboard, and user authentication. Built with modern tech stack including React, Node.js, and MongoDB.",
    price: "$1,200",
    priceCents: 120000,
    rating: 5.0,
    reviews: 18,
    deliveryTime: "7 days",
    deliveryDays: 7,
    student: {
      name: "Sarah Chen",
      university: "Stanford University",
      major: "Computer Science",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
      verified: true
    },
    category: "Web Development",
    icon: Code,
    tags: ["React", "Node.js", "MongoDB", "Payment Gateway"],
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&w=400&h=250&fit=crop"
  },
  {
    id: 2,
    title: "Mobile App UI/UX Design & Prototype",
    description: "Professional mobile app design with user research, wireframes, high-fidelity mockups, and interactive prototype. Includes user testing and design system.",
    price: "$800",
    priceCents: 80000,
    rating: 4.9,
    reviews: 24,
    deliveryTime: "5 days",
    deliveryDays: 5,
    student: {
      name: "Alex Rodriguez",
      university: "MIT",
      major: "Design & Technology",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
      verified: true
    },
    category: "Design",
    icon: Smartphone,
    tags: ["Figma", "Prototyping", "User Research", "UI/UX"],
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&w=400&h=250&fit=crop"
  },
  {
    id: 3,
    title: "Brand Identity & Logo Design Package",
    description: "Complete brand identity including logo design, color palette, typography, business cards, and brand guidelines. Perfect for startups and small businesses.",
    price: "$650",
    priceCents: 65000,
    rating: 4.8,
    reviews: 31,
    deliveryTime: "4 days",
    deliveryDays: 4,
    student: {
      name: "Emma Thompson",
      university: "Harvard University",
      major: "Visual Arts",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
      verified: true
    },
    category: "Graphic Design",
    icon: PaintBucket,
    tags: ["Logo Design", "Branding", "Adobe Creative", "Identity"],
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&w=400&h=250&fit=crop"
  },
  {
    id: 4,
    title: "Research Paper & Data Analysis",
    description: "Comprehensive research and data analysis for academic or business purposes. Includes statistical analysis, visualization, and detailed reporting with citations.",
    price: "$450",
    priceCents: 45000,
    rating: 4.9,
    reviews: 15,
    deliveryTime: "6 days",
    deliveryDays: 6,
    student: {
      name: "Michael Chang",
      university: "UC Berkeley",
      major: "Data Science",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
      verified: true
    },
    category: "Research & Writing",
    icon: FileText,
    tags: ["Research", "Data Analysis", "Statistics", "Academic"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&w=400&h=250&fit=crop"
  },
  {
    id: 5,
    title: "Business Strategy & Market Analysis",
    description: "Professional business strategy development with market research, competitive analysis, financial projections, and presentation materials for investors.",
    price: "$950",
    priceCents: 95000,
    rating: 5.0,
    reviews: 12,
    deliveryTime: "8 days",
    deliveryDays: 8,
    student: {
      name: "Sophie Williams",
      university: "Wharton School",
      major: "Business Administration",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
      verified: true
    },
    category: "Business & Strategy",
    icon: BarChart3,
    tags: ["Strategy", "Market Research", "Business Plan", "Analysis"],
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&w=400&h=250&fit=crop"
  },
  {
    id: 6,
    title: "Full-Stack Web Application Development",
    description: "Modern web application with React, TypeScript, Node.js, and PostgreSQL. Includes authentication, real-time features, and admin dashboard.",
    price: "$1,500",
    priceCents: 150000,
    rating: 4.9,
    reviews: 22,
    deliveryTime: "10 days",
    deliveryDays: 10,
    student: {
      name: "David Kim",
      university: "Carnegie Mellon",
      major: "Software Engineering",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
      verified: true
    },
    category: "Full-Stack Development",
    icon: Code,
    tags: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&w=400&h=250&fit=crop"
  },
  {
    id: 7,
    title: "AI Chatbot Development & Integration",
    description: "Custom AI chatbot with natural language processing, integrated with your website or app. Includes training, deployment, and documentation.",
    price: "$1,100",
    priceCents: 110000,
    rating: 4.8,
    reviews: 16,
    deliveryTime: "7 days",
    deliveryDays: 7,
    student: {
      name: "Aria Patel",
      university: "MIT",
      major: "Artificial Intelligence",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
      verified: true
    },
    category: "AI & Machine Learning",
    icon: Bot,
    tags: ["AI", "Chatbot", "NLP", "Integration"],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&w=400&h=250&fit=crop"
  },
  {
    id: 8,
    title: "3D Product Visualization & Animation",
    description: "Professional 3D modeling and animation for product showcases, architectural visualization, or marketing materials. High-quality renders included.",
    price: "$750",
    priceCents: 75000,
    rating: 5.0,
    reviews: 19,
    deliveryTime: "6 days",
    deliveryDays: 6,
    student: {
      name: "Lucas Foster",
      university: "ArtCenter College",
      major: "3D Design",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
      verified: true
    },
    category: "3D Design & Animation",
    icon: Sparkles,
    tags: ["3D Modeling", "Animation", "Rendering", "Visualization"],
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&w=400&h=250&fit=crop"
  },
  {
    id: 9,
    title: "Digital Marketing Strategy & Campaign",
    description: "Comprehensive digital marketing strategy with SEO optimization, social media campaigns, content creation, and performance analytics.",
    price: "$900",
    priceCents: 90000,
    rating: 4.7,
    reviews: 28,
    deliveryTime: "5 days",
    deliveryDays: 5,
    student: {
      name: "Maya Johnson",
      university: "Northwestern University",
      major: "Marketing & Communications",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
      verified: true
    },
    category: "Digital Marketing",
    icon: TrendingUp,
    tags: ["SEO", "Social Media", "Content Strategy", "Analytics"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&w=400&h=250&fit=crop"
  }
];

export const newProjects: ProjectData[] = [
  {
    id: 11,
    title: "Voice Assistant AI Development",
    description: "Custom voice assistant with natural language processing, voice recognition, and smart home integration. Built with Python, TensorFlow, and cloud APIs.",
    price: "$2,200",
    priceCents: 220000,
    rating: 4.9,
    reviews: 14,
    deliveryTime: "12 days",
    deliveryDays: 12,
    student: {
      name: "Rachel Kim",
      university: "Seoul National University",
      major: "AI & Robotics",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
      verified: true
    },
    category: "AI Development",
    icon: Bot,
    tags: ["Python", "TensorFlow", "Voice AI", "NLP"],
    image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?ixlib=rb-4.0.3&w=400&h=250&fit=crop"
  },
  {
    id: 12,
    title: "Augmented Reality Shopping App",
    description: "AR mobile application for virtual product try-ons and interactive shopping experiences. Includes 3D modeling, real-time tracking, and e-commerce integration.",
    price: "$1,800",
    priceCents: 180000,
    rating: 4.8,
    reviews: 19,
    deliveryTime: "14 days",
    deliveryDays: 14,
    student: {
      name: "Carlos Rodriguez",
      university: "Technical University of Madrid",
      major: "Computer Graphics",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
      verified: true
    },
    category: "AR Development",
    icon: Smartphone,
    tags: ["AR", "Unity", "3D Modeling", "Mobile"],
    image: "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?ixlib=rb-4.0.3&w=400&h=250&fit=crop"
  },
  {
    id: 13,
    title: "Cybersecurity Audit & Penetration Testing",
    description: "Comprehensive security assessment including vulnerability scanning, penetration testing, and detailed security recommendations for web applications.",
    price: "$1,400",
    priceCents: 140000,
    rating: 5.0,
    reviews: 11,
    deliveryTime: "10 days",
    deliveryDays: 10,
    student: {
      name: "Alex Chen",
      university: "Carnegie Mellon University",
      major: "Cybersecurity",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
      verified: true
    },
    category: "Cybersecurity",
    icon: Shield,
    tags: ["Security", "Penetration Testing", "Audit", "Compliance"],
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&w=400&h=250&fit=crop"
  },
  {
    id: 14,
    title: "Machine Learning Predictive Analytics",
    description: "Advanced ML models for business forecasting, customer behavior prediction, and data-driven insights. Includes model training, validation, and deployment.",
    price: "$1,600",
    priceCents: 160000,
    rating: 4.7,
    reviews: 16,
    deliveryTime: "11 days",
    deliveryDays: 11,
    student: {
      name: "Priya Sharma",
      university: "Indian Institute of Technology",
      major: "Machine Learning",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
      verified: true
    },
    category: "Machine Learning",
    icon: BarChart3,
    tags: ["Machine Learning", "Python", "Analytics", "Prediction"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&w=400&h=250&fit=crop"
  },
  {
    id: 15,
    title: "IoT Smart Home Automation System",
    description: "Complete IoT solution for home automation including sensor integration, mobile app control, and cloud-based monitoring. Works with Alexa and Google Home.",
    price: "$1,900",
    priceCents: 190000,
    rating: 4.9,
    reviews: 13,
    deliveryTime: "15 days",
    deliveryDays: 15,
    student: {
      name: "Thomas Mueller",
      university: "Technical University of Munich",
      major: "IoT Engineering",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
      verified: true
    },
    category: "IoT Development",
    icon: Zap,
    tags: ["IoT", "Arduino", "Smart Home", "Mobile App"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&w=400&h=250&fit=crop"
  },
  {
    id: 16,
    title: "Game Development with Unity 3D",
    description: "Professional 3D game development including character design, physics implementation, UI/UX design, and cross-platform deployment for mobile and PC.",
    price: "$2,500",
    priceCents: 250000,
    rating: 4.8,
    reviews: 21,
    deliveryTime: "18 days",
    deliveryDays: 18,
    student: {
      name: "Isabella Santos",
      university: "University of Southern California",
      major: "Game Development",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
      verified: true
    },
    category: "Game Development",
    icon: Sparkles,
    tags: ["Unity", "C#", "3D Graphics", "Game Design"],
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&w=400&h=250&fit=crop"
  }
];

// Combined projects for easy access
export const allProjects: ProjectData[] = [...topProjects, ...newProjects];

// Helper function to convert ProjectData to Service format for Marketplace
export const projectToService = (project: ProjectData): Service => {
  return {
    id: project.id.toString(),
    title: project.title,
    description: project.description,
    tags: project.tags,
    pricingCents: project.priceCents,
    deliveryDays: project.deliveryDays,
    avgRating: project.rating.toFixed(1),
    ratingCount: project.reviews,
    isActive: true,
    owner: {
      id: project.id.toString(),
      fullName: project.student.name,
      university: project.student.university,
      avatarUrl: project.student.avatar,
      isVerified: project.student.verified
    }
  };
};

// Convert all projects to services for Marketplace
export const allProjectsAsServices: Service[] = allProjects.map(projectToService);