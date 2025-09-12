import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Shield, MessageSquare, Zap, Palette, Lock, CheckCircle, GraduationCap, Clock, FolderSync, Users, TrendingUp, AlertCircle, Search, Bot, Sparkles, Award, Target, Globe, Code, Smartphone, PaintBucket, FileText, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Footer } from "@/components/Footer";

export default function Landing() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentNewProjectSlide, setCurrentNewProjectSlide] = useState(0);
  
  const topProjects = [
    {
      id: 1,
      title: "E-commerce Website with React & Node.js",
      description: "Complete e-commerce platform with payment integration, admin dashboard, and user authentication. Built with modern tech stack including React, Node.js, and MongoDB.",
      price: "$1,200",
      rating: 5.0,
      reviews: 18,
      deliveryTime: "7 days",
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
      rating: 4.9,
      reviews: 24,
      deliveryTime: "5 days",
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
      rating: 4.8,
      reviews: 31,
      deliveryTime: "4 days",
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
      rating: 4.9,
      reviews: 15,
      deliveryTime: "6 days",
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
      rating: 5.0,
      reviews: 12,
      deliveryTime: "8 days",
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
      rating: 4.9,
      reviews: 22,
      deliveryTime: "10 days",
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
      rating: 4.8,
      reviews: 16,
      deliveryTime: "7 days",
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
      rating: 5.0,
      reviews: 19,
      deliveryTime: "6 days",
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
      rating: 4.7,
      reviews: 28,
      deliveryTime: "5 days",
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

  const newProjects = [
    {
      id: 11,
      title: "Voice Assistant AI Development",
      description: "Custom voice assistant with natural language processing, voice recognition, and smart home integration. Built with Python, TensorFlow, and cloud APIs.",
      price: "$2,200",
      rating: 4.9,
      reviews: 14,
      deliveryTime: "12 days",
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
      rating: 4.8,
      reviews: 19,
      deliveryTime: "14 days",
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
      rating: 5.0,
      reviews: 11,
      deliveryTime: "10 days",
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
      rating: 4.7,
      reviews: 16,
      deliveryTime: "11 days",
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
      rating: 4.9,
      reviews: 13,
      deliveryTime: "15 days",
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
      rating: 4.8,
      reviews: 21,
      deliveryTime: "18 days",
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

  const projectsPerSlide = 3;
  const totalSlides = Math.ceil(topProjects.length / projectsPerSlide);
  const totalNewProjectSlides = Math.ceil(newProjects.length / projectsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const nextNewProjectSlide = () => {
    setCurrentNewProjectSlide((prev) => (prev + 1) % totalNewProjectSlides);
  };

  const prevNewProjectSlide = () => {
    setCurrentNewProjectSlide((prev) => (prev - 1 + totalNewProjectSlides) % totalNewProjectSlides);
  };

  const getCurrentProjects = () => {
    const startIndex = currentSlide * projectsPerSlide;
    return topProjects.slice(startIndex, startIndex + projectsPerSlide);
  };

  const getCurrentNewProjects = () => {
    const startIndex = currentNewProjectSlide * projectsPerSlide;
    return newProjects.slice(startIndex, startIndex + projectsPerSlide);
  };

  // Auto-slide functionality removed - user wants manual control only

  const features = [
    {
      icon: Shield,
      title: "Verified Excellence",
      description: "Every student is thoroughly verified through university credentials, ensuring authentic and qualified talent for your projects.",
      gradient: "from-primary to-secondary",
    },
    {
      icon: Award,
      title: "Premium Quality",
      description: "Access top-tier student talent from leading universities worldwide, delivering exceptional results every time.",
      gradient: "from-accent to-primary",
    },
    {
      icon: Target,
      title: "AI-Powered Matching",
      description: "Our intelligent system connects you with the perfect student talent based on your specific project requirements.",
      gradient: "from-secondary to-accent",
    },
    {
      icon: Zap,
      title: "Fast Delivery",
      description: "Get your projects completed quickly with dedicated student freelancers who understand deadlines matter.",
      gradient: "from-primary to-accent",
    },
    {
      icon: Globe,
      title: "Global Talent Pool",
      description: "Connect with verified students from top universities across the globe, bringing diverse skills and fresh perspectives.",
      gradient: "from-accent to-secondary",
    },
    {
      icon: Lock,
      title: "Secure Platform",
      description: "Your projects and payments are protected with enterprise-grade security and comprehensive dispute resolution.",
      gradient: "from-secondary to-primary",
    },
  ];


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-padding-y bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container-unified">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 xl:gap-12 items-center">
            {/* Content - 7/12 (60%) */}
            <motion.div
              className="lg:col-span-7 space-y-8"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div className="space-y-6" variants={itemVariants}>
                <Badge className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/20 text-accent-foreground border-accent/30">
                  <Star className="h-3 w-3" />
                  <span className="font-medium">Verified Students Only</span>
                </Badge>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                  Hire Talent from
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent block">
                    Top Universities
                  </span>
                  Worldwide
                </h1>
                
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
                  Access verified student talent for your projects. From web development to design, research to tutoring—connect with the brightest minds from leading universities.
                </p>
              </motion.div>

              <motion.div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center" variants={itemVariants}>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-[var(--button-height)]"
                  asChild
                  data-testid="hire-talent-button"
                >
                  <Link href="/signin">
                    <Users className="mr-2 h-5 w-5" />
                    Hire Talent
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border bg-card hover:bg-accent/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-[var(--button-height)]"
                  asChild
                  data-testid="join-student-button"
                >
                  <Link href="/signin">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Join as Student
                  </Link>
                </Button>
              </motion.div>

            </motion.div>

            {/* Visual - 5/12 (40%) */}
            <motion.div 
              className="lg:col-span-5"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="relative">
                {/* Main Image */}
                <div className="glass-card bg-card/30 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-12">
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=800" 
                    alt="Students collaborating" 
                    className="w-full h-auto"
                    data-testid="hero-image"
                  />
                </div>
                
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI-Powered Search Section */}
      <section className="section-padding-y bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container-unified">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-secondary" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              AI-Powered Project Matching
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Describe your project in natural language and let our AI recommend the perfect student talent for your needs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Enhanced AI Search Bar */}
            <div className="relative bg-card/80 backdrop-blur-12 border border-border/50 rounded-2xl p-3 sm:p-4 shadow-2xl max-w-5xl mx-auto">
              
              {/* Mobile Layout */}
              <div className="block sm:hidden">
                {/* Mobile Header */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">AI-Powered Search</span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-muted-foreground">Online</span>
                  </div>
                </div>
                
                {/* Mobile Input */}
                <div className="mb-4">
                  <Input 
                    placeholder="Describe your project... e.g., 'mobile app with payments'"
                    className="border-border/50 bg-background/50 focus-visible:ring-1 focus-visible:ring-primary/50 text-base h-12 placeholder:text-muted-foreground/70"
                    data-testid="ai-search-input"
                  />
                </div>
                
                {/* Mobile Button */}
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-medium"
                  data-testid="ai-search-button"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Find Perfect Talent
                </Button>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:block">
                <div className="flex items-center gap-4 px-2 lg:px-6 py-4">
                  <div className="flex items-center gap-3 text-primary flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Input 
                      placeholder="Describe your project in detail... e.g., 'I need a mobile app for food delivery with payment integration'"
                      className="border-0 bg-transparent focus-visible:ring-0 text-base placeholder:text-muted-foreground/70 h-12"
                      data-testid="ai-search-input"
                    />
                  </div>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 px-6 lg:px-8 h-12 flex-shrink-0"
                    data-testid="ai-search-button"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    <span className="hidden lg:inline">Find Talent</span>
                    <span className="lg:hidden">Find</span>
                  </Button>
                </div>
                
                <div className="px-2 lg:px-6 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI-powered project assistance and talent matching
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>AI Online</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample suggestions - responsive */}
              <div className="px-3 sm:px-6 pb-4 border-t border-border/20 pt-4 mt-4 sm:mt-0 sm:border-t-0 sm:pt-0">
                <p className="text-xs text-muted-foreground mb-3">Popular project types:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Web Development",
                    "App Design", 
                    "Data Analysis",
                    "Logo Design",
                    "Business Plan",
                    "Research"
                  ].map((suggestion) => (
                    <Badge 
                      key={suggestion}
                      variant="outline" 
                      className="text-xs hover:bg-accent/20 hover:border-primary/30 cursor-pointer transition-colors px-2 py-1"
                      data-testid={`suggestion-${suggestion.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 grid-gap-unified mt-12 sm:mt-16">
              <motion.div
                className="text-center p-6 sm:p-4 rounded-xl bg-background/50 border border-border/30 sm:bg-transparent sm:border-none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <h3 className="font-semibold mb-3 text-base sm:text-lg">Smart Matching</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  AI analyzes your requirements and matches you with the most suitable students
                </p>
              </motion.div>

              <motion.div
                className="text-center p-6 sm:p-4 rounded-xl bg-background/50 border border-border/30 sm:bg-transparent sm:border-none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-secondary to-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <h3 className="font-semibold mb-3 text-base sm:text-lg">Instant Results</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Get personalized recommendations in seconds, not hours
                </p>
              </motion.div>

              <motion.div
                className="text-center p-6 sm:p-4 rounded-xl bg-background/50 border border-border/30 sm:bg-transparent sm:border-none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-accent to-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <h3 className="font-semibold mb-3 text-base sm:text-lg">Quality Assured</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Only verified students from top universities worldwide
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Top Selection Section */}
      <section className="section-padding-y bg-background">
        <div className="container-unified">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Top Selection</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover exceptional work from our verified student talent. These featured projects showcase the quality and expertise available on CollaboTree.
            </p>
          </motion.div>

          {/* Carousel with External Navigation */}
          <div className="flex items-center gap-6">
            {/* Previous Arrow - Outside Left */}
            <Button
              onClick={prevSlide}
              variant="outline"
              size="icon"
              className="flex-shrink-0 bg-background/95 backdrop-blur-lg border-border/40 hover:bg-primary/10 hover:border-primary/50 hover:shadow-xl hover:scale-110 transition-all duration-500 shadow-2xl rounded-full w-14 h-14 group"
              data-testid="carousel-prev-button"
            >
              <ChevronLeft className="h-6 w-6 group-hover:text-primary transition-colors duration-300" />
            </Button>
            
            {/* Carousel Content */}
            <div className="flex-1">

              {/* Carousel Container */}
              <motion.div 
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-gap-unified items-stretch">
                  {getCurrentProjects().map((project, index) => (
                    <motion.div 
                      key={`${currentSlide}-${project.id}`}
                      className="w-full h-full flex"
                      data-testid={`top-project-${project.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                    >
                <Card 
                  className="rounded-2xl border h-full w-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-card overflow-hidden flex flex-col group"
                  aria-label={project.title}
                >
                  {/* Project Image with Gradient Overlay */}
                  <div className="relative h-48 overflow-hidden rounded-t-2xl">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 group-hover:from-primary/30 group-hover:via-secondary/15 group-hover:to-accent/30 transition-all duration-200" />
                  </div>
                  
                  <CardContent className="p-4 md:p-5 xl:p-6 flex-1 flex flex-col">
                    {/* Category pill */}
                    <Badge variant="secondary" className="w-fit rounded-full text-xs mb-3">
                      {project.category}
                    </Badge>
                    
                    {/* Title */}
                    <h3 className="font-bold text-lg line-clamp-2 mb-3">{project.title}</h3>
                    
                    {/* Description - Fixed height for consistency */}
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-3 flex-1">
                      {project.description}
                    </p>
                    
                    {/* Tags - Fixed spacing */}
                    <div className="flex flex-wrap gap-1.5 mb-4 min-h-[2rem]">
                      {project.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="rounded-full text-xs px-2 py-1">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge variant="outline" className="rounded-full text-xs px-2 py-1">
                          +{project.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Author row - Consistent spacing */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={project.student.avatar} alt={project.student.name} />
                          <AvatarFallback className="text-xs">
                            {project.student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <p className="font-medium text-sm truncate">{project.student.name}</p>
                            {project.student.verified && (
                              <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {project.student.university}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{project.rating}</span>
                      </div>
                    </div>
                    
                    {/* Bottom price bar - Always at bottom */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <span className="text-lg font-semibold">{project.price}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        asChild
                        data-testid={`view-project-${project.id}`}
                      >
                        <Link href="/marketplace">
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            </div>
            
            {/* Next Arrow - Outside Right */}
            <Button
              onClick={nextSlide}
              variant="outline"
              size="icon"
              className="flex-shrink-0 bg-background/95 backdrop-blur-lg border-border/40 hover:bg-primary/10 hover:border-primary/50 hover:shadow-xl hover:scale-110 transition-all duration-500 shadow-2xl rounded-full w-14 h-14 group"
              data-testid="carousel-next-button"
            >
              <ChevronRight className="h-6 w-6 group-hover:text-primary transition-colors duration-300" />
            </Button>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center items-center gap-3 mt-12">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`relative h-3 rounded-full transition-all duration-500 hover:scale-125 ${
                  index === currentSlide 
                    ? 'w-10 bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/30' 
                    : 'w-3 bg-muted-foreground/30 hover:bg-primary/40 hover:shadow-md'
                }`}
                data-testid={`carousel-indicator-${index}`}
              >
                {index === currentSlide && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* View All Projects Button */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              asChild
              data-testid="view-all-projects-button"
            >
              <Link href="/marketplace">
                <FolderSync className="mr-2 h-5 w-5" />
                Explore All Projects
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* New Projects Section */}
      <section className="section-padding-y bg-gradient-to-br from-accent/5 via-primary/5 to-secondary/5">
        <div className="container-unified">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">New Projects</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fresh opportunities from our talented student community. Discover the latest projects and innovations from verified students worldwide.
            </p>
          </motion.div>

          {/* Carousel with External Navigation */}
          <div className="flex items-center gap-6">
            {/* Previous Arrow - Outside Left */}
            <Button
              onClick={prevNewProjectSlide}
              variant="outline"
              size="icon"
              className="flex-shrink-0 bg-background/95 backdrop-blur-lg border-border/40 hover:bg-primary/10 hover:border-primary/50 hover:shadow-xl hover:scale-110 transition-all duration-500 shadow-2xl rounded-full w-14 h-14 group"
              data-testid="new-projects-prev-button"
            >
              <ChevronLeft className="h-6 w-6 group-hover:text-primary transition-colors duration-300" />
            </Button>
            
            {/* Carousel Content */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-gap-unified items-stretch">
                {getCurrentNewProjects().map((project, index) => (
              <motion.div 
                key={project.id} 
                variants={itemVariants}
                className="w-full h-full flex"
                data-testid={`new-project-${project.id}`}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card 
                  className="rounded-2xl border h-full w-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 bg-card overflow-hidden flex flex-col group"
                  aria-label={project.title}
                >
                  {/* Project Image with Gradient Overlay */}
                  <div className="relative h-48 overflow-hidden rounded-t-2xl">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 group-hover:from-primary/30 group-hover:via-secondary/15 group-hover:to-accent/30 transition-all duration-200" />
                  </div>
                  
                  <CardContent className="p-4 md:p-5 xl:p-6 flex-1 flex flex-col">
                    {/* Category pill */}
                    <Badge variant="secondary" className="w-fit rounded-full text-xs mb-3">
                      {project.category}
                    </Badge>
                    
                    {/* Title */}
                    <h3 className="font-bold text-lg line-clamp-2 mb-3">{project.title}</h3>
                    
                    {/* Description - Fixed height for consistency */}
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-3 flex-1">
                      {project.description}
                    </p>
                    
                    {/* Tags - Fixed spacing */}
                    <div className="flex flex-wrap gap-1.5 mb-4 min-h-[2rem]">
                      {project.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="rounded-full text-xs px-2 py-1">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge variant="outline" className="rounded-full text-xs px-2 py-1">
                          +{project.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Author row - Consistent spacing */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={project.student.avatar} alt={project.student.name} />
                          <AvatarFallback className="text-xs">
                            {project.student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <p className="font-medium text-sm truncate">{project.student.name}</p>
                            {project.student.verified && (
                              <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {project.student.university}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{project.rating}</span>
                      </div>
                    </div>
                    
                    {/* Bottom price bar - Always at bottom */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <span className="text-lg font-semibold">{project.price}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        asChild
                        data-testid={`view-new-project-${project.id}`}
                      >
                        <Link href="/marketplace">
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
                ))}
              </div>
            </div>

            {/* Next Arrow - Outside Right */}
            <Button
              onClick={nextNewProjectSlide}
              variant="outline"
              size="icon"
              className="flex-shrink-0 bg-background/95 backdrop-blur-lg border-border/40 hover:bg-primary/10 hover:border-primary/50 hover:shadow-xl hover:scale-110 transition-all duration-500 shadow-2xl rounded-full w-14 h-14 group"
              data-testid="new-projects-next-button"
            >
              <ChevronRight className="h-6 w-6 group-hover:text-primary transition-colors duration-300" />
            </Button>
          </div>

          {/* Slide indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalNewProjectSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentNewProjectSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentNewProjectSlide
                    ? 'bg-primary w-8'
                    : 'bg-border/50 hover:bg-border'
                }`}
                data-testid={`new-projects-indicator-${index}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding-y bg-muted/5 overflow-hidden">
        <div className="container-unified">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose CollaboTree?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access the world's brightest student talent through our trusted platform designed for exceptional results.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="group"
              >
                <Card className="glass-card bg-card/50 border-border/50 h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 backdrop-blur-12 relative overflow-hidden" data-testid={`feature-${index}`}>
                  {/* Floating gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  {/* Animated border effect */}
                  <div className="absolute inset-0 rounded-lg">
                    <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 transform group-hover:scale-110`}></div>
                  </div>
                  
                  <CardContent className="p-8 relative z-10">
                    {/* Enhanced icon with floating animation */}
                    <div className="relative mb-6">
                      <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                        <feature.icon className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      {/* Floating particles effect */}
                      <div className={`absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r ${feature.gradient} rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-300`}></div>
                      <div className={`absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-r ${feature.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200`}></div>
                    </div>
                    
                    {/* Content with better typography */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm group-hover:text-foreground/80 transition-colors duration-300">
                        {feature.description}
                      </p>
                      
                      {/* Progress indicator */}
                      <div className="pt-4">
                        <div className="w-full bg-border/30 rounded-full h-1">
                          <div 
                            className={`h-1 bg-gradient-to-r ${feature.gradient} rounded-full transition-all duration-1000 ease-out group-hover:w-full`}
                            style={{ width: '0%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding-y bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container-unified text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Begin?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join thousands of professionals and students who are already creating exceptional projects together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                asChild
                data-testid="cta-hire-talent-button"
              >
                <Link href="/signin">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Hire Talent Now
                </Link>
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-border bg-background hover:bg-accent/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                asChild
                data-testid="cta-student-button"
              >
                <Link href="/signin">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Become a Student Seller
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
